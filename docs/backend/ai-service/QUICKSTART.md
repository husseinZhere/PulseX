# Quick Start Guide - PulseX AI Service

## 🚀 Quick Setup (5 minutes)

### Step 1: Navigate to AI Service Directory
```bash
cd ai-service
```

### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- PyTorch (deep learning)
- EasyOCR (text extraction)
- And other dependencies

**Note**: First installation may take 5-10 minutes as it downloads pre-trained models.

### Step 4: Run the Server
```bash
python main.py
```

The server will start at: http://localhost:8000

### Step 5: Test the API
Open your browser and visit:
- **API Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **Health Check**: http://localhost:8000/health

## 📝 Testing the Endpoints

### Using the Swagger UI (Easiest Method)

1. Go to http://localhost:8000/docs
2. Click on any endpoint (e.g., `/api/xray/analyze`)
3. Click "Try it out"
4. Upload a test image
5. Click "Execute"
6. See the results!

### Using cURL (Command Line)

**Health Check:**
```bash
curl http://localhost:8000/health
```

**X-ray Analysis:**
```bash
curl -X POST "http://localhost:8000/api/xray/analyze" \
  -F "file=@test_images/your_xray.jpg"
```

**Lab Test Analysis:**
```bash
curl -X POST "http://localhost:8000/api/lab-test/analyze" \
  -F "file=@test_images/your_lab_test.jpg"
```

## 🔗 Integration with .NET Backend

### Example .NET Code

```csharp
using System.Net.Http;

var client = new HttpClient();
var content = new MultipartFormDataContent();

// Add file
var fileContent = new ByteArrayContent(fileBytes);
content.Add(fileContent, "file", "test.jpg");

// Call API
var response = await client.PostAsync(
    "http://localhost:8000/api/xray/analyze", 
    content
);

var result = await response.Content.ReadAsStringAsync();
```

## 📊 Expected API Response Examples

### X-ray Analysis Response:
```json
{
  "filename": "chest_xray.jpg",
  "prediction": "normal",
  "confidence": 0.8523,
  "risk_level": "low",
  "recommendations": [
    "✅ Chest X-ray appears normal",
    "💚 Continue maintaining healthy lifestyle habits"
  ]
}
```

### Lab Test Analysis Response:
```json
{
  "filename": "lab_test.jpg",
  "parsed_values": {
    "total_cholesterol": 185,
    "blood_pressure": {"systolic": 120, "diastolic": 80}
  },
  "risk_level": "low",
  "recommendations": [
    "✅ Lab values are within normal ranges"
  ]
}
```

## 🐳 Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Edit `.env` to configure:
- Server port
- File size limits
- GPU usage
- CORS origins

## 🛠️ Troubleshooting

### "Module not found" error
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### EasyOCR downloading models
- First run downloads ~100MB of language models
- This is normal and only happens once
- Requires internet connection

### Out of memory errors
- Models use CPU by default (safer but slower)
- If you have a GPU, edit the service files to enable it
- Reduce image sizes if needed

## 📚 Next Steps

1. ✅ Place test images in `test_images/` directory
2. ✅ Test all endpoints using Swagger UI
3. ✅ Integrate with your .NET backend
4. ✅ Deploy to production (see README.md)

## 🆘 Need Help?

- Check full documentation: `README.md`
- Test your setup: `python test_setup.py`
- View API docs: http://localhost:8000/docs

---

**You're all set! 🎉**

The AI service is now ready to analyze X-rays and lab tests for the PulseX platform.
