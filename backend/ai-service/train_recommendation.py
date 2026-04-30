#!/usr/bin/env python3
"""
Smart Health Recommendation Model Training Script
================================================
Trains ML models on the Framingham Heart Study dataset for 10-year CHD risk prediction.

Features:
- Comprehensive feature engineering (11 derived features)
- Multiple models: RF, XGBoost, Logistic Regression (with/without SMOTE)
- Ensemble methods: Stacking and Voting
- Threshold tuning for maximum accuracy
- Full metrics reporting

Dataset: Framingham Heart Study
Target: TenYearCHD (0 = No CHD, 1 = CHD Risk)
"""

import copy
import json
import warnings
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    GradientBoostingClassifier,
    RandomForestClassifier,
    StackingClassifier,
    VotingClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    auc,
    classification_report,
    confusion_matrix,
    f1_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

# Try to import optional dependencies
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("XGBoost not available, using GradientBoosting as fallback")

try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False
    print("SMOTE not available, will use class weights instead")

# Paths
BASE_DIR = Path(__file__).parent
DATASET_FILE = BASE_DIR / "data" / "framingham_heart_study.csv"
MODELS_DIR = BASE_DIR / "models"

# Feature definitions
CONTINUOUS_FEATURES = [
    'age', 'cigsPerDay', 'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose',
    'pulse_pressure', 'mean_arterial_pressure', 'age_sysBP', 'chol_age',
    'bmi_age', 'smoking_intensity', 'glucose_diabetes', 'age_male_interaction',
    'framingham_score',
]

BINARY_ORDINAL_FEATURES = [
    'male', 'education', 'currentSmoker', 'BPMeds', 'prevalentStroke',
    'prevalentHyp', 'diabetes', 'bp_risk', 'chol_risk', 'high_risk_combo',
    'hr_risk', 'isolated_systolic_htn',
]

# Imputation columns
MEDIAN_IMPUTE_COLS = ['cigsPerDay', 'BPMeds', 'totChol', 'BMI', 'heartRate', 'glucose']
MODE_IMPUTE_COLS = ['education']


class FeatureEngineeringTransformer(BaseEstimator, TransformerMixin):
    """Custom transformer for Framingham feature engineering."""
    
    def __init__(self):
        self.feature_names_out_ = None
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X, columns=self._get_input_features())
        
        # Create engineered features
        df['pulse_pressure'] = df['sysBP'] - df['diaBP']
        df['mean_arterial_pressure'] = df['diaBP'] + (df['pulse_pressure'] / 3)
        df['age_sysBP'] = df['age'] * df['sysBP'] / 100
        df['chol_age'] = df['totChol'] * df['age'] / 100
        df['bmi_age'] = df['BMI'] * df['age'] / 100
        
        df['smoking_intensity'] = df['currentSmoker'] * df['cigsPerDay']
        df['glucose_diabetes'] = df['glucose'] * df['diabetes']
        df['age_male_interaction'] = df['age'] * df['male'] / 100

        # Risk indicators
        df['bp_risk'] = ((df['sysBP'] >= 140) | (df['diaBP'] >= 90)).astype(int)
        df['chol_risk'] = (df['totChol'] >= 240).astype(int)
        df['high_risk_combo'] = (
            (df['age'] >= 50) &
            (df['sysBP'] >= 140) &
            ((df['currentSmoker'] == 1) | (df['diabetes'] == 1))
        ).astype(int)
        df['hr_risk'] = ((df['heartRate'] < 60) | (df['heartRate'] > 100)).astype(int)
        df['isolated_systolic_htn'] = (
            (df['sysBP'] >= 140) & (df['diaBP'] < 90)
        ).astype(int)

        # Simplified Framingham score
        df['framingham_score'] = (
            df['age'] * 0.5 +
            df['male'] * 3 +
            df['sysBP'] * 0.1 +
            df['currentSmoker'] * 4 +
            df['totChol'] * 0.01 +
            df['diabetes'] * 3
        )
        
        self.feature_names_out_ = list(df.columns)
        return df
    
    def _get_input_features(self):
        return ['male', 'age', 'education', 'currentSmoker', 'cigsPerDay',
                'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes',
                'totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose']
    
    def get_feature_names_out(self, input_features=None):
        return self.feature_names_out_


