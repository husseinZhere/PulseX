"""
Unit tests for XRayService.

Tests that don't require model weights run always.
Tests that DO need model weights are skipped if the file is absent.

Run: pytest tests/test_xray.py -v
"""

import io
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
import torch
from PIL import Image

MODELS_DIR          = Path(__file__).parent.parent / 'models'
BINARY_MODEL_PRESENT = (MODELS_DIR / 'xray_binary_model.pth').exists()
CARDIAC_MODEL_PRESENT = (MODELS_DIR / 'cardiac_xray_model.pth').exists()

skip_if_no_binary  = pytest.mark.skipif(not BINARY_MODEL_PRESENT,  reason="xray_binary_model.pth not found")
skip_if_no_cardiac = pytest.mark.skipif(not CARDIAC_MODEL_PRESENT, reason="cardiac_xray_model.pth not found")


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_png_bytes(width=224, height=224, color=(128, 128, 128)) -> bytes:
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


# ── Transform (no model needed) ───────────────────────────────────────────────

class TestTransform:

    @pytest.fixture
    def svc_cls(self):
        from services.xray_service import XRayService
        return XRayService

    def test_transform_produces_correct_tensor_shape(self, svc_cls):
        from services.xray_service import XRayService
        svc = object.__new__(XRayService)
        transform = svc._get_transform()  # call as normal instance method
        img = Image.new('RGB', (256, 256), color=(128, 128, 128))
        tensor = transform(img)
        assert tensor.shape == (3, 224, 224)

    def test_transform_normalises_values(self):
        from services.xray_service import XRayService
        svc = object.__new__(XRayService)
        transform = svc._get_transform()
        img = Image.new('RGB', (256, 256), color=(0, 0, 0))
        tensor = transform(img)
        # After ImageNet normalization of a black image, values should be negative
        assert tensor.min().item() < 0


# ── Binary recommendations (no model needed) ─────────────────────────────────

class TestBinaryRecommendations:

    @pytest.fixture
    def svc(self):
        from services.xray_service import XRayService
        svc = object.__new__(XRayService)
        return svc

    def test_normal_recommendations_are_positive(self, svc):
        recs = svc._get_recommendations('Normal', 0.92)
        assert any('✅' in r for r in recs)
        assert not any('🔴' in r for r in recs)

    def test_abnormal_recommendations_flag_urgency(self, svc):
        recs = svc._get_recommendations('Abnormal', 0.88)
        assert any('🔴' in r or 'ABNORMALITY' in r for r in recs)

    def test_low_confidence_warning_added(self, svc):
        recs = svc._get_recommendations('Normal', 0.60)
        assert any('CAUTION' in r or 'confidence' in r.lower() for r in recs)

    def test_high_confidence_no_caution_warning(self, svc):
        recs = svc._get_recommendations('Normal', 0.95)
        assert not any('CAUTION' in r for r in recs)

    def test_recommendations_is_list(self, svc):
        recs = svc._get_recommendations('Normal', 0.90)
        assert isinstance(recs, list)
        assert len(recs) > 0

    def test_cardiac_workup_in_abnormal(self, svc):
        recs = svc._get_recommendations('Abnormal', 0.88)
        full_text = ' '.join(recs).lower()
        assert 'cardiac' in full_text or 'ecg' in full_text or 'cardiology' in full_text


# ── Cardiac recommendations (no model needed) ─────────────────────────────────

class TestCardiacRecommendations:

    @pytest.fixture
    def svc(self):
        from services.xray_service import XRayService
        svc = object.__new__(XRayService)
        return svc

    def test_no_findings_gives_normal_recs(self, svc):
        recs = svc._get_cardiac_recommendations([], 0.30)
        assert any('✅' in r for r in recs)

    def test_cardiomegaly_finding_has_echo_rec(self, svc):
        recs = svc._get_cardiac_recommendations(['Cardiomegaly'], 0.80)
        full = ' '.join(recs).lower()
        assert 'echocardiogram' in full or 'echo' in full

    def test_effusion_finding_has_fluid_rec(self, svc):
        recs = svc._get_cardiac_recommendations(['Effusion'], 0.75)
        full = ' '.join(recs).lower()
        assert 'effusion' in full or 'fluid' in full or 'diuretic' in full

    def test_edema_finding_flags_urgency(self, svc):
        recs = svc._get_cardiac_recommendations(['Edema'], 0.82)
        full = ' '.join(recs).lower()
        assert 'urgent' in full or 'immediately' in full or 'oxygen' in full

    def test_consolidation_differential_included(self, svc):
        recs = svc._get_cardiac_recommendations(['Consolidation'], 0.70)
        full = ' '.join(recs).lower()
        assert 'infect' in full or 'cardiac' in full or 'differenti' in full

    def test_multiple_findings_all_addressed(self, svc):
        findings = ['Cardiomegaly', 'Effusion', 'Edema']
        recs = svc._get_cardiac_recommendations(findings, 0.85)
        full = ' '.join(recs).lower()
        assert 'cardiomegaly' in full.lower() or 'echo' in full
        assert 'effusion' in full or 'fluid' in full
        assert 'edema' in full or 'oxygen' in full or 'diuretic' in full

    def test_low_confidence_adds_caution(self, svc):
        recs = svc._get_cardiac_recommendations(['Cardiomegaly'], 0.55)
        assert any('CAUTION' in r or 'confidence' in r.lower() for r in recs)


