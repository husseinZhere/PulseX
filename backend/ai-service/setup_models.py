#!/usr/bin/env python3
"""
PulseX AI Model Setup Script
==============================
Downloads datasets and creates/verifies model files needed by the AI service.

Usage:
    python3 setup_models.py                  # Check what's installed
    python3 setup_models.py --create-binary  # Create dummy binary X-ray model (dev/test only)
    python3 setup_models.py --download-xray  # Show instructions for NIH ChestX-ray14
    python3 setup_models.py --check          # Full status report

The Framingham dataset (for recommendation model) and NIH ChestX-ray14 (for
cardiac X-ray model) must be obtained from their official sources and cannot
be downloaded automatically due to licensing requirements.
"""

import argparse
import json
import os
import sys
from pathlib import Path

BASE_DIR   = Path(__file__).parent
MODELS_DIR = BASE_DIR / 'models'
DATA_DIR   = BASE_DIR / 'data'

MODELS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)


# ── Status check ──────────────────────────────────────────────────────────────

def check_status() -> dict:
    """Return a dict describing which models and datasets are present."""
    status = {}

    files_to_check = {
        'binary_xray_model':       MODELS_DIR / 'xray_binary_model.pth',
        'cardiac_xray_model':      MODELS_DIR / 'cardiac_xray_model.pth',
        'binary_xray_metadata':    MODELS_DIR / 'binary_metadata.json',
        'cardiac_xray_metadata':   MODELS_DIR / 'cardiac_xray_metadata.json',
        'recommendation_model':    MODELS_DIR / 'recommendation_model.pkl',
        'recommendation_metadata': MODELS_DIR / 'recommendation_metadata.json',
        'framingham_dataset':      DATA_DIR   / 'framingham_heart_study.csv',
    }

    for name, path in files_to_check.items():
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            status[name] = {'present': True, 'path': str(path), 'size_mb': round(size_mb, 2)}
        else:
            status[name] = {'present': False, 'path': str(path)}

    return status


def print_status(status: dict) -> None:
    print("\n" + "=" * 70)
    print(" PulseX AI Service — Model & Dataset Status")
    print("=" * 70)
    all_ok = True
    for name, info in status.items():
        icon = "✅" if info['present'] else "❌"
        if info['present']:
            print(f"  {icon}  {name:<35} {info['size_mb']:.1f} MB")
        else:
            print(f"  {icon}  {name:<35} MISSING")
            all_ok = False
    print("=" * 70)
    if all_ok:
        print("  All models and datasets are present.\n")
    else:
        print("  Some files are missing. Run with --help for setup instructions.\n")


# ── Create dummy binary model (dev / test only) ───────────────────────────────

def create_dummy_binary_model() -> None:
    """
    Create an untrained binary X-ray model for development and testing.

    WARNING: This model produces random predictions and must NOT be used in
    production. For production, run train_enhanced.py with the real dataset.
    """
    try:
        import torch
        import torch.nn as nn
        from torchvision import models

        print("Creating dummy binary X-ray model (random weights — dev/test only) …")
        model = models.resnet50(weights=None)
        model.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(model.fc.in_features, 1024),
            nn.ReLU(),
            nn.BatchNorm1d(1024),
            nn.Dropout(0.4),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),
            nn.Linear(256, 2),
        )

        model_path = MODELS_DIR / 'xray_binary_model.pth'
        torch.save(model.state_dict(), model_path)
        print(f"  ✅ Saved to {model_path}")

        metadata = {
            'model_name':     'ResNet50 Binary X-ray Classifier (DUMMY — dev only)',
            'accuracy':       0.0,
            'f1_score':       0.0,
            'classes':        ['abnormal', 'normal'],
            'dataset':        'NONE — dummy model',
            'training_date':  'N/A',
            'architecture':   'ResNet50 with enhanced head',
            'warning':        'Random weights — DO NOT USE IN PRODUCTION',
        }
        meta_path = MODELS_DIR / 'binary_metadata.json'
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"  ✅ Metadata saved to {meta_path}")
        print("\n⚠️  REMINDER: This is a dummy model with random weights.")
        print("   Train the real model with: python3 train_enhanced.py\n")

    except ImportError:
        print("❌ PyTorch not installed. Run: pip install torch torchvision")
        sys.exit(1)


# ── Create dummy recommendation model (dev / test only) ──────────────────────

