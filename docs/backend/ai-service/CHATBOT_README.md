# Heart Health Chatbot

## Overview

The Heart Health Chatbot is an intelligent conversational AI system designed to assess cardiovascular risk based on user-reported symptoms. It implements a multi-layered guardrail system to ensure safe and relevant interactions.

## Architecture

The chatbot follows a pipeline architecture with four main stages:

### 1. Input & Text Refinement
- **Text Preprocessing**: Cleans and normalizes user input
  - Converts to lowercase
  - Removes extra whitespaces
  - Handles special characters appropriately

### 2. Guardrail Logic (Filtering Phase)

#### Medical Intent Validation
The chatbot first validates if the input is medical-related:
- **Checks for medical keywords**: pain, symptom, disease, treatment, blood pressure, heart, etc.
- **If not medical**: Returns a friendly response asking for heart health concerns
- **If medical**: Proceeds to domain specialization

#### Domain Specialization
Once validated as medical, checks if it's heart-related:
- **Checks for heart keywords**: heart, cardiac, chest pain, blood pressure, cholesterol, etc.
- **If not heart-related**: Returns a scope constraint message
- **If heart-related**: Proceeds to symptom extraction

### 3. Core AI Processing

#### Symptom Extraction
Identifies heart-related symptoms from the text:
- Chest pain
- Shortness of breath
- High blood pressure
- High cholesterol
- Irregular heartbeat
- Diabetes
- Smoking
- Family history
- And more...

#### Risk Calculation
Calculates cardiovascular risk based on:
- **Detected symptoms**: Each symptom has a weighted contribution
- **User data** (optional):
  - Age (> 55 years adds risk)
  - BMI (> 30 adds risk)

**Risk Levels:**
- **Low Risk** (< 25%): Minimal symptoms, continue healthy habits
- **Medium Risk** (25-49%): Moderate symptoms, schedule doctor appointment
- **High Risk** (≥ 50%): Serious symptoms, seek immediate medical attention

### 4. Post-Processing & Final Delivery

#### Response Formatting
Generates structured output with:
- Risk level and score
- Detected symptoms
- Risk analysis breakdown
- Personalized recommendations

#### Recommendations
Tailored advice based on risk level:
- **High Risk**: Urgent medical attention, emergency contacts
- **Medium Risk**: Schedule appointment, monitor symptoms
- **Low Risk**: Maintain healthy habits, regular check-ups
- **Symptom-specific**: Diet, exercise, smoking cessation, etc.

## API Usage

### Endpoint
```
POST /api/chatbot
```

### Request Format
```json
{
  "message": "I have chest pain and shortness of breath",
  "user_data": {
    "age": 55,
    "bmi": 28
  }
}
```

### Response Types

#### 1. Non-Medical Query
```json
{
  "success": true,
  "response": "I'm here to help you with heart health concerns! ...",
  "type": "non_medical",
  "requires_clarification": true
}
```

#### 2. Medical but Non-Heart
```json
{
  "success": true,
  "response": "I appreciate your question! However, I specialize specifically in cardiovascular (heart) health...",
  "type": "non_heart_medical",
  "requires_clarification": true
}
```

#### 3. Needs More Information
```json
{
  "success": true,
  "response": "I understand you have heart health concerns. To provide you with a better assessment...",
  "type": "needs_more_info",
  "requires_clarification": true
}
```

#### 4. Risk Assessment (Full Response)
```json
{
  "success": true,
  "response": "# Heart Health Assessment Results\n\n## Risk Level: High Risk ⚠️\n...",
  "type": "risk_assessment",
  "risk_level": "high",
  "risk_score": 0.78,
  "symptoms": ["chest pain", "shortness of breath", "irregular heartbeat"],
  "recommendations": [
    "🚨 URGENT: Please seek immediate medical attention",
    "📞 Contact your doctor or go to the emergency room",
    ...
  ],
  "requires_clarification": false
}
```

## Risk Factors & Weights

| Symptom | Weight | Contribution |
|---------|--------|--------------|
| Chest pain | 0.25 | 25% |
| Shortness of breath | 0.20 | 20% |
| High blood pressure | 0.15 | 15% |
| High cholesterol | 0.15 | 15% |
| Irregular heartbeat | 0.15 | 15% |
| Palpitations | 0.12 | 12% |
| Diabetes | 0.10 | 10% |
| Smoking | 0.10 | 10% |
| Dizziness | 0.08 | 8% |
| Family history | 0.08 | 8% |
| Obesity | 0.07 | 7% |
| Swelling | 0.07 | 7% |
| Fatigue | 0.05 | 5% |
| Age > 55 | 0.10 | 10% |
| BMI > 30 | 0.08 | 8% |

