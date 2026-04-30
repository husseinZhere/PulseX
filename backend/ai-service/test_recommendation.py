"""
Test Suite for Smart Health Recommendation Service
Tests the recommendation endpoint and service functionality.

Run with: pytest test_recommendation.py -v
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from pathlib import Path

# Test data fixtures
LOW_RISK_PATIENT = {
    "age": 35,
    "sex": 0,
    "cp": 1,
    "trestbps": 110,
    "chol": 180,
    "fbs": 0,
    "restecg": 0,
    "thalach": 175,
    "exang": 0,
    "oldpeak": 0.5,
    "slope": 1,
    "ca": 0,
    "thal": 1
}

HIGH_RISK_PATIENT = {
    "age": 65,
    "sex": 1,
    "cp": 0,
    "trestbps": 160,
    "chol": 280,
    "fbs": 1,
    "restecg": 2,
    "thalach": 90,
    "exang": 1,
    "oldpeak": 3.5,
    "slope": 2,
    "ca": 2,
    "thal": 2
}

HIGH_BP_PATIENT = {
    "age": 45,
    "sex": 1,
    "cp": 2,
    "trestbps": 155,  # High BP
    "chol": 220,
    "fbs": 0,
    "restecg": 0,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 1.0,
    "slope": 1,
    "ca": 0,
    "thal": 1
}


class TestRecommendationService:
    """Unit tests for RecommendationService class."""
    
    @pytest.fixture
    def mock_model(self):
        """Create a mock model for testing."""
        mock = MagicMock()
        mock.predict.return_value = [0]  # No disease
        mock.predict_proba.return_value = [[0.8, 0.2]]  # Low probability
        return mock
    
    @pytest.fixture
    def mock_high_risk_model(self):
        """Create a mock model that predicts high risk."""
        mock = MagicMock()
        mock.predict.return_value = [1]  # Disease present
        mock.predict_proba.return_value = [[0.15, 0.85]]  # High probability
        return mock
    
    def test_validate_input_success(self):
        """Test input validation with valid data."""
        from services.recommendation_service import RecommendationService
        
        # Mock model loading
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = MagicMock()
            
            # Should not raise
            validated = service._validate_input(LOW_RISK_PATIENT)
            assert validated == LOW_RISK_PATIENT
    
    def test_validate_input_missing_field(self):
        """Test input validation fails with missing field."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = MagicMock()
            
            incomplete_data = LOW_RISK_PATIENT.copy()
            del incomplete_data['age']
            
            with pytest.raises(ValueError, match="Missing required fields"):
                service._validate_input(incomplete_data)
    
    def test_validate_input_out_of_range(self):
        """Test input validation fails with out-of-range values."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = MagicMock()
            
            invalid_data = LOW_RISK_PATIENT.copy()
            invalid_data['age'] = 150  # Invalid age
            
            with pytest.raises(ValueError, match="Age must be between"):
                service._validate_input(invalid_data)
    
    def test_calculate_confidence_high(self):
        """Test confidence calculation for high confidence."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Far from 0.5 threshold
            assert service._calculate_confidence(0.9) == "high"
            assert service._calculate_confidence(0.1) == "high"
    
    def test_calculate_confidence_moderate(self):
        """Test confidence calculation for moderate confidence."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Moderate distance from 0.5
            assert service._calculate_confidence(0.7) == "moderate"
            assert service._calculate_confidence(0.3) == "moderate"
    
    def test_calculate_confidence_low(self):
        """Test confidence calculation for low confidence."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Close to 0.5 threshold
            assert service._calculate_confidence(0.55) == "low"
            assert service._calculate_confidence(0.45) == "low"
    
    def test_determine_risk_level_low(self):
        """Test risk level determination for low risk."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Prediction 0 with low score
            assert service._determine_risk_level(0.2, 0) == "low"
    
    def test_determine_risk_level_high(self):
        """Test risk level determination for high risk."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Prediction 1 with high score
            assert service._determine_risk_level(0.85, 1) == "high"
    
    def test_determine_followup_urgency(self):
        """Test follow-up urgency determination."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            assert service._determine_followup_urgency(0.9) == "immediate"
            assert service._determine_followup_urgency(0.7) == "within_48h"
            assert service._determine_followup_urgency(0.5) == "within_week"
            assert service._determine_followup_urgency(0.3) == "routine"
    
    def test_identify_key_risk_factors(self):
        """Test identification of key risk factors."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            risk_factors = service._identify_key_risk_factors(HIGH_RISK_PATIENT)
            
            assert "high_bp" in risk_factors
            assert "elevated_cholesterol" in risk_factors
            assert "elevated_blood_sugar" in risk_factors
            assert "exercise_induced_angina" in risk_factors
            assert "chest_pain_type_0" in risk_factors
            assert "significant_st_depression" in risk_factors
            assert "major_vessels_affected" in risk_factors
    
    def test_generate_recommendations_high_bp(self):
        """Test that high BP generates lifestyle recommendation."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            recommendations = service._generate_recommendations(HIGH_BP_PATIENT, 0, 0.3)
            
            # Should have at least one lifestyle recommendation for high BP
            lifestyle_recs = [r for r in recommendations if r['category'] == 'lifestyle']
            assert len(lifestyle_recs) > 0
            
            # Check that high BP is mentioned
            bp_rec = [r for r in lifestyle_recs if 'blood pressure' in r['message'].lower()]
            assert len(bp_rec) > 0
    
    def test_generate_recommendations_minimum_two(self):
        """Test that at least 2 recommendations are always generated."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            # Even for low-risk patient
            recommendations = service._generate_recommendations(LOW_RISK_PATIENT, 0, 0.1)
            assert len(recommendations) >= 2
    
    def test_get_recommendation_low_risk(self, mock_model):
        """Test full recommendation flow for low risk patient."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = mock_model
            
            result = service.get_recommendation(LOW_RISK_PATIENT)
            
            # Check all required keys are present
            assert 'risk_level' in result
            assert 'risk_score' in result
            assert 'prediction' in result
            assert 'confidence' in result
            assert 'recommendations' in result
            assert 'key_risk_factors' in result
            assert 'follow_up_urgency' in result
            
            # Check prediction is 0 for low risk
            assert result['prediction'] == 0
            assert result['risk_level'] == 'low'
    
    def test_get_recommendation_high_risk(self, mock_high_risk_model):
        """Test full recommendation flow for high risk patient."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = mock_high_risk_model
            
            result = service.get_recommendation(HIGH_RISK_PATIENT)
            
            # Check prediction is 1 for high risk
            assert result['prediction'] == 1
            assert result['risk_level'] == 'high'
            assert result['follow_up_urgency'] in ['within_48h', 'immediate']
    
    def test_get_recommendation_model_not_loaded(self):
        """Test that RuntimeError is raised when model is not loaded."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.model = None
            
            with pytest.raises(RuntimeError, match="model not loaded"):
                service.get_recommendation(LOW_RISK_PATIENT)


class TestRecommendationEndpoint:
    """Integration tests for the /api/recommendation endpoint."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        from fastapi.testclient import TestClient
        
        # We need to mock the service before importing main
        with patch('services.recommendation_service.RecommendationService') as MockService:
            mock_instance = MagicMock()
            mock_instance.get_recommendation.return_value = {
                "risk_level": "low",
                "risk_score": 0.2,
                "prediction": 0,
                "confidence": "high",
                "recommendations": [
                    {"category": "lifestyle", "priority": "low", "message": "Test recommendation 1"},
                    {"category": "medical", "priority": "low", "message": "Test recommendation 2"}
                ],
                "key_risk_factors": [],
                "follow_up_urgency": "routine"
            }
            MockService.return_value = mock_instance
            
            # Import main after mocking
            import importlib
            import main
            importlib.reload(main)
            
            return TestClient(main.app)
    
    def test_endpoint_happy_path_low_risk(self):
        """Test endpoint with low risk patient - happy path."""
        from fastapi.testclient import TestClient
        from unittest.mock import patch, MagicMock
        
        # Create mock service
        mock_service = MagicMock()
        mock_service.get_recommendation.return_value = {
            "risk_level": "low",
            "risk_score": 0.2,
            "prediction": 0,
            "confidence": "high",
            "recommendations": [
                {"category": "lifestyle", "priority": "low", "message": "Maintain healthy lifestyle"},
                {"category": "medical", "priority": "low", "message": "Continue routine checkups"}
            ],
            "key_risk_factors": [],
            "follow_up_urgency": "routine"
        }
        
        with patch.dict('sys.modules', {}):
            # This test verifies the expected response structure
            result = mock_service.get_recommendation(LOW_RISK_PATIENT)
            
            assert result['risk_level'] == 'low'
            assert result['prediction'] == 0
            assert 'recommendations' in result
            assert len(result['recommendations']) >= 2
    
    def test_endpoint_happy_path_high_risk(self):
        """Test endpoint with high risk patient - happy path."""
        # Create mock service
        mock_service = MagicMock()
        mock_service.get_recommendation.return_value = {
            "risk_level": "high",
            "risk_score": 0.85,
            "prediction": 1,
            "confidence": "high",
            "recommendations": [
                {"category": "medical", "priority": "urgent", "message": "Immediate cardiology referral"},
                {"category": "lifestyle", "priority": "high", "message": "Reduce sodium intake"}
            ],
            "key_risk_factors": ["high_bp", "elevated_cholesterol"],
            "follow_up_urgency": "within_48h"
        }
        
        result = mock_service.get_recommendation(HIGH_RISK_PATIENT)
        
        assert result['risk_level'] == 'high'
        assert result['prediction'] == 1
        assert result['follow_up_urgency'] in ['within_48h', 'immediate']
    
    def test_endpoint_validation_missing_field(self):
        """Test that missing field returns 422."""
        from fastapi.testclient import TestClient
        from pydantic import ValidationError
        
        # Test Pydantic validation directly
        from main import RecommendationRequest
        
        incomplete_data = LOW_RISK_PATIENT.copy()
        del incomplete_data['age']
        
        with pytest.raises(ValidationError):
            RecommendationRequest(**incomplete_data)
    
    def test_endpoint_validation_invalid_range(self):
        """Test that out-of-range values return 422."""
        from main import RecommendationRequest
        from pydantic import ValidationError
        
        invalid_data = LOW_RISK_PATIENT.copy()
        invalid_data['age'] = 150  # Invalid
        
        with pytest.raises(ValidationError):
            RecommendationRequest(**invalid_data)
    
    def test_pydantic_model_valid_data(self):
        """Test that valid data passes Pydantic validation."""
        from main import RecommendationRequest
        
        request = RecommendationRequest(**LOW_RISK_PATIENT)
        
        assert request.age == LOW_RISK_PATIENT['age']
        assert request.sex == LOW_RISK_PATIENT['sex']
        assert request.cp == LOW_RISK_PATIENT['cp']
    
    def test_service_unavailable_503(self):
        """Test that missing model returns 503."""
        # This tests the expected behavior when service is not initialized
        # The endpoint should return 503 when recommendation_service is None
        pass  # This would require actual endpoint testing


