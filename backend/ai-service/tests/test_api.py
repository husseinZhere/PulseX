"""
FastAPI integration tests — all endpoints.

Uses TestClient (synchronous) so no running server is needed.

Run: pytest tests/test_api.py -v
"""

import io
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))


# ── Client fixture ────────────────────────────────────────────────────────────

@pytest.fixture(scope='module')
def client():
    from main import app
    with TestClient(app) as c:
        yield c


def png_bytes(size=224) -> bytes:
    img = Image.new('RGB', (size, size), color=(100, 100, 100))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()


# ── Root / Health ─────────────────────────────────────────────────────────────

class TestSystemEndpoints:

    def test_root_returns_200(self, client):
        r = client.get('/')
        assert r.status_code == 200

    def test_root_has_service_field(self, client):
        r = client.get('/')
        assert 'service' in r.json()

    def test_root_has_features(self, client):
        data = client.get('/').json()
        assert 'features' in data
        assert 'xray_binary_classifier'  in data['features']
        assert 'heart_health_chatbot'    in data['features']
        assert 'smart_recommendation'    in data['features']

    def test_health_returns_200(self, client):
        r = client.get('/health')
        assert r.status_code == 200

    def test_health_has_status(self, client):
        r = client.get('/health')
        assert r.json()['status'] == 'healthy'

    def test_health_has_timestamp(self, client):
        r = client.get('/health')
        assert 'timestamp' in r.json()


# ── Chat endpoint ─────────────────────────────────────────────────────────────

class TestChatEndpoint:

    @pytest.fixture(autouse=True)
    def mock_chatbot(self):
        """Mock ChatbotService so this test doesn't need any model files."""
        mock_svc = MagicMock()
        mock_svc.process_message = AsyncMock(return_value={
            'success':     True,
            'response':    '# Assessment\nTest response',
            'type':        'risk_assessment',
            'risk_level':  'medium',
            'risk_score':  0.35,
            'symptoms':    ['chest_pain'],
            'session_id':  'test-session-id',
        })
        with patch('main.get_chatbot_service', return_value=mock_svc):
            yield

    def test_chat_returns_200(self, client):
        r = client.post('/api/chat', json={'message': 'I have chest pain'})
        assert r.status_code == 200

    def test_chat_returns_response_field(self, client):
        r = client.post('/api/chat', json={'message': 'chest pain'})
        data = r.json()
        assert 'response'   in data
        assert 'session_id' in data

    def test_chat_with_session_id(self, client):
        r = client.post('/api/chat', json={
            'message':    'shortness of breath',
            'session_id': 'my-session-123',
        })
        assert r.status_code == 200

    def test_chat_with_user_data(self, client):
        r = client.post('/api/chat', json={
            'message':   'I have palpitations',
            'user_data': {'age': 55, 'bmi': 28},
        })
        assert r.status_code == 200

    def test_chat_empty_message_still_processed(self, client):
        r = client.post('/api/chat', json={'message': ''})
        assert r.status_code in (200, 422)  # 422 if Pydantic rejects empty string

    def test_chat_missing_message_returns_422(self, client):
        r = client.post('/api/chat', json={})
        assert r.status_code == 422


# ── Recommendation endpoint ───────────────────────────────────────────────────

class TestRecommendationEndpoint:

    VALID_PAYLOAD = {
        'male': 1, 'age': 55, 'education': 2,
        'currentSmoker': 1, 'cigsPerDay': 10.0,
        'BPMeds': 0, 'prevalentStroke': 0, 'prevalentHyp': 1,
        'diabetes': 0, 'totChol': 240.0, 'sysBP': 145.0,
        'diaBP': 90.0, 'BMI': 27.5, 'heartRate': 75.0, 'glucose': 95.0,
    }

    @pytest.fixture(autouse=True)
    def mock_recommendation(self):
        mock_svc = MagicMock()
        mock_svc.predict.return_value = {
            'risk_level':       'moderate',
            'risk_score':       0.45,
            'prediction':       1,
            'confidence':       'moderate',
            'alert_message':    '🟡 MODERATE RISK: CHD risk detected.',
            'recommendations':  [{'category': 'lifestyle', 'priority': 'high', 'message': 'Exercise daily'}],
            'key_risk_factors': ['current_smoker', 'elevated_cholesterol'],
            'follow_up_urgency': 'within_1_week',
        }
        with patch('main.get_recommendation_service', return_value=mock_svc):
            yield

    def test_recommendation_returns_200(self, client):
        r = client.post('/api/recommendation', json=self.VALID_PAYLOAD)
        assert r.status_code == 200

    def test_recommendation_has_success_field(self, client):
        r = client.post('/api/recommendation', json=self.VALID_PAYLOAD)
        assert r.json()['success'] is True

    def test_recommendation_has_result(self, client):
        r = client.post('/api/recommendation', json=self.VALID_PAYLOAD)
        assert 'result' in r.json()

    def test_recommendation_result_has_alert_message(self, client):
        r = client.post('/api/recommendation', json=self.VALID_PAYLOAD)
        result = r.json()['result']
        assert 'alert_message' in result
        assert result['alert_message'] is not None

    def test_recommendation_result_has_risk_level(self, client):
        r = client.post('/api/recommendation', json=self.VALID_PAYLOAD)
        assert 'risk_level' in r.json()['result']

    def test_recommendation_missing_field_returns_422(self, client):
        bad_payload = {k: v for k, v in self.VALID_PAYLOAD.items() if k != 'age'}
        r = client.post('/api/recommendation', json=bad_payload)
        assert r.status_code == 422

    def test_recommendation_age_out_of_range_returns_422(self, client):
        bad = dict(self.VALID_PAYLOAD)
        bad['age'] = 15  # below minimum 20
        r = client.post('/api/recommendation', json=bad)
        assert r.status_code == 422

    def test_model_info_endpoint(self, client):
        mock_svc = MagicMock()
        mock_svc.get_model_info.return_value = {
            'model_type': 'RF (SMOTE)', 'active_threshold': 0.35,
            'clinical_override_active': True, 'sensitivity': 0.1085,
        }
        with patch('main.get_recommendation_service', return_value=mock_svc):
            r = client.get('/api/recommendation/model-info')
        assert r.status_code == 200
        assert r.json()['success'] is True


