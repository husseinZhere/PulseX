#!/usr/bin/env python3
"""
Cardiac X-Ray Classifier — Production Training Script
=======================================================
Dataset  : NIH ChestX-ray14 (112,120 frontal-view X-rays, 14 disease labels)
Task     : Multi-label binary classification — cardiac / cardiopulmonary findings
Labels   : Cardiomegaly, Effusion, Edema, Atelectasis, Consolidation

Why these labels?
  Cardiomegaly  — enlarged cardiac silhouette (CTR > 0.5); the primary X-ray
                  sign of structural heart disease.
  Effusion      — pleural effusion; hallmark of biventricular heart failure.
  Edema         — pulmonary oedema; key marker of acute decompensated HF.
  Atelectasis   — basilar collapse from elevated hemidiaphragm in CHF or
                  post-cardiac-surgery atelectasis.
  Consolidation — cardiogenic vs infective differential; occurs in flash
                  pulmonary oedema / decompensated CHF.
  Infiltration intentionally excluded: deprecated label in NIH v2 with no
  primary cardiac aetiology.

Run:
    # Step 1 — download NIH ChestX-ray14 dataset (42 GB):
    python3 setup_models.py --download-xray

    # Step 2 — train:
    python3 train_cardiac_xray.py

    # Optional — custom dataset path:
    NIH_XRAY_PATH=/your/path python3 train_cardiac_xray.py

Output (all saved to models/):
    cardiac_xray_model.pth         — best checkpoint (highest mean AUC on val)
    cardiac_xray_metadata.json     — full metrics, thresholds, training config
    cardiac_roc_curves.png         — per-class ROC curves (val + test)
    cardiac_confusion_matrix.png   — per-class confusion matrices at Youden threshold
    cardiac_training_history.png   — loss / AUC / LR curves

Architecture:
    ResNet50 (ImageNet pretrained)
    Layers 1–2 frozen; fine-tune from layer3 onward
    Head: 2048 → 512 → 256 → 5 (sigmoid, multi-label)
    Focal loss (γ=2.0, α=0.75) — handles severe class imbalance
    Mixed-precision FP16 on GPU, FP32 on CPU

Target performance:
    Mean AUC across 5 cardiac classes ≥ 0.80 (NIH ChestX-ray14 is challenging)
    Cardiomegaly AUC ≥ 0.87 (best-published benchmarks ~0.90)
    Edema AUC ≥ 0.80
    Effusion AUC ≥ 0.82
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from tqdm import tqdm

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    HAS_MPL = True
except ImportError:
    HAS_MPL = False

# ── Configuration ─────────────────────────────────────────────────────────────

CARDIAC_LABELS = [
    'Cardiomegaly',
    'Effusion',
    'Edema',
    'Atelectasis',
    'Consolidation',
]
N_CLASSES = len(CARDIAC_LABELS)

BASE_DIR      = Path(__file__).parent
DATASET_PATH  = Path(os.getenv('NIH_XRAY_PATH', '/data/nih_chest_xray'))
IMAGES_DIR    = DATASET_PATH / 'images'
LABELS_CSV    = DATASET_PATH / 'Data_Entry_2017.csv'
MODELS_DIR    = BASE_DIR / 'models'

BATCH_SIZE   = 32
NUM_EPOCHS   = 30
LR           = 3e-4
WEIGHT_DECAY = 1e-4
PATIENCE     = 8        # Early-stopping patience
IMG_SIZE     = 224
GRAD_CLIP    = 1.0
VAL_SPLIT    = 0.10     # 10% validation
TEST_SPLIT   = 0.10     # 10% held-out test set
NUM_WORKERS  = min(4, os.cpu_count() or 1)


# ── Focal Loss ────────────────────────────────────────────────────────────────

class FocalLoss(nn.Module):
    """
    Multi-label focal loss (Lin et al., RetinaNet 2017).

    Correct alpha_t formulation:
        alpha_t = alpha     if target == 1  (upweight rare positives)
        alpha_t = 1-alpha   if target == 0  (downweight frequent negatives)

    With alpha=0.75 and gamma=2.0, Cardiomegaly positives (~2.5% of images)
    receive 3× the gradient weight of negatives while easy negatives are
    suppressed by the focusing parameter.
    """

    def __init__(self, gamma: float = 2.0, alpha: float = 0.75):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        bce     = nn.functional.binary_cross_entropy_with_logits(logits, targets, reduction='none')
        probs   = torch.sigmoid(logits)
        pt      = torch.where(targets == 1, probs, 1 - probs)
        alpha_t = torch.where(
            targets == 1,
            torch.full_like(targets, self.alpha),
            torch.full_like(targets, 1.0 - self.alpha),
        )
        focal = alpha_t * (1 - pt) ** self.gamma * bce
        return focal.mean()


# ── Dataset ───────────────────────────────────────────────────────────────────

class NIHChestXRayDataset(Dataset):
    """
    NIH ChestX-ray14 dataset — cardiac label subset.

    Reads Data_Entry_2017.csv. Each sample is a frontal-view X-ray image
    with a multi-hot label vector for the 5 cardiac-relevant findings.
    """

    def __init__(self, records: List[Dict], images_dir: Path, transform=None):
        self.records    = records
        self.images_dir = images_dir
        self.transform  = transform

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        rec  = self.records[idx]
        path = self.images_dir / rec['filename']
        try:
            img = Image.open(path).convert('RGB')
        except Exception:
            img = Image.new('RGB', (IMG_SIZE, IMG_SIZE), color=128)
        if self.transform:
            img = self.transform(img)
        return img, torch.tensor(rec['labels'], dtype=torch.float32)


def load_nih_csv(csv_path: Path) -> List[Dict]:
    """Parse Data_Entry_2017.csv and return records with cardiac label vectors."""
    import csv
    records = []
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename   = row['Image Index'].strip()
            raw_labels = [l.strip() for l in row['Finding Labels'].split('|')]
            label_vec  = [1 if lbl in raw_labels else 0 for lbl in CARDIAC_LABELS]
            records.append({'filename': filename, 'labels': label_vec})
    return records


def three_way_split(
    records: List[Dict],
    val_ratio: float = VAL_SPLIT,
    test_ratio: float = TEST_SPLIT,
) -> Tuple[List, List, List]:
    """
    Stratified 3-way split (train / val / test).

    Stratification is on presence of ANY positive cardiac label so that
    the rare positive class (Cardiomegaly ~2.5%) is represented in all splits.
    """
    pos = [r for r in records if any(r['labels'])]
    neg = [r for r in records if not any(r['labels'])]

    rng = np.random.default_rng(42)
    rng.shuffle(pos)
    rng.shuffle(neg)

    def split3(lst, v, t):
        n_v = int(len(lst) * v)
        n_t = int(len(lst) * t)
        return lst[n_v + n_t:], lst[:n_v], lst[n_v:n_v + n_t]

    train_pos, val_pos, test_pos = split3(pos, val_ratio, test_ratio)
    train_neg, val_neg, test_neg = split3(neg, val_ratio, test_ratio)

    train = train_pos + train_neg
    val   = val_pos   + val_neg
    test  = test_pos  + test_neg
    rng.shuffle(train)
    rng.shuffle(val)
    rng.shuffle(test)
    return train, val, test


# ── Transforms ────────────────────────────────────────────────────────────────

def get_transforms(phase: str = 'train') -> transforms.Compose:
    """
    Training augmentations are conservative to avoid distorting cardiac anatomy:
    - Horizontal flip is acceptable (heart position is normally on the left, but
      dextrocardia is rare and the model learns structural features, not position).
    - Rotation ≤15°: extreme rotation is clinically rare on properly positioned CXRs.
    - Colour jitter (brightness/contrast): accounts for scanner variation.
    - RandomAffine (translate ≤8%): accounts for patient positioning variation.
    - RandomErasing (p=0.2, small scale): regularisation only.
    - No vertical flip: PA/AP orientation is always upright; vertical flip would
      produce anatomically impossible images.
    """
    if phase == 'train':
        return transforms.Compose([
            transforms.Resize(256),
            transforms.RandomCrop(IMG_SIZE),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.3, contrast=0.3),
            transforms.RandomAffine(degrees=0, translate=(0.08, 0.08)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            transforms.RandomErasing(p=0.2, scale=(0.02, 0.08)),
        ])
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(IMG_SIZE),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])


# ── Model ─────────────────────────────────────────────────────────────────────

def create_cardiac_model(n_classes: int, dropout: float = 0.5) -> nn.Module:
    """
    ResNet50 (ImageNet pretrained) with multi-label cardiac classification head.

    Frozen: conv1, bn1, layer1, layer2 (general low-level features, stable).
    Trained: layer3, layer4, fc           (task-specific high-level features).

    Head: 2048 → Dropout → 512 → ReLU → BN → Dropout → 256 → ReLU → BN → Dropout → n_classes
    No final sigmoid — applied in loss (BCEWithLogitsLoss / FocalLoss) and at inference.
    """
    model = models.resnet50(weights='IMAGENET1K_V2')

    for name, param in model.named_parameters():
        if any(x in name for x in ['conv1', 'bn1', 'layer1', 'layer2']):
            param.requires_grad = False

    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(512),
        nn.Dropout(dropout * 0.6),
        nn.Linear(512, 256),
        nn.ReLU(inplace=True),
        nn.BatchNorm1d(256),
        nn.Dropout(dropout * 0.4),
        nn.Linear(256, n_classes),
    )
    return model


# ── Training utilities ────────────────────────────────────────────────────────

def train_epoch(model, loader, criterion, optimizer, device, scaler) -> Tuple[float, float]:
    model.train()
    total_loss = 0.0
    all_preds, all_labels = [], []

    for imgs, labels in tqdm(loader, desc='Train', leave=False):
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()

        if scaler:
            with torch.amp.autocast('cuda'):
                logits = model(imgs)
                loss   = criterion(logits, labels)
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP)
            scaler.step(optimizer)
            scaler.update()
        else:
            logits = model(imgs)
            loss   = criterion(logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP)
            optimizer.step()

        total_loss += loss.item()
        preds = (torch.sigmoid(logits) >= 0.5).float()
        all_preds.append(preds.cpu())
        all_labels.append(labels.cpu())

    avg_loss  = total_loss / len(loader)
    exact_acc = float((torch.cat(all_preds).numpy() == torch.cat(all_labels).numpy()).all(axis=1).mean())
    return avg_loss, exact_acc


@torch.no_grad()
def evaluate(model, loader, criterion, device) -> Dict:
    """Full evaluation: loss, exact-match accuracy, per-class AUC, raw probs/labels."""
    model.eval()
    total_loss = 0.0
    all_probs, all_labels = [], []

    for imgs, labels in tqdm(loader, desc='Eval ', leave=False):
        imgs, labels = imgs.to(device), labels.to(device)
        logits       = model(imgs)
        total_loss  += criterion(logits, labels).item()
        all_probs.append(torch.sigmoid(logits).cpu())
        all_labels.append(labels.cpu())

    probs_cat  = torch.cat(all_probs).numpy()
    labels_cat = torch.cat(all_labels).numpy()
    preds_cat  = (probs_cat >= 0.5).astype(int)

    avg_loss  = total_loss / len(loader)
    exact_acc = float((preds_cat == labels_cat).all(axis=1).mean())

    per_class_auc = {}
    for i, lbl in enumerate(CARDIAC_LABELS):
        if labels_cat[:, i].sum() > 0:
            per_class_auc[lbl] = roc_auc_score(labels_cat[:, i], probs_cat[:, i])
        else:
            per_class_auc[lbl] = float('nan')

    mean_auc = float(np.nanmean(list(per_class_auc.values())))

    return {
        'loss':          avg_loss,
        'exact_acc':     exact_acc,
        'mean_auc':      mean_auc,
        'per_class_auc': per_class_auc,
        'probs':         probs_cat,
        'labels':        labels_cat,
        'preds':         preds_cat,
    }


# ── Per-class Youden's J threshold optimisation ───────────────────────────────

def find_per_class_thresholds(probs: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    """
    Independently optimise the decision threshold for each class using Youden's J statistic.

    J = sensitivity + specificity − 1  (maximised at Youden's optimal threshold)

    Using a single 0.5 threshold is incorrect for multi-label cardiac detection:
    Cardiomegaly prevalence (~2.5%) requires a lower threshold than Consolidation
    (~10%) to achieve clinically acceptable sensitivity.
    """
    thresholds = {}
    print("\nPer-class Youden's J threshold optimisation:")
    for i, label in enumerate(CARDIAC_LABELS):
        y_true = labels[:, i]
        if y_true.sum() < 5:
            thresholds[label] = 0.5
            print(f"  {label:20s} threshold=0.500  (insufficient positives in val set)")
            continue

        best_j, best_t = -1.0, 0.5
        for t in np.arange(0.05, 0.95, 0.005):
            y_pred = (probs[:, i] >= t).astype(int)
            sens   = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
            spec   = recall_score(y_true, y_pred, pos_label=0, zero_division=0)
            j = sens + spec - 1.0
            if j > best_j:
                best_j, best_t = j, t

        thresholds[label] = round(float(best_t), 3)
        y_opt = (probs[:, i] >= best_t).astype(int)
        sens_opt = recall_score(y_true, y_opt, pos_label=1, zero_division=0)
        spec_opt = recall_score(y_true, y_opt, pos_label=0, zero_division=0)
        print(f"  {label:20s} threshold={best_t:.3f}  sens={sens_opt*100:.1f}%  spec={spec_opt*100:.1f}%")

    return thresholds


# ── Visualisations ─────────────────────────────────────────────────────────────

def plot_roc_curves(val_metrics: Dict, test_metrics: Dict, save_path: Path) -> None:
    """Per-class ROC curves for both val and test sets."""
    if not HAS_MPL:
        return
    n = N_CLASSES
    fig, axes = plt.subplots(1, n, figsize=(5 * n, 4))
    if n == 1:
        axes = [axes]

    for i, (lbl, ax) in enumerate(zip(CARDIAC_LABELS, axes)):
        for split_name, metrics, color in [
            ('Val',  val_metrics,  'steelblue'),
            ('Test', test_metrics, 'darkorange'),
        ]:
            y_true = metrics['labels'][:, i]
            y_prob = metrics['probs'][:, i]
            if y_true.sum() == 0:
                continue
            fpr, tpr, _ = roc_curve(y_true, y_prob)
            auc_val      = roc_auc_score(y_true, y_prob)
            ax.plot(fpr, tpr, color=color, lw=1.5,
                    label=f"{split_name} AUC={auc_val:.3f}")

        ax.plot([0, 1], [0, 1], 'k--', lw=0.8)
        ax.set_title(lbl, fontsize=10, fontweight='bold')
        ax.set_xlabel('FPR'); ax.set_ylabel('TPR')
        ax.legend(fontsize=7); ax.grid(True, alpha=0.3)
        ax.set_xlim([0, 1]); ax.set_ylim([0, 1.02])

    plt.suptitle('Per-Class ROC Curves — Cardiac X-Ray Classifier', fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  ROC curves saved → {save_path}")


def plot_confusion_matrices(
    test_metrics: Dict,
    per_class_thresholds: Dict[str, float],
    save_path: Path,
) -> None:
    """Per-class confusion matrices at Youden's J threshold."""
    if not HAS_MPL:
        return
    try:
        import seaborn as sns
    except ImportError:
        sns = None

    n   = N_CLASSES
    fig, axes = plt.subplots(1, n, figsize=(4 * n, 4))
    if n == 1:
        axes = [axes]

    labels_cat = test_metrics['labels']
    probs_cat  = test_metrics['probs']

    for i, (lbl, ax) in enumerate(zip(CARDIAC_LABELS, axes)):
        t     = per_class_thresholds.get(lbl, 0.5)
        preds = (probs_cat[:, i] >= t).astype(int)
        cm    = confusion_matrix(labels_cat[:, i], preds)

        if sns is not None:
            sns.heatmap(
                cm, annot=True, fmt='d', cmap='Blues', ax=ax,
                xticklabels=['Neg', 'Pos'],
                yticklabels=['Neg', 'Pos'],
                cbar=False,
            )
        else:
            ax.imshow(cm, cmap='Blues')
            for r in range(2):
                for c in range(2):
                    ax.text(c, r, str(cm[r, c]), ha='center', va='center', fontsize=12)
            ax.set_xticks([0, 1]); ax.set_xticklabels(['Neg', 'Pos'])
            ax.set_yticks([0, 1]); ax.set_yticklabels(['Neg', 'Pos'])

        n_pos = labels_cat[:, i].sum()
        ax.set_title(f"{lbl}\nthresh={t:.3f}  n_pos={n_pos:.0f}", fontsize=8, fontweight='bold')
        ax.set_xlabel('Predicted'); ax.set_ylabel('True')

    plt.suptitle('Per-Class Confusion Matrices (test set, Youden threshold)',
                 fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  Confusion matrices saved → {save_path}")


def plot_training_history(history: Dict, save_path: Path) -> None:
    if not HAS_MPL:
        return
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    axes[0].plot(history['train_loss'], label='Train'); axes[0].plot(history['val_loss'], label='Val')
    axes[0].set_title('Loss'); axes[0].legend(); axes[0].grid(True)
    axes[1].plot(history['val_auc'], color='green')
    axes[1].axhline(0.80, color='red', linestyle='--', label='Target AUC 0.80')
    axes[1].set_title('Val Mean AUC'); axes[1].legend(); axes[1].grid(True)
    axes[2].semilogy(history['lr'], color='orange')
    axes[2].set_title('Learning Rate'); axes[2].grid(True)
    plt.suptitle('Training History — Cardiac X-Ray Classifier', fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches='tight')
    plt.close()
    print(f"  Training history saved → {save_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    print("=" * 70)
    print(" Cardiac X-Ray Classifier — NIH ChestX-ray14 Training Pipeline")
    print("=" * 70)

    if not IMAGES_DIR.exists() or not LABELS_CSV.exists():
        print(f"\n❌ Dataset not found.")
        print(f"   Expected images : {IMAGES_DIR}")
        print(f"   Expected CSV    : {LABELS_CSV}")
        print(f"\n   To download NIH ChestX-ray14:")
        print(f"     python3 setup_models.py --download-xray")
        print(f"   Or set: NIH_XRAY_PATH=/your/dataset/path")
        return 1

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n🚀 Device: {device}")

    # ── Load and split dataset ──────────────────────────────────────────────
    print("\n📁 Loading NIH ChestX-ray14 CSV …")
    all_records = load_nih_csv(LABELS_CSV)
    print(f"   Total records: {len(all_records):,}")

    train_recs, val_recs, test_recs = three_way_split(all_records)
    print(f"   Train: {len(train_recs):,}  Val: {len(val_recs):,}  Test: {len(test_recs):,}")

    print("\n⚖️  Class distribution (train set):")
    for i, lbl in enumerate(CARDIAC_LABELS):
        n   = sum(r['labels'][i] for r in train_recs)
        pct = n / len(train_recs) * 100
        print(f"   {lbl:20s}: {n:6d}  ({pct:.1f}%)")

    # ── Datasets and loaders ────────────────────────────────────────────────
    train_ds = NIHChestXRayDataset(train_recs, IMAGES_DIR, get_transforms('train'))
    val_ds   = NIHChestXRayDataset(val_recs,   IMAGES_DIR, get_transforms('val'))
    test_ds  = NIHChestXRayDataset(test_recs,  IMAGES_DIR, get_transforms('val'))

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                              num_workers=NUM_WORKERS, pin_memory=True)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=True)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=True)

    # ── Model, loss, optimizer ──────────────────────────────────────────────
    print("\n🏗️  Building ResNet50 cardiac classifier …")
    model = create_cardiac_model(N_CLASSES).to(device)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"   Trainable parameters: {trainable:,}")

    criterion = FocalLoss(gamma=2.0, alpha=0.75)

    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LR, weight_decay=WEIGHT_DECAY,
    )
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=5, T_mult=2, eta_min=1e-6
    )
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None

    # ── Training loop ───────────────────────────────────────────────────────
    MODELS_DIR.mkdir(exist_ok=True)
    best_auc       = 0.0
    patience_count = 0
    history        = {'train_loss': [], 'val_loss': [], 'val_auc': [], 'lr': []}
    start          = time.time()

    print(f"\n🎯 Training up to {NUM_EPOCHS} epochs (early-stop patience={PATIENCE}) …")

    for epoch in range(NUM_EPOCHS):
        print(f"\n{'─'*60}")
        print(f"Epoch {epoch+1}/{NUM_EPOCHS}")

        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_metrics           = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        lr = optimizer.param_groups[0]['lr']
        history['train_loss'].append(train_loss)
        history['val_loss'].append(val_metrics['loss'])
        history['val_auc'].append(val_metrics['mean_auc'])
        history['lr'].append(lr)

        print(f"  Train: loss={train_loss:.4f}  exact-acc={train_acc*100:.1f}%")
        print(f"  Val:   loss={val_metrics['loss']:.4f}  exact-acc={val_metrics['exact_acc']*100:.1f}%"
              f"  mean-AUC={val_metrics['mean_auc']:.4f}")
        for lbl, auc_v in val_metrics['per_class_auc'].items():
            auc_str = f"{auc_v:.4f}" if not np.isnan(auc_v) else "  N/A"
            print(f"           {lbl:20s} AUC={auc_str}")

        if val_metrics['mean_auc'] > best_auc:
            best_auc       = val_metrics['mean_auc']
            patience_count = 0
            ckpt_path      = MODELS_DIR / 'cardiac_xray_model.pth'
            torch.save(model.state_dict(), ckpt_path)
            print(f"  ✅ NEW BEST mean-AUC={best_auc:.4f} → saved to {ckpt_path}")
        else:
            patience_count += 1
            print(f"  ⏳ No improvement ({patience_count}/{PATIENCE})")
            if patience_count >= PATIENCE:
                print(f"\n⏹️  Early stopping at epoch {epoch+1}")
                break

    elapsed = (time.time() - start) / 60
    print(f"\n{'='*60}")
    print(f"🎉 Training complete in {elapsed:.1f} min")
    print(f"🏆 Best val mean-AUC: {best_auc:.4f}")

    # ── Load best checkpoint for threshold optimisation + test evaluation ──
    print("\n⚖️  Loading best checkpoint …")
    best_path = MODELS_DIR / 'cardiac_xray_model.pth'
    model.load_state_dict(torch.load(best_path, map_location=device, weights_only=True))

    print("Computing per-class Youden's J thresholds on validation set …")
    final_val  = evaluate(model, val_loader,  criterion, device)
    per_class_thresholds = find_per_class_thresholds(final_val['probs'], final_val['labels'])

    # ── Test set evaluation ─────────────────────────────────────────────────
    print("\n📊 Evaluating on held-out test set …")
    test_metrics = evaluate(model, test_loader, criterion, device)
    print(f"  Test mean-AUC: {test_metrics['mean_auc']:.4f}")
    for lbl, auc_v in test_metrics['per_class_auc'].items():
        auc_str = f"{auc_v:.4f}" if not np.isnan(auc_v) else "  N/A"
        print(f"    {lbl:20s} AUC={auc_str}")

    # Per-class precision/recall/F1 at Youden threshold
    print("\n📊 Per-class classification report (test set, Youden threshold):")
    for i, lbl in enumerate(CARDIAC_LABELS):
        t    = per_class_thresholds.get(lbl, 0.5)
        pred = (test_metrics['probs'][:, i] >= t).astype(int)
        true = test_metrics['labels'][:, i].astype(int)
        if true.sum() > 0:
            report = classification_report(true, pred, target_names=['Neg', 'Pos'],
                                          output_dict=True, zero_division=0)
            pos = report.get('Pos', {})
            print(f"  {lbl:20s}  P={pos.get('precision',0):.3f}  "
                  f"R={pos.get('recall',0):.3f}  F1={pos.get('f1-score',0):.3f}")

    # ── Plots ───────────────────────────────────────────────────────────────
    print("\n📈 Saving visualisations …")
    plot_roc_curves(final_val, test_metrics, MODELS_DIR / 'cardiac_roc_curves.png')
    plot_confusion_matrices(test_metrics, per_class_thresholds, MODELS_DIR / 'cardiac_confusion_matrix.png')
    plot_training_history(history, MODELS_DIR / 'cardiac_training_history.png')

    # ── Save metadata ───────────────────────────────────────────────────────
    metadata = {
        'model_name':           'ResNet50 Cardiac X-Ray Classifier',
        'model_version':        'ResNet50-NIH-CardiacV1-MultiLabel',
        'task':                 'multi-label cardiac finding detection',
        'labels':               CARDIAC_LABELS,
        'n_classes':            N_CLASSES,
        'dataset':              'NIH ChestX-ray14',
        'dataset_reference':    'Wang et al., CVPR 2017 — https://nihcc.app.box.com/v/ChestXray-NIHCC',
        'dataset_cardiac_note': (
            'Cardiac-relevant subset of NIH ChestX-ray14. '
            'Labels chosen: Cardiomegaly, Effusion, Edema, Atelectasis, Consolidation. '
            'Infiltration excluded: deprecated in NIH v2, no primary cardiac aetiology.'
        ),
        'best_mean_auc':        float(best_auc),
        'val_per_class_auc':    {k: (round(v, 4) if not np.isnan(v) else None)
                                 for k, v in final_val['per_class_auc'].items()},
        'test_mean_auc':        float(test_metrics['mean_auc']),
        'test_per_class_auc':   {k: (round(v, 4) if not np.isnan(v) else None)
                                 for k, v in test_metrics['per_class_auc'].items()},
        'per_class_thresholds': per_class_thresholds,
        'training_date':        time.strftime('%Y-%m-%d'),
        'img_size':             IMG_SIZE,
        'batch_size':           BATCH_SIZE,
        'optimizer':            'AdamW',
        'scheduler':            'CosineAnnealingWarmRestarts(T_0=5, T_mult=2)',
        'loss':                 'FocalLoss(gamma=2.0, alpha=0.75)',
        'frozen_layers':        ['conv1', 'bn1', 'layer1', 'layer2'],
        'history':              history,
        'limitations': (
            'Model trained on NIH ChestX-ray14 frontal-view PA/AP X-rays. '
            'Performance may be lower on portable/AP/paediatric/post-surgical images. '
            'Multi-label accuracy is inherently limited by inter-observer label noise in NIH dataset. '
            'Cardiomegaly label in NIH is based on radiologist report, not CTR measurement. '
            'Do not use as a standalone diagnostic tool.'
        ),
    }

    meta_path = MODELS_DIR / 'cardiac_xray_metadata.json'
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"\n✅ Metadata saved → {meta_path}")
    print(f"\n✅ All outputs saved to {MODELS_DIR}/")

    return 0


if __name__ == '__main__':
    exit(main())
