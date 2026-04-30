# PulseX AI Service

AI service for medical image analysis and lab test OCR in the PulseX healthcare platform.

## Overview

This service provides AI-powered cardiac analysis for:
- **Cardiac X-ray Analysis**: ResNet50 multi-label classifier — detects Cardiomegaly, Pleural Effusion, Pulmonary Edema, Atelectasis, Consolidation
- **CHD Risk Recommendation**: Random Forest + SMOTE — 10-year Coronary Heart Disease risk using 29 Framingham-engineered features
- **Heart Health Chatbot**: TF-IDF NLP pipeline with negation-aware symptom extraction, risk scoring, and optional Gemini AI
- **ECG Upload**: Secure ECG image upload with unique file tracking

## Features

✅ **X-ray Analysis**
- Chest X-ray image classification (Normal/Abnormal)
- Confidence score for predictions
- Risk level assessment
- Personalized recommendations

✅ **Lab Test Analysis**
- OCR text extraction from lab test images
- Automatic parsing of medical values (cholesterol, blood pressure, blood sugar, etc.)
- Risk factor identification
- Health metric analysis with normal range comparison

✅ **Combined Analysis**
- Comprehensive health assessment combining X-ray and lab tests
- Unified risk level calculation
- Smart recommendations based on multiple data sources

✅ **Heart Health Chatbot**
- Natural language processing for symptom analysis
- Medical intent validation with guardrails
- Heart-health domain specialization
- Real-time risk assessment based on symptoms
- Personalized health recommendations
- Multi-level risk categorization (Low, Medium, High)

## Project Structure

```
ai-service/
├── main.py                      # FastAPI server (port 8001)
├── config.py                    # Environment config (Pydantic Settings)
├── services/
│   ├── xray_service.py          # Cardiac X-ray multi-label classifier (ResNet50)
│   ├── recommendation_service.py # CHD risk prediction (Random Forest + SMOTE)
│   └── chatbot_service.py       # Heart health chatbot (TF-IDF NLP + Gemini)
├── models/                      # Trained model weights + metadata
│   ├── xray_binary_model.pth    # Binary fallback (93.3% acc, pneumonia domain)
│   ├── binary_metadata.json
│   ├── cardiac_xray_model.pth   # Cardiac multi-label (train with NIH dataset)
│   ├── cardiac_xray_metadata.json
│   ├── recommendation_model.pkl # CHD risk RF model
│   └── recommendation_metadata.json
├── data/
│   └── framingham_heart_study.csv  # Framingham dataset (download separately)
├── tests/
│   ├── conftest.py              # Shared pytest fixtures
│   ├── test_api.py              # FastAPI endpoint integration tests (32 tests)
│   ├── test_chatbot.py          # Chatbot NLP unit tests (49 tests)
│   ├── test_recommendation.py   # Recommendation model tests (27 tests)
│   └── test_xray.py             # X-ray service tests (24 tests)
├── train_cardiac_xray.py        # NIH ChestX-ray14 training script
├── train_recommendation.py      # Framingham CHD model training script
├── setup_models.py              # Dev model setup / dummy model creation
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
└── Dockerfile                   # Container configuration
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Virtual environment (recommended)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd /path/to/PulseX
   cd ai-service
   ```

2. **Create and activate virtual environment**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate (Linux/Mac)
   source venv/bin/activate

   # Activate (Windows)
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   Note: The first run will download pre-trained models:
   - DenseNet121 (~30MB)
   - EasyOCR language models (~100MB)

## Usage

### Starting the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### API Endpoints

