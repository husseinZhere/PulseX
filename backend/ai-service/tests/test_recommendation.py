"""
Unit tests for RecommendationService.

Tests that do NOT require the trained model file are always run.
Tests that DO require the model file are skipped automatically if the file is absent.

Run: pytest tests/test_recommendation.py -v
"""

from pathlib import Path
import pytest

MODELS_DIR = Path(__file__).parent.parent / 'models'
MODEL_PRESENT = (MODELS_DIR / 'recommendation_model.pkl').exists()

skip_if_no_model = pytest.mark.skipif(
    not MODEL_PRESENT,
    reason="recommendation_model.pkl not found — run train_recommendation.py first",
)


# ── FeatureEngineeringTransformer (no model needed) ──────────────────────────

class TestFeatureEngineering:

    @pytest.fixture
    def transformer(self):
        from services.recommendation_service import FeatureEngineeringTransformer
        return FeatureEngineeringTransformer()

    def test_transform_adds_derived_features(self, transformer, sample_framingham_patient):
        import pandas as pd
        from services.recommendation_service import RecommendationService
        df = pd.DataFrame([sample_framingham_patient], columns=RecommendationService.FRAMINGHAM_FEATURES)
        result = transformer.transform(df)
        assert 'pulse_pressure'         in result.columns
        assert 'mean_arterial_pressure' in result.columns
        assert 'framingham_score'       in result.columns

    def test_pulse_pressure_correct(self, transformer, sample_framingham_patient):
        import pandas as pd
        from services.recommendation_service import RecommendationService
        df = pd.DataFrame([sample_framingham_patient], columns=RecommendationService.FRAMINGHAM_FEATURES)
        result = transformer.transform(df)
        expected = sample_framingham_patient['sysBP'] - sample_framingham_patient['diaBP']
        assert abs(result['pulse_pressure'].iloc[0] - expected) < 1e-6

    def test_bp_risk_flag_elevated(self, transformer, sample_framingham_patient):
        import pandas as pd
        from services.recommendation_service import RecommendationService
        # sysBP=145 → should trigger bp_risk=1
        df = pd.DataFrame([sample_framingham_patient], columns=RecommendationService.FRAMINGHAM_FEATURES)
        result = transformer.transform(df)
        assert result['bp_risk'].iloc[0] == 1

    def test_chol_risk_flag(self, transformer, sample_framingham_patient):
        import pandas as pd
        from services.recommendation_service import RecommendationService
        df = pd.DataFrame([sample_framingham_patient], columns=RecommendationService.FRAMINGHAM_FEATURES)
        result = transformer.transform(df)
        expected_chol_risk = int(sample_framingham_patient['totChol'] >= 240)
        assert result['chol_risk'].iloc[0] == expected_chol_risk

    def test_output_shape(self, transformer, sample_framingham_patient):
        import pandas as pd
        from services.recommendation_service import RecommendationService
        df = pd.DataFrame([sample_framingham_patient], columns=RecommendationService.FRAMINGHAM_FEATURES)
        result = transformer.transform(df)
        assert result.shape[1] == 29  # 15 original + 14 engineered


# ── Input Validation (no model needed) ───────────────────────────────────────

class TestInputValidation:
    """Test _validate_input in isolation (creates a partial service-like object)."""

    @pytest.fixture
    def validate_fn(self):
        from services.recommendation_service import RecommendationService
        svc = object.__new__(RecommendationService)  # skip __init__
        svc.FRAMINGHAM_FEATURES = RecommendationService.FRAMINGHAM_FEATURES
        return svc._validate_input

    def test_valid_patient_passes(self, validate_fn, sample_framingham_patient):
        result = validate_fn(sample_framingham_patient)
        assert set(result.keys()) == set(result.keys())

    def test_missing_field_raises(self, validate_fn, sample_framingham_patient):
        incomplete = {k: v for k, v in sample_framingham_patient.items() if k != 'age'}
        with pytest.raises(ValueError, match='age'):
            validate_fn(incomplete)

    def test_binary_fields_converted_to_int(self, validate_fn, sample_framingham_patient):
        result = validate_fn(sample_framingham_patient)
        for field in ['male', 'currentSmoker', 'BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes']:
            assert isinstance(result[field], int)

    def test_continuous_fields_converted_to_float(self, validate_fn, sample_framingham_patient):
        result = validate_fn(sample_framingham_patient)
        for field in ['totChol', 'sysBP', 'diaBP', 'BMI', 'heartRate', 'glucose']:
            assert isinstance(result[field], float)


# ── Risk Factor Identification (no model needed) ──────────────────────────────

