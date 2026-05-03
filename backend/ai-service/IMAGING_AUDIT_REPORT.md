# PulseX Medical Imaging AI — Full Audit Report
## Date: 2026-05-03 | Auditor: Claude Sonnet 4.6

---

## EXECUTIVE SUMMARY

The PulseX AI imaging pipeline has been fully audited and rebuilt.  
The pre-audit state had **four critical deficiencies** that made the system medically invalid.  
All four have been resolved or honestly documented. The system is now architecturally correct and production-ready pending model training.

---

## AUDIT FINDINGS — PRE-REBUILD STATE

### CRITICAL-1 — Binary model trained on WRONG dataset
| Item | Detail |
|------|--------|
| Model | `xray_binary_model.pth` |
| Training dataset | Kaggle Chest X-Ray Pneumonia dataset (Normal vs **Pneumonia**) |
| Reported accuracy | 93.3% on validation set |
| What this accuracy measures | Pneumonia detection, NOT cardiac abnormality |
| Medical validity | **INVALID for cardiac use** — detects bacterial/viral pneumonia, not cardiomegaly, effusion, or heart failure |
| Root cause | Original training script (`train_enhanced.py`) hardcodes `DATASET_PATH = '/home/youssef/Downloads/chest_xray/chest_xray'` which is the Kaggle pneumonia dataset |

### CRITICAL-2 — Cardiac model weights do not exist
| Item | Detail |
|------|--------|
| Expected file | `models/cardiac_xray_model.pth` |
| Actual status | **MISSING** — file does not exist |
| Consequence | Service falls back to the pneumonia binary model at runtime |
| Training script | `train_cardiac_xray.py` exists and is well-designed (NIH ChestX-ray14 + focal loss) |
| Reason missing | NIH ChestX-ray14 dataset (42 GB) must be downloaded separately and training run |

### CRITICAL-3 — Binary model weights also do not exist
| Item | Detail |
|------|--------|
| Expected file | `models/xray_binary_model.pth` |
| Actual status | **MISSING** — only `binary_metadata.json` exists (records a previous training run) |
| Consequence | `_load_binary_model()` raises `FileNotFoundError` — service crashes on startup |
| Fix | Added graceful degradation: service now starts in "unavailable" mode and returns clear error responses |

### CRITICAL-4 — CT support completely absent
| Item | Detail |
|------|--------|
| CT endpoint | Did not exist before this rebuild |
| CT model | No dataset, no training script, no weights |
| Previous behavior | Frontend had no CT option; any CT upload would hit the X-ray endpoint with wrong results |
| Fix | `/api/ct/analyze` endpoint added, returns honest "not available" response with clinical recommendation |

### MEDIUM-1 — Recommendation model is a dummy
| Item | Detail |
|------|--------|
| Model | `recommendation_model.pkl` (166 KB) |
| Type | RF-Dummy trained on 500 SYNTHETIC samples |
| Test accuracy | 0.0% (explicitly set in metadata) |
| AUC-ROC | 0.675 (near-random) |
| Status | This is not a critical imaging issue — the recommendation service is separate from imaging |
| Fix needed | Run `train_recommendation.py` with real Framingham Heart Study CSV |

### MEDIUM-2 — Output format mismatch
| Item | Detail |
|------|--------|
| Required format | `{imageType, prediction, confidence, riskLevel, recommendation, modelVersion, limitations}` |
| Pre-rebuild format | `{diagnosis, confidence_level, recommendations (list), mode, ...}` |
| riskLevel | Not computed — only `confidence_level` (High/Medium/Low based on model confidence, not finding severity) |
| Risk logic issue | Risk was confidence-based, not finding-based. High confidence on a minor finding gave "High" risk |
| Fix | Full riskLevel mapping added with medically-grounded severity hierarchy |

---

## DATASET VALIDATION

### NIH ChestX-ray14 — VALID for this purpose

The training script uses NIH ChestX-ray14, which is the **correct** dataset for cardiac X-ray classification with these specific considerations:

**Why NIH ChestX-ray14 is appropriate:**
- 112,120 frontal-view PA/AP chest X-rays from 30,805 unique patients
- Contains explicit `Cardiomegaly` label (the primary cardiac X-ray finding)
- Contains `Effusion` (pleural effusion — hallmark of heart failure)
- Contains `Edema` (pulmonary oedema — acute decompensated HF marker)
- Widely used in published cardiac X-ray AI research
- Publicly available, well-documented, medically labelled

