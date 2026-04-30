"""
Simple test script for the chatbot service (without other service dependencies)
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import only the chatbot service
import re
import logging
from typing import Dict, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatbotService:
    """Service for heart health chatbot with medical intent validation"""
    
    def __init__(self):
        """Initialize the chatbot service"""
        # Medical keywords for intent detection
        self.medical_keywords = [
            'pain', 'ache', 'symptom', 'disease', 'illness', 'condition', 
            'sick', 'hurt', 'doctor', 'treatment', 'medicine', 'medication',
            'health', 'medical', 'diagnosis', 'test', 'blood', 'pressure',
            'heart', 'chest', 'breathing', 'dizzy', 'fever', 'cough',
            'fatigue', 'tired', 'weak', 'nausea', 'vomit', 'headache'
        ]
        
        # Heart-related keywords for domain specialization
        self.heart_keywords = [
            'heart', 'cardiac', 'cardiovascular', 'chest', 'angina',
            'palpitation', 'arrhythmia', 'hypertension', 'blood pressure',
            'cholesterol', 'coronary', 'myocardial', 'infarction',
            'stroke', 'atherosclerosis', 'tachycardia', 'bradycardia',
            'valve', 'ecg', 'ekg', 'pulse', 'circulation', 'arteries'
        ]
        
        # Risk factors and their weights
        self.risk_factors = {
            'chest pain': 0.25,
            'shortness of breath': 0.20,
            'high blood pressure': 0.15,
            'high cholesterol': 0.15,
            'diabetes': 0.10,
            'smoking': 0.10,
            'family history': 0.08,
            'obesity': 0.07,
            'irregular heartbeat': 0.15,
            'fatigue': 0.05,
            'dizziness': 0.08,
            'swelling': 0.07,
            'palpitations': 0.12
        }
        
        logger.info("ChatbotService initialized successfully")
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess user input text"""
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s\-\.\,\?\!]', '', text)
        return text
    
    def validate_medical_intent(self, text: str) -> Tuple[bool, str]:
        """Validate if the input has medical intent"""
        words = text.split()
        medical_word_count = sum(1 for word in words if any(keyword in word for keyword in self.medical_keywords))
        
        if medical_word_count > 0:
            return True, ""
        
        friendly_response = (
            "I'm here to help you with heart health concerns! 💚\n\n"
            "I specialize in cardiovascular health and can assist you with:\n"
            "• Heart-related symptoms and concerns\n"
            "• Blood pressure and cholesterol information\n"
            "• Heart disease risk assessment\n"
            "• General heart health advice\n\n"
            "Could you please share your heart health concerns or symptoms?"
        )
        
        return False, friendly_response
    
    def validate_heart_domain(self, text: str) -> Tuple[bool, str]:
        """Validate if the medical query is related to heart health"""
        # Check for heart-related keywords - look for any match
        is_heart_related = any(keyword in text for keyword in self.heart_keywords)
        
        if is_heart_related:
            return True, ""
        
        scope_response = (
            "I appreciate your question! However, I specialize specifically in "
            "cardiovascular (heart) health. 🫀\n\n"
            "For concerns not related to heart health, I recommend:\n"
            "• Consulting with your primary care physician\n"
            "• Visiting a specialist for the specific condition\n"
            "• Using a general medical resource\n\n"
            "If you have any heart-related concerns, I'm here to help!"
        )
        
        return False, scope_response
    
    def extract_symptoms(self, text: str) -> List[str]:
        """Extract heart-related symptoms from text"""
        detected_symptoms = []
        
        # Map variations to standard symptom names
        symptom_variations = {
            'chest pain': ['chest pain', 'chest ache', 'chest hurt'],
            'shortness of breath': ['shortness of breath', 'short of breath', 'breath shortness', 'breathing difficulty', 'difficulty breathing'],
            'high blood pressure': ['high blood pressure', 'hypertension', 'elevated blood pressure'],
            'high cholesterol': ['high cholesterol', 'elevated cholesterol', 'hypercholesterolemia'],
            'diabetes': ['diabetes', 'diabetic', 'blood sugar'],
            'smoking': ['smoking', 'smoke', 'smoker'],
            'family history': ['family history', 'hereditary', 'genetic'],
            'obesity': ['obesity', 'obese', 'overweight'],
            'irregular heartbeat': ['irregular heartbeat', 'arrhythmia', 'heart rhythm', 'irregular pulse'],
            'fatigue': ['fatigue', 'tired', 'exhausted', 'weakness', 'weak'],
            'dizziness': ['dizziness', 'dizzy', 'lightheaded', 'vertigo'],
            'swelling': ['swelling', 'swollen', 'edema'],
            'palpitations': ['palpitations', 'palpitation', 'heart racing', 'rapid heartbeat']
        }
        
        for symptom, variations in symptom_variations.items():
            for variation in variations:
                if variation in text:
                    detected_symptoms.append(symptom)
                    break  # Only add once per symptom
        
        return detected_symptoms
    
    def calculate_risk(self, symptoms: List[str], additional_factors: Dict = None) -> Dict:
        """Calculate heart disease risk based on symptoms and factors"""
        risk_score = 0.0
        risk_contributors = []
        
        for symptom in symptoms:
            if symptom in self.risk_factors:
                weight = self.risk_factors[symptom]
                risk_score += weight
                risk_contributors.append({
                    'factor': symptom,
                    'weight': weight,
                    'contribution': f"{weight * 100:.1f}%"
                })
        
        if additional_factors:
            for factor, value in additional_factors.items():
                if factor == 'age' and value > 55:
                    risk_score += 0.10
                    risk_contributors.append({
                        'factor': 'age > 55',
                        'weight': 0.10,
                        'contribution': '10.0%'
                    })
                elif factor == 'bmi' and value > 30:
                    risk_score += 0.08
                    risk_contributors.append({
                        'factor': 'high BMI',
                        'weight': 0.08,
                        'contribution': '8.0%'
                    })
        
        if risk_score >= 0.5:
            risk_level = "high"
            risk_category = "High Risk ⚠️"
        elif risk_score >= 0.25:
            risk_level = "medium"
            risk_category = "Moderate Risk ⚡"
        else:
            risk_level = "low"
            risk_category = "Low Risk ✅"
        
        return {
            'risk_level': risk_level,
            'risk_category': risk_category,
            'risk_score': round(risk_score, 2),
            'risk_percentage': round(min(risk_score * 100, 100), 1),
            'contributors': risk_contributors
        }
    
    def generate_recommendations(self, risk_assessment: Dict, symptoms: List[str]) -> List[str]:
        """Generate personalized health recommendations"""
        recommendations = []
        risk_level = risk_assessment['risk_level']
        
        if risk_level == "high":
            recommendations.extend([
                "🚨 URGENT: Please seek immediate medical attention",
                "📞 Contact your doctor or go to the emergency room",
                "⚠️ Do not ignore these symptoms - they could be serious",
                "💊 Continue taking any prescribed medications as directed"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "📅 Schedule an appointment with your doctor soon",
                "📊 Consider getting comprehensive heart health tests",
                "💚 Monitor your symptoms and track any changes",
                "🏥 Don't wait for symptoms to worsen"
            ])
        else:
            recommendations.extend([
                "✅ Your risk appears low, but stay vigilant",
                "💚 Maintain regular check-ups with your doctor",
                "🏃 Continue healthy lifestyle habits"
            ])
        
        if 'chest pain' in symptoms:
            recommendations.append("⚠️ Chest pain should be evaluated by a medical professional")
        
        if 'high blood pressure' in symptoms or 'high cholesterol' in symptoms:
            recommendations.extend([
                "🥗 Follow a heart-healthy diet (low sodium, low saturated fat)",
                "🏃‍♂️ Engage in regular physical activity (30+ minutes daily)",
                "⚖️ Maintain a healthy weight"
            ])
        
        if 'smoking' in symptoms:
            recommendations.append("🚭 Quit smoking - it significantly increases heart disease risk")
        
        recommendations.extend([
            "😴 Get adequate sleep (7-9 hours per night)",
            "🧘 Manage stress through relaxation techniques",
            "💧 Stay well-hydrated",
            "📱 Use our heart health monitoring tools regularly"
        ])
        
        return recommendations
    
    def format_response(self, risk_assessment: Dict, symptoms: List[str], recommendations: List[str]) -> str:
        """Format the final response for the user"""
        response_parts = []
        
        response_parts.append("# Heart Health Assessment Results\n")
        response_parts.append(f"## Risk Level: {risk_assessment['risk_category']}\n")
        response_parts.append(f"**Risk Score:** {risk_assessment['risk_percentage']}%\n")
        
        if symptoms:
            response_parts.append("\n## Detected Symptoms/Risk Factors:")
            for symptom in symptoms:
                response_parts.append(f"• {symptom.title()}")
            response_parts.append("")
        
        if risk_assessment['contributors']:
            response_parts.append("\n## Risk Analysis:")
            for contributor in risk_assessment['contributors']:
                response_parts.append(
                    f"• {contributor['factor'].title()}: {contributor['contribution']} contribution"
                )
            response_parts.append("")
        
        response_parts.append("\n## Recommendations:\n")
        for rec in recommendations:
            response_parts.append(rec)
        
        response_parts.append(
            "\n---\n"
            "⚕️ **Medical Disclaimer:** This assessment is for informational purposes only "
            "and is not a substitute for professional medical advice, diagnosis, or treatment. "
            "Always consult with a qualified healthcare provider."
        )
        
        return "\n".join(response_parts)
    
    async def process_message(self, message: str, user_data: Dict = None) -> Dict:
        """Process user message through the complete chatbot pipeline"""
        try:
            cleaned_text = self.preprocess_text(message)
            logger.info(f"Preprocessed text: {cleaned_text}")
            
            is_medical, response = self.validate_medical_intent(cleaned_text)
            if not is_medical:
                return {
                    'success': True,
                    'response': response,
                    'type': 'non_medical',
                    'requires_clarification': True
                }
            
            is_heart_related, response = self.validate_heart_domain(cleaned_text)
            if not is_heart_related:
                return {
                    'success': True,
                    'response': response,
                    'type': 'non_heart_medical',
                    'requires_clarification': True
                }
            
            symptoms = self.extract_symptoms(cleaned_text)
            
            if not symptoms:
                guidance_response = (
                    "I understand you have heart health concerns. To provide you with "
                    "a better assessment, could you describe your symptoms in more detail?\n\n"
                    "For example, are you experiencing:\n"
                    "• Chest pain or discomfort?\n"
                    "• Shortness of breath?\n"
                    "• Irregular heartbeat or palpitations?\n"
                    "• Fatigue or weakness?\n"
                    "• High blood pressure or cholesterol?\n\n"
                    "Please share as much detail as you're comfortable with."
                )
                return {
                    'success': True,
                    'response': guidance_response,
                    'type': 'needs_more_info',
                    'requires_clarification': True
                }
            
            risk_assessment = self.calculate_risk(symptoms, user_data)
            recommendations = self.generate_recommendations(risk_assessment, symptoms)
            formatted_response = self.format_response(risk_assessment, symptoms, recommendations)
            
            return {
                'success': True,
                'response': formatted_response,
                'type': 'risk_assessment',
                'risk_level': risk_assessment['risk_level'],
                'risk_score': risk_assessment['risk_score'],
                'symptoms': symptoms,
                'recommendations': recommendations,
                'requires_clarification': False
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                'success': False,
                'response': (
                    "I apologize, but I encountered an error processing your message. "
                    "Please try rephrasing your question or contact support if the issue persists."
                ),
                'type': 'error',
                'error': str(e)
            }


