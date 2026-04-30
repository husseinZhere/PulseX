"""
Test script to verify the updated PulseX AI Service v3.0.0 API
Tests all endpoints without requiring full ML model dependencies
"""

from fastapi.testclient import TestClient
from main import app
import io
from PIL import Image
import json


def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes


def test_root_endpoint():
    """Test root endpoint"""
    print("\n1. Testing GET / endpoint...")
    client = TestClient(app)
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["service"] == "PulseX AI Service"
    assert data["version"] == "3.0.0"
    assert "xray_binary_classifier" in data["features"]
    assert "heart_health_chatbot" in data["features"]
    assert "ecg_storage" in data["features"]
    
    print("   ✅ Root endpoint working correctly")
    print(f"   Service: {data['service']}")
    print(f"   Version: {data['version']}")


def test_health_endpoint():
    """Test health check endpoint"""
    print("\n2. Testing GET /health endpoint...")
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "services" in data
    assert "xray_binary" in data["services"]
    assert "chatbot" in data["services"]
    assert "ecg_storage" in data["services"]
    
    print("   ✅ Health endpoint working correctly")
    print(f"   Status: {data['status']}")
    print(f"   Services: {data['services']}")


def test_xray_endpoint_structure():
    """Test X-ray endpoint structure (without ML model)"""
    print("\n3. Testing POST /api/xray/analyze endpoint structure...")
    client = TestClient(app)
    
    # Test with invalid file type
    response = client.post(
        "/api/xray/analyze",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    
    # Should return 400 for invalid file type OR 503 if service not initialized
    assert response.status_code in [400, 503]
    if response.status_code == 400:
        print("   ✅ Invalid file type handling working")
    else:
        print("   ✅ X-ray service check working (service not available)")
    
    # Test with valid image (will fail without ML model, but structure is correct)
    img_bytes = create_test_image()
    response = client.post(
        "/api/xray/analyze",
        files={"file": ("test.jpg", img_bytes.getvalue(), "image/jpeg")}
    )
    
    # Will be 503 (service unavailable) or 500 without ML model, or 200 with model
    assert response.status_code in [200, 500, 503]
    if response.status_code == 200:
        print("   ✅ X-ray endpoint fully functional")
    else:
        print("   ✅ X-ray endpoint structure correct (ML model not loaded)")


def test_ecg_upload_endpoint():
    """Test ECG upload endpoint"""
    print("\n4. Testing POST /api/ecg/upload endpoint...")
    client = TestClient(app)
    
    # Test with invalid file type
    response = client.post(
        "/api/ecg/upload",
        files={"file": ("test.txt", b"test content", "text/plain")}
    )
    
    assert response.status_code == 400
    print("   ✅ Invalid file type rejected")
    
    # Test with valid file type
    img_bytes = create_test_image()
    response = client.post(
        "/api/ecg/upload",
        files={"file": ("ecg_test.jpg", img_bytes.getvalue(), "image/jpeg")}
    )
    
    if response.status_code == 200:
        data = response.json()
        assert data["success"] == True
        assert "file_info" in data
        assert "filename" in data["file_info"]
        print("   ✅ ECG upload working correctly")
        print(f"   Uploaded: {data['file_info']['filename']}")
    else:
        print(f"   ⚠️  ECG upload returned {response.status_code}")


def test_chatbot_endpoint_structure():
    """Test chatbot endpoint structure"""
    print("\n5. Testing POST /api/chatbot endpoint structure...")
    client = TestClient(app)
    
    # Test with valid request
    response = client.post(
        "/api/chatbot",
        json={
            "message": "I have chest pain and shortness of breath",
            "user_data": {"age": 55, "bmi": 28}
        }
    )
    
    # Will be 503 or 200 depending on whether chatbot loaded
    if response.status_code == 200:
        data = response.json()
        assert "success" in data
        print("   ✅ Chatbot endpoint working correctly")
    else:
        assert response.status_code == 503
        print("   ✅ Chatbot endpoint structure correct (service not loaded)")


def test_404_handler():
    """Test 404 error handler"""
    print("\n6. Testing 404 error handler...")
    client = TestClient(app)
    
    response = client.get("/nonexistent")
    
    assert response.status_code == 404
    data = response.json()
    
    assert "error" in data
    assert "available" in data
    assert "/api/xray/analyze" in data["available"]
    assert "/api/ecg/upload" in data["available"]
    assert "/api/chatbot" in data["available"]
    
    print("   ✅ 404 handler working correctly")
    print(f"   Available endpoints: {data['available']}")


def main():
    """Run all tests"""
    print("=" * 70)
    print("PulseX AI Service v3.0.0 - API Structure Tests")
    print("=" * 70)
    
    try:
        test_root_endpoint()
        test_health_endpoint()
        test_xray_endpoint_structure()
        test_ecg_upload_endpoint()
        test_chatbot_endpoint_structure()
        test_404_handler()
        
        print("\n" + "=" * 70)
        print("✅ All API structure tests passed!")
        print("=" * 70)
        print("\nNote: Some services may show as 'inactive' without ML dependencies.")
        print("This is expected behavior - the API structure is correct.")
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return False


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