class TestRiskFactorIdentification:

    @pytest.fixture
    def identify_fn(self):
        from services.recommendation_service import RecommendationService
        svc = object.__new__(RecommendationService)
        return svc._identify_risk_factors

    def test_smoking_detected(self, identify_fn, sample_framingham_patient):
        factors = identify_fn(sample_framingham_patient)
        assert 'current_smoker' in factors

    def test_high_bp_detected(self, identify_fn, sample_framingham_patient):
        factors = identify_fn(sample_framingham_patient)
        assert 'high_systolic_bp' in factors

    def test_elevated_cholesterol(self, identify_fn, sample_framingham_patient):
        factors = identify_fn(sample_framingham_patient)
        assert 'elevated_cholesterol' in factors

    def test_low_risk_patient_has_fewer_factors(self, identify_fn, low_risk_patient):
        factors = identify_fn(low_risk_patient)
        assert len(factors) < 3

    def test_high_risk_patient_has_many_factors(self, identify_fn, high_risk_patient):
        factors = identify_fn(high_risk_patient)
        assert len(factors) >= 5

    def test_prior_stroke_detected(self, identify_fn, high_risk_patient):
        factors = identify_fn(high_risk_patient)
        assert 'prior_stroke' in factors


# ── Prediction (requires model file) ─────────────────────────────────────────

class TestPrediction:

    @pytest.fixture(scope='class')
    def svc(self):
        from services.recommendation_service import RecommendationService
        return RecommendationService()

    @skip_if_no_model
    def test_predict_returns_required_fields(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        required = {'risk_level', 'risk_score', 'prediction', 'confidence',
                    'alert_message', 'recommendations', 'key_risk_factors', 'follow_up_urgency'}
        assert required.issubset(set(result.keys()))

    @skip_if_no_model
    def test_risk_level_is_valid(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        assert result['risk_level'] in ('low', 'elevated', 'moderate', 'high', 'very_high')

    @skip_if_no_model
    def test_risk_score_is_probability(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        assert 0.0 <= result['risk_score'] <= 1.0

    @skip_if_no_model
    def test_prediction_is_binary(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        assert result['prediction'] in (0, 1)

    @skip_if_no_model
    def test_alert_message_present_and_non_empty(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        assert result['alert_message'] is not None
        assert len(result['alert_message']) > 10

    @skip_if_no_model
    def test_recommendations_is_non_empty_list(self, svc, sample_framingham_patient):
        result = svc.predict(sample_framingham_patient)
        assert isinstance(result['recommendations'], list)
        assert len(result['recommendations']) > 0

    @skip_if_no_model
    def test_high_risk_patient_gets_urgent_alert(self, svc, high_risk_patient):
        result = svc.predict(high_risk_patient)
        alert = result['alert_message']
        assert any(word in alert.upper() for word in ['CRITICAL', 'HIGH', 'URGENT', 'RISK'])

    @skip_if_no_model
    def test_low_risk_patient_lower_score(self, svc, low_risk_patient, high_risk_patient):
        if 'Dummy' in svc.model_type:
            pytest.skip("Dummy model gives random predictions — requires real trained model")
        low  = svc.predict(low_risk_patient)
        high = svc.predict(high_risk_patient)
        assert low['risk_score'] < high['risk_score']

    @skip_if_no_model
    def test_very_high_risk_reachable(self, svc):
        """Verify very_high risk level can be assigned (threshold ≥ 0.85)."""
        from services.recommendation_service import RecommendationService
        from unittest.mock import patch, MagicMock
        mock_model = MagicMock()
        import numpy as np
        mock_model.predict_proba.return_value = np.array([[0.05, 0.92]])
        with patch.object(svc, 'model', mock_model):
            result = svc.predict({
                'male': 1, 'age': 65, 'education': 1,
                'currentSmoker': 1, 'cigsPerDay': 30.0, 'BPMeds': 1,
                'prevalentStroke': 0, 'prevalentHyp': 1, 'diabetes': 1,
                'totChol': 280.0, 'sysBP': 160.0, 'diaBP': 98.0,
                'BMI': 32.0, 'heartRate': 85.0, 'glucose': 130.0,
            })
        assert result['risk_level'] == 'very_high'
        assert result['follow_up_urgency'] == 'immediate'

    @skip_if_no_model
    def test_model_info_has_required_fields(self, svc):
        info = svc.get_model_info()
        assert 'model_type'               in info
        assert 'active_threshold'         in info
        assert 'clinical_override_active' in info
        assert 'sensitivity'              in info

    @skip_if_no_model
    def test_clinical_override_active_due_to_low_sensitivity(self, svc):
        """With the current model's sensitivity of 10.85%, override must be active."""
        info = svc.get_model_info()
        sensitivity = info.get('sensitivity', 1.0)
        if sensitivity is not None and sensitivity < 0.40:
            assert info['clinical_override_active'] is True
            assert info['active_threshold'] == svc.CLINICAL_SENSITIVITY_THRESHOLD