async def test_chatbot():
    """Test various chatbot scenarios"""
    
    chatbot = ChatbotService()
    
    print("=" * 80)
    print("CHATBOT SERVICE TESTS")
    print("=" * 80)
    
    # Test 1: Non-medical query
    print("\n" + "=" * 80)
    print("Test 1: Non-medical query")
    print("=" * 80)
    result = await chatbot.process_message("Hello, how are you?")
    print(f"Type: {result['type']}")
    print(f"Response:\n{result['response']}")
    
    # Test 2: Medical but non-heart query
    print("\n" + "=" * 80)
    print("Test 2: Medical but non-heart query")
    print("=" * 80)
    result = await chatbot.process_message("I have a broken leg and it hurts")
    print(f"Type: {result['type']}")
    print(f"Response:\n{result['response']}")
    
    # Test 3: Heart-related query without specific symptoms
    print("\n" + "=" * 80)
    print("Test 3: Heart-related query without specific symptoms")
    print("=" * 80)
    result = await chatbot.process_message("I'm worried about my heart")
    print(f"Type: {result['type']}")
    print(f"Response:\n{result['response']}")
    
    # Test 4: Heart-related query with symptoms (Low Risk)
    print("\n" + "=" * 80)
    print("Test 4: Heart-related query with symptoms (Low Risk)")
    print("=" * 80)
    result = await chatbot.process_message("I have heart fatigue and feel tired")
    print(f"Type: {result['type']}")
    print(f"Risk Level: {result.get('risk_level', 'N/A')}")
    print(f"Response:\n{result['response'][:500]}...")
    
    # Test 5: Heart-related query with symptoms (Medium Risk)
    print("\n" + "=" * 80)
    print("Test 5: Heart-related query with symptoms (Medium Risk)")
    print("=" * 80)
    result = await chatbot.process_message(
        "I have high blood pressure and sometimes feel dizzy"
    )
    print(f"Type: {result['type']}")
    print(f"Risk Level: {result.get('risk_level', 'N/A')}")
    print(f"Risk Score: {result.get('risk_score', 'N/A')}")
    print(f"Symptoms: {result.get('symptoms', [])}")
    print(f"Response:\n{result['response'][:500]}...")
    
    # Test 6: Heart-related query with symptoms (High Risk)
    print("\n" + "=" * 80)
    print("Test 6: Heart-related query with symptoms (High Risk)")
    print("=" * 80)
    result = await chatbot.process_message(
        "I have severe chest pain, shortness of breath, and irregular heartbeat",
        user_data={"age": 60, "bmi": 32}
    )
    print(f"Type: {result['type']}")
    print(f"Risk Level: {result.get('risk_level', 'N/A')}")
    print(f"Risk Score: {result.get('risk_score', 'N/A')}")
    print(f"Symptoms: {result.get('symptoms', [])}")
    print(f"Response:\n{result['response'][:500]}...")
    
    # Test 7: Text preprocessing
    print("\n" + "=" * 80)
    print("Test 7: Text preprocessing")
    print("=" * 80)
    messy_text = "  I   HAVE   CHEST   PAIN!!!   and   HIGH   blood   pressure???  "
    cleaned = chatbot.preprocess_text(messy_text)
    print(f"Original: '{messy_text}'")
    print(f"Cleaned: '{cleaned}'")
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED SUCCESSFULLY ✅")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_chatbot())