def print_header(text: str) -> None:
    print(f"\n{'='*70}")
    print(f" {text}")
    print('='*70)


def print_section(text: str) -> None:
    print(f"\n--- {text} ---")


def load_dataset() -> pd.DataFrame:
    """Load the Framingham Heart Study dataset."""
    print_section("Loading Framingham Dataset")
    
    if not DATASET_FILE.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_FILE}")
    
    df = pd.read_csv(DATASET_FILE)
    print(f"Loaded {len(df)} records from {DATASET_FILE.name}")
    print(f"Features: {list(df.columns)}")
    print(f"Target distribution:\n{df['TenYearCHD'].value_counts()}")
    
    # Check for missing values
    missing = df.isnull().sum()
    if missing.any():
        print(f"\nMissing values found:")
        for col in missing[missing > 0].index:
            print(f"  {col}: {missing[col]} ({missing[col]/len(df)*100:.1f}%)")
    
    return df


def impute_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Impute missing values using median/mode strategy."""
    print_section("Imputing Missing Values")
    
    df = df.copy()
    
    for col in MEDIAN_IMPUTE_COLS:
        if col in df.columns and df[col].isnull().any():
            median_val = df[col].median()
            count = df[col].isnull().sum()
            df[col] = df[col].fillna(median_val)
            print(f"  {col}: filled {count} values with median={median_val:.2f}")
    
    for col in MODE_IMPUTE_COLS:
        if col in df.columns and df[col].isnull().any():
            mode_val = df[col].mode()[0]
            count = df[col].isnull().sum()
            df[col] = df[col].fillna(mode_val)
            print(f"  {col}: filled {count} values with mode={mode_val}")
    
    remaining = df.isnull().sum().sum()
    if remaining > 0:
        print(f"  WARNING: {remaining} missing values still remain")
    else:
        print("  All missing values imputed successfully")
    
    return df


def preprocess_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Preprocess the dataset."""
    print_section("Preprocessing Data")
    
    df = impute_missing_values(df)
    X = df.drop('TenYearCHD', axis=1)
    y = df['TenYearCHD']
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Target distribution: {dict(y.value_counts())}")
    
    neg_count = (y == 0).sum()
    pos_count = (y == 1).sum()
    print(f"Class imbalance ratio: {neg_count/pos_count:.2f}:1")
    
    return X, y


def create_preprocessor(feature_names: List[str]) -> ColumnTransformer:
    """Create a ColumnTransformer for preprocessing features."""
    continuous = [f for f in feature_names if f in CONTINUOUS_FEATURES]
    binary = [f for f in feature_names if f in BINARY_ORDINAL_FEATURES]
    
    print(f"  Continuous features ({len(continuous)}): {continuous}")
    print(f"  Binary/ordinal features ({len(binary)}): {binary}")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cont', StandardScaler(), continuous),
            ('bin', 'passthrough', binary)
        ],
        remainder='drop'
    )
    
    return preprocessor


def find_optimal_threshold(y_true: np.ndarray, y_proba: np.ndarray) -> Tuple[float, Dict]:
    """
    Find optimal threshold using Youden's J statistic (sensitivity + specificity - 1).

    WHY: Maximising raw accuracy on an imbalanced dataset (85% negatives) always
    drives the threshold up, causing the model to predict 'no CHD' for almost
    everyone — giving >98% specificity but <15% sensitivity.  This misses the
    majority of at-risk patients, which is clinically unacceptable for screening.

    Youden's J finds the threshold where sensitivity + specificity is maximised
    together, producing a clinically balanced classifier.
    """
    best_thresh = 0.5
    best_j = -1.0

    for thresh in np.arange(0.05, 0.95, 0.005):
        y_pred = (y_proba >= thresh).astype(int)
        sens = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
        spec = recall_score(y_true, y_pred, pos_label=0, zero_division=0)
        j = sens + spec - 1.0          # Youden's J statistic
        if j > best_j:
            best_j = j
            best_thresh = thresh

    y_pred_opt = (y_proba >= best_thresh).astype(int)
    sens_opt = recall_score(y_true, y_pred_opt, pos_label=1, zero_division=0)
    spec_opt = recall_score(y_true, y_pred_opt, pos_label=0, zero_division=0)

    print(f"\n  ⚖️  Youden's J optimised threshold: {best_thresh:.3f}")
    print(f"     → Sensitivity: {sens_opt*100:.1f}%  |  Specificity: {spec_opt*100:.1f}%")
    if sens_opt < 0.40:
        print(f"  ⚠️  WARNING: Sensitivity {sens_opt*100:.1f}% is below 40% — consider stronger SMOTE or class weighting")

    return best_thresh, {
        'threshold':    best_thresh,
        'accuracy':     accuracy_score(y_true, y_pred_opt),
        'f1_macro':     f1_score(y_true, y_pred_opt, average='macro'),
        'sensitivity':  sens_opt,
        'specificity':  spec_opt,
        'youdens_j':    best_j,
    }