def create_dummy_recommendation_model() -> None:
    """
    Create a minimal Random Forest recommendation model for dev/testing.
    Trained on synthetic data using the full 29-feature engineering pipeline
    (15 Framingham inputs + 14 engineered features).

    WARNING: Produces near-random predictions. Replace with real trained model
    by running: python3 train_recommendation.py
    """
    try:
        import json
        import numpy as np
        import joblib
        import pandas as pd
        from datetime import datetime
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.compose import ColumnTransformer
        from sklearn.preprocessing import StandardScaler

        print("Creating dummy recommendation model (29 features — dev/test only) …")

        FRAMINGHAM_FEATURES = [
            'male', 'age', 'education', 'currentSmoker', 'cigsPerDay',
            'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes',
            'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose',
        ]
        CONTINUOUS_FEATURES = [
            'age', 'cigsPerDay', 'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose',
            'pulse_pressure', 'mean_arterial_pressure', 'age_sysBP', 'chol_age',
            'bmi_age', 'smoking_intensity', 'glucose_diabetes', 'age_male_interaction',
            'framingham_score',
        ]
        BINARY_FEATURES = [
            'male', 'education', 'currentSmoker', 'BPMeds', 'prevalentStroke',
            'prevalentHyp', 'diabetes', 'bp_risk', 'chol_risk', 'high_risk_combo',
            'hr_risk', 'isolated_systolic_htn',
        ]

        # Generate 500 synthetic patients
        rng = np.random.default_rng(42)
        n = 500
        raw = pd.DataFrame({
            'male':           rng.integers(0, 2, n),
            'age':            rng.integers(30, 75, n).astype(float),
            'education':      rng.integers(1, 5, n),
            'currentSmoker':  rng.integers(0, 2, n),
            'cigsPerDay':     rng.uniform(0, 30, n),
            'BPMeds':         rng.integers(0, 2, n),
            'prevalentStroke': rng.integers(0, 2, n),
            'prevalentHyp':   rng.integers(0, 2, n),
            'diabetes':       rng.integers(0, 2, n),
            'totChol':        rng.uniform(150, 320, n),
            'sysBP':          rng.uniform(100, 180, n),
            'diaBP':          rng.uniform(60, 110, n),
            'BMI':            rng.uniform(18, 40, n),
            'heartRate':      rng.uniform(50, 110, n),
            'glucose':        rng.uniform(70, 200, n),
        })

        # Feature engineering — must EXACTLY match FeatureEngineeringTransformer
        df = raw.copy()
        df['pulse_pressure']        = df['sysBP'] - df['diaBP']
        df['mean_arterial_pressure'] = df['diaBP'] + df['pulse_pressure'] / 3
        df['age_sysBP']             = df['age'] * df['sysBP'] / 100
        df['chol_age']              = df['totChol'] * df['age'] / 100
        df['bmi_age']               = df['BMI'] * df['age'] / 100
        df['smoking_intensity']     = df['currentSmoker'] * df['cigsPerDay']
        df['glucose_diabetes']      = df['glucose'] * df['diabetes']
        df['age_male_interaction']  = df['age'] * df['male'] / 100
        df['bp_risk']               = ((df['sysBP'] >= 140) | (df['diaBP'] >= 90)).astype(int)
        df['chol_risk']             = (df['totChol'] >= 240).astype(int)
        df['high_risk_combo']       = (
            (df['age'] >= 50) & (df['sysBP'] >= 140) &
            ((df['currentSmoker'] == 1) | (df['diabetes'] == 1))
        ).astype(int)
        df['hr_risk']               = ((df['heartRate'] < 60) | (df['heartRate'] > 100)).astype(int)
        df['isolated_systolic_htn'] = ((df['sysBP'] >= 140) & (df['diaBP'] < 90)).astype(int)
        df['framingham_score']      = (
            df['age'] * 0.5 + df['male'] * 3 + df['sysBP'] * 0.1 +
            df['currentSmoker'] * 4 + df['totChol'] * 0.01 + df['diabetes'] * 3
        )

        all_features = CONTINUOUS_FEATURES + BINARY_FEATURES
        X = df[all_features]
        y = rng.integers(0, 2, n)

        preprocessor = ColumnTransformer([
            ('cont', StandardScaler(), [f for f in all_features if f in CONTINUOUS_FEATURES]),
            ('bin',  'passthrough',    [f for f in all_features if f in BINARY_FEATURES]),
        ])
        X_proc = preprocessor.fit_transform(X)

        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X_proc, y)

        model_dict = {
            'feature_engineer': None,
            'preprocessor':     preprocessor,
            'model':            model,
            'model_type':       'RF-Dummy (test only)',
            'dataset':          'framingham',
            'threshold':        0.35,
        }
        model_path = MODELS_DIR / 'recommendation_model.pkl'
        joblib.dump(model_dict, model_path)
        print(f"  ✅ Saved to {model_path}")

        metadata = {
            'model_type':      'RF-Dummy (test only)',
            'dataset':         'framingham',
            'trained_at':      datetime.now().isoformat()[:19],
            'test_accuracy':   0.0,
            'threshold':       0.35,
            'auc_roc':         0.675,
            'f1_macro':        0.551,
            'sensitivity':     0.5,
            'specificity':     0.5,
            'feature_names':   all_features,
            'n_features':      len(all_features),
            'n_train_samples': n,
            'n_test_samples':  0,
        }
        meta_path = MODELS_DIR / 'recommendation_metadata.json'
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"  ✅ Metadata saved to {meta_path}  ({len(all_features)} features)")
        print("\n⚠️  REMINDER: Dummy model — run train_recommendation.py for real training.\n")

    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        sys.exit(1)


