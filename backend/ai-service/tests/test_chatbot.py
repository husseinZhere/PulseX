"""
Unit + integration tests for ChatbotService.

Run: pytest tests/test_chatbot.py -v
"""

import asyncio
import pytest
from services.chatbot_service import ChatbotService, ABBREV_MAP, RISK_WEIGHTS


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope='module')
def svc():
    return ChatbotService()


# ── Preprocessing ─────────────────────────────────────────────────────────────

class TestPreprocessing:

    def test_lowercase(self, svc):
        assert svc.preprocess("HELLO WORLD") == "hello world"

    def test_strips_whitespace(self, svc):
        assert svc.preprocess("  hello  ") == "hello"

    def test_collapses_extra_spaces(self, svc):
        result = svc.preprocess("hello   world")
        assert "  " not in result

    def test_abbrev_bp(self, svc):
        assert 'blood pressure' in svc.preprocess("my BP is high")

    def test_abbrev_sob(self, svc):
        assert 'shortness of breath' in svc.preprocess("I have SOB")

    def test_abbrev_htn(self, svc):
        assert 'hypertension' in svc.preprocess("patient has HTN")

    def test_abbrev_mi(self, svc):
        assert 'myocardial infarction' in svc.preprocess("had an MI last year")

    def test_abbrev_ecg(self, svc):
        assert 'electrocardiogram' in svc.preprocess("ECG showed changes")

    def test_abbrev_chf(self, svc):
        assert 'congestive heart failure' in svc.preprocess("diagnosed with CHF")

    def test_non_medical_unchanged_in_structure(self, svc):
        # Non-medical text still goes through preprocessing without error
        result = svc.preprocess("What is the weather?")
        assert isinstance(result, str)


# ── Intent Classification ─────────────────────────────────────────────────────

class TestIntentClassification:

    def test_heart_pain_is_medical_and_heart(self, svc):
        is_med, is_heart, _, _ = svc.classify_intent("I have chest pain and heart palpitations")
        assert is_med is True
        assert is_heart is True

    def test_blood_pressure_is_heart(self, svc):
        is_med, is_heart, _, _ = svc.classify_intent("my blood pressure is 160 over 100")
        assert is_heart is True

    def test_greeting_is_not_medical(self, svc):
        is_med, is_heart, _, _ = svc.classify_intent("hello how are you today")
        assert is_med is False
        assert is_heart is False

    def test_weather_is_not_medical(self, svc):
        is_med, is_heart, _, _ = svc.classify_intent("what is the weather tomorrow")
        assert is_med is False

    def test_diabetes_is_medical(self, svc):
        is_med, is_heart, _, _ = svc.classify_intent("i am diabetic and take insulin")
        assert is_med is True

    def test_heart_implies_medical(self, svc):
        # Heart-related must always be classified as medical too
        is_med, is_heart, _, _ = svc.classify_intent("coronary artery disease risk")
        assert is_med is True
        assert is_heart is True

    def test_tfidf_scores_are_floats(self, svc):
        _, _, med_score, heart_score = svc.classify_intent("chest pain shortness of breath")
        assert isinstance(med_score,   float)
        assert isinstance(heart_score, float)
        assert med_score   >= 0.0
        assert heart_score >= 0.0


# ── Symptom Extraction ────────────────────────────────────────────────────────

class TestSymptomExtraction:

    def test_chest_pain_detected(self, svc):
        symptoms = svc.extract_symptoms("i have chest pain when i walk")
        assert 'chest_pain' in symptoms

    def test_shortness_of_breath_detected(self, svc):
        symptoms = svc.extract_symptoms("shortness of breath when climbing stairs")
        assert 'shortness_of_breath' in symptoms

    def test_palpitations_detected(self, svc):
        symptoms = svc.extract_symptoms("my heart is racing and pounding")
        assert 'palpitations' in symptoms

    def test_high_bp_detected(self, svc):
        symptoms = svc.extract_symptoms("i have high blood pressure")
        assert 'high_blood_pressure' in symptoms

    def test_smoking_detected(self, svc):
        symptoms = svc.extract_symptoms("i smoke 10 cigarettes per day")
        assert 'smoking' in symptoms

    def test_family_history_detected(self, svc):
        symptoms = svc.extract_symptoms("my father had a heart attack")
        assert 'family_history' in symptoms

    def test_negation_no_chest_pain(self, svc):
        symptoms = svc.extract_symptoms("patient denies chest pain")
        assert 'chest_pain' not in symptoms

    def test_negation_no_shortness_of_breath(self, svc):
        symptoms = svc.extract_symptoms("no shortness of breath reported")
        assert 'shortness_of_breath' not in symptoms

    def test_negation_without_edema(self, svc):
        symptoms = svc.extract_symptoms("without swelling in the legs")
        assert 'swelling' not in symptoms

    def test_multiple_symptoms(self, svc):
        text = "i have chest pain, shortness of breath, and fatigue"
        symptoms = svc.extract_symptoms(text)
        assert 'chest_pain'          in symptoms
        assert 'shortness_of_breath' in symptoms
        assert 'fatigue'             in symptoms

    def test_empty_input_returns_empty(self, svc):
        symptoms = svc.extract_symptoms("")
        assert symptoms == []

    def test_irrelevant_text_returns_empty(self, svc):
        symptoms = svc.extract_symptoms("i love cooking pasta for dinner")
        assert symptoms == []


# ── Risk Calculation ──────────────────────────────────────────────────────────