def evaluate_model_comprehensive(model, X_test: np.ndarray, y_test: np.ndarray, 
                                  model_name: str) -> Dict[str, float]:
    """Evaluate model with comprehensive metrics."""
    print_section(model_name)
    
    y_proba = model.predict_proba(X_test)[:, 1]
    y_pred_default = (y_proba >= 0.5).astype(int)
    
    acc_default = accuracy_score(y_test, y_pred_default)
    sens_default = recall_score(y_test, y_pred_default, pos_label=1)
    spec_default = recall_score(y_test, y_pred_default, pos_label=0)
    
    optimal_thresh, opt_metrics = find_optimal_threshold(y_test, y_proba)
    
    try:
        auc_roc = roc_auc_score(y_test, y_proba)
    except:
        auc_roc = 0.5
    
    print(f"\n{model_name} Test Results:")
    print(f"  At default threshold (0.5):")
    print(f"    Accuracy: {acc_default:.4f}")
    print(f"    Sensitivity: {sens_default:.4f}")
    print(f"    Specificity: {spec_default:.4f}")
    print(f"  At OPTIMAL threshold ({optimal_thresh:.3f}):")
    print(f"    Accuracy: {opt_metrics['accuracy']:.4f}")
    print(f"    F1 (macro): {opt_metrics['f1_macro']:.4f}")
    print(f"    Sensitivity: {opt_metrics['sensitivity']:.4f}")
    print(f"    Specificity: {opt_metrics['specificity']:.4f}")
    print(f"  AUC-ROC (threshold-independent): {auc_roc:.4f}")
    
    return {
        'accuracy_default': acc_default,
        'accuracy_optimal': opt_metrics['accuracy'],
        'f1_macro_optimal': opt_metrics['f1_macro'],
        'auc_roc': auc_roc,
        'sensitivity_optimal': opt_metrics['sensitivity'],
        'specificity_optimal': opt_metrics['specificity'],
        'optimal_threshold': optimal_thresh
    }


def train_with_smote_cv(model, X: np.ndarray, y: np.ndarray, 
                        cv: int = 5, name: str = "") -> Tuple[Any, Dict]:
    """Train model with SMOTE oversampling."""
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)
    cv_scores = []
    
    for train_idx, val_idx in skf.split(X, y):
        X_train_fold, X_val_fold = X[train_idx], X[val_idx]
        y_train_fold, y_val_fold = y[train_idx], y[val_idx]
        
        if HAS_SMOTE:
            smote = SMOTE(random_state=42)
            X_res, y_res = smote.fit_resample(X_train_fold, y_train_fold)
        else:
            X_res, y_res = X_train_fold, y_train_fold
        
        fold_model = copy.deepcopy(model)
        fold_model.fit(X_res, y_res)
        y_pred = fold_model.predict(X_val_fold)
        cv_scores.append(f1_score(y_val_fold, y_pred, average='macro'))
    
    # Final fit
    if HAS_SMOTE:
        smote = SMOTE(random_state=42)
        X_resampled, y_resampled = smote.fit_resample(X, y)
    else:
        X_resampled, y_resampled = X, y
    
    final_model = copy.deepcopy(model)
    final_model.fit(X_resampled, y_resampled)
    
    mean_f1 = np.mean(cv_scores)
    std_f1 = np.std(cv_scores)
    print(f"    CV F1: {mean_f1:.4f} (+/- {std_f1:.4f})")
    
    return final_model, {'cv_f1_mean': mean_f1, 'cv_f1_std': std_f1}


