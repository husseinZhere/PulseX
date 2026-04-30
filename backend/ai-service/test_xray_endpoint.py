#!/usr/bin/env python3
"""
Test the X-ray analysis endpoint
"""

import requests
from PIL import Image
import numpy as np
import io

# Create a simple test X-ray image (grayscale gradient)
width, height = 224, 224
test_image = np.random.randint(0, 256, (height, width), dtype=np.uint8)
img = Image.fromarray(test_image, 'L').convert('RGB')

# Save to bytes
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr.seek(0)

# Test the endpoint
url = "http://localhost:8000/api/xray/analyze"

try:
    print("Testing X-ray analysis endpoint...")
    response = requests.post(
        url,
        files={'file': ('test_xray.jpg', img_byte_arr, 'image/jpeg')}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"\nResponse:")
    print(response.json())
    
    if response.status_code == 200:
        print("\n✅ X-ray service is working!")
    else:
        print(f"\n❌ Error: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")