#### 1. Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "xray": "active",
    "ocr": "active"
  }
}
```

#### 2. Analyze X-ray
```bash
POST /api/xray/analyze
Content-Type: multipart/form-data
```

Parameters:
- `file`: X-ray image file (JPEG, PNG)

Response:
```json
{
  "filename": "chest_xray.jpg",
  "prediction": "normal",
  "confidence": 0.8523,
  "probabilities": {
    "normal": 0.8523,
    "abnormal": 0.1477
  },
  "risk_level": "low",
  "recommendations": [
    "✅ Chest X-ray appears normal",
    "💚 Continue maintaining healthy lifestyle habits",
    ...
  ]
}
```

#### 3. Analyze Lab Test
```bash
POST /api/lab-test/analyze
Content-Type: multipart/form-data
```

Parameters:
- `file`: Lab test image file (JPEG, PNG, PDF)

Response:
```json
{
  "filename": "lab_test.jpg",
  "extracted_text": "Total Cholesterol: 185 mg/dL\nLDL: 95 mg/dL\n...",
  "parsed_values": {
    "total_cholesterol": 185,
    "ldl": 95,
    "hdl": 55,
    "blood_pressure": {
      "systolic": 118,
      "diastolic": 75
    }
  },
  "analysis": {
    "normal": ["Total Cholesterol: 185 mg/dL (Normal)", ...],
    "abnormal": [],
    "risk_factors": [],
    "risk_level": "low"
  },
  "recommendations": [...],
  "confidence": 0.9234
}
```

#### 4. Get Comprehensive Recommendations
```bash
POST /api/recommendations
Content-Type: multipart/form-data
```

Parameters:
- `xray_file`: (Optional) X-ray image
- `lab_test_file`: (Optional) Lab test image

Response:
```json
{
  "risk_level": "low",
  "recommendations": [...],
  "results": {
    "xray": {...},
    "lab_test": {...}
  },
  "summary": "Low risk detected. Continue maintaining healthy lifestyle habits..."
}
```

#### 5. Heart Health Chatbot
```bash
POST /api/chatbot
Content-Type: application/json
```

Parameters (JSON body):
```json
{
  "message": "I have chest pain and shortness of breath",
  "user_data": {
    "age": 55,
    "bmi": 28
  }
}
```

Response:
```json
{
  "success": true,
  "response": "# Heart Health Assessment Results\n\n## Risk Level: High Risk ⚠️\n...",
  "type": "risk_assessment",
  "risk_level": "high",
  "risk_score": 0.78,
  "symptoms": ["chest pain", "shortness of breath"],
  "recommendations": [
    "🚨 URGENT: Please seek immediate medical attention",
    "📞 Contact your doctor or go to the emergency room",
    ...
  ],
  "requires_clarification": false
}
```

**Chatbot Features:**
- **Medical Intent Validation**: Ensures queries are medically relevant
- **Domain Specialization**: Focuses specifically on heart health
- **Symptom Extraction**: Automatically identifies heart-related symptoms
- **Risk Assessment**: Calculates cardiovascular risk based on symptoms and user data
- **Smart Recommendations**: Provides personalized advice based on risk level

**Chatbot Response Types:**
- `non_medical`: User query is not medical-related
- `non_heart_medical`: Medical query but not heart-related
- `needs_more_info`: Heart-related but needs more symptom details
- `risk_assessment`: Full risk assessment with recommendations
- `error`: An error occurred during processing

### Testing with cURL

**X-ray Analysis:**
```bash
curl -X POST "http://localhost:8000/api/xray/analyze" \
  -H "accept: application/json" \
  -F "file=@test_images/chest_xray.jpg"
```

**Lab Test Analysis:**
```bash
curl -X POST "http://localhost:8000/api/lab-test/analyze" \
  -H "accept: application/json" \
  -F "file=@test_images/lab_test.jpg"
```

**Combined Analysis:**
```bash
curl -X POST "http://localhost:8000/api/recommendations" \
  -H "accept: application/json" \
  -F "xray_file=@test_images/chest_xray.jpg" \
  -F "lab_test_file=@test_images/lab_test.jpg"
```

**Heart Health Chatbot:**
```bash
curl -X POST "http://localhost:8000/api/chatbot" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have chest pain and high blood pressure",
    "user_data": {
      "age": 60,
      "bmi": 32
    }
  }'
```

### Interactive API Documentation

Once the server is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Integration with .NET Backend

### Connection Setup

The FastAPI service is designed to integrate seamlessly with the .NET backend:

1. **CORS Configuration**: Already configured to accept requests from any origin (configure specific origins in production)

2. **REST API**: Standard REST endpoints compatible with .NET HttpClient

3. **JSON Responses**: All responses are in JSON format

### .NET Integration Example

```csharp
using System.Net.Http;
using System.Net.Http.Headers;

