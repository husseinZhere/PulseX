"""
Test script for the chatbot service
"""

import asyncio
from services.chatbot_service import ChatbotService


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
    result = await chatbot.process_message("I sometimes feel fatigued")
    print(f"Type: {result['type']}")
    print(f"Risk Level: {result.get('risk_level', 'N/A')}")
    print(f"Response:\n{result['response']}")
    
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
    print(f"Response:\n{result['response']}")
    
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
    print(f"Risk Percentage: {result.get('risk_percentage', 'N/A')}")
    print(f"Symptoms: {result.get('symptoms', [])}")
    print(f"Response:\n{result['response']}")
    
    # Test 7: Text preprocessing
    print("\n" + "=" * 80)
    print("Test 7: Text preprocessing")
    print("=" * 80)
    messy_text = "  I   HAVE   CHEST   PAIN!!!   and   HIGH   blood   pressure???  "
    cleaned = chatbot.preprocess_text(messy_text)
    print(f"Original: '{messy_text}'")
    print(f"Cleaned: '{cleaned}'")
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_chatbot())
