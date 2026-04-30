#!/usr/bin/env python3
"""
Test the trained X-ray model with real images
"""

import torch
from torchvision import transforms
from PIL import Image
import requests
from pathlib import Path
import json

# Test with sample images from dataset
test_dir = Path("/home/youssef/Downloads/chest_xray/chest_xray/test")

def test_model():
    """Test the trained model"""
    
    print("🧪 Testing Trained X-ray Model")
    print("="*60)
    
    # Check if model exists
    model_path = Path("models/xray_binary_model.pth")
    if not model_path.exists():
        print("❌ Model not found! Please wait for training to complete.")
        return
    
    # Test using the API
    api_url = "http://localhost:8000/api/xray/analyze"
    
    # Get some test images
    normal_images = list((test_dir / "NORMAL").glob("*.jpeg"))[:3]
    pneumonia_images = list((test_dir / "PNEUMONIA").glob("*.jpeg"))[:3]
    
    print(f"\n📁 Testing with {len(normal_images)} NORMAL and {len(pneumonia_images)} PNEUMONIA images\n")
    
    results = {
        "normal_correct": 0,
        "normal_total": 0,
        "pneumonia_correct": 0,
        "pneumonia_total": 0
    }
    
    # Test NORMAL images
    print("Testing NORMAL images:")
    print("-" * 60)
    for img_path in normal_images:
        with open(img_path, 'rb') as f:
            files = {'file': (img_path.name, f, 'image/jpeg')}
            try:
                response = requests.post(api_url, files=files, timeout=30)
                if response.status_code == 200:
                    result = response.json()['result']
                    diagnosis = result['diagnosis']
                    confidence = result['confidence']
                    
                    is_correct = diagnosis == "Normal"
                    status = "✅" if is_correct else "❌"
                    
                    print(f"{status} {img_path.name[:30]:30} → {diagnosis:8} ({confidence}%)")
                    
                    results["normal_total"] += 1
                    if is_correct:
                        results["normal_correct"] += 1
                else:
                    print(f"❌ Error: {response.status_code}")
            except Exception as e:
                print(f"❌ Error testing {img_path.name}: {e}")
    
    # Test PNEUMONIA images  
    print("\nTesting PNEUMONIA images:")
    print("-" * 60)
    for img_path in pneumonia_images:
        with open(img_path, 'rb') as f:
            files = {'file': (img_path.name, f, 'image/jpeg')}
            try:
                response = requests.post(api_url, files=files, timeout=30)
                if response.status_code == 200:
                    result = response.json()['result']
                    diagnosis = result['diagnosis']
                    confidence = result['confidence']
                    
                    is_correct = diagnosis == "Abnormal"
                    status = "✅" if is_correct else "❌"
                    
                    print(f"{status} {img_path.name[:30]:30} → {diagnosis:8} ({confidence}%)")
                    
                    results["pneumonia_total"] += 1
                    if is_correct:
                        results["pneumonia_correct"] += 1
                else:
                    print(f"❌ Error: {response.status_code}")
            except Exception as e:
                print(f"❌ Error testing {img_path.name}: {e}")
    
    # Print summary
    print("\n" + "="*60)
    print("📊 TEST RESULTS")
    print("="*60)
    
    if results["normal_total"] > 0:
        normal_acc = (results["normal_correct"] / results["normal_total"]) * 100
        print(f"NORMAL Images: {results['normal_correct']}/{results['normal_total']} correct ({normal_acc:.1f}%)")
    
    if results["pneumonia_total"] > 0:
        pneumonia_acc = (results["pneumonia_correct"] / results["pneumonia_total"]) * 100
        print(f"PNEUMONIA Images: {results['pneumonia_correct']}/{results['pneumonia_total']} correct ({pneumonia_acc:.1f}%)")
    
    total = results["normal_total"] + results["pneumonia_total"]
    correct = results["normal_correct"] + results["pneumonia_correct"]
    
    if total > 0:
        overall_acc = (correct / total) * 100
        print(f"\n🎯 Overall Accuracy: {correct}/{total} ({overall_acc:.1f}%)")
    
    print("="*60)


if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            test_model()
        else:
            print("❌ Server not responding correctly")
            print("   Start server: python3 -m uvicorn main:app --host 0.0.0.0 --port 8000")
    except:
        print("❌ Server not running!")
        print("   Start server: cd ai-service && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000")