class TestRiskCalculation:

    def test_high_risk_from_severe_symptoms(self, svc):
        symptoms = ['chest_pain', 'shortness_of_breath', 'high_blood_pressure', 'irregular_heartbeat']
        risk = svc.calculate_risk(symptoms)
        assert risk['risk_level'] == 'high'
        assert risk['risk_score'] > 0.55

    def test_low_risk_from_no_symptoms(self, svc):
        risk = svc.calculate_risk([])
        assert risk['risk_level'] == 'low'
        assert risk['risk_score'] == 0.0

    def test_medium_risk(self, svc):
        symptoms = ['fatigue', 'dizziness']
        risk = svc.calculate_risk(symptoms)
        assert risk['risk_level'] in ('low', 'medium')

    def test_risk_score_capped_at_1(self, svc):
        all_symptoms = list(RISK_WEIGHTS.keys())
        risk = svc.calculate_risk(all_symptoms)
        assert risk['risk_score'] <= 1.0

    def test_risk_percentage_capped_at_100(self, svc):
        all_symptoms = list(RISK_WEIGHTS.keys())
        risk = svc.calculate_risk(all_symptoms)
        assert risk['risk_percentage'] <= 100.0

    def test_contributors_match_symptoms(self, svc):
        symptoms = ['chest_pain', 'smoking']
        risk = svc.calculate_risk(symptoms)
        factor_names = [c['factor'] for c in risk['contributors']]
        assert any('Chest' in f for f in factor_names)
        assert any('Smoking' in f for f in factor_names)

    def test_user_data_age_increases_score(self, svc):
        symptoms = ['fatigue']
        risk_no_age   = svc.calculate_risk(symptoms, user_data={'age': 40})
        risk_with_age = svc.calculate_risk(symptoms, user_data={'age': 60})
        assert risk_with_age['risk_score'] > risk_no_age['risk_score']


# ── Recommendations ───────────────────────────────────────────────────────────

class TestRecommendations:

    def test_high_risk_has_urgent_recs(self, svc):
        risk = {'risk_level': 'high', 'risk_category': 'High Risk ⚠️',
                'risk_score': 0.7, 'risk_percentage': 70.0, 'contributors': []}
        recs = svc.generate_recommendations(risk, ['chest_pain'])
        assert any('URGENT' in r or 'emergency' in r.lower() for r in recs)

    def test_smoking_rec_included_when_smoking(self, svc):
        risk = {'risk_level': 'low', 'risk_category': 'Low Risk ✅',
                'risk_score': 0.1, 'risk_percentage': 10.0, 'contributors': []}
        recs = svc.generate_recommendations(risk, ['smoking'])
        assert any('smok' in r.lower() for r in recs)

    def test_diabetes_rec_included(self, svc):
        risk = {'risk_level': 'medium', 'risk_category': 'Moderate Risk ⚡',
                'risk_score': 0.3, 'risk_percentage': 30.0, 'contributors': []}
        recs = svc.generate_recommendations(risk, ['diabetes'])
        assert any('glyc' in r.lower() or 'diabet' in r.lower() or 'hba1c' in r.lower() for r in recs)

    def test_recs_is_non_empty_list(self, svc):
        risk = {'risk_level': 'low', 'risk_category': 'Low Risk ✅',
                'risk_score': 0.1, 'risk_percentage': 10.0, 'contributors': []}
        recs = svc.generate_recommendations(risk, [])
        assert isinstance(recs, list)
        assert len(recs) > 0


# ── Full Pipeline (async) ─────────────────────────────────────────────────────

class TestFullPipeline:

    def test_non_medical_message(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("what is the weather today")
        )
        assert result['success'] is True
        assert result['type'] == 'non_medical'
        assert result['requires_clarification'] is True

    def test_non_heart_medical_message(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("I have a headache and fever")
        )
        assert result['success'] is True
        assert result['type'] in ('non_heart_medical', 'needs_more_info', 'risk_assessment')

    def test_heart_message_returns_assessment(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("I have chest pain and shortness of breath")
        )
        assert result['success'] is True
        assert result['type'] == 'risk_assessment'
        assert 'risk_level'  in result
        assert 'risk_score'  in result
        assert 'symptoms'    in result
        assert len(result['symptoms']) > 0

    def test_response_contains_markdown(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("chest pain and high blood pressure")
        )
        assert '#' in result['response']

    def test_session_id_returned(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("I have palpitations")
        )
        assert 'session_id' in result
        assert len(result['session_id']) > 0

    def test_session_continuity(self, svc, event_loop):
        r1 = event_loop.run_until_complete(svc.process_message("chest pain"))
        sid = r1.get('session_id')
        r2 = event_loop.run_until_complete(svc.process_message("high blood pressure", session_id=sid))
        assert r2.get('session_id') == sid

    def test_negation_not_in_symptoms(self, svc, event_loop):
        result = event_loop.run_until_complete(
            svc.process_message("no chest pain, no shortness of breath, just fatigue")
        )
        if result['type'] == 'risk_assessment':
            assert 'chest_pain'          not in result.get('symptoms', [])
            assert 'shortness_of_breath' not in result.get('symptoms', [])

    def test_error_handled_gracefully(self, svc, event_loop):
        # Pass None to trigger error handling
        result = event_loop.run_until_complete(svc.process_message(None))
        assert result['success'] is False
        assert 'error' in result

    def test_abbrev_expansion_in_pipeline(self, svc, event_loop):
        # "SOB" should be expanded and trigger heart classification
        result = event_loop.run_until_complete(
            svc.process_message("I have SOB and CP")
        )
        assert result['success'] is True
        # Should be classified as heart-related after expansion
        assert result['type'] in ('risk_assessment', 'needs_more_info')