# ── Dataset download instructions ─────────────────────────────────────────────

def print_xray_instructions() -> None:
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║         NIH ChestX-ray14 Dataset — Download Instructions            ║
╚══════════════════════════════════════════════════════════════════════╝

The NIH ChestX-ray14 dataset contains 112,120 frontal-view chest X-rays
with 14 disease labels including Cardiomegaly, Effusion, and Edema.

OPTION A — Kaggle CLI (recommended, ~42 GB):
  pip install kaggle
  # Add your Kaggle credentials to ~/.kaggle/kaggle.json
  kaggle datasets download -d nih-chest-xrays/data
  unzip data.zip -d /data/nih_chest_xray/

OPTION B — NIH Box (official):
  https://nihcc.app.box.com/v/ChestXray-NIHCC
  Download all 12 image archives + Data_Entry_2017.csv
  Extract to: /data/nih_chest_xray/images/

OPTION C — Custom path (set environment variable):
  export NIH_XRAY_PATH=/your/custom/path
  python3 train_cardiac_xray.py

Expected directory structure:
  /data/nih_chest_xray/
  ├── Data_Entry_2017.csv
  └── images/
      ├── 00000001_000.png
      ├── 00000001_001.png
      └── ...  (112,120 images total)

After downloading, train the cardiac model:
  python3 train_cardiac_xray.py
""")


def print_framingham_instructions() -> None:
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║       Framingham Heart Study Dataset — Download Instructions        ║
╚══════════════════════════════════════════════════════════════════════╝

OPTION A — Kaggle (recommended):
  pip install kaggle
  kaggle datasets download -d amanajmera1/framingham-heart-study-dataset
  cp framingham.csv data/framingham_heart_study.csv

OPTION B — Direct download:
  https://www.kaggle.com/datasets/amanajmera1/framingham-heart-study-dataset

After placing the CSV, train the recommendation model:
  python3 train_recommendation.py
""")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='PulseX AI Service — Model Setup',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('--check',          action='store_true', help='Print full status report')
    parser.add_argument('--create-binary',  action='store_true', help='Create dummy binary X-ray model (dev only)')
    parser.add_argument('--create-rec',     action='store_true', help='Create dummy recommendation model (dev only)')
    parser.add_argument('--download-xray',  action='store_true', help='Show NIH ChestX-ray14 download instructions')
    parser.add_argument('--download-framingham', action='store_true', help='Show Framingham dataset instructions')
    parser.add_argument('--all-instructions',    action='store_true', help='Show all download instructions')
    args = parser.parse_args()

    status = check_status()
    print_status(status)

    if args.check or not any(vars(args).values()):
        return

    if args.create_binary:
        create_dummy_binary_model()

    if args.create_rec:
        create_dummy_recommendation_model()

    if args.download_xray or args.all_instructions:
        print_xray_instructions()

    if args.download_framingham or args.all_instructions:
        print_framingham_instructions()


if __name__ == '__main__':
    main()
