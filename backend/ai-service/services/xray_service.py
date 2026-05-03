"""
PulseX Cardiac X-Ray / CT Inference Service
============================================
Supports three model modes (loaded in priority order):

1. Cardiac multi-label model  (cardiac_xray_model.pth)
   - Trained on NIH ChestX-ray14 dataset
   - Architecture: ResNet50 + 5-class sigmoid head
   - Labels: Cardiomegaly, Effusion, Edema, Atelectasis, Consolidation
   - Run `python3 train_cardiac_xray.py` to produce this model (requires NIH dataset)

2. Cardiac binary model  (cardiac_binary_model.pth)     ← NEW (priority #2)
   - Trained on NIH cardiomegaly subset (2,776 cardiomegaly + 2,776 normal, 128×128)
   - Architecture: DenseNet121 + binary sigmoid head
   - Task: Cardiomegaly detection (Normal vs Cardiomegaly)
   - Run `python3 train_cardiac_binary.py` to produce this model

3. Binary fallback model  (xray_binary_model.pth)
   - Trained on Kaggle Chest X-Ray Pneumonia dataset (Normal vs Pneumonia)
   - WARNING: Domain mismatch — pneumonia classifier ≠ cardiac classifier
   - Used only when both cardiac models are absent; clearly labelled in output

CT analysis is NOT currently trained and returns an honest "not available" response.
A dedicated cardiac CT dataset and training pipeline is required to enable it.

Output contract (all endpoints):
{
    "imageType":            "xray" | "ct",
    "prediction":           "...",
    "confidence":           float (0–100, percentage),
    "riskLevel":            "Low" | "Medium" | "High" | "Critical",
    "recommendation":       "..." (single coherent paragraph),
    "modelVersion":         "...",
    "limitations":          "...",
    "success":              bool,
    # Cardiac-mode extras:
    "positive_findings":    [...],
    "finding_probabilities":{...},
    "mode":                 "cardiac_multilabel" | "binary" | "ct_unavailable",
}
"""

import io
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Cardiac-relevant labels (NIH ChestX-ray14 subset)
# ---------------------------------------------------------------------------
# These five findings are the most clinically meaningful for cardiac assessment
# from a chest X-ray perspective:
#   Cardiomegaly  — enlarged cardiac silhouette (CTR > 0.5); the primary X-ray
#                   sign of cardiac disease.
#   Effusion      — pleural effusion; hallmark of left/right heart failure.
#   Edema         — pulmonary oedema; key marker of acute decompensated HF.
#   Atelectasis   — basilar collapse from elevated hemidiaphragm in CHF or
#                   post-cardiac surgery.
#   Consolidation — cardiogenic vs infective differential; occurs in flash
#                   pulmonary oedema.
#
# Infiltration was intentionally excluded: deprecated in NIH v2, non-specific,
# no primary cardiac aetiology.
CARDIAC_LABELS = ['Cardiomegaly', 'Effusion', 'Edema', 'Atelectasis', 'Consolidation']

CARDIAC_MODEL_VERSION        = "ResNet50-NIH-CardiacV1-MultiLabel"
CARDIAC_BINARY_MODEL_VERSION = "DenseNet121-NIH-CardiomegalyBinaryV1"
BINARY_MODEL_VERSION         = "ResNet50-Pneumonia-BinaryV1-FALLBACK"
CT_MODEL_VERSION             = "Not Available"

_STANDARD_LIMITATIONS = (
    "This AI analysis is decision-support only and does not constitute a clinical diagnosis. "
    "All results must be interpreted by a qualified radiologist and/or cardiologist in the "
    "context of the patient's full clinical history, symptoms, and other investigations. "
    "The model was trained on the NIH ChestX-ray14 dataset; performance on out-of-distribution "
    "images (e.g., portable, paediatric, post-surgical) may be lower. "
    "Sensitivity and specificity vary by finding class. "
    "Do not make treatment decisions based solely on this output."
)

_CARDIAC_BINARY_LIMITATIONS = (
    "This result was produced by the cardiomegaly binary model (DenseNet121 trained on the NIH "
    "cardiomegaly subset). It detects cardiomegaly only — it cannot identify effusion, edema, "
    "atelectasis, or consolidation. For multi-label cardiac analysis, the full NIH ChestX-ray14 "
    "model is required. Run: python3 train_cardiac_xray.py"
)

