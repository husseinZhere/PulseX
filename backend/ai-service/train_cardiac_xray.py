#!/usr/bin/env python3
"""
Cardiac X-Ray Classifier — Training Script
============================================
Dataset  : NIH ChestX-ray14 (112,120 frontal-view X-rays, 14 disease labels)
Task     : Multi-label binary classification focused on cardiac / cardiopulmonary findings
Labels   : Cardiomegaly, Effusion, Edema, Infiltration, Consolidation + No Finding

Run:
    # 1. Download the NIH dataset:
    python3 setup_models.py --download-xray

    # 2. Train:
    python3 train_cardiac_xray.py

Output:
    models/cardiac_xray_model.pth        — trained weights
    models/cardiac_xray_metadata.json   — metrics & config

Architecture:
    ResNet50 pre-trained on ImageNet
    Custom head: 2048 → 512 → 256 → n_classes (sigmoid for multi-label)
    Focal loss (handles severe class imbalance without SMOTE)
    Mixed-precision training (FP16 on GPU, FP32 fallback on CPU)
"""

import json
import os
import time
from collections import Counter
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
    roc_auc_score,
    recall_score,
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

# NIH ChestX-ray14 cardiac-relevant labels (subset of all 14)
CARDIAC_LABELS = [
    'Cardiomegaly',    # enlarged heart silhouette (CTR > 0.5) — most direct cardiac finding
    'Effusion',        # pleural effusion — common consequence of left/right heart failure
    'Edema',           # pulmonary oedema — key radiographic marker of acute heart failure
    'Atelectasis',     # basilar collapse from elevated hemidiaphragm in CHF or post-cardiac surgery
    'Consolidation',   # cardiac vs infectious differential — cardiogenic consolidation occurs in flash pulmonary oedema
    # Infiltration intentionally excluded: non-specific, poorly-defined label deprecated
    # in NIH ChestX-ray14 v2; no primary cardiac aetiology.
]
N_CLASSES = len(CARDIAC_LABELS)

# Paths — update DATASET_PATH to match your local copy
BASE_DIR    = Path(__file__).parent
DATASET_PATH = Path(os.getenv('NIH_XRAY_PATH', '/data/nih_chest_xray'))
IMAGES_DIR  = DATASET_PATH / 'images'
LABELS_CSV  = DATASET_PATH / 'Data_Entry_2017.csv'
MODELS_DIR  = BASE_DIR / 'models'

# Hyperparameters
BATCH_SIZE    = 32
NUM_EPOCHS    = 25
LR            = 3e-4
WEIGHT_DECAY  = 1e-4
PATIENCE      = 7       # early stopping patience
IMG_SIZE      = 224
GRAD_CLIP     = 1.0
VAL_SPLIT     = 0.15
NUM_WORKERS   = min(4, os.cpu_count() or 1)


# ── Focal Loss (handles class imbalance without SMOTE) ───────────────────────

class FocalLoss(nn.Module):
    """
    Multi-label focal loss — Lin et al. (RetinaNet, 2017), corrected for class imbalance.

    BUG FIXED: prior version applied alpha uniformly to all examples, which is a
    scaling constant, not class-aware weighting.  Correct formulation:
        alpha_t = alpha      if target == 1  (minority positive class)
        alpha_t = 1 - alpha  if target == 0  (majority negative class)

    With alpha=0.75 (recommended for severe class imbalance like NIH cardiac labels):
        Cardiomegaly positives (~2.5% of images) → weighted 3× relative to negatives.
    gamma=2.0 further down-weights easy negatives so the gradient focuses on hard,
    rare positive examples.
    """
    def __init__(self, gamma: float = 2.0, alpha: float = 0.75):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        F = nn.functional
        bce = F.binary_cross_entropy_with_logits(logits, targets, reduction='none')
        probs   = torch.sigmoid(logits)
        pt      = torch.where(targets == 1, probs, 1 - probs)
        # alpha_t: up-weight rare positives, down-weight abundant negatives
        alpha_t = torch.where(targets == 1,
                              torch.full_like(targets, self.alpha),
                              torch.full_like(targets, 1.0 - self.alpha))
        focal   = alpha_t * (1 - pt) ** self.gamma * bce
        return focal.mean()