public class AIServiceClient
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "http://localhost:8000";

    public AIServiceClient()
    {
        _httpClient = new HttpClient { BaseAddress = new Uri(BaseUrl) };
    }

    public async Task<XRayAnalysisResult> AnalyzeXRayAsync(byte[] imageBytes, string fileName)
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/jpeg");
        content.Add(fileContent, "file", fileName);

        var response = await _httpClient.PostAsync("/api/xray/analyze", content);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsAsync<XRayAnalysisResult>();
    }

    public async Task<LabTestAnalysisResult> AnalyzeLabTestAsync(byte[] imageBytes, string fileName)
    {
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(imageBytes);
        content.Add(fileContent, "file", fileName);

        var response = await _httpClient.PostAsync("/api/lab-test/analyze", content);
        response.EnsureSuccessStatusCode();
        
        return await response.Content.ReadAsAsync<LabTestAnalysisResult>();
    }
}
```

## Datasets

### Required Datasets

#### 1. NIH ChestX-ray14 — Cardiac X-ray Model

| Property | Details |
|---|---|
| Images | 112,120 frontal-view chest X-rays |
| Labels | 14 disease labels (we use 5 cardiac-relevant ones) |
| Size | ~42 GB |
| License | NIH Public |

**Download links:**

- **Kaggle (recommended):** https://www.kaggle.com/datasets/nih-chest-xrays/data
- **Official NIH Box:** https://nihcc.app.box.com/v/ChestXray-NIHCC

```bash
# Option A — Kaggle CLI
pip install kaggle
kaggle datasets download -d nih-chest-xrays/data
unzip data.zip -d /data/nih_chest_xray/

# Option B — set custom path
export NIH_XRAY_PATH=/your/path
python3 train_cardiac_xray.py
```

Expected structure:
```
/data/nih_chest_xray/
├── Data_Entry_2017.csv
└── images/
    ├── 00000001_000.png
    └── ...  (112,120 images)
```

#### 2. Framingham Heart Study — Recommendation Model

| Property | Details |
|---|---|
| Patients | 4,240 |
| Features | 15 clinical features |
| Target | 10-year CHD risk (binary) |
| License | Public research |

**Download link:**

- **Kaggle:** https://www.kaggle.com/datasets/amanajmera1/framingham-heart-study-dataset

```bash
kaggle datasets download -d amanajmera1/framingham-heart-study-dataset
cp framingham.csv PulseX/backend/ai-service/data/framingham_heart_study.csv
python3 train_recommendation.py
```

---

## Model Information

### ResNet50 — Cardiac X-ray Classifier (Primary)
- **Architecture**: ResNet50 pre-trained on ImageNet, frozen layers 1–2, fine-tuned from layer 3
- **Task**: Multi-label cardiac finding detection (5 classes)
- **Labels**: Cardiomegaly, Effusion, Edema, Atelectasis, Consolidation
- **Input Size**: 224×224 RGB
- **Loss**: FocalLoss (γ=2.0, α_t=0.75 for positives / 0.25 for negatives)
- **Threshold**: Per-class Youden's J optimised (not flat 0.5)
- **Expected AUC**: 0.78–0.88 per class on NIH ChestX-ray14

### ResNet50 — Binary X-ray Classifier (Fallback)
- **Architecture**: ResNet50 with enhanced classification head
- **Task**: Normal vs Abnormal (binary)
- **Accuracy**: 93.3% on Kaggle Chest X-ray Pneumonia dataset
- **Note**: Domain mismatch — trained on pneumonia data, not cardiac. Used as fallback only until cardiac model is trained.

### Random Forest + SMOTE — CHD Recommendation Model
- **Architecture**: Random Forest (500 trees) with SMOTE oversampling
- **Task**: 10-year Coronary Heart Disease risk prediction
- **Features**: 15 Framingham inputs → 29 engineered features
- **Threshold**: Youden's J optimised for maximum sensitivity + specificity balance
- **Expected AUC**: 0.72–0.78 | **Target Sensitivity**: ≥ 70%

---

## AI System Updates (April 2026)

> This section documents all changes made to the AI service during the cardiac domain upgrade.

### What Was Wrong (Before)

| Component | Issue |
|---|---|
| X-Ray Labels | `Infiltration` label — non-specific, deprecated in NIH v2, no primary cardiac aetiology |
| X-Ray Training | `FocalLoss` applied alpha uniformly to all examples — not class-aware |
| X-Ray Inference | Flat 0.5 threshold for all classes — ignores prevalence differences (Cardiomegaly 2.5% vs Consolidation 10%) |
| X-Ray Recommendations | Binary fallback contained pneumonia-specific text ("lung consolidation infectious/inflammatory") |
| Recommendation Model | Sensitivity only **10.85%** — missed 89% of true CHD-risk patients |
| Recommendation Features | Missing cardiac-specific features: heart rate risk, arterial stiffness, sex-age interaction |
| Training Script | Success target was `accuracy ≥ 95%` — meaningless on an 85%-negative imbalanced dataset |
| Risk Levels | `elevated` risk band (0.20–0.50) had no recommendation message |

### What Was Fixed

#### X-Ray Service (`services/xray_service.py`)

**CARDIAC_LABELS updated:**
```python
# Before (wrong)
CARDIAC_LABELS = ['Cardiomegaly', 'Effusion', 'Edema', 'Infiltration', 'Consolidation']