_BINARY_EXTRA_LIMITATIONS = (
    "IMPORTANT: This result was produced by the FALLBACK binary model trained on a pneumonia "
    "dataset (Normal vs Pneumonia), NOT a cardiac-specific model. "
    "It cannot detect cardiomegaly, effusion, or other cardiac findings. "
    "For meaningful cardiac assessment the NIH ChestX-ray14 cardiac model must be trained "
    "and installed. Run: python3 train_cardiac_xray.py"
)

_CT_LIMITATIONS = (
    "CT scan analysis is NOT currently supported. "
    "A dedicated cardiac CT model trained on annotated coronary CT angiography or cardiac CT "
    "datasets (e.g., SCCT, COCA, Multi-Centre Cardiac CT) is required. "
    "Please consult a radiologist for CT interpretation."
)


class XRayService:
    """
    Cardiac X-ray inference service with graceful fallback and honest CT status.
    """

    def __init__(self):
        try:
            import torch
            import torch.nn as nn
            from torchvision import models, transforms
            self._torch  = torch
            self._nn     = nn
            self._models = models
        except ImportError as e:
            raise RuntimeError(
                f"PyTorch / torchvision not installed: {e}. "
                "Run: pip install torch torchvision"
            ) from e

        self.device    = self._torch.device('cuda' if self._torch.cuda.is_available() else 'cpu')
        self.transform = self._build_transform()
        self.metadata  = {}
        self.model     = None
        self.mode      = 'unavailable'

        # Load best available model — priority: cardiac multilabel > cardiac binary > pneumonia binary
        cardiac = self._try_load_cardiac_model()
        if cardiac is not None:
            self.model    = cardiac
            self.mode     = 'cardiac'
            self.classes  = CARDIAC_LABELS
            self.metadata = self._load_metadata('cardiac_xray_metadata.json')
            raw_thresholds = self.metadata.get('per_class_thresholds', {})
            self.per_class_thresholds = {
                lbl: raw_thresholds.get(lbl, 0.5) for lbl in CARDIAC_LABELS
            }
            logger.info("Cardiac multi-label model loaded (NIH ChestX-ray14) — mode=cardiac")
            logger.info("Per-class thresholds: %s", self.per_class_thresholds)
        else:
            cardiac_binary = self._try_load_cardiac_binary_model()
            if cardiac_binary is not None:
                self.model    = cardiac_binary
                self.mode     = 'cardiac_binary'
                self.classes  = ['normal', 'cardiomegaly']
                self.metadata = self._load_metadata('cardiac_binary_metadata.json')
                self.per_class_thresholds = {}
                self.binary_threshold = float(
                    self.metadata.get('youden_threshold',
                    self.metadata.get('optimal_threshold', 0.5))
                )
                logger.info(
                    "Cardiac binary model loaded (DenseNet121, cardiomegaly) — mode=cardiac_binary | "
                    "threshold=%.3f | val_auc=%.3f",
                    self.binary_threshold,
                    self.metadata.get('val_auc', 0.0),
                )
            else:
                binary = self._try_load_binary_model()
                if binary is not None:
                    self.model    = binary
                    self.mode     = 'binary'
                    self.classes  = ['abnormal', 'normal']
                    self.metadata = self._load_metadata('binary_metadata.json')
                    self.per_class_thresholds = {}
                    logger.warning(
                        "Binary pneumonia model loaded — mode=binary (FALLBACK). "
                        "Domain mismatch: this model detects pneumonia, NOT cardiac conditions. "
                        "Train cardiac model with: python3 train_cardiac_binary.py"
                    )
                else:
                    logger.error(
                        "No X-ray model found. Service will return 'model unavailable' responses. "
                        "To install models, run: python3 setup_models.py --help"
                    )

        logger.info("XRayService ready | device=%s | mode=%s", self.device, self.mode)

    # ------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------

    def _try_load_cardiac_model(self):
        """Load cardiac multi-label ResNet50; returns None if not found or broken."""
        path = Path(__file__).parent.parent / 'models' / 'cardiac_xray_model.pth'
        if not path.exists():
            logger.info("cardiac_xray_model.pth not found at %s", path)
            return None
        try:
            n = len(CARDIAC_LABELS)
            nn = self._nn
            model = self._models.resnet50(weights=None)
            model.fc = nn.Sequential(
                nn.Dropout(0.5),
                nn.Linear(model.fc.in_features, 512),
                nn.ReLU(inplace=True),
                nn.BatchNorm1d(512),
                nn.Dropout(0.3),
                nn.Linear(512, 256),
                nn.ReLU(inplace=True),
                nn.BatchNorm1d(256),
                nn.Dropout(0.2),
                nn.Linear(256, n),
            )
            state = self._torch.load(path, map_location=self.device, weights_only=True)
            model.load_state_dict(state)
            return model.to(self.device).eval()
        except Exception as e:
            logger.warning("Failed to load cardiac model from %s: %s", path, e)
            return None

    def _try_load_cardiac_binary_model(self):
        """Load DenseNet121 cardiomegaly binary model; returns None if not found or broken."""
        path = Path(__file__).parent.parent / 'models' / 'cardiac_binary_model.pth'
        if not path.exists():
            logger.info("cardiac_binary_model.pth not found at %s", path)
            return None
        try:
            nn = self._nn
            model = self._models.densenet121(weights=None)
            n_features = model.classifier.in_features  # 1024
            model.classifier = nn.Sequential(
                nn.Dropout(0.5),
                nn.Linear(n_features, 256),
                nn.ReLU(inplace=True),
                nn.BatchNorm1d(256),
                nn.Dropout(0.3),
                nn.Linear(256, 1),
            )
            state = self._torch.load(path, map_location=self.device, weights_only=True)
            model.load_state_dict(state)
            return model.to(self.device).eval()
        except Exception as e:
            logger.warning("Failed to load cardiac binary model from %s: %s", path, e)
            return None

    def _try_load_binary_model(self):
        """Load binary (Normal vs Abnormal) ResNet50; returns None if not found or broken."""
        path = Path(__file__).parent.parent / 'models' / 'xray_binary_model.pth'
        if not path.exists():
            logger.info("xray_binary_model.pth not found at %s", path)
            return None
        try:
            nn = self._nn
            model = self._models.resnet50(weights=None)
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
            state = self._torch.load(path, map_location=self.device, weights_only=True)
            model.load_state_dict(state)
            return model.to(self.device).eval()
        except Exception as e:
            logger.warning("Failed to load binary model from %s: %s", path, e)
            return None

    def _load_metadata(self, filename: str) -> dict:
        try:
            path = Path(__file__).parent.parent / 'models' / filename
            if path.exists():
                with open(path) as f:
                    return json.load(f)
        except Exception as e:
            logger.warning("Could not load metadata %s: %s", filename, e)
        return {}

    def _build_transform(self):
        from torchvision import transforms
        return transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

    # ------------------------------------------------------------------
    # Public analysis entry points
    # ------------------------------------------------------------------

    def analyze_xray(self, image_data, filename: str) -> dict:
        """
        Analyse a chest X-ray image.

        Routes to:
          - cardiac multi-label analysis  (preferred, when cardiac model is loaded)
          - binary Normal/Abnormal        (fallback — pneumonia domain, see limitations)
          - model-unavailable response    (when no weights are present)

        Args:
            image_data: Image bytes or file-path string
            filename:   Original filename (for logging)

        Returns:
            Standardised result dict (see module docstring for full contract).
        """
        if self.mode == 'unavailable':
            return self._model_unavailable_response('xray', filename)

        try:
            image = self._load_image(image_data)
            tensor = self.transform(image).unsqueeze(0).to(self.device)

            with self._torch.no_grad():
                logits = self.model(tensor)

            if self.mode == 'cardiac':
                return self._build_cardiac_result(logits, filename)
            elif self.mode == 'cardiac_binary':
                return self._build_cardiac_binary_result(logits, filename)
            else:
                return self._build_binary_result(logits, filename)

        except Exception as e:
            logger.error("analyze_xray failed for %s: %s", filename, e)
            return {
                'success':    False,
                'imageType':  'xray',
                'error':      f"Analysis failed: {e}",
                'prediction': None,
                'confidence': 0.0,
                'riskLevel':  'Unknown',
                'recommendation': (
                    "An error occurred during image analysis. "
                    "Please ensure the uploaded file is a valid, unrotated chest X-ray image "
                    "(JPEG or PNG). If the problem persists, contact support."
                ),
                'modelVersion': (
                CARDIAC_MODEL_VERSION        if self.mode == 'cardiac' else
                CARDIAC_BINARY_MODEL_VERSION if self.mode == 'cardiac_binary' else
                BINARY_MODEL_VERSION
            ),
                'limitations': _STANDARD_LIMITATIONS,
                'mode':       self.mode,
            }

    def analyze_ct(self, image_data, filename: str) -> dict:
        """
        CT scan analysis — NOT currently implemented.

        CT requires a dedicated model trained on annotated cardiac CT data
        (e.g., coronary CT angiography, cardiac CT gated studies).
        The NIH ChestX-ray14 model cannot be applied to CT slices directly.

        Returns an honest "not available" response. CT inference will return
        success=False so the caller can display an appropriate UI message.
        """
        logger.warning("CT analysis requested for %s — feature not implemented", filename)
        return {
            'success':      False,
            'imageType':    'ct',
            'prediction':   'CT Analysis Not Available',
            'confidence':   0.0,
            'riskLevel':    'Unknown',
            'recommendation': (
                "CT scan analysis is not currently available in this AI module. "
                "CT imaging requires a dedicated model trained on annotated cardiac CT datasets "
                "(e.g., coronary CT angiography studies). "
                "For CT interpretation, please consult a qualified radiologist. "
                "This feature is planned for a future release."
            ),
            'modelVersion': CT_MODEL_VERSION,
            'limitations':  _CT_LIMITATIONS,
            'mode':         'ct_unavailable',
        }

    # ------------------------------------------------------------------
    # Cardiac multi-label result builder
    # ------------------------------------------------------------------

    def _build_cardiac_result(self, logits, filename: str) -> dict:
        probs = self._torch.sigmoid(logits)[0].cpu().tolist()

        # Per-finding probabilities (percentage)
        finding_probs: Dict[str, float] = {
            lbl: round(p * 100, 1) for lbl, p in zip(CARDIAC_LABELS, probs)
        }

        # Apply per-class Youden's-J thresholds
        positive_labels: List[str] = []
        for lbl, p in zip(CARDIAC_LABELS, probs):
            threshold = self.per_class_thresholds.get(lbl, 0.5)
            if p >= threshold:
                positive_labels.append(lbl)

        max_prob = max(probs)

        if positive_labels:
            prediction = ', '.join(positive_labels)
            confidence = round(max_prob * 100, 1)
        else:
            prediction = 'No Cardiac Findings Detected'
            # Confidence in "normal" = 1 - highest abnormal probability
            confidence = round((1.0 - max_prob) * 100, 1)

        risk_level = self._map_risk_level_cardiac(positive_labels, max_prob)
        recommendation = self._build_cardiac_recommendation(positive_labels, risk_level, finding_probs)

        meta_auc = self.metadata.get('best_mean_auc', None)
        model_perf = f"Mean AUC {meta_auc*100:.1f}%" if meta_auc else "See training metadata"

        return {
            'success':             True,
            'imageType':           'xray',
            'prediction':          prediction,
            'confidence':          confidence,
            'riskLevel':           risk_level,
            'recommendation':      recommendation,
            'modelVersion':        CARDIAC_MODEL_VERSION,
            'limitations':         _STANDARD_LIMITATIONS,
            'positive_findings':   positive_labels,
            'finding_probabilities': finding_probs,
            'mode':                'cardiac_multilabel',
            'model_accuracy':      model_perf,
            # Kept for backward compatibility with .NET AiXRayResult
            'diagnosis':           prediction,
            'confidence_level':    self._confidence_label(confidence),
        }

    # ------------------------------------------------------------------
    # Cardiac binary (cardiomegaly) result builder
    # ------------------------------------------------------------------

    def _build_cardiac_binary_result(self, logits, filename: str) -> dict:
        """
        Build result for DenseNet121 cardiomegaly binary model.
        logits: shape [1, 1] — single sigmoid output
        threshold: Youden's J optimal threshold from validation set (stored in metadata)
        """
        prob = float(self._torch.sigmoid(logits)[0, 0].cpu())
        threshold = getattr(self, 'binary_threshold', 0.5)
        is_cardiomegaly = prob >= threshold
        confidence = round(prob * 100.0, 1) if is_cardiomegaly else round((1.0 - prob) * 100.0, 1)

        if is_cardiomegaly:
            prediction       = 'Cardiomegaly Detected'
            positive_findings = ['Cardiomegaly']
        else:
            prediction        = 'No Cardiomegaly Detected'
            positive_findings = []

        risk_level     = self._map_risk_level_cardiac_binary(is_cardiomegaly, prob)
        recommendation = self._build_cardiac_binary_recommendation(is_cardiomegaly, prob, risk_level)

        meta_auc = self.metadata.get('test_auc', self.metadata.get('val_auc', None))
        model_perf = f"AUC {meta_auc:.3f} (test set)" if meta_auc else "See training metadata"

        return {
            'success':             True,
            'imageType':           'xray',
            'prediction':          prediction,
            'confidence':          confidence,
            'riskLevel':           risk_level,
            'recommendation':      recommendation,
            'modelVersion':        CARDIAC_BINARY_MODEL_VERSION,
            'limitations':         f"{_STANDARD_LIMITATIONS}\n\n{_CARDIAC_BINARY_LIMITATIONS}",
            'positive_findings':   positive_findings,
            'finding_probabilities': {'Cardiomegaly': round(prob * 100.0, 1)},
            'mode':                'cardiac_binary',
            'model_accuracy':      model_perf,
            # Backward compat
            'diagnosis':           prediction,
            'confidence_level':    self._confidence_label(confidence),
        }

    def _map_risk_level_cardiac_binary(self, is_cardiomegaly: bool, prob: float) -> str:
        """
        Risk mapping for the binary cardiomegaly classifier.

        Cardiomegaly (CTR > 0.5) is a primary indicator of structural cardiac disease —
        heart failure, cardiomyopathy, valvular disease, or pericardial effusion.
        It warrants at minimum urgent cardiology evaluation.

        High    — Cardiomegaly detected with high model confidence (≥ 70%)
        Medium  — Cardiomegaly detected but borderline confidence (threshold–70%)
                  or near-threshold negatives (≥ 40%)
        Low     — No cardiomegaly detected at comfortable margin
        """
        if is_cardiomegaly:
            return 'High' if prob >= 0.70 else 'Medium'
        # No cardiomegaly: borderline negatives get Medium to flag for clinical review
        return 'Medium' if prob >= 0.40 else 'Low'

    def _build_cardiac_binary_recommendation(
        self, is_cardiomegaly: bool, prob: float, risk_level: str
    ) -> str:
        disclaimer = (
            "This AI result is decision-support only and does not replace clinical judgment. "
            "Formal radiological review and clinical correlation are mandatory."
        )
        scope_note = (
            "Note: This model detects cardiomegaly only. It does not assess effusion, edema, "
            "atelectasis, or consolidation. A full NIH-trained multi-label model is required "
            "for comprehensive cardiac X-ray analysis."
        )
        prob_pct = round(prob * 100, 1)

        if is_cardiomegaly and risk_level == 'High':
            return (
                f"The AI model detected cardiomegaly with high confidence ({prob_pct}%). "
                "An enlarged cardiac silhouette (cardiothoracic ratio > 0.5) is a significant "
                "radiographic indicator of structural cardiac disease, including heart failure, "
                "cardiomyopathy, valvular disease, or pericardial effusion. "
                "Urgent cardiology referral within 24–48 hours is strongly recommended. "
                "Recommended evaluation: 2D echocardiogram to measure ejection fraction and "
                "assess wall motion; 12-lead ECG; BNP/NT-proBNP; troponin; metabolic panel. "
                "If symptoms are present (chest pain, severe dyspnoea, orthopnoea, haemodynamic "
                "instability), seek emergency care immediately. "
                f"{scope_note} {disclaimer}"
            )
        if is_cardiomegaly and risk_level == 'Medium':
            return (
                f"The AI model detected possible cardiomegaly (confidence: {prob_pct}%). "
                "A mildly enlarged or borderline cardiac silhouette warrants further clinical "
                "evaluation. Please arrange a cardiology review within 1–2 weeks. "
                "Recommended investigations: 2D echocardiogram, 12-lead ECG, BNP/NT-proBNP. "
                "Monitor for symptoms: exertional dyspnoea, ankle oedema, orthopnoea, or palpitations. "
                f"{scope_note} {disclaimer}"
            )
        if not is_cardiomegaly and risk_level == 'Medium':
            return (
                f"No cardiomegaly detected, however model confidence is borderline ({prob_pct:.0f}% "
                "cardiomegaly probability). Clinical correlation is recommended. "
                "If cardiac symptoms are present or there is clinical suspicion, arrange "
                "a formal radiological review and echocardiogram. "
                f"{scope_note} {disclaimer}"
            )
        # Low risk — no cardiomegaly, high confidence
        return (
            f"No cardiomegaly detected on this X-ray (AI probability: {prob_pct}%). "
            "The cardiac silhouette appears within normal limits. "
            "Continue routine cardiovascular monitoring and maintain a heart-healthy lifestyle. "
            "Report new symptoms — chest pain, shortness of breath, palpitations, or syncope — "
            "to your physician promptly. "
            f"{scope_note} {disclaimer}"
        )

    # ------------------------------------------------------------------
    # Binary fallback result builder
    # ------------------------------------------------------------------

    def _build_binary_result(self, logits, filename: str) -> dict:
        probs = self._torch.softmax(logits, dim=1)[0]
        conf_val, pred_idx = self._torch.max(probs, 0)

        predicted_class  = self.classes[pred_idx.item()]
        confidence_score = conf_val.item()
        diagnosis        = 'No Abnormality Detected' if predicted_class == 'normal' else 'Abnormality Detected'
        confidence       = round(confidence_score * 100, 1)

        normal_prob   = probs[1].item()
        abnormal_prob = probs[0].item()

        # Binary fallback can only say "something abnormal" — not cardiac-specific
        is_abnormal = predicted_class != 'normal'
        risk_level  = 'Medium' if is_abnormal and confidence_score >= 0.70 else (
                      'Low'    if not is_abnormal else 'Medium')

        recommendation = self._build_binary_recommendation(is_abnormal, confidence_score)

        meta_acc = self.metadata.get('accuracy', None)
        model_perf = f"{meta_acc*100:.1f}% val accuracy (pneumonia domain)" if meta_acc else "See training metadata"

        return {
            'success':        True,
            'imageType':      'xray',
            'prediction':     diagnosis,
            'confidence':     confidence,
            'riskLevel':      risk_level,
            'recommendation': recommendation,
            'modelVersion':   BINARY_MODEL_VERSION,
            'limitations':    f"{_STANDARD_LIMITATIONS}\n\n{_BINARY_EXTRA_LIMITATIONS}",
            'probabilities':  {
                'normal':   round(normal_prob   * 100, 1),
                'abnormal': round(abnormal_prob * 100, 1),
            },
            'mode':           'binary',
            'model_accuracy': model_perf,
            # Backward compat
            'diagnosis':       diagnosis,
            'confidence_level': self._confidence_label(confidence),
        }

    # ------------------------------------------------------------------
    # Model unavailable response
    # ------------------------------------------------------------------

    def _model_unavailable_response(self, image_type: str, filename: str) -> dict:
        return {
            'success':      False,
            'imageType':    image_type,
            'prediction':   'Model Not Available',
            'confidence':   0.0,
            'riskLevel':    'Unknown',
            'recommendation': (
                "The AI imaging model is not currently loaded. "
                "Model weight files are missing. "
                "Fastest option: run `python3 train_cardiac_binary.py` (64 MB cardiomegaly dataset, "
                "trains in ~30 min on GPU). "
                "For full multi-label cardiac analysis: download NIH ChestX-ray14 dataset and "
                "run `python3 train_cardiac_xray.py`. "
                "Please consult a qualified radiologist for immediate image interpretation."
            ),
            'modelVersion': 'Not Loaded',
            'limitations':  'Model files are missing. See setup_models.py for installation instructions.',
            'mode':         'unavailable',
            'error':        'No model weights found. Run setup_models.py to install models.',
        }

    # ------------------------------------------------------------------
    # Risk level mapping — medically grounded
    # ------------------------------------------------------------------

    def _map_risk_level_cardiac(self, positive_labels: List[str], max_prob: float) -> str:
        """
        Map detected cardiac findings to a clinical risk level.

        Hierarchy (descending severity):
          Critical — Pulmonary Edema: acute decompensated heart failure / medical emergency.
          High     — Cardiomegaly or Pleural Effusion with reasonable model confidence.
                     Also: multiple concurrent findings (≥3) at moderate confidence.
          Medium   — Any positive primary finding at lower confidence, or secondary findings
                     (Atelectasis, Consolidation) suggesting cardiac aetiology.
          Low      — No positive findings detected.

        Risk is NOT determined by confidence alone — the finding class matters most.
        """
        if not positive_labels:
            return 'Low'

        # Edema = acute pulmonary oedema → potential cardiac emergency
        if 'Edema' in positive_labels:
            return 'Critical' if max_prob >= 0.60 else 'High'

        # Primary cardiac findings: Cardiomegaly, Effusion
        primary = {'Cardiomegaly', 'Effusion'}
        has_primary = any(f in positive_labels for f in primary)

        if has_primary:
            # Multiple primaries or very high confidence → High
            n_primary = sum(1 for f in positive_labels if f in primary)
            if n_primary >= 2 or max_prob >= 0.70:
                return 'High'
            # Single primary at moderate confidence → High if confident, Medium otherwise
            return 'High' if max_prob >= 0.55 else 'Medium'

        # Secondary findings only (Atelectasis, Consolidation)
        if len(positive_labels) >= 2 and max_prob >= 0.65:
            return 'Medium'

        return 'Medium' if max_prob >= 0.50 else 'Low'

    # ------------------------------------------------------------------
    # Recommendation builders — single coherent medical paragraph
    # ------------------------------------------------------------------

    def _build_cardiac_recommendation(
        self,
        positive_labels: List[str],
        risk_level: str,
        finding_probs: Dict[str, float],
    ) -> str:
        """
        Build a single medically appropriate recommendation paragraph
        based on detected findings and risk level.
        """
        disclaimer = (
            "This AI result is decision-support only and does not replace clinical judgment. "
            "Formal radiological review and clinical correlation are mandatory."
        )

        if not positive_labels:
            return (
                "No significant cardiac abnormalities were detected on this X-ray. "
                "The cardiac silhouette and mediastinal contours appear within normal limits "
                "based on AI analysis. "
                "Continue routine cardiovascular monitoring and maintain a heart-healthy lifestyle "
                "including regular aerobic exercise (≥150 min/week), a low-sodium Mediterranean-style diet, "
                "and annual cardiovascular check-ups. "
                "Report any new symptoms — chest pain, shortness of breath, syncope, or palpitations — "
                "to your physician promptly. "
                f"{disclaimer}"
            )

        findings_text = ', '.join(positive_labels)
        action_parts: List[str] = []

        if risk_level == 'Critical':
            action_parts.append(
                f"URGENT ALERT: The AI analysis identified {findings_text} on this chest X-ray, "
                "with features consistent with acute pulmonary oedema — a potential cardiac emergency. "
                "The patient requires immediate emergency evaluation. "
                "Initiate supplemental oxygen targeting SpO₂ ≥94%, close haemodynamic monitoring, "
                "and urgent cardiology or emergency medicine consultation. "
                "Intravenous diuretic therapy (e.g., furosemide) should be considered if acute "
                "decompensated heart failure is confirmed clinically. "
                "Urgent investigations: 12-lead ECG, troponin, BNP/NT-proBNP, renal function, "
                "bedside echocardiogram, and arterial blood gas."
            )
        elif risk_level == 'High':
            action_parts.append(
                f"The AI analysis detected {findings_text} on this chest X-ray. "
                "These findings may indicate significant cardiac pathology including heart failure, "
                "cardiomegaly, or pericardial/pleural fluid accumulation. "
                "Urgent cardiology referral within 24–48 hours is strongly recommended. "
                "A full cardiac evaluation should include: echocardiogram, 12-lead ECG, "
                "BNP/NT-proBNP, troponin, comprehensive metabolic panel, CBC, and lipid panel. "
                "If symptoms such as chest pain, severe dyspnoea, orthopnoea, haemodynamic instability, "
                "or reduced consciousness are present, seek emergency care immediately."
            )
        else:  # Medium
            action_parts.append(
                f"The AI analysis identified {findings_text} on this chest X-ray. "
                "These findings warrant clinical correlation by a qualified radiologist and cardiologist. "
                "A cardiac evaluation within the next 1–2 weeks is recommended, including: "
                "12-lead ECG and echocardiogram to assess cardiac structure and function. "
                "Lab work including BNP/NT-proBNP, CBC, and metabolic panel is advisable. "
                "Monitor for symptoms: chest pain, exertional dyspnoea, ankle oedema, or palpitations."
            )

        # Per-finding specific guidance
        finding_guidance: List[str] = []
        if 'Cardiomegaly' in positive_labels:
            finding_guidance.append(
                "Cardiomegaly (enlarged cardiac silhouette, cardiothoracic ratio >0.5): "
                "echocardiogram is essential to assess ejection fraction, wall motion, and valvular function."
            )
        if 'Effusion' in positive_labels:
            finding_guidance.append(
                "Pleural Effusion: evaluate for congestive heart failure, pericarditis, or malignancy. "
                "Serial imaging to monitor progression. Thoracentesis if large or symptomatic."
            )
        if 'Edema' in positive_labels:
            finding_guidance.append(
                "Pulmonary Oedema: likely acute decompensated heart failure. "
                "Measure SpO₂, initiate diuretic therapy per clinical assessment, "
                "ICU-level monitoring may be required."
            )
        if 'Atelectasis' in positive_labels:
            finding_guidance.append(
                "Atelectasis: assess for cardiomegaly-related diaphragm elevation or post-surgical collapse. "
                "Incentive spirometry and early mobilisation if post-operative."
            )
        if 'Consolidation' in positive_labels:
            finding_guidance.append(
                "Consolidation: differentiate cardiogenic (pulmonary oedema redistribution) from "
                "infectious aetiology using BNP and clinical context."
            )

        parts = action_parts
        if finding_guidance:
            parts.append("Specific finding guidance: " + " | ".join(finding_guidance))
        parts.append(disclaimer)

        return " ".join(parts)

    def _build_binary_recommendation(self, is_abnormal: bool, confidence: float) -> str:
        """Recommendation for the binary fallback model (pneumonia domain)."""
        domain_warning = (
            "NOTE: This result is from the binary fallback model (trained on pneumonia data, "
            "not a cardiac-specific model). It cannot identify specific cardiac conditions. "
            "Upgrade to the cardiac model (run train_cardiac_xray.py) for meaningful cardiac analysis."
        )
        disclaimer = (
            "This AI result is decision-support only. Formal radiological review is mandatory."
        )

        if not is_abnormal:
            return (
                "No significant abnormality detected on this X-ray based on AI analysis. "
                "Continue routine cardiovascular monitoring and heart-healthy lifestyle practices. "
                f"{domain_warning} {disclaimer}"
            )

        if confidence >= 0.85:
            urgency = "prompt medical attention"
        elif confidence >= 0.70:
            urgency = "medical evaluation within the next few days"
        else:
            urgency = "clinical review (lower-confidence result)"

        return (
            f"An abnormality was detected on this X-ray with the AI model (confidence: {confidence*100:.0f}%). "
            f"This finding warrants {urgency}. "
            "Consult a physician for formal radiological interpretation. "
            "If cardiac abnormality is suspected, a dedicated cardiac X-ray analysis "
            "and echocardiogram are recommended. "
            f"{domain_warning} {disclaimer}"
        )

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _load_image(image_data):
        """Load image from bytes or file path into PIL RGB Image."""
        from PIL import Image
        if isinstance(image_data, bytes):
            return Image.open(io.BytesIO(image_data)).convert('RGB')
        return Image.open(image_data).convert('RGB')

    @staticmethod
    def _confidence_label(confidence_pct: float) -> str:
        """Return human-readable confidence tier."""
        if confidence_pct >= 85:
            return 'High'
        if confidence_pct >= 65:
            return 'Medium'
        return 'Low'
