#!/usr/bin/env python3
"""
Cardiac Binary Classifier — Training Script
=============================================
Task    : Binary classification — Cardiomegaly vs No Cardiomegaly
Dataset : NIH ChestX-ray14 cardiomegaly subset
          (rahimanshu/cardiomegaly-disease-prediction-using-cnn on Kaggle)
          - 2,776 Cardiomegaly images  (class 1 = cardiac)
          - 2,776 No-Cardiomegaly images (class 0 = normal/other)
          - 128 × 128 px grayscale
          - Perfectly balanced — no class weighting needed

Architecture: DenseNet121 (ImageNet pretrained) — CheXNet-inspired
              Head replaced: 1024 → Dropout → 256 → ReLU → BN → Dropout → 1
              Binary cross-entropy (sigmoid output)

Why binary first:
  • Stable, accurate, easier to validate medically
  • More training data per class than multi-label
  • Directly answers "does this X-ray show cardiomegaly?"
  • Strong AUC is more meaningful than multi-label exact-match accuracy

Medical context:
  Cardiomegaly (enlarged cardiac silhouette, CTR > 0.5) is the most
  reliable radiographic indicator of structural cardiac disease.
  Detected in PA/AP chest X-ray by comparing heart width to chest width.
  Associated with heart failure, cardiomyopathy, valvular disease, pericardial effusion.

Run:
    python3 train_cardiac_binary.py

Output (models/):
    cardiac_binary_model.pth          — best val-AUC checkpoint
    cardiac_binary_metadata.json      — metrics, config, per-threshold stats
    cardiac_binary_roc.png            — ROC curve (val + test)
    cardiac_binary_cm.png             — Confusion matrix (test set, Youden threshold)
    cardiac_binary_history.png        — Loss / AUC training curves
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, Optional, Tuple

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from torch.utils.data import DataLoader, Dataset, random_split
from torchvision import models, transforms
from tqdm import tqdm

try:
    import seaborn as sns
    HAS_SNS = True
except ImportError:
    HAS_SNS = False

# ── Paths ─────────────────────────────────────────────────────────────────────

BASE_DIR    = Path(__file__).parent
DATA_DIR    = BASE_DIR / 'data' / 'cardiomegaly_raw'
MODELS_DIR  = BASE_DIR / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# ── Hyperparameters ───────────────────────────────────────────────────────────

IMG_SIZE     = 128      # native image size (128×128 grayscale)
BATCH_SIZE   = 32
NUM_EPOCHS   = 50       # upper bound — EarlyStopping will stop earlier
LR           = 1e-4
WEIGHT_DECAY = 1e-3     # stronger L2 for small dataset
PATIENCE     = 10       # early-stopping patience (epochs without AUC improvement)
VAL_SPLIT    = 0.20     # fraction of train set used for validation
NUM_WORKERS  = min(4, os.cpu_count() or 1)
SEED         = 42


# ── Dataset ───────────────────────────────────────────────────────────────────

class CardiomegalyDataset(Dataset):
    """
    Loads cardiomegaly PNG images from the directory structure:
        {split_dir}/true/  → label 1 (cardiomegaly)
        {split_dir}/false/ → label 0 (no cardiomegaly)

    Converts grayscale to 3-channel RGB by repeating (required for ImageNet-
    pretrained models). Applies optional augmentation.
    """

    def __init__(self, root_dir: Path, transform=None):
        self.samples   = []   # list of (path, label)
        self.transform = transform

        for subdir in ['true', 'false']:
            label = 1 if subdir == 'true' else 0
            d     = root_dir / subdir
            if not d.exists():
                continue
            for p in d.iterdir():
                if p.suffix.lower() in {'.png', '.jpg', '.jpeg'}:
                    self.samples.append((p, label))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        img = Image.open(path).convert('L')   # grayscale
        img = img.convert('RGB')              # repeat to 3 channels
        if self.transform:
            img = self.transform(img)
        return img, label


def get_transforms(phase: str = 'train') -> transforms.Compose:
    """
    Augmentation notes:
    - Horizontal flip: anatomically valid (model learns shape features not position)
    - Rotation ≤10°: realistic patient positioning variation at 128px resolution
    - ColorJitter: accounts for scanner contrast/brightness variation
    - No vertical flip: PA/AP X-rays are always upright
    - No aggressive geometric distortion: would blur cardiac silhouette features
    - Stronger for train (regularisation), minimal for val/test
    """
    mean = [0.485, 0.456, 0.406]
    std  = [0.229, 0.224, 0.225]

    if phase == 'train':
        return transforms.Compose([
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=10),
            transforms.ColorJitter(brightness=0.25, contrast=0.25),
            transforms.RandomAffine(degrees=0, translate=(0.06, 0.06)),
            transforms.ToTensor(),
            transforms.Normalize(mean, std),
            transforms.RandomErasing(p=0.15, scale=(0.02, 0.06)),
        ])
    return transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean, std),
    ])


# ── Model ─────────────────────────────────────────────────────────────────────

def create_densenet121_model(dropout: float = 0.5) -> nn.Module:
    """
    DenseNet121 (CheXNet architecture) for binary cardiomegaly classification.

    DenseNet121 uses a Global Average Pooling before the classifier, making it
    compatible with any input size ≥ 32×32. For 128×128 input, the feature maps
    are 4×4 before GAP, which is adequate for classification.

    Freezing strategy:
    - denseblock1, denseblock2: frozen (low-level features from ImageNet)
    - denseblock3, denseblock4, classifier: fine-tuned
    """
    model = models.densenet121(weights='IMAGENET1K_V1')

    # Freeze early dense blocks
    for name, param in model.named_parameters():
        if 'denseblock1' in name or 'denseblock2' in name:
            param.requires_grad = False

    n_features = model.classifier.in_features  # 1024 for DenseNet121
    model.classifier = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(n_features, 256),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(256),
        nn.Dropout(dropout * 0.6),
        nn.Linear(256, 1),
        # No sigmoid here — BCEWithLogitsLoss applies it during training.
        # At inference: sigmoid(logit) gives probability.
    )
    return model


# ── Training utilities ────────────────────────────────────────────────────────

def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
    scaler: Optional[object],
) -> Tuple[float, float]:
    model.train()
    total_loss = 0.0
    all_probs, all_labels = [], []

    for imgs, labels in tqdm(loader, desc='Train', leave=False):
        imgs   = imgs.to(device)
        labels = labels.float().unsqueeze(1).to(device)

        optimizer.zero_grad()

        if scaler:
            with torch.amp.autocast('cuda'):
                logits = model(imgs)
                loss   = criterion(logits, labels)
            scaler.scale(loss).backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()
        else:
            logits = model(imgs)
            loss   = criterion(logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

        total_loss += loss.item()
        probs = torch.sigmoid(logits).detach().cpu().squeeze().tolist()
        all_probs.extend(probs if isinstance(probs, list) else [probs])
        all_labels.extend(labels.cpu().squeeze().tolist())

    avg_loss = total_loss / len(loader)
    auc      = roc_auc_score(all_labels, all_probs) if len(set(all_labels)) > 1 else 0.5
    return avg_loss, auc


@torch.no_grad()
def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Dict:
    model.eval()
    total_loss = 0.0
    all_probs, all_labels = [], []

    for imgs, labels in tqdm(loader, desc='Eval ', leave=False):
        imgs   = imgs.to(device)
        labels_f = labels.float().unsqueeze(1).to(device)
        logits   = model(imgs)
        total_loss += criterion(logits, labels_f).item()
        probs = torch.sigmoid(logits).cpu().squeeze().tolist()
        all_probs.extend(probs if isinstance(probs, list) else [probs])
        all_labels.extend(labels.tolist())

    avg_loss = total_loss / len(loader)
    auc      = roc_auc_score(all_labels, all_probs) if len(set(all_labels)) > 1 else 0.5
    return {
        'loss':   avg_loss,
        'auc':    auc,
        'probs':  np.array(all_probs),
        'labels': np.array(all_labels, dtype=int),
    }


def find_youden_threshold(probs: np.ndarray, labels: np.ndarray) -> float:
    """
    Find optimal decision threshold using Youden's J statistic.
    J = sensitivity + specificity - 1  (maximised at optimal threshold)
    """
    fpr, tpr, thresholds = roc_curve(labels, probs)
    j_scores = tpr - fpr
    best_idx = np.argmax(j_scores)
    return float(thresholds[best_idx])


def metrics_at_threshold(probs: np.ndarray, labels: np.ndarray, threshold: float) -> Dict:
    preds = (probs >= threshold).astype(int)
    return {
        'threshold':  round(threshold, 4),
        'accuracy':   round(accuracy_score(labels, preds), 4),
        'precision':  round(precision_score(labels, preds, zero_division=0), 4),
        'recall':     round(recall_score(labels, preds, zero_division=0), 4),
        'f1':         round(f1_score(labels, preds, zero_division=0), 4),
        'specificity': round(recall_score(labels, preds, pos_label=0, zero_division=0), 4),
    }


# ── Visualisations ─────────────────────────────────────────────────────────────

def plot_roc_curves(
    val_metrics: Dict,
    test_metrics: Dict,
    threshold: float,
    save_path: Path,
) -> None:
    fig, ax = plt.subplots(figsize=(7, 6))

    for name, m, color in [('Validation', val_metrics, 'steelblue'),
                            ('Test',       test_metrics, 'darkorange')]:
        fpr, tpr, _ = roc_curve(m['labels'], m['probs'])
        ax.plot(fpr, tpr, color=color, lw=2,
                label=f"{name} AUC = {m['auc']:.4f}")

    ax.axvline(x=0, color='grey', linestyle=':')
    ax.plot([0, 1], [0, 1], 'k--', lw=1)
    ax.set_xlabel('False Positive Rate (1 - Specificity)', fontsize=12)
    ax.set_ylabel('True Positive Rate (Sensitivity)', fontsize=12)
    ax.set_title('ROC Curve — Cardiomegaly Binary Classifier\n(DenseNet121, NIH ChestX-ray14)',
                 fontsize=12, fontweight='bold')
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    ax.set_xlim([0, 1]); ax.set_ylim([0, 1.02])

    # Mark Youden's threshold on val curve
    fpr_v, tpr_v, thr_v = roc_curve(val_metrics['labels'], val_metrics['probs'])
    dists = np.abs(thr_v - threshold)
    idx   = np.argmin(dists)
    ax.scatter(fpr_v[idx], tpr_v[idx], color='steelblue', zorder=5, s=80,
               label=f"Youden threshold={threshold:.3f}")
    ax.legend(fontsize=10)

    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  ROC curve saved → {save_path.name}")


def plot_confusion_matrix(
    metrics: Dict,
    threshold: float,
    save_path: Path,
) -> None:
    preds = (metrics['probs'] >= threshold).astype(int)
    cm    = confusion_matrix(metrics['labels'], preds)

    fig, ax = plt.subplots(figsize=(5, 4))
    if HAS_SNS:
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                    xticklabels=['No Cardiomegaly', 'Cardiomegaly'],
                    yticklabels=['No Cardiomegaly', 'Cardiomegaly'],
                    cbar=False)
    else:
        ax.imshow(cm, cmap='Blues')
        for r in range(2):
            for c in range(2):
                ax.text(c, r, str(cm[r, c]), ha='center', va='center', fontsize=14)
        ax.set_xticks([0, 1]); ax.set_xticklabels(['No Cardio.', 'Cardio.'])
        ax.set_yticks([0, 1]); ax.set_yticklabels(['No Cardio.', 'Cardio.'])

    tn, fp, fn, tp = cm.ravel()
    ax.set_xlabel('Predicted', fontsize=11)
    ax.set_ylabel('Actual', fontsize=11)
    ax.set_title(
        f"Confusion Matrix — Test Set (threshold={threshold:.3f})\n"
        f"TP={tp}  FP={fp}  FN={fn}  TN={tn}",
        fontsize=10, fontweight='bold'
    )
    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  Confusion matrix saved → {save_path.name}")


def plot_training_history(history: Dict, save_path: Path) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    axes[0].plot(history['train_loss'], label='Train'); axes[0].plot(history['val_loss'], label='Val')
    axes[0].set_title('BCE Loss'); axes[0].legend(); axes[0].grid(True)
    axes[0].set_xlabel('Epoch')

    axes[1].plot(history['train_auc'], label='Train AUC'); axes[1].plot(history['val_auc'], label='Val AUC')
    axes[1].axhline(0.90, color='red', linestyle='--', label='Target 0.90')
    axes[1].set_title('AUC-ROC'); axes[1].legend(); axes[1].grid(True)
    axes[1].set_xlabel('Epoch'); axes[1].set_ylim([0.5, 1.0])

    axes[2].semilogy(history['lr'], color='orange')
    axes[2].set_title('Learning Rate'); axes[2].grid(True)
    axes[2].set_xlabel('Epoch')

    plt.suptitle('Training History — Cardiomegaly Binary Classifier (DenseNet121)',
                 fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  Training history saved → {save_path.name}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    torch.manual_seed(SEED)
    np.random.seed(SEED)

    print("=" * 65)
    print(" Cardiomegaly Binary Classifier — DenseNet121 Training")
    print("=" * 65)

    train_raw = DATA_DIR / 'train' / 'train'
    test_dir  = DATA_DIR / 'test'  / 'test'

    if not train_raw.exists():
        print(f"\n❌ Dataset not found at {DATA_DIR}")
        print("   Run:  kaggle datasets download -d rahimanshu/cardiomegaly-disease-prediction-using-cnn")
        print("         unzip cardiomegaly-disease-prediction-using-cnn.zip -d data/cardiomegaly_raw")
        return 1

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n🚀 Device: {device}")
    if device.type == 'cuda':
        print(f"   GPU: {torch.cuda.get_device_name(0)}")

    # ── Datasets ─────────────────────────────────────────────────────────────
    print("\n📁 Loading datasets …")
    full_train_ds = CardiomegalyDataset(train_raw, transform=get_transforms('train'))
    test_ds       = CardiomegalyDataset(test_dir,  transform=get_transforms('val'))

    n_val   = int(len(full_train_ds) * VAL_SPLIT)
    n_train = len(full_train_ds) - n_val
    gen     = torch.Generator().manual_seed(SEED)
    train_ds, val_ds = random_split(full_train_ds, [n_train, n_val], generator=gen)

    # Override val transform (no augmentation)
    val_ds.dataset = CardiomegalyDataset(train_raw, transform=get_transforms('val'))
    val_subset_indices = val_ds.indices

    print(f"   Train:      {n_train} images  (80% of train split)")
    print(f"   Validation: {n_val}  images  (20% of train split)")
    print(f"   Test:       {len(test_ds)} images  (held-out)")
    print(f"   Classes:    0=No Cardiomegaly  1=Cardiomegaly")

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                              num_workers=NUM_WORKERS, pin_memory=True)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=True)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=True)

    # ── Model ─────────────────────────────────────────────────────────────────
    print("\n🏗️  Building DenseNet121 model …")
    model     = create_densenet121_model(dropout=0.5).to(device)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    frozen    = sum(p.numel() for p in model.parameters() if not p.requires_grad)
    print(f"   Trainable parameters : {trainable:,}")
    print(f"   Frozen parameters    : {frozen:,}")

    # Perfectly balanced dataset → no class weighting
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LR, weight_decay=WEIGHT_DECAY,
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='max', factor=0.5, patience=4, min_lr=1e-7, verbose=True
    )
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None

    # ── Training loop ─────────────────────────────────────────────────────────
    best_auc       = 0.0
    patience_count = 0
    history        = {'train_loss': [], 'val_loss': [], 'train_auc': [], 'val_auc': [], 'lr': []}
    start          = time.time()

    print(f"\n🎯 Training up to {NUM_EPOCHS} epochs (early-stop patience={PATIENCE}) …")
    print(f"   Target: AUC ≥ 0.90\n")

    for epoch in range(NUM_EPOCHS):
        print(f"{'─'*55}")
        print(f"Epoch {epoch+1}/{NUM_EPOCHS}")

        train_loss, train_auc = train_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_m                 = evaluate(model, val_loader, criterion, device)
        scheduler.step(val_m['auc'])

        lr = optimizer.param_groups[0]['lr']
        history['train_loss'].append(train_loss)
        history['val_loss'].append(val_m['loss'])
        history['train_auc'].append(train_auc)
        history['val_auc'].append(val_m['auc'])
        history['lr'].append(lr)

        print(f"  Train: loss={train_loss:.4f}  AUC={train_auc:.4f}")
        print(f"  Val:   loss={val_m['loss']:.4f}  AUC={val_m['auc']:.4f}  (LR={lr:.2e})")

        if val_m['auc'] > best_auc:
            best_auc       = val_m['auc']
            patience_count = 0
            ckpt           = MODELS_DIR / 'cardiac_binary_model.pth'
            torch.save(model.state_dict(), ckpt)
            print(f"  ✅ NEW BEST AUC={best_auc:.4f} → saved to {ckpt.name}")
        else:
            patience_count += 1
            print(f"  ⏳ No improvement ({patience_count}/{PATIENCE})")
            if patience_count >= PATIENCE:
                print(f"\n⏹️  Early stopping at epoch {epoch+1}")
                break

    elapsed = (time.time() - start) / 60
    print(f"\n{'='*55}")
    print(f"🎉 Training complete in {elapsed:.1f} min")
    print(f"🏆 Best val AUC: {best_auc:.4f}")

    # ── Load best checkpoint ──────────────────────────────────────────────────
    ckpt = MODELS_DIR / 'cardiac_binary_model.pth'
    model.load_state_dict(torch.load(ckpt, map_location=device, weights_only=True))

    # ── Final evaluation — val + test ─────────────────────────────────────────
    print("\n📊 Final evaluation on held-out TEST set …")
    val_metrics  = evaluate(model, val_loader,  criterion, device)
    test_metrics = evaluate(model, test_loader, criterion, device)

    # Youden's J optimal threshold from validation set
    threshold = find_youden_threshold(val_metrics['probs'], val_metrics['labels'])
    print(f"  Youden's J threshold (val): {threshold:.4f}")

    val_m_thr  = metrics_at_threshold(val_metrics['probs'],  val_metrics['labels'],  threshold)
    test_m_thr = metrics_at_threshold(test_metrics['probs'], test_metrics['labels'], threshold)

    print(f"\n  VAL SET   (at threshold={threshold:.4f}):")
    print(f"    AUC={val_metrics['auc']:.4f}  Acc={val_m_thr['accuracy']:.4f}  "
          f"P={val_m_thr['precision']:.4f}  R={val_m_thr['recall']:.4f}  "
          f"F1={val_m_thr['f1']:.4f}  Spec={val_m_thr['specificity']:.4f}")

    print(f"\n  TEST SET  (at threshold={threshold:.4f}):")
    print(f"    AUC={test_metrics['auc']:.4f}  Acc={test_m_thr['accuracy']:.4f}  "
          f"P={test_m_thr['precision']:.4f}  R={test_m_thr['recall']:.4f}  "
          f"F1={test_m_thr['f1']:.4f}  Spec={test_m_thr['specificity']:.4f}")

    # ── Plots ─────────────────────────────────────────────────────────────────
    print("\n📈 Generating plots …")
    plot_roc_curves(val_metrics, test_metrics, threshold, MODELS_DIR / 'cardiac_binary_roc.png')
    plot_confusion_matrix(test_metrics, threshold, MODELS_DIR / 'cardiac_binary_cm.png')
    plot_training_history(history, MODELS_DIR / 'cardiac_binary_history.png')

    # ── Save metadata ─────────────────────────────────────────────────────────
    metadata = {
        'model_name':        'DenseNet121 Cardiomegaly Binary Classifier',
        'model_version':     'DenseNet121-Cardiomegaly-BinaryV1',
        'task':              'binary classification — Cardiomegaly vs No Cardiomegaly',
        'classes':           {0: 'No Cardiomegaly', 1: 'Cardiomegaly'},
        'dataset':           'NIH ChestX-ray14 cardiomegaly subset',
        'dataset_source':    'rahimanshu/cardiomegaly-disease-prediction-using-cnn (Kaggle)',
        'dataset_note':      (
            'Contains all 2,776 cardiomegaly-labelled images from NIH ChestX-ray14, '
            'paired with 2,776 non-cardiomegaly images. '
            'Images pre-resized to 128×128 grayscale.'
        ),
        'n_train':           n_train,
        'n_val':             n_val,
        'n_test':            len(test_ds),
        'img_size':          IMG_SIZE,
        'architecture':      'DenseNet121 (ImageNet pretrained) — CheXNet-inspired',
        'frozen_blocks':     ['denseblock1', 'denseblock2'],
        'optimizer':         'AdamW',
        'scheduler':         'ReduceLROnPlateau(factor=0.5, patience=4)',
        'loss':              'BCEWithLogitsLoss',
        'training_date':     time.strftime('%Y-%m-%d'),
        'epochs_trained':    epoch + 1,
        'training_time_min': round(elapsed, 1),
        'youden_threshold':  round(threshold, 4),
        'val_auc':           round(val_metrics['auc'], 4),
        'test_auc':          round(test_metrics['auc'], 4),
        'val_metrics':       val_m_thr,
        'test_metrics':      test_m_thr,
        'history':           {k: [round(float(v), 5) for v in vals]
                              for k, vals in history.items()},
        'limitations': (
            'Model trained on 128×128 resized images from NIH ChestX-ray14. '
            'Performance may differ on full-resolution clinical images. '
            'The "No Cardiomegaly" class may include other lung/chest diseases '
            '(not exclusively "No Finding"), so this model detects the presence '
            'of cardiomegaly specifically, not general cardiac health. '
            'Do not use as a standalone diagnostic tool. '
            'Formal radiological review is mandatory for clinical decisions.'
        ),
    }

    meta_path = MODELS_DIR / 'cardiac_binary_metadata.json'
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"\n✅ Metadata saved → {meta_path.name}")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'='*65}")
    print(f" TRAINING COMPLETE")
    print(f"{'='*65}")
    print(f" Best val AUC  : {best_auc:.4f}")
    print(f" Test AUC      : {test_metrics['auc']:.4f}")
    print(f" Test Accuracy : {test_m_thr['accuracy']*100:.1f}%")
    print(f" Test Recall   : {test_m_thr['recall']*100:.1f}%  (sensitivity — cardio detected)")
    print(f" Test Precision: {test_m_thr['precision']*100:.1f}%")
    print(f" Test F1       : {test_m_thr['f1']*100:.1f}%")
    print(f" Test Spec     : {test_m_thr['specificity']*100:.1f}%  (true negative rate)")
    print(f" Threshold     : {threshold:.4f}  (Youden's J from val set)")
    print(f"\n Files saved to {MODELS_DIR}/")
    print(f"{'='*65}")

    if test_metrics['auc'] >= 0.90:
        print("\n🎯 TARGET ACHIEVED: AUC ≥ 0.90 ✅")
    elif test_metrics['auc'] >= 0.85:
        print("\n🟡 Good AUC (≥ 0.85). Consider: more epochs, stronger augmentation, or TTA.")
    else:
        print("\n🔴 AUC below 0.85. Consider: unfreezing more layers, adjusting LR, or more data.")

    return 0


if __name__ == '__main__':
    exit(main())
