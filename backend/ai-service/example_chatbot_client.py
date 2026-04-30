"""
Example client for testing the PulseX Heart Health Chatbot
This script demonstrates how to interact with the chatbot API
"""

import requests
import json

# API endpoint
BASE_URL = "http://localhost:8000"
CHATBOT_ENDPOINT = f"{BASE_URL}/api/chatbot"


def test_chatbot(message: str, user_data: dict = None):
    """
    Test the chatbot with a message
    
    Args:
        message: User message/query
        user_data: Optional user health data (age, bmi)
    """
    payload = {
        "message": message,
        "user_data": user_data
    }
    
    print("\n" + "=" * 80)
    print(f"MESSAGE: {message}")
    if user_data:
        print(f"USER DATA: {user_data}")
    print("=" * 80)
    
    try:
        response = requests.post(CHATBOT_ENDPOINT, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        print(f"\nType: {result.get('type')}")
        if 'risk_level' in result:
            print(f"Risk Level: {result['risk_level']}")
            print(f"Risk Score: {result['risk_score']}")
            print(f"Symptoms: {result.get('symptoms', [])}")
        
        print(f"\nResponse:\n{result['response']}")
        
        return result
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server. Make sure the server is running at", BASE_URL)
        return None
    except requests.exceptions.HTTPError as e:
        print(f"\n❌ HTTP ERROR: {e}")
        return None
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return None


def main():
    """Run chatbot tests"""
    
    print("=" * 80)
    print("PULSEX HEART HEALTH CHATBOT - TEST CLIENT")
    print("=" * 80)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        health = response.json()
        print("\n✅ Server is running!")
        print(f"Status: {health['status']}")
        print(f"Services: {health['services']}")
    except:
        print("\n❌ Server is not running. Please start the server with:")
        print("   cd ai-service && python main.py")
        return
    
    # Test 2: Non-medical query
    test_chatbot("Hello, how are you?")
    
    # Test 3: Medical but non-heart query
    test_chatbot("I have a broken leg")
    
    # Test 4: Heart-related without symptoms
    test_chatbot("I'm worried about my heart health")
    
    # Test 5: Low risk
    test_chatbot("I have some heart fatigue")
    
    # Test 6: Medium risk
    test_chatbot("I have high blood pressure and feel dizzy sometimes")
    
    # Test 7: High risk
    test_chatbot(
        "I'm experiencing severe chest pain, shortness of breath, and irregular heartbeat",
        user_data={"age": 65, "bmi": 32}
    )
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED")
    print("=" * 80)


if __name__ == "__main__":
    main()
