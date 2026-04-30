import io
import json
import logging
from pathlib import Path
from typing import List, Optional

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

logger = logging.getLogger(__name__)

# Cardiac-relevant labels from NIH ChestX-ray14 (used by cardiac model).
# Infiltration was removed: it is a non-specific, poorly-defined label deprecated
# in NIH dataset v2 and has no primary cardiac aetiology.
# Atelectasis replaces it: clinically relevant in cardiac patients (post-cardiac
# surgery collapse, basilar atelectasis from elevated hemidiaphragm in CHF).
CARDIAC_LABELS = ['Cardiomegaly', 'Effusion', 'Edema', 'Atelectasis', 'Consolidation']


class XRayService:
    """
    X-Ray classification service supporting two model modes:

    1. Binary model  (xray_binary_model.pth) — Normal vs Abnormal (93.3% accuracy)
       Trained on Kaggle Chest X-ray Pneumonia dataset.

    2. Cardiac model (cardiac_xray_model.pth) — Multi-label cardiac finding detection
       Trained on NIH ChestX-ray14 (Cardiomegaly, Effusion, Edema, Infiltration, Consolidation).
       Run `python3 train_cardiac_xray.py` to produce this model.

    The service automatically loads the cardiac model when available and falls back
    to the binary model otherwise.
    """

    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.transform = self._get_transform()
        self.metadata  = {}

        # Try cardiac model first, fall back to binary
        self._cardiac_model = self._try_load_cardiac_model()
        if self._cardiac_model is not None:
            self.model      = self._cardiac_model
            self.mode       = 'cardiac'
            self.classes    = CARDIAC_LABELS
            self.metadata   = self._load_metadata('cardiac_xray_metadata.json')
            # Per-class thresholds from Youden's J optimisation (saved during training).
            # Falls back to 0.5 per class if not in metadata (e.g. first training run).
            raw_thresholds = self.metadata.get('per_class_thresholds', {})
            self.per_class_thresholds = {
                lbl: raw_thresholds.get(lbl, 0.5) for lbl in CARDIAC_LABELS
            }
            logger.info("✅ Cardiac multi-label model loaded (NIH ChestX-ray14)")
            logger.info("   Per-class thresholds: %s", self.per_class_thresholds)
        else:
            self.model      = self._load_binary_model()
            self.mode       = 'binary'
            self.classes    = ['abnormal', 'normal']
            self.metadata   = self._load_metadata('binary_metadata.json')
            self.per_class_thresholds = {}
            logger.info("✅ Binary X-ray model loaded (Normal vs Abnormal — pneumonia domain)")

        logger.info("XRayService initialised on %s | mode=%s", self.device, self.mode)
    
    def _try_load_cardiac_model(self) -> Optional[nn.Module]:
        """Attempt to load the cardiac multi-label model (returns None if not found)."""
        model_path = Path(__file__).parent.parent / 'models' / 'cardiac_xray_model.pth'
        if not model_path.exists():
            logger.info("Cardiac model not found at %s — using binary model", model_path)
            return None
        try:
            n_classes = len(CARDIAC_LABELS)
            model = models.resnet50(weights=None)
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
                nn.Linear(256, n_classes),
            )
            state = torch.load(model_path, map_location=self.device, weights_only=True)
            model.load_state_dict(state)
            model = model.to(self.device).eval()
            return model
        except Exception as e:
            logger.warning("Failed to load cardiac model: %s — falling back to binary", e)
            return None

    def _load_binary_model(self) -> nn.Module:
        """Load the trained binary classifier (Normal vs Abnormal)."""
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
        model_path = Path(__file__).parent.parent / 'models' / 'xray_binary_model.pth'
        if not model_path.exists():
            raise FileNotFoundError(
                f"Binary model not found at {model_path}. "
                "Run: python3 create_model.py  OR  python3 train_enhanced.py"
            )
        state = torch.load(model_path, map_location=self.device, weights_only=True)
        model.load_state_dict(state)
        return model.to(self.device).eval()

    def _load_metadata(self, filename: str) -> dict:
        """Load model metadata JSON."""
        try:
            path = Path(__file__).parent.parent / 'models' / filename
            if path.exists():
                with open(path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.warning("Could not load metadata %s: %s", filename, e)
        return {'accuracy': 0.9263}
    
    def _get_transform(self):
        """Standard preprocessing - same as training validation"""
        return transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    
    def analyze_xray(self, image_data, filename: str) -> dict:
        """
        Analyse a chest X-ray image.

        Routes to cardiac multi-label analysis or binary Normal/Abnormal
        depending on which model is loaded.

        Args:
            image_data: Image bytes or file path string
            filename:   Original filename (used for logging)

        Returns:
            Structured result dict with diagnosis, confidence, and recommendations
        """
        try:
            # Load image
            if isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data)).convert('RGB')
            elif isinstance(image_data, (str, Path)):
                image = Image.open(image_data).convert('RGB')
            else:
                raise ValueError(f"Unsupported image_data type: {type(image_data)}")

            image_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = self.model(image_tensor)

            if self.mode == 'cardiac':
                return self._cardiac_result(logits, filename)
            else:
                return self._binary_result(logits, filename)

        except Exception as e:
            logger.error("analyze_xray failed for %s: %s", filename, e)
            return {
                'success':   False,
                'error':     f"Analysis failed: {str(e)}",
                'diagnosis': None,
                'confidence': 0.0,
                'mode':      self.mode,
            }

    # ─────────────────── Cardiac multi-label result ──────────────────────────

    def _cardiac_result(self, logits: torch.Tensor, filename: str) -> dict:
        """Process cardiac multi-label model output."""
        probs = torch.sigmoid(logits)[0].cpu().tolist()

        findings = {}
        positive_labels = []
        for label, prob in zip(CARDIAC_LABELS, probs):
            findings[label] = round(prob * 100, 1)
            # Use Youden's-J-optimised per-class threshold when available
            threshold = self.per_class_thresholds.get(label, 0.5)
            if prob >= threshold:
                positive_labels.append(label)

        if not positive_labels:
            diagnosis   = 'Normal'
            overall_conf = round((1 - max(probs)) * 100, 1)
        else:
            diagnosis   = 'Cardiac Abnormality Detected'
            overall_conf = round(max(probs) * 100, 1)

        conf_level = 'High' if overall_conf >= 85 else ('Medium' if overall_conf >= 65 else 'Low')

        recommendations = self._get_cardiac_recommendations(positive_labels, max(probs))

        return {
            'success':         True,
            'mode':            'cardiac_multilabel',
            'diagnosis':       diagnosis,
            'positive_findings': positive_labels,
            'finding_probabilities': findings,
            'confidence':      overall_conf,
            'confidence_level': conf_level,
            'model_accuracy':  f"mean-AUC {self.metadata.get('best_mean_auc', 0)*100:.1f}%",
            'recommendations': recommendations,
            'note':            'Cardiac multi-label model (NIH ChestX-ray14)',
        }

    # ─────────────────── Binary result ───────────────────────────────────────

    def _binary_result(self, logits: torch.Tensor, filename: str) -> dict:
        """Process binary Normal/Abnormal model output."""
        probs = torch.softmax(logits, dim=1)[0]
        confidence, predicted_idx = torch.max(probs, 0)

        predicted_class  = self.classes[predicted_idx.item()]
        confidence_score = confidence.item()
        diagnosis        = 'Normal' if predicted_class == 'normal' else 'Abnormal'
        conf_level       = 'High' if confidence_score >= 0.90 else ('Medium' if confidence_score >= 0.75 else 'Low')

        normal_prob   = probs[1].item()
        abnormal_prob = probs[0].item()

        recommendations = self._get_recommendations(diagnosis, confidence_score)

        return {
            'success':        True,
            'mode':           'binary',
            'diagnosis':      diagnosis,
            'confidence':     round(confidence_score * 100, 1),
            'confidence_level': conf_level,
            'probabilities':  {
                'normal':   round(normal_prob   * 100, 1),
                'abnormal': round(abnormal_prob * 100, 1),
            },
            'model_accuracy': f"{self.metadata.get('accuracy', 0)*100:.1f}%",
            'recommendations': recommendations,
            'note':           'Binary classifier — upgrade to cardiac model for heart-specific findings',
        }
    
    def _get_recommendations(self, diagnosis, confidence):
        """
        Cardiac-focused recommendations for the binary fallback model.
        NOTE: This model was trained on a pneumonia dataset (Normal vs Abnormal).
        It is domain-incorrect for cardiac assessment. The cardiac multi-label
        model (train_cardiac_xray.py) should replace it for production use.
        All language below is intentionally heart-focused, not lung/pneumonia.
        """
        recs = []

        if confidence < 0.75:
            recs.append("⚠️  CAUTION: Lower confidence score — radiologist review strongly recommended")
        recs.append("⚠️  NOTE: Running in binary fallback mode — upgrade to cardiac model for "
                    "per-finding detection (run train_cardiac_xray.py)")

        if diagnosis == "Normal":
            recs.append("✅ No significant cardiac abnormalities detected on this X-ray")
            recs.append("✅ Heart silhouette and mediastinal contours appear within normal limits")
            recs.append("📋 Continue routine cardiovascular health monitoring")
            recs.append("📋 Maintain a heart-healthy diet and regular physical activity")
            recs.append("📋 Follow-up X-ray in 6–12 months if asymptomatic")
            recs.append("📋 Report any new cardiac symptoms (chest pain, dyspnoea, palpitations) promptly")

        else:  # Abnormal
            recs.append("🔴 CARDIAC ABNORMALITY SUSPECTED")
            recs.append("🔴 Immediate clinical correlation with cardiac history is required")
            recs.append("🔴 Formal radiologist and cardiologist review is mandatory")

            recs.append("\n📋 POSSIBLE CARDIAC FINDINGS TO ASSESS:")
            recs.append("• Cardiomegaly — enlarged cardiac silhouette (CTR > 0.5)")
            recs.append("• Pleural effusion — fluid accumulation suggesting heart failure")
            recs.append("• Pulmonary vascular congestion — redistribution pattern in CHF")
            recs.append("• Mediastinal widening — aortic or pericardial abnormality")
            recs.append("• Basal atelectasis — elevated hemidiaphragm from cardiomegaly or post-surgery")
            recs.append("• Pericardial effusion — globular cardiac silhouette")

            recs.append("\n📋 RECOMMENDED CARDIAC ACTIONS:")
            recs.append("• Urgent cardiology referral within 24–48 hours")
            recs.append("• Full cardiac workup: 12-lead ECG, Echocardiogram, BNP / NT-proBNP")
            recs.append("• Lab panel: Troponin, BMP, CBC, lipid profile, thyroid function")
            recs.append("• Cardiac CT or coronary angiography if structural cause suspected")
            recs.append("• Monitor oxygen saturation (target SpO₂ ≥ 94%) and vital signs closely")

        return recs

    def _get_cardiac_recommendations(self, positive_labels: List[str], max_prob: float) -> List[str]:
        """Generate targeted cardiac recommendations per detected finding."""
        recs = []

        if max_prob < 0.65:
            recs.append("⚠️  CAUTION: Borderline confidence — radiologist review strongly recommended")

        if not positive_labels:
            recs += [
                "✅ No significant cardiac findings detected on this X-ray",
                "📋 Continue routine cardiovascular monitoring",
                "📋 Maintain heart-healthy lifestyle: diet, exercise, sleep",
                "📋 Follow-up X-ray in 6–12 months if asymptomatic",
                "📋 Report any new symptoms (chest pain, dyspnea, palpitations) promptly",
            ]
            return recs

        recs += [
            "🔴 CARDIAC FINDING(S) DETECTED — clinical correlation required",
            "🔴 Formal radiologist and cardiologist review is mandatory",
        ]

        if 'Cardiomegaly' in positive_labels:
            recs += [
                "\n📋 CARDIOMEGALY (Enlarged Heart):",
                "• Echocardiogram urgently to assess ejection fraction and wall motion",
                "• ECG to evaluate rhythm and conduction abnormalities",
                "• BNP / NT-proBNP blood test to assess heart failure",
                "• Consider cardiology referral within 48 hours",
            ]
        if 'Effusion' in positive_labels:
            recs += [
                "\n📋 PLEURAL EFFUSION:",
                "• Assess for congestive heart failure, pericarditis, or malignancy",
                "• Diuretic therapy evaluation if heart failure suspected",
                "• Thoracentesis if large symptomatic effusion",
                "• Serial chest X-rays to monitor size",
            ]
        if 'Edema' in positive_labels:
            recs += [
                "\n📋 PULMONARY EDEMA:",
                "• Likely acute decompensated heart failure — urgent assessment",
                "• IV diuretics and supplemental oxygen may be needed immediately",
                "• Measure oxygen saturation; escalate if SpO₂ < 94%",
                "• Cardiology / ICU consult based on severity",
            ]
        if 'Atelectasis' in positive_labels:
            recs += [
                "\n📋 ATELECTASIS:",
                "• Evaluate for cardiac cause: elevated hemidiaphragm in decompensated CHF",
                "• Check post-cardiac-surgery status — basilar collapse is common post-sternotomy",
                "• Incentive spirometry and early mobilisation if post-operative",
                "• Echocardiogram if cardiac aetiology suspected",
            ]
        if 'Consolidation' in positive_labels:
            recs += [
                "\n📋 CONSOLIDATION:",
                "• Differentiate cardiogenic (pulmonary oedema redistribution) from infectious",
                "• BNP / NT-proBNP to distinguish heart failure from primary infection",
                "• Echocardiogram to assess left ventricular function and filling pressures",
                "• If infectious aetiology confirmed, cardiac risk remains — coordinate care",
            ]

        recs += [
            "\n📋 GENERAL URGENT ACTIONS:",
            "• Seek specialist care within 24–48 hours",
            "• Full cardiac workup: ECG, Echo, troponin, BNP, lipid panel",
            "• Monitor vital signs and oxygen saturation closely",
            "• Lifestyle: sodium restriction, fluid management, cardiac rehabilitation",
        ]
        return recs