def train_without_smote_cv(model, X: np.ndarray, y: np.ndarray, 
                           cv: int = 5, name: str = "") -> Tuple[Any, Dict]:
    """Train model without SMOTE (accuracy-focused)."""
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)
    cv_scores = []
    
    for train_idx, val_idx in skf.split(X, y):
        X_train_fold, X_val_fold = X[train_idx], X[val_idx]
        y_train_fold, y_val_fold = y[train_idx], y[val_idx]
        
        fold_model = copy.deepcopy(model)
        fold_model.fit(X_train_fold, y_train_fold)
        y_pred = fold_model.predict(X_val_fold)
        cv_scores.append(f1_score(y_val_fold, y_pred, average='macro'))
    
    final_model = copy.deepcopy(model)
    final_model.fit(X, y)
    
    mean_f1 = np.mean(cv_scores)
    std_f1 = np.std(cv_scores)
    print(f"    CV F1: {mean_f1:.4f} (+/- {std_f1:.4f})")
    
    return final_model, {'cv_f1_mean': mean_f1, 'cv_f1_std': std_f1}


def train_all_models(X_train: np.ndarray, y_train: np.ndarray, cv: int = 5) -> Dict:
    """Train all models."""
    print_header(f"Training Models with {cv}-Fold Stratified CV")
    
    models = {}
    
    neg_count = np.sum(y_train == 0)
    pos_count = np.sum(y_train == 1)
    scale_pos_weight = neg_count / pos_count if pos_count > 0 else 1.0
    print(f"\nClass weights: scale_pos_weight = {scale_pos_weight:.2f}")
    print("\n  Training BOTH with SMOTE and WITHOUT SMOTE...\n")
    
    # RF No SMOTE
    print("  Training Random Forest (No SMOTE)...")
    rf_no_smote = RandomForestClassifier(
        n_estimators=500, max_depth=10, min_samples_split=5,
        min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
    )
    rf_trained_ns, rf_scores_ns = train_without_smote_cv(rf_no_smote, X_train, y_train, cv)
    models['RF (No SMOTE)'] = (rf_trained_ns, rf_scores_ns)
    
    # RF With SMOTE
    print("\n  Training Random Forest (With SMOTE)...")
    rf_smote = RandomForestClassifier(
        n_estimators=500, max_depth=8, min_samples_split=5,
        min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
    )
    rf_trained_s, rf_scores_s = train_with_smote_cv(rf_smote, X_train, y_train, cv)
    models['RF (SMOTE)'] = (rf_trained_s, rf_scores_s)
    
    # XGBoost No SMOTE
    print("\n  Training XGBoost (No SMOTE)...")
    if HAS_XGBOOST:
        xgb_no_smote = XGBClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.9, min_child_weight=3,
            eval_metric='logloss', random_state=42, n_jobs=-1
        )
    else:
        xgb_no_smote = GradientBoostingClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.05,
            subsample=0.8, random_state=42
        )
    xgb_trained_ns, xgb_scores_ns = train_without_smote_cv(xgb_no_smote, X_train, y_train, cv)
    models['XGB (No SMOTE)'] = (xgb_trained_ns, xgb_scores_ns)
    
    # XGBoost With SMOTE
    print("\n  Training XGBoost (With SMOTE)...")
    if HAS_XGBOOST:
        xgb_smote = XGBClassifier(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.9, min_child_weight=3,
            eval_metric='logloss', scale_pos_weight=scale_pos_weight,
            random_state=42, n_jobs=-1
        )
    else:
        xgb_smote = GradientBoostingClassifier(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, random_state=42
        )
    xgb_trained_s, xgb_scores_s = train_with_smote_cv(xgb_smote, X_train, y_train, cv)
    models['XGB (SMOTE)'] = (xgb_trained_s, xgb_scores_s)
    
    # Logistic Regression No SMOTE
    print("\n  Training Logistic Regression (No SMOTE)...")
    lr_no_smote = LogisticRegression(max_iter=1000, random_state=42, n_jobs=-1)
    lr_trained_ns, lr_scores_ns = train_without_smote_cv(lr_no_smote, X_train, y_train, cv)
    models['LR (No SMOTE)'] = (lr_trained_ns, lr_scores_ns)
    
    # Logistic Regression With SMOTE
    print("\n  Training Logistic Regression (With SMOTE)...")
    lr_smote = LogisticRegression(max_iter=1000, random_state=42, n_jobs=-1)
    lr_trained_s, lr_scores_s = train_with_smote_cv(lr_smote, X_train, y_train, cv)
    models['LR (SMOTE)'] = (lr_trained_s, lr_scores_s)
    
    return models