**Chosen cardiac labels and medical justification:**
| Label | Medical relevance | NIH prevalence |
|-------|-------------------|---------------|
| Cardiomegaly | Enlarged cardiac silhouette (CTR > 0.5) — primary radiographic sign of structural heart disease | ~2.5% |
| Effusion | Pleural effusion — hallmark of biventricular heart failure | ~13% |
| Edema | Pulmonary oedema — key marker of acute decompensated heart failure | ~5% |
| Atelectasis | Basilar collapse from elevated hemidiaphragm in CHF, or post-cardiac surgery | ~19% |
| Consolidation | Cardiogenic vs infectious differential; occurs in flash pulmonary oedema | ~10% |

**What was intentionally excluded:**
- `Infiltration` — deprecated in NIH v2, non-specific, no primary cardiac aetiology
- All non-cardiac labels (Pneumonia, Mass, Nodule, Hernia, etc.)

**Known limitations of NIH ChestX-ray14 for cardiac use:**
- Labels are extracted from radiology report text using NLP, not direct image annotation
- Inter-annotator agreement for some labels (esp. Atelectasis, Consolidation) is moderate
- Cardiomegaly label is based on radiologist text, not CTR measurement
- No lateral view images included
- Expected AUC for cardiac labels: Cardiomegaly ~0.87, Effusion ~0.84, Edema ~0.80

---

## INVALID DATASETS — What to AVOID

The following datasets are NOT appropriate for cardiac-specific assessment:

| Dataset | Why invalid |
|---------|-------------|
| Kaggle Chest X-Ray Pneumonia (Mooney) | Binary: Normal vs Pneumonia — detects lung infection, not heart disease |
| Generic pneumonia datasets | Same as above |
| Broad NIH ChestX-ray14 without filtering | If all 14 labels used without cardiac focus, model learns pulmonary > cardiac features |
| Tuberculosis datasets | TB is a pulmonary condition, not cardiac |
| COVID-19 chest X-ray datasets | COVID-19 primarily causes lung injury, not cardiac findings |

---

## TRAINING PIPELINE — Architecture and Scientific Validity

### Model Architecture
```
ResNet50 (ImageNet pretrained, IMAGENET1K_V2 weights)
├── conv1, bn1, layer1, layer2  [FROZEN — general low-level features]
└── layer3, layer4              [FINE-TUNED — task-specific high-level features]
    └── Custom FC Head:
        2048 → Dropout(0.5) → Linear(512) → ReLU → BN
             → Dropout(0.3) → Linear(256) → ReLU → BN
             → Dropout(0.2) → Linear(5)
             → [Sigmoid at inference, not in training]
```

### Loss Function: Focal Loss (γ=2.0, α=0.75)
- Addresses severe class imbalance (Cardiomegaly: only 2.5% of images)
- Correct alpha_t formulation: α for positives, (1-α) for negatives
- γ=2.0 down-weights easy negatives so gradient focuses on hard rare positives
- Better than plain BCEWithLogitsLoss + pos_weight for this imbalance level

### Data Augmentation (medically justified)
| Augmentation | Justification |
|--------------|--------------|
| RandomHorizontalFlip(p=0.5) | Acceptable: model learns structural features, not absolute position |
| RandomRotation(15°) | Accounts for patient positioning variation (±15° is clinically realistic) |
| ColorJitter(brightness=0.3, contrast=0.3) | Accounts for scanner/exposure variation |
| RandomAffine(translate=8%) | Accounts for patient centering variation |
| RandomErasing(p=0.2, scale=0.02–0.08) | Regularisation — small scale avoids masking anatomical landmarks |
| **NO VerticalFlip** | PA/AP X-rays are always upright; vertical flip would be anatomically impossible |
| **NO extreme rotation (>20°)** | Would produce unrealistic images not seen in clinical practice |

### Threshold Optimisation: Youden's J Statistic
Instead of a single 0.5 threshold for all classes (incorrect for multi-label):
- Per-class thresholds optimised on validation set using J = sensitivity + specificity − 1
- Cardiomegaly (~2.5% prevalence) receives a lower threshold than Consolidation (~10%)
- Stored in `cardiac_xray_metadata.json` → `per_class_thresholds`

### Dataset Split (3-way, stratified)
- Train: 80% | Val: 10% | Test: 10%
- Stratified on presence of ANY positive cardiac label
- Test set is held out until final evaluation — not used for threshold tuning

### Evaluation Metrics
- Primary: per-class AUC-ROC (appropriate for imbalanced multi-label)
- Secondary: precision, recall, F1 at Youden threshold
- Per-class confusion matrices on test set
- Per-class ROC curves (val + test) to check for overfitting

---

## RISK LEVEL MAPPING — Medically Grounded Logic

Risk level is based on **what was found AND how confidently**, not confidence alone.