## Examples

### Example 1: High Risk Assessment
**Input:**
```json
{
  "message": "I'm experiencing severe chest pain, shortness of breath, and my heart beats irregularly",
  "user_data": {
    "age": 65,
    "bmi": 32
  }
}
```

**Output:**
- Risk Level: High Risk ⚠️ (78%)
- Symptoms: chest pain, shortness of breath, irregular heartbeat
- Recommendations: Urgent medical attention

### Example 2: Low Risk Assessment (near Medium threshold)
**Input:**
```json
{
  "message": "I have high blood pressure and sometimes feel dizzy"
}
```

**Output:**
- Risk Level: Low Risk ✅ (23%)
- Symptoms: high blood pressure, dizziness
- Recommendations: Monitor symptoms, maintain healthy habits

### Example 3: Medium Risk Assessment
**Input:**
```json
{
  "message": "I have chest pain and high cholesterol"
}
```

**Output:**
- Risk Level: Medium Risk ⚡ (40%)
- Symptoms: chest pain, high cholesterol
- Recommendations: Schedule appointment, get comprehensive tests

### Example 3: Medium Risk Assessment
**Input:**
```json
{
  "message": "I have chest pain and high cholesterol"
}
```

**Output:**
- Risk Level: Medium Risk ⚡ (40%)
- Symptoms: chest pain, high cholesterol
- Recommendations: Schedule appointment, get comprehensive tests

### Example 4: Non-Medical Query
**Input:**
```json
{
  "message": "Hello, how are you?"
}
```

**Output:**
- Type: non_medical
- Response: Friendly prompt asking for heart health concerns

### Example 5: Non-Heart Medical Query
**Input:**
```json
{
  "message": "I have a broken leg"
}
```

**Output:**
- Type: non_heart_medical
- Response: Scope constraint message directing to appropriate resources

## Testing

### Unit Tests
Run the chatbot service tests:
```bash
python test_chatbot_simple.py
```

### Integration Tests
Start the server and use the example client:
```bash
# Terminal 1: Start server
python main.py

# Terminal 2: Run tests
python example_chatbot_client.py
```

### cURL Example
```bash
curl -X POST "http://localhost:8000/api/chatbot" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have chest pain and high blood pressure",
    "user_data": {
      "age": 60,
      "bmi": 32
    }
  }'
```

## Safety & Limitations

### Medical Disclaimer
⚕️ **Important**: This chatbot is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.

### Limitations
- **Not a diagnosis tool**: Cannot diagnose medical conditions
- **Symptom-based only**: Relies on user-reported symptoms
- **Heart-focused**: Only addresses cardiovascular health
- **No emergency response**: Cannot replace emergency services
- **Language support**: Currently English only

### When to Seek Immediate Medical Attention
Users should be advised to call emergency services (911/999) if experiencing:
- Severe chest pain or pressure
- Difficulty breathing
- Loss of consciousness
- Severe dizziness or confusion
- Symptoms of heart attack or stroke

## Future Enhancements

Potential improvements for the chatbot:
1. **Multi-language support**: Arabic, Spanish, French, etc.
2. **Voice input**: Speech-to-text integration
3. **Conversational memory**: Multi-turn conversations
4. **Integration with ML models**: Use trained models for risk prediction
5. **Integration with patient data**: Access to medical history
6. **Follow-up recommendations**: Track symptoms over time
7. **Emergency alerts**: Automatic alerts for high-risk cases
8. **Doctor matching**: Recommend specialists based on symptoms

## Technical Stack

- **Framework**: FastAPI
- **Language**: Python 3.8+
- **NLP**: Regex-based pattern matching
- **Architecture**: Pipeline with guardrails
- **API Style**: RESTful JSON

## Contributing

When adding new symptoms or risk factors:
1. Add to `risk_factors` dictionary in `chatbot_service.py`
2. Update documentation
3. Add test cases
4. Update risk calculation logic if needed

## Support

For questions or issues with the chatbot:
- Check the main README.md
- Review test examples
- Contact the development team