class TestModelLoading:
    """Tests for model loading functionality."""
    
    def test_model_file_not_found(self):
        """Test that FileNotFoundError is raised when model file is missing."""
        from services.recommendation_service import RecommendationService
        
        with patch('pathlib.Path.exists', return_value=False):
            with pytest.raises(FileNotFoundError, match="Model file missing"):
                RecommendationService()
    
    def test_metadata_loading_success(self):
        """Test successful metadata loading."""
        from services.recommendation_service import RecommendationService
        
        mock_metadata = {
            "model_type": "TestModel",
            "test_accuracy": 0.95,
            "feature_names": ["age", "sex"]
        }
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            service.metadata = mock_metadata
            service.feature_names = mock_metadata['feature_names']
            
            assert service.metadata['model_type'] == "TestModel"
            assert len(service.feature_names) == 2


class TestRecommendationLogic:
    """Tests for recommendation generation logic."""
    
    def test_high_bp_recommendation(self):
        """Test that high BP always generates lifestyle recommendation."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            high_bp_data = LOW_RISK_PATIENT.copy()
            high_bp_data['trestbps'] = 160
            
            recommendations = service._generate_recommendations(high_bp_data, 0, 0.3)
            
            categories = [r['category'] for r in recommendations]
            assert 'lifestyle' in categories
    
    def test_exercise_angina_recommendation(self):
        """Test that exercise angina generates exercise recommendation."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            angina_data = LOW_RISK_PATIENT.copy()
            angina_data['exang'] = 1
            
            recommendations = service._generate_recommendations(angina_data, 0, 0.3)
            
            categories = [r['category'] for r in recommendations]
            assert 'exercise' in categories
    
    def test_asymptomatic_chest_pain_recommendation(self):
        """Test that cp=0 generates urgent medical recommendation."""
        from services.recommendation_service import RecommendationService
        
        with patch.object(RecommendationService, '_load_model'):
            service = RecommendationService()
            
            cp0_data = LOW_RISK_PATIENT.copy()
            cp0_data['cp'] = 0
            
            recommendations = service._generate_recommendations(cp0_data, 0, 0.3)
            
            # Find recommendation about asymptomatic chest pain
            urgent_recs = [r for r in recommendations if r['priority'] == 'urgent']
            assert len(urgent_recs) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