# ── Full inference (requires model weights) ───────────────────────────────────

class TestBinaryInference:

    @skip_if_no_binary
    def test_analyze_xray_returns_success(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(dummy_xray_bytes, 'test.png')
        assert result['success'] is True

    @skip_if_no_binary
    def test_analyze_xray_has_required_fields(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(dummy_xray_bytes, 'test.png')
        assert 'diagnosis'        in result
        assert 'confidence'       in result
        assert 'recommendations'  in result
        assert 'model_accuracy'   in result

    @skip_if_no_binary
    def test_diagnosis_is_valid_value(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(dummy_xray_bytes, 'test.png')
        if svc.mode == 'binary':
            assert result['diagnosis'] in ('Normal', 'Abnormal')

    @skip_if_no_binary
    def test_confidence_in_range(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(dummy_xray_bytes, 'test.png')
        assert 0.0 <= result['confidence'] <= 100.0

    @skip_if_no_binary
    def test_invalid_bytes_returns_error(self):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(b'not-an-image', 'bad.jpg')
        assert result['success'] is False
        assert 'error' in result

    @skip_if_no_binary
    def test_bytes_input_works(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = XRayService()
        result = svc.analyze_xray(dummy_xray_bytes, 'test.png')
        assert result['success'] is True


# ── Mocked inference (always runs) ───────────────────────────────────────────

class TestMockedInference:
    """Tests using mocked models so they run without weight files."""

    def _make_mocked_binary_svc(self):
        from services.xray_service import XRayService
        svc = object.__new__(XRayService)
        svc.device    = torch.device('cpu')
        svc.mode      = 'binary'
        svc.classes   = ['abnormal', 'normal']
        svc.metadata  = {'accuracy': 0.933}
        svc.transform = XRayService._get_transform(svc)

        mock_model = MagicMock()
        # Simulate model returning logits that give "Normal" prediction
        mock_model.return_value = torch.tensor([[0.1, 2.5]])
        svc.model = mock_model
        return svc

    def test_mocked_binary_normal_prediction(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = self._make_mocked_binary_svc()
        result = svc._binary_result(torch.tensor([[0.1, 2.5]]), 'test.png')
        assert result['success'] is True
        assert result['diagnosis'] == 'Normal'

    def test_mocked_binary_abnormal_prediction(self, dummy_xray_bytes):
        from services.xray_service import XRayService
        svc = self._make_mocked_binary_svc()
        result = svc._binary_result(torch.tensor([[2.5, 0.1]]), 'test.png')
        assert result['success'] is True
        assert result['diagnosis'] == 'Abnormal'

    def test_mocked_cardiac_no_findings(self):
        from services.xray_service import XRayService, CARDIAC_LABELS
        svc = object.__new__(XRayService)
        svc.metadata              = {'best_mean_auc': 0.85}
        svc.mode                  = 'cardiac'
        svc.classes               = CARDIAC_LABELS
        svc.per_class_thresholds  = {lbl: 0.5 for lbl in CARDIAC_LABELS}
        logits = torch.tensor([[-3.0, -3.0, -3.0, -3.0, -3.0]])
        result = svc._cardiac_result(logits, 'test.png')
        assert result['success'] is True
        assert result['positive_findings'] == []
        assert result['diagnosis'] == 'Normal'

    def test_mocked_cardiac_cardiomegaly_found(self):
        from services.xray_service import XRayService, CARDIAC_LABELS
        svc = object.__new__(XRayService)
        svc.metadata              = {'best_mean_auc': 0.85}
        svc.mode                  = 'cardiac'
        svc.classes               = CARDIAC_LABELS
        svc.per_class_thresholds  = {lbl: 0.5 for lbl in CARDIAC_LABELS}
        # High logit for Cardiomegaly (index 0), low for others
        logits = torch.tensor([[3.0, -3.0, -3.0, -3.0, -3.0]])
        result = svc._cardiac_result(logits, 'test.png')
        assert result['success'] is True
        assert 'Cardiomegaly' in result['positive_findings']
        assert 'Cardiac Abnormality' in result['diagnosis']