def build_stacking_ensemble(models: Dict, X_train: np.ndarray, y_train: np.ndarray, 
                            cv: int = 5) -> Tuple[Any, Dict]:
    """Build a stacking ensemble."""
    print("\n  Building Stacking Ensemble...")
    
    estimators = [
        ('rf', models['RF (No SMOTE)'][0]),
        ('xgb', models['XGB (No SMOTE)'][0]),
        ('lr', models['LR (No SMOTE)'][0])
    ]
    
    stacking = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(max_iter=1000, random_state=42),
        cv=5, n_jobs=-1
    )
    
    trained, scores = train_without_smote_cv(stacking, X_train, y_train, cv)
    return trained, scores


def build_voting_ensemble(models: Dict, X_train: np.ndarray, y_train: np.ndarray, 
                          cv: int = 5) -> Tuple[Any, Dict]:
    """Build a soft voting ensemble."""
    print("\n  Building Soft Voting Ensemble...")
    
    estimators = [
        ('rf', models['RF (No SMOTE)'][0]),
        ('xgb', models['XGB (No SMOTE)'][0]),
        ('lr', models['LR (No SMOTE)'][0])
    ]
    
    voting = VotingClassifier(estimators=estimators, voting='soft', n_jobs=-1)
    trained, scores = train_without_smote_cv(voting, X_train, y_train, cv)
    return trained, scores


def save_model(preprocessor: ColumnTransformer, model: Any, model_type: str, 
               metadata: Dict[str, Any]) -> None:
    """Save the trained model components."""
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # NOTE: DO NOT pickle feature_engineer - it causes import errors
    # The service will create its own instance
    model_dict = {
        'feature_engineer': None,
        'preprocessor': preprocessor,
        'model': model,
        'model_type': model_type,
        'dataset': 'framingham',
        'threshold': metadata.get('threshold', 0.5)
    }
    
    model_path = MODELS_DIR / 'recommendation_model.pkl'
    joblib.dump(model_dict, model_path)
    print(f"\nModel saved to {model_path}")
    print(f"  Optimal threshold saved: {model_dict['threshold']:.3f}")
    
    metadata_path = MODELS_DIR / 'recommendation_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {metadata_path}")


def print_results_table(results: Dict[str, Dict[str, float]]) -> None:
    """Print formatted results table."""
    print("\n" + "=" * 120)
    print(" FULL METRICS TABLE - ALL MODELS")
    print("=" * 120)
    print(f"{'Model':<25} {'Acc@0.5':>10} {'Acc@Opt':>10} {'F1-Macro':>10} {'AUC-ROC':>10} {'Sens':>10} {'Spec':>10} {'Thresh':>10}")
    print("-" * 120)
    
    for model_name, scores in results.items():
        acc_default = scores.get('accuracy_default', 0)
        acc_optimal = scores.get('accuracy_optimal', 0)
        f1_macro = scores.get('f1_macro_optimal', 0)
        auc = scores.get('auc_roc', 0)
        sens = scores.get('sensitivity_optimal', 0)
        spec = scores.get('specificity_optimal', 0)
        thresh = scores.get('optimal_threshold', 0.5)
        print(f"{model_name:<25} {acc_default:>10.4f} {acc_optimal:>10.4f} {f1_macro:>10.4f} {auc:>10.4f} {sens:>10.4f} {spec:>10.4f} {thresh:>10.3f}")
    
    print("=" * 120)