### Cardiac Multi-Label Mode
| Condition | Risk Level | Medical Rationale |
|-----------|-----------|-------------------|
| Edema detected + confidence ≥ 60% | **Critical** | Pulmonary oedema = acute decompensated HF — medical emergency |
| Edema detected + confidence < 60% | **High** | Still warrants urgent evaluation |
| Cardiomegaly OR Effusion + confidence ≥ 70%, OR both present | **High** | Significant cardiac pathology, urgent cardiology referral |
| Cardiomegaly OR Effusion + confidence 55–70% | **High** | Single primary finding, prompt evaluation |
| Cardiomegaly OR Effusion + confidence < 55% | **Medium** | Borderline confidence, clinical correlation needed |
| Only secondary findings (Atelectasis, Consolidation) ≥ 2 + confidence ≥ 65% | **Medium** | Possible cardiac aetiology needs workup |
| No positive findings | **Low** | Normal, routine monitoring |

### Binary Fallback Mode (PNEUMONIA DOMAIN — NOT cardiac-specific)
| Condition | Risk Level |
|-----------|-----------|
| Abnormal detected, confidence ≥ 70% | **Medium** (cannot be higher — wrong domain) |
| Normal detected | **Low** |

**Why not "High/Critical" for binary fallback?** Because the model detects pneumonia, not cardiac conditions. Reporting "Critical" for a pneumonia finding would be medically misleading.

---

## CT SCAN AUDIT

### Current Status: NOT IMPLEMENTED

CT analysis requires:
1. A dedicated dataset of annotated cardiac CT studies (e.g., coronary CT angiography, gated cardiac CT)
2. A separate model trained on 3D or multi-slice 2D CT data
3. CT-specific preprocessing (Hounsfield unit windowing, not simple RGB normalisation)
4. Appropriate output labels (CAC score, stenosis grade, etc.)

**The NIH ChestX-ray14 model CANNOT be applied to CT slices** — different modality, different intensity range, different texture statistics.

### What was done:
- Added `/api/ct/analyze` endpoint
- Returns an honest "not available" response with `success: false`
- Includes clinical recommendation to consult a radiologist
- Clearly documents the gap so developers know what is needed

### What would be needed to implement CT:
- Dataset: COCA (Coronary Calcium) dataset, SCCT dataset, or custom institutional CT data
- Preprocessing: HU windowing (cardiac window: C=400, W=1200; lung: C=-600, W=1500)
- Architecture: 3D ResNet, DenseNet, or 2.5D multi-slice approach
- Labels: Cardiomegaly on CT, pericardial effusion, CAC, cardiac chamber sizing

---

## API CONTRACT (v4.0)

### POST /api/xray/analyze
**Response:**
```json
{
  "success": true,
  "result": {
    "imageType": "xray",
    "prediction": "Cardiomegaly, Pleural Effusion",
    "confidence": 87.3,
    "riskLevel": "High",
    "recommendation": "The AI analysis detected Cardiomegaly, Pleural Effusion on this chest X-ray...",
    "modelVersion": "ResNet50-NIH-CardiacV1-MultiLabel",
    "limitations": "This AI analysis is decision-support only...",
    "positive_findings": ["Cardiomegaly", "Effusion"],
    "finding_probabilities": {
      "Cardiomegaly": 87.3,
      "Effusion": 72.1,
      "Edema": 12.4,
      "Atelectasis": 8.7,
      "Consolidation": 5.2
    },
    "mode": "cardiac_multilabel",
    "model_accuracy": "Mean AUC 82.3%"
  }
}
```

### POST /api/ct/analyze
**Response (always `success: false`):**
```json
{
  "success": false,
  "result": {
    "imageType": "ct",
    "prediction": "CT Analysis Not Available",
    "confidence": 0.0,
    "riskLevel": "Unknown",
    "recommendation": "CT scan analysis is not currently available...",
    "modelVersion": "Not Available",
    "limitations": "CT analysis has not been implemented...",
    "mode": "ct_unavailable"
  }
}
```

---

## PERFORMANCE TARGETS

### Cardiac X-Ray Classifier (NIH ChestX-ray14)
| Metric | Target | Published Benchmark |
|--------|--------|---------------------|
| Cardiomegaly AUC | ≥ 0.87 | Wang et al. 2017: 0.81, CheXNeXt: 0.89 |
| Effusion AUC | ≥ 0.83 | Wang et al.: 0.78, CheXNeXt: 0.87 |
| Edema AUC | ≥ 0.80 | Wang et al.: 0.81 |
| Atelectasis AUC | ≥ 0.70 | Wang et al.: 0.70 |
| Consolidation AUC | ≥ 0.70 | Wang et al.: 0.70 |
| Mean AUC (5-class) | ≥ 0.80 | — |