# After (correct)
CARDIAC_LABELS = ['Cardiomegaly', 'Effusion', 'Edema', 'Atelectasis', 'Consolidation']
```
`Infiltration` → `Atelectasis`: Atelectasis is clinically relevant in cardiac patients (basilar collapse from CHF, post-cardiac-surgery atelectasis).

**Per-class threshold optimisation:**
```python
# Before: flat 0.5 for every class
if prob >= 0.50:
    positive_labels.append(label)

# After: Youden's J threshold per class, loaded from metadata
threshold = self.per_class_thresholds.get(label, 0.5)
if prob >= threshold:
    positive_labels.append(label)
```

**Binary fallback recommendations:** all pneumonia/non-cardiac language removed. Output now contains only cardiac-domain text (Cardiomegaly, Pleural effusion, Pulmonary congestion, Mediastinal widening, Atelectasis).

#### X-Ray Training (`train_cardiac_xray.py`)

**FocalLoss corrected** (Lin et al. 2017 formulation):
```python
# Before (wrong — uniform alpha, not class-aware)
focal = self.alpha * (1 - pt) ** self.gamma * bce

# After (correct — alpha_t differentiates positives from negatives)
alpha_t = torch.where(targets == 1,
                      torch.full_like(targets, self.alpha),      # 0.75 for rare positives
                      torch.full_like(targets, 1.0 - self.alpha)) # 0.25 for abundant negatives
focal = alpha_t * (1 - pt) ** self.gamma * bce
```

**Per-class Youden's J threshold computation** added after training:
```python
def find_per_class_thresholds(probs, labels):
    # For each class: search threshold that maximises sensitivity + specificity - 1
    # Saves to metadata as per_class_thresholds dict
```

#### Recommendation Service (`services/recommendation_service.py`)

**3 new cardiac-specific engineered features (26 → 29 total):**

| Feature | Formula | Clinical Rationale |
|---|---|---|
| `hr_risk` | heartRate < 60 OR > 100 | Bradycardia/tachycardia both increase cardiac event risk |
| `isolated_systolic_htn` | sysBP ≥ 140 AND diaBP < 90 | Arterial stiffness marker, independent CHD predictor |
| `age_male_interaction` | age × male / 100 | Men < 55 have sharply higher CHD risk |

**`elevated` risk recommendation added:**
```python
if risk_level == 'elevated':
    recommendations.append({
        'category': 'medical',
        'priority': 'moderate',
        'message': "Your CHD risk score is in the elevated range. Schedule a cardiovascular "
                   "risk assessment within the next month..."
    })
```

#### Recommendation Training (`train_recommendation.py`)

**Success criteria fixed:**
```python
# Before (wrong — accuracy is misleading on 85%-negative data)
if best_scores['accuracy_optimal'] >= 0.95:
    print("[SUCCESS]")