# ── Dataset ───────────────────────────────────────────────────────────────────

class NIHChestXRayDataset(Dataset):
    """
    NIH ChestX-ray14 dataset loader.

    Reads Data_Entry_2017.csv and loads images from the images/ directory.
    Each image can have multiple labels (multi-label).

    Expected CSV columns:
        Image Index | Finding Labels | ... (other columns ignored)
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

        label_vec = torch.tensor(rec['labels'], dtype=torch.float32)
        return img, label_vec


def load_nih_csv(csv_path: Path) -> List[Dict]:
    """Parse NIH Data_Entry_2017.csv and return list of records."""
    import csv
    records = []
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename = row['Image Index'].strip()
            raw_labels = [l.strip() for l in row['Finding Labels'].split('|')]

            label_vec = [
                1 if lbl in raw_labels else 0
                for lbl in CARDIAC_LABELS
            ]
            records.append({'filename': filename, 'labels': label_vec})
    return records


def split_dataset(records: List[Dict], val_ratio: float = VAL_SPLIT) -> Tuple[List, List]:
    """Stratified split by presence of any positive cardiac label."""
    pos = [r for r in records if any(r['labels'])]
    neg = [r for r in records if not any(r['labels'])]

    rng = np.random.default_rng(42)
    rng.shuffle(pos)
    rng.shuffle(neg)

    n_pos_val = int(len(pos) * val_ratio)
    n_neg_val = int(len(neg) * val_ratio)

    val   = pos[:n_pos_val] + neg[:n_neg_val]
    train = pos[n_pos_val:] + neg[n_neg_val:]
    rng.shuffle(train)
    rng.shuffle(val)
    return train, val


# ── Transforms ────────────────────────────────────────────────────────────────

def get_transforms(phase: str = 'train') -> transforms.Compose:
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
    ResNet50 with multi-label cardiac classification head.
    Final activation: Sigmoid (NOT softmax — multi-label problem).
    """
    model = models.resnet50(weights='IMAGENET1K_V2')

    # Freeze early layers, fine-tune from layer3 onward
    for name, param in model.named_parameters():
        if 'layer1' in name or 'layer2' in name or 'bn1' in name or 'conv1' in name:
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
        # No sigmoid here — applied in loss and at inference
    )
    return model


# ── Training ──────────────────────────────────────────────────────────────────