### Why 90% "accuracy" is not the right metric
For multi-label cardiac classification:
- "Accuracy" (exact match across all labels) is misleadingly low because most samples have no finding
- AUC-ROC per class is the correct primary metric
- Sensitivity and specificity at optimal threshold matter more than overall accuracy
- A model with 97% "accuracy" that never detects Cardiomegaly has 0% clinical utility

---

## HOW TO TRAIN THE CARDIAC MODEL

### Step 1 — Download NIH ChestX-ray14 dataset
```bash
# Option A: Kaggle CLI (recommended)
pip install kaggle
kaggle datasets download -d nih-chest-xrays/data
unzip data.zip -d /data/nih_chest_xray/

# Option B: NIH Box (official)
# https://nihcc.app.box.com/v/ChestXray-NIHCC
# Download all 12 archives + Data_Entry_2017.csv
# Extract images to /data/nih_chest_xray/images/
```

Expected structure:
```
/data/nih_chest_xray/
├── Data_Entry_2017.csv
└── images/
    ├── 00000001_000.png
    ├── 00000001_001.png
    └── ...  (112,120 images total, ~42 GB)
```

### Step 2 — Train the cardiac model
```bash
cd backend/ai-service
python3 train_cardiac_xray.py

# Custom dataset path:
NIH_XRAY_PATH=/your/path python3 train_cardiac_xray.py
```

Training produces:
- `models/cardiac_xray_model.pth` — model weights (best val AUC checkpoint)
- `models/cardiac_xray_metadata.json` — metrics, thresholds, config
- `models/cardiac_roc_curves.png` — per-class ROC curves (val + test)
- `models/cardiac_confusion_matrix.png` — confusion matrices at Youden threshold
- `models/cardiac_training_history.png` — loss/AUC/LR training curves

### Step 3 — Verify service loads cardiac model
```bash
python3 -c "from services.xray_service import XRayService; s = XRayService(); print(s.mode)"
# Expected output: cardiac
```

---

## HOW TO TRAIN THE RECOMMENDATION MODEL

```bash
# Option A: Kaggle CLI
pip install kaggle
kaggle datasets download -d amanajmera1/framingham-heart-study-dataset
cp framingham.csv backend/ai-service/data/framingham_heart_study.csv

# Train:
cd backend/ai-service
python3 train_recommendation.py
```

---

## DEVELOPMENT / TESTING (no dataset required)

For local development and UI testing without the full NIH dataset:
```bash
cd backend/ai-service
python3 setup_models.py --create-binary   # Creates random-weight binary model for testing
python3 setup_models.py --create-rec      # Creates dummy recommendation model
```

**WARNING:** Dummy models return random predictions and must NOT be used in production or clinical settings.

---

## LIMITATIONS STATEMENT (included in all AI responses)

> This AI analysis is decision-support only and does not constitute a clinical diagnosis.
> All results must be interpreted by a qualified radiologist and/or cardiologist in the
> context of the patient's full clinical history, symptoms, and other investigations.
> The model was trained on the NIH ChestX-ray14 dataset; performance on out-of-distribution
> images (e.g., portable, paediatric, post-surgical) may be lower.
> Sensitivity and specificity vary by finding class.
> Do not make treatment decisions based solely on this output.

---

## FILES CHANGED IN THIS REBUILD

| File | Change |
|------|--------|
| `backend/ai-service/services/xray_service.py` | Complete rewrite: proper riskLevel mapping, structured output contract, CT support, graceful model-missing handling |
| `backend/ai-service/main.py` | Added `/api/ct/analyze` endpoint, fixed root endpoint info, updated to v4.0.0 |
| `backend/ai-service/train_cardiac_xray.py` | Added test split, per-class ROC curves, confusion matrix, full metrics report |
| `backend/dotnet/PulseX.API/Services/AiServiceClient.cs` | Added riskLevel/limitations/positiveFindings to AiXRayResult; added AnalyzeCtAsync |
| `backend/dotnet/PulseX.API/Controllers/AiProxyController.cs` | Added /ct/analyze proxy endpoint |
| `Frontend/src/services/aiService.js` | Added analyzeCt() export |
| `backend/ai-service/IMAGING_AUDIT_REPORT.md` | This document |

## FILES NOT CHANGED

The following files were intentionally NOT modified:
- All chat/booking/auth/prescription/video-call/story frontend or backend code
- `recommendation_service.py` (sound architecture, needs real data training)
- `chatbot_service.py` (out of imaging scope)
- `setup_models.py` (already provides correct setup infrastructure)
- `train_recommendation.py` (correct, needs real Framingham data)
- All .NET controllers except AiProxyController
- All frontend pages/components except aiService.js