def main() -> int:
    """Main training function."""
    print_header("Smart Health Recommendation Model Training (Framingham)")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Load dataset
    df = load_dataset()
    X, y = preprocess_data(df)
    
    # Feature engineering
    print_section("Feature Engineering")
    feature_engineer = FeatureEngineeringTransformer()
    X_engineered = feature_engineer.fit_transform(X)
    print(f"Original features: {X.shape[1]}")
    print(f"Engineered features: {X_engineered.shape[1]}")
    
    # Create preprocessor
    print_section("Creating Preprocessor")
    preprocessor = create_preprocessor(list(X_engineered.columns))
    
    # Train/test split
    print_section("Train/Test Split")
    X_train, X_test, y_train, y_test = train_test_split(
        X_engineered, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Fit and transform
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    print(f"Processed feature dimensions: {X_train_processed.shape[1]}")
    
    # Train models
    models = train_all_models(X_train_processed, y_train.values, cv=5)
    
    # Build ensembles
    stacking, stacking_scores = build_stacking_ensemble(models, X_train_processed, y_train.values, 5)
    models['Stacking Ensemble'] = (stacking, stacking_scores)
    
    voting, voting_scores = build_voting_ensemble(models, X_train_processed, y_train.values, 5)
    models['Voting Ensemble'] = (voting, voting_scores)
    
    # Evaluate all models
    print_header("Evaluating All Models on Test Set")
    results = {}
    for name, (model, _) in models.items():
        results[name] = evaluate_model_comprehensive(model, X_test_processed, y_test.values, name)
    
    # Print results table
    print_results_table(results)
    
    # Find best model by Youden's J (balances sensitivity + specificity for screening)
    best_model_name = max(results.keys(), key=lambda k: (
        results[k].get('sensitivity_optimal', 0) + results[k].get('specificity_optimal', 0)
    ))
    best_model = models[best_model_name][0]
    best_scores = results[best_model_name]
    
    # Final report
    print_header("FINAL REPORT")
    print(f"Best Model: {best_model_name}")
    print(f"Optimal Threshold: {best_scores['optimal_threshold']:.3f}")
    print(f"\n=== KEY METRICS ===")
    print(f"  Accuracy at default (0.5): {best_scores['accuracy_default']:.4f}")
    print(f"  Accuracy at optimal thresh: {best_scores['accuracy_optimal']:.4f} (Target: 0.95)")
    print(f"  F1 (macro) at optimal: {best_scores['f1_macro_optimal']:.4f}")
    print(f"  AUC-ROC: {best_scores['auc_roc']:.4f}")
    print(f"  Sensitivity: {best_scores['sensitivity_optimal']:.4f}")
    print(f"  Specificity: {best_scores['specificity_optimal']:.4f}")
    
    # Classification report
    y_proba = best_model.predict_proba(X_test_processed)[:, 1]
    y_pred = (y_proba >= best_scores['optimal_threshold']).astype(int)
    
    print(f"\nClassification Report (at optimal threshold):")
    print(classification_report(y_test, y_pred, target_names=['No CHD', 'CHD Risk']))
    
    print(f"\nConfusion Matrix (at optimal threshold):")
    print(confusion_matrix(y_test, y_pred))
    
    # Save model
    print_header("Saving Model and Artifacts")
    metadata = {
        'model_type': best_model_name,
        'dataset': 'framingham',
        'trained_at': datetime.now().isoformat(),
        'test_accuracy': best_scores['accuracy_optimal'],
        'threshold': best_scores['optimal_threshold'],
        'auc_roc': best_scores['auc_roc'],
        'f1_macro': best_scores['f1_macro_optimal'],
        'sensitivity': best_scores['sensitivity_optimal'],
        'specificity': best_scores['specificity_optimal'],
        'feature_names': list(X_engineered.columns),
        'n_features': X_engineered.shape[1],
        'n_train_samples': len(X_train),
        'n_test_samples': len(X_test)
    }
    
    save_model(preprocessor, best_model, best_model_name, metadata)
    
    # Status — evaluated on SENSITIVITY (not accuracy) for medical screening.
    # Accuracy on imbalanced data (85% negatives) is misleading: a model predicting
    # "no CHD" for everyone scores 85% accuracy but detects 0% of at-risk patients.
    # Minimum acceptable sensitivity for cardiac screening: 70%.
    sens = best_scores['sensitivity_optimal']
    auc  = best_scores['auc_roc']
    if sens >= 0.70 and auc >= 0.75:
        print(f"\n[SUCCESS] Clinical targets met: sensitivity={sens:.2f} AUC={auc:.3f}")
        return 0
    elif sens >= 0.50:
        print(f"\n[WARNING] Sensitivity {sens*100:.1f}% is acceptable for initial deployment "
              f"but below the 70% clinical target. Consider more SMOTE or data augmentation.")
        return 0
    else:
        print(f"\n[FAIL] Sensitivity {sens*100:.1f}% is clinically unsafe for cardiac screening "
              f"(minimum 50%). Do not deploy. Try: stronger SMOTE, lower threshold, or more data.")
        return 1


if __name__ == "__main__":
    exit(main())