def find_per_class_thresholds(probs: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    """
    Find the Youden's-J-optimal threshold for each class independently.

    Using a single 0.5 threshold for all classes is incorrect for multi-label
    cardiac detection: Cardiomegaly prevalence (~2.5%) requires a lower threshold
    than Consolidation (~10%) to achieve acceptable sensitivity.

    Returns a dict mapping each CARDIAC_LABELS entry to its optimal threshold.
    """
    thresholds = {}
    for i, label in enumerate(CARDIAC_LABELS):
        y_true = labels[:, i]
        if y_true.sum() < 5:
            thresholds[label] = 0.5
            continue
        best_j, best_t = -1.0, 0.5
        for t in np.arange(0.05, 0.95, 0.005):
            y_pred = (probs[:, i] >= t).astype(int)
            sens = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
            spec = recall_score(y_true, y_pred, pos_label=0, zero_division=0)
            j = sens + spec - 1.0
            if j > best_j:
                best_j, best_t = j, t
        thresholds[label] = round(float(best_t), 3)
        y_pred_opt = (probs[:, i] >= best_t).astype(int)
        sens_opt = recall_score(y_true, y_pred_opt, pos_label=1, zero_division=0)
        spec_opt = recall_score(y_true, y_pred_opt, pos_label=0, zero_division=0)
        print(f"   {label:20s} threshold={best_t:.3f}  sens={sens_opt*100:.1f}%  spec={spec_opt*100:.1f}%")
    return thresholds


def compute_pos_weights(records: List[Dict]) -> torch.Tensor:
    """Compute BCE pos_weight per class to handle class imbalance."""
    n = len(records)
    pos_counts = np.array([sum(r['labels'][i] for r in records) for i in range(N_CLASSES)])
    neg_counts = n - pos_counts
    weights = neg_counts / (pos_counts + 1e-6)
    return torch.tensor(weights, dtype=torch.float32)


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

    avg_loss = total_loss / len(loader)
    preds_cat  = torch.cat(all_preds).numpy()
    labels_cat = torch.cat(all_labels).numpy()
    # Exact match accuracy (all labels correct per sample)
    exact_acc = float((preds_cat == labels_cat).all(axis=1).mean())
    return avg_loss, exact_acc


@torch.no_grad()
def validate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Dict:
    model.eval()
    total_loss = 0.0
    all_probs, all_preds, all_labels = [], [], []

    for imgs, labels in tqdm(loader, desc='Val  ', leave=False):
        imgs, labels = imgs.to(device), labels.to(device)
        logits = model(imgs)
        loss   = criterion(logits, labels)
        total_loss += loss.item()

        probs = torch.sigmoid(logits)
        preds = (probs >= 0.5).float()
        all_probs.append(probs.cpu())
        all_preds.append(preds.cpu())
        all_labels.append(labels.cpu())

    probs_cat  = torch.cat(all_probs).numpy()
    preds_cat  = torch.cat(all_preds).numpy()
    labels_cat = torch.cat(all_labels).numpy()

    avg_loss  = total_loss / len(loader)
    exact_acc = float((preds_cat == labels_cat).all(axis=1).mean())

    # Per-class AUC-ROC (skip classes with no positives in val set)
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
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print(" Cardiac X-Ray Classifier — NIH ChestX-ray14")
    print("=" * 70)

    if not IMAGES_DIR.exists() or not LABELS_CSV.exists():
        print(f"\n❌ Dataset not found.")
        print(f"   Expected images at : {IMAGES_DIR}")
        print(f"   Expected CSV  at   : {LABELS_CSV}")
        print(f"\n   Run:  python3 setup_models.py --download-xray")
        print(f"   Or set NIH_XRAY_PATH env variable to your dataset location.")
        return 1

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\n🚀 Training on: {device}")

    # Load and split dataset
    print("\n📁 Loading NIH dataset CSV …")
    all_records = load_nih_csv(LABELS_CSV)
    print(f"   Total records: {len(all_records):,}")

    train_recs, val_recs = split_dataset(all_records)
    print(f"   Train: {len(train_recs):,}  |  Val: {len(val_recs):,}")

    # Class distribution
    print("\n⚖️  Positive samples per class (train):")
    for i, lbl in enumerate(CARDIAC_LABELS):
        count = sum(r['labels'][i] for r in train_recs)
        print(f"   {lbl:20s}: {count:6d}  ({count/len(train_recs)*100:.1f}%)")

    # Datasets and loaders
    train_ds = NIHChestXRayDataset(train_recs, IMAGES_DIR, get_transforms('train'))
    val_ds   = NIHChestXRayDataset(val_recs,   IMAGES_DIR, get_transforms('val'))

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                              num_workers=NUM_WORKERS, pin_memory=True)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,
                              num_workers=NUM_WORKERS, pin_memory=True)

    # Model
    print("\n🏗️  Building ResNet50 cardiac classifier …")
    model = create_cardiac_model(N_CLASSES).to(device)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"   Trainable parameters: {trainable:,}")

    # Loss: weighted BCE (alternative to focal loss; comment out one)
    pos_weights = compute_pos_weights(train_recs).to(device)
    criterion   = FocalLoss(gamma=2.0, alpha=0.75)
    # criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weights)  # alternative

    # Optimizer and scheduler
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LR, weight_decay=WEIGHT_DECAY,
    )
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(
        optimizer, T_0=5, T_mult=2, eta_min=1e-6
    )

    # Mixed precision
    scaler = torch.amp.GradScaler('cuda') if device.type == 'cuda' else None

    # Training loop
    MODELS_DIR.mkdir(exist_ok=True)
    best_auc       = 0.0
    patience_count = 0
    history        = {'train_loss': [], 'val_loss': [], 'val_auc': [], 'lr': []}
    start          = time.time()

    print(f"\n🎯 Training for up to {NUM_EPOCHS} epochs (early stop patience={PATIENCE}) …\n")

    for epoch in range(NUM_EPOCHS):
        print(f"{'─'*60}")
        print(f"Epoch {epoch+1}/{NUM_EPOCHS}")

        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_metrics = validate(model, val_loader, criterion, device)
        scheduler.step()

        lr = optimizer.param_groups[0]['lr']
        history['train_loss'].append(train_loss)
        history['val_loss'].append(val_metrics['loss'])
        history['val_auc'].append(val_metrics['mean_auc'])
        history['lr'].append(lr)

        print(f"  Train  — loss: {train_loss:.4f}  exact-acc: {train_acc*100:.1f}%")
        print(f"  Val    — loss: {val_metrics['loss']:.4f}  exact-acc: {val_metrics['exact_acc']*100:.1f}%  mean-AUC: {val_metrics['mean_auc']:.4f}")
        for lbl, auc in val_metrics['per_class_auc'].items():
            print(f"           {lbl:20s} AUC: {auc:.4f}")

        if val_metrics['mean_auc'] > best_auc:
            best_auc = val_metrics['mean_auc']
            patience_count = 0
            model_path = MODELS_DIR / 'cardiac_xray_model.pth'
            torch.save(model.state_dict(), model_path)
            print(f"  ✅ NEW BEST  mean-AUC={best_auc:.4f} → saved to {model_path}")
        else:
            patience_count += 1
            print(f"  ⏳ No improvement ({patience_count}/{PATIENCE})")
            if patience_count >= PATIENCE:
                print(f"\n⏹️  Early stopping after epoch {epoch+1}")
                break

    elapsed = (time.time() - start) / 60
    print(f"\n{'='*60}")
    print(f"🎉 Training complete in {elapsed:.1f} min")
    print(f"🏆 Best validation mean-AUC: {best_auc:.4f}")

    # ── Per-class Youden's J threshold optimisation ───────────────────────────
    # Re-load best checkpoint and run full val inference for threshold computation
    print("\n⚖️  Computing per-class Youden's J thresholds on validation set …")
    best_model_path = MODELS_DIR / 'cardiac_xray_model.pth'
    model.load_state_dict(torch.load(best_model_path, map_location=device, weights_only=True))
    final_val = validate(model, val_loader, criterion, device)
    per_class_thresholds = find_per_class_thresholds(
        final_val['probs'], final_val['labels']
    )

    # ── Per-class AUC on best model ───────────────────────────────────────────
    print("\n📊 Per-class AUC (best checkpoint):")
    for lbl, auc_val in final_val['per_class_auc'].items():
        print(f"   {lbl:20s} AUC: {auc_val:.4f}")

    # Save metadata
    metadata = {
        'model_name':            'ResNet50 Cardiac X-Ray Classifier',
        'task':                  'multi-label cardiac finding detection',
        'labels':                CARDIAC_LABELS,
        'n_classes':             N_CLASSES,
        'dataset':               'NIH ChestX-ray14',
        'best_mean_auc':         float(best_auc),
        'per_class_auc':         {k: (round(v, 4) if not np.isnan(v) else None)
                                  for k, v in final_val['per_class_auc'].items()},
        'per_class_thresholds':  per_class_thresholds,
        'training_date':         time.strftime('%Y-%m-%d'),
        'img_size':              IMG_SIZE,
        'batch_size':            BATCH_SIZE,
        'optimizer':             'AdamW',
        'scheduler':             'CosineAnnealingWarmRestarts',
        'loss':                  'FocalLoss(gamma=2.0, alpha=0.75, alpha_t corrected)',
        'history':               history,
    }
    meta_path = MODELS_DIR / 'cardiac_xray_metadata.json'
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata saved to {meta_path}")

    # Training curve plot
    if HAS_MPL:
        fig, axes = plt.subplots(1, 3, figsize=(15, 4))
        axes[0].plot(history['train_loss'], label='Train'); axes[0].plot(history['val_loss'], label='Val')
        axes[0].set_title('Loss'); axes[0].legend(); axes[0].grid(True)
        axes[1].plot(history['val_auc'], color='green')
        axes[1].set_title('Val Mean AUC'); axes[1].grid(True)
        axes[2].semilogy(history['lr'], color='orange')
        axes[2].set_title('Learning Rate'); axes[2].grid(True)
        plt.tight_layout()
        plt.savefig(MODELS_DIR / 'cardiac_training_history.png', dpi=120)
        plt.close()
        print("✅ Training history plot saved")

    return 0


if __name__ == '__main__':
    exit(main())