# After (correct — medical screening requires sensitivity)
if sens >= 0.70 and auc >= 0.75:
    print("[SUCCESS] Clinical targets met")
elif sens >= 0.50:
    print("[WARNING] Acceptable but below 70% clinical target")
else:
    print("[FAIL] Clinically unsafe — do not deploy")
```

### Datasets Used

| Model | Dataset | Link |
|---|---|---|
| Cardiac X-ray (train when available) | NIH ChestX-ray14 | https://www.kaggle.com/datasets/nih-chest-xrays/data |
| CHD Recommendation (train when available) | Framingham Heart Study | https://www.kaggle.com/datasets/amanajmera1/framingham-heart-study-dataset |
| Binary X-ray (existing, fallback only) | Kaggle Chest X-ray Pneumonia | https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia |

### Test Results (April 2026)

```
131 passed, 1 skipped, 0 failed  (6.2s)

test_api.py          32 tests  ✅ all passed
test_chatbot.py      49 tests  ✅ all passed
test_recommendation  27 tests  ✅ 26 passed, 1 skipped*
test_xray.py         24 tests  ✅ all passed

* skipped: test_low_risk_patient_lower_score
  Reason: dummy model gives random predictions — will auto-enable when real model is trained
```

### Quick Start (Train Real Models)

```bash
cd PulseX/backend/ai-service

# 1. Download datasets (see links above)

# 2. Train the cardiac X-ray model (~25 epochs, GPU recommended)
export NIH_XRAY_PATH=/data/nih_chest_xray
python3 train_cardiac_xray.py

# 3. Train the CHD recommendation model (~5 min, CPU ok)
python3 train_recommendation.py

# 4. Run tests to verify
python3 -m pytest tests/ -v

# 5. Start the server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
# Swagger UI: http://localhost:8001/docs
```

---

## Performance

- **X-ray Analysis**: ~1–2 seconds per image (CPU) / ~0.2s (GPU)
- **CHD Recommendation**: ~50ms per patient (CPU)
- **Chatbot**: ~100ms (template) / ~1–2s (with Gemini API)

GPU acceleration strongly recommended for X-ray inference in production.

## Development

### Running Tests

```bash
cd PulseX/backend/ai-service

# Run all tests
python3 -m pytest tests/ -v

# Run specific module
python3 -m pytest tests/test_xray.py -v
python3 -m pytest tests/test_recommendation.py -v
python3 -m pytest tests/test_chatbot.py -v
python3 -m pytest tests/test_api.py -v

# Create dev dummy models (no real dataset needed)
python3 setup_models.py --create-binary   # dummy X-ray model
python3 setup_models.py --create-rec      # dummy recommendation model
```

### Adding New Features

1. Create new service files in `services/` directory
2. Import and initialize in `main.py`
3. Add new endpoints in `main.py`
4. Update `requirements.txt` if needed

## Production Deployment

### Recommendations

1. **Use GPU**: Enable GPU support for faster inference
   ```python
   # In xray_service.py and ocr_service.py
   self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
   self.reader = easyocr.Reader(['en'], gpu=True)  # Enable GPU for OCR
   ```

2. **Configure CORS**: Set specific allowed origins
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],
       ...
   )
   ```

3. **Use Environment Variables**: Store configuration in `.env` file
   ```bash
   PORT=8000
   HOST=0.0.0.0
   MAX_FILE_SIZE=10485760  # 10MB
   ```

4. **Add Authentication**: Implement API key or JWT authentication

5. **Add Rate Limiting**: Prevent abuse

6. **Use Production Server**: Deploy with Gunicorn + Uvicorn workers
   ```bash
   gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt` again

2. **CUDA errors**
   - If no GPU available, models will automatically use CPU
   - Check CUDA installation if GPU is available but not detected

3. **EasyOCR download issues**
   - First run downloads language models
   - Ensure stable internet connection
   - Models cached in `~/.EasyOCR/`

4. **Memory errors**
   - Reduce batch size or image resolution
   - Use GPU if available
   - Increase system RAM

## License

This service is part of the PulseX project.

## Support

For issues or questions, please contact the development team.