# ── X-Ray endpoint ────────────────────────────────────────────────────────────

class TestXRayEndpoint:

    @pytest.fixture(autouse=True)
    def mock_xray(self):
        mock_svc = MagicMock()
        mock_svc.analyze_xray.return_value = {
            'success':          True,
            'mode':             'binary',
            'diagnosis':        'Normal',
            'confidence':       91.5,
            'confidence_level': 'High',
            'probabilities':    {'normal': 91.5, 'abnormal': 8.5},
            'model_accuracy':   '93.3%',
            'recommendations':  ['✅ No significant abnormalities'],
            'note':             'Binary classifier',
        }
        with patch('main.get_xray_service', return_value=mock_svc):
            yield

    def test_xray_returns_200_with_valid_image(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('test.png', png_bytes(), 'image/png')},
        )
        assert r.status_code == 200

    def test_xray_has_success_field(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('test.png', png_bytes(), 'image/png')},
        )
        assert r.json()['success'] is True

    def test_xray_has_result_field(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('test.png', png_bytes(), 'image/png')},
        )
        assert 'result' in r.json()

    def test_xray_result_has_diagnosis(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('test.png', png_bytes(), 'image/png')},
        )
        assert 'diagnosis' in r.json()['result']

    def test_xray_result_has_recommendations(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('test.png', png_bytes(), 'image/png')},
        )
        assert 'recommendations' in r.json()['result']

    def test_xray_invalid_content_type_returns_error(self, client):
        r = client.post(
            '/api/xray/analyze',
            files={'file': ('bad.pdf', b'%PDF-fake', 'application/pdf')},
        )
        data = r.json()
        assert data.get('success') is False or r.status_code in (400, 422)

    def test_xray_no_file_returns_422(self, client):
        r = client.post('/api/xray/analyze')
        assert r.status_code == 422


# ── ECG upload endpoint ───────────────────────────────────────────────────────

class TestECGEndpoint:

    def test_ecg_upload_png_returns_200(self, client):
        r = client.post(
            '/api/ecg/upload',
            files={'file': ('ecg.png', png_bytes(), 'image/png')},
            data={'patient_id': 'pt-001'},
        )
        assert r.status_code == 200

    def test_ecg_upload_has_success_field(self, client):
        r = client.post(
            '/api/ecg/upload',
            files={'file': ('ecg.png', png_bytes(), 'image/png')},
            data={'patient_id': 'pt-001'},
        )
        assert r.json()['success'] is True

    def test_ecg_upload_returns_file_id(self, client):
        r = client.post(
            '/api/ecg/upload',
            files={'file': ('ecg.png', png_bytes(), 'image/png')},
            data={'patient_id': 'pt-002'},
        )
        assert 'file_id' in r.json()
        assert r.json()['file_id'] is not None

    def test_ecg_upload_invalid_extension_rejected(self, client):
        r = client.post(
            '/api/ecg/upload',
            files={'file': ('ecg.exe', b'MZ...', 'application/octet-stream')},
            data={'patient_id': 'pt-003'},
        )
        data = r.json()
        assert data.get('success') is False or r.status_code == 400

    def test_ecg_unique_file_ids(self, client):
        ids = []
        for i in range(3):
            r = client.post(
                '/api/ecg/upload',
                files={'file': (f'ecg_{i}.png', png_bytes(), 'image/png')},
                data={'patient_id': 'pt-multi'},
            )
            ids.append(r.json().get('file_id'))
        assert len(set(ids)) == 3  # all unique
