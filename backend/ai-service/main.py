"""
PulseX AI Service - FastAPI Application
========================================
Main entry point for the PulseX AI Service providing:
- Cardiac X-Ray analysis (DenseNet121 cardiomegaly binary / ResNet50 NIH multi-label)
- CT analysis placeholder (returns honest "not available" response)
- Heart health chatbot
- Smart health recommendations (Framingham-based CHD risk prediction)
- ECG file storage

Swagger UI: http://localhost:8001/docs
ReDoc:      http://localhost:8001/redoc
OpenAPI:    http://localhost:8001/openapi.json
"""

import logging
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app with OpenAPI tags configuration
# ---------------------------------------------------------------------------

app = FastAPI(
    title="PulseX AI Service",
    description=(
        "## PulseX Cardiac AI Service\n\n"
        "AI-powered cardiac health analysis. Endpoints:\n\n"
        "- **Cardiac Imaging** — Chest X-ray analysis (cardiomegaly detection, "
        "DenseNet121 trained on NIH ChestX-ray14 subset). Risk levels: `Low | Medium | High | Critical`.\n"
        "- **Heart Risk** — Framingham-based 10-year coronary heart disease risk prediction.\n"
        "- **Chatbot** — Heart-health Q&A with medical intent validation.\n"
        "- **ECG** — Secure ECG file upload and storage.\n"
        "- **System** — Health check and service info.\n\n"
        "### Quick test (Swagger)\n"
        "Use `/api/xray/analyze` → **Try it out** → upload a PNG chest X-ray → **Execute**.\n\n"
        "### Model currently active\n"
        "DenseNet121 cardiomegaly binary classifier (NIH subset, AUC 0.86, threshold 0.6031).\n"
        "Detects cardiomegaly from chest X-rays. Multi-label NIH model loads automatically "
        "if `cardiac_xray_model.pth` is present."
    ),
    version="4.0.0",
    openapi_tags=[
        {
            "name": "Cardiac Imaging",
            "description": (
                "Chest X-ray and CT cardiac analysis. "
                "Upload a frontal-view PA/AP chest X-ray PNG or JPEG. "
                "Returns prediction, confidence, risk level, and clinical recommendation."
            ),
        },
        {
            "name": "Heart Risk",
            "description": "Framingham-based 10-year coronary heart disease risk prediction.",
        },
        {
            "name": "Chatbot",
            "description": "Heart-health conversational AI with medical intent validation.",
        },
        {
            "name": "ECG",
            "description": "Electrocardiogram file upload and secure storage.",
        },
        {
            "name": "System",
            "description": "Service health check and operational status.",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
ECG_DIR    = UPLOAD_DIR / "ecg"
XRAY_TEMP  = UPLOAD_DIR / "xray_temp"
CT_TEMP    = UPLOAD_DIR / "ct_temp"

for folder in [ECG_DIR, XRAY_TEMP, CT_TEMP]:
    folder.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Allowed image extensions (content_type can be application/octet-stream
# when uploaded via Swagger or some browsers)
# ---------------------------------------------------------------------------
_ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif'}

def _is_image_upload(file: UploadFile) -> bool:
    ct = (file.content_type or '').lower()
    if ct.startswith('image/'):
        return True
    if ct == 'application/octet-stream':
        # Fall back to extension check
        ext = Path(file.filename or '').suffix.lower()
        return ext in _ALLOWED_IMAGE_EXTENSIONS
    return False


# ============================================================================
# Pydantic Models
# ============================================================================

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    user_data: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    type: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    session_id: str


class FraminghamRequest(BaseModel):
    male: int = Field(..., ge=0, le=1)
    age: int = Field(..., ge=20, le=100)
    education: int = Field(..., ge=1, le=4)
    currentSmoker: int = Field(..., ge=0, le=1)
    cigsPerDay: float = Field(..., ge=0)
    BPMeds: int = Field(..., ge=0, le=1)
    prevalentStroke: int = Field(..., ge=0, le=1)
    prevalentHyp: int = Field(..., ge=0, le=1)
    diabetes: int = Field(..., ge=0, le=1)
    totChol: float = Field(..., ge=100, le=600)
    sysBP: float = Field(..., ge=80, le=300)
    diaBP: float = Field(..., ge=40, le=200)
    BMI: float = Field(..., ge=10, le=60)
    heartRate: float = Field(..., ge=30, le=200)
    glucose: float = Field(..., ge=30, le=500)


class RecommendationResponse(BaseModel):
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str


# ---------------------------------------------------------------------------
# Imaging response — explicit fields shown in Swagger schema
# ---------------------------------------------------------------------------

class XRayResult(BaseModel):
    """
    Full result object returned inside ImagingResponse.result for X-ray analysis.
    All fields are present for both cardiac_binary and cardiac (multi-label) modes.
    """
    imageType: str = Field(
        ...,
        description="Always `xray` for X-ray analysis.",
        examples=["xray"],
    )
    prediction: str = Field(
        ...,
        description="Human-readable finding summary.",
        examples=["Cardiomegaly Detected", "No Cardiomegaly Detected"],
    )
    confidence: float = Field(
        ...,
        ge=0.0, le=100.0,
        description=(
            "Model confidence in the stated prediction (0–100 %). "
            "For positive predictions this is the cardiomegaly probability. "
            "For negative predictions this is the 'no cardiomegaly' probability (1 − raw prob)."
        ),
        examples=[81.8, 88.1],
    )
    riskLevel: str = Field(
        ...,
        description="Clinical risk level. One of: `Low | Medium | High | Critical`.",
        examples=["High", "Low", "Medium"],
    )
    recommendation: str = Field(
        ...,
        description="Single-paragraph medical recommendation based on findings and risk level.",
    )
    modelVersion: str = Field(
        ...,
        description="Identifier of the model that produced this result.",
        examples=[
            "DenseNet121-NIH-CardiomegalyBinaryV1",
            "ResNet50-NIH-CardiacV1-MultiLabel",
        ],
    )
    limitations: str = Field(
        ...,
        description="Model scope and disclaimer. Must be shown to the end user.",
    )
    positive_findings: List[str] = Field(
        default_factory=list,
        description=(
            "List of detected findings. `['Cardiomegaly']` for binary mode; "
            "up to 5 labels in multi-label mode."
        ),
        examples=[["Cardiomegaly"], []],
    )
    finding_probabilities: Dict[str, float] = Field(
        default_factory=dict,
        description="Per-finding probability (0–100 %). Single key in binary mode.",
        examples=[{"Cardiomegaly": 81.8}],
    )
    mode: str = Field(
        ...,
        description=(
            "Active inference mode. "
            "`cardiac_binary` — DenseNet121 cardiomegaly binary; "
            "`cardiac_multilabel` — ResNet50 NIH multi-label; "
            "`binary` — pneumonia fallback (not cardiac); "
            "`ct_unavailable` — CT placeholder."
        ),
        examples=["cardiac_binary"],
    )
    model_accuracy: Optional[str] = Field(
        None,
        description="Human-readable accuracy/AUC string from training metadata.",
        examples=["AUC 0.8604 (test set)"],
    )
    success: bool = Field(True, description="True unless inference failed.")
    # Backward-compat aliases kept for .NET AiXRayResult and legacy frontend consumers
    diagnosis: Optional[str] = Field(None, description="Alias of `prediction` (backward compat).")
    confidence_level: Optional[str] = Field(
        None,
        description="Human-readable confidence tier: `High | Medium | Low` (backward compat).",
    )


class ImagingResponse(BaseModel):
    """
    Unified response envelope for X-ray and CT analysis endpoints.

    On success: `success=true`, `result` contains an `XRayResult` object.
    On failure: `success=false`, `error` contains a descriptive message.
    """
    success: bool
    result: Optional[XRayResult] = None
    error: Optional[str] = None


class ECGUploadResponse(BaseModel):
    success: bool
    file_id: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


# ============================================================================
# Service Initialization (lazy — first request triggers load)
# ============================================================================

_chatbot_service        = None
_recommendation_service = None
_xray_service           = None


def get_chatbot_service():
    global _chatbot_service
    if _chatbot_service is None:
        from services.chatbot_service import ChatbotService
        _chatbot_service = ChatbotService()
        logger.info("ChatbotService initialized")
    return _chatbot_service


def get_recommendation_service():
    global _recommendation_service
    if _recommendation_service is None:
        from services.recommendation_service import RecommendationService
        _recommendation_service = RecommendationService()
        logger.info("RecommendationService initialized")
    return _recommendation_service


def get_xray_service():
    global _xray_service
    if _xray_service is None:
        from services.xray_service import XRayService
        _xray_service = XRayService()
        logger.info("XRayService initialized — mode=%s", _xray_service.mode)
    return _xray_service


# ============================================================================
# System endpoints
# ============================================================================

@app.get(
    "/",
    tags=["System"],
    summary="Service info and model status",
    response_description="Service version, feature status, and model metadata.",
)
async def root():
    """
    Returns service version and current model status for each feature.

    Check the `xray_cardiac_classifier` field to see which model is currently loaded
    and its validation/test metrics.
    """
    svc = None
    try:
        svc = get_xray_service()
    except Exception:
        pass

    xray_status = "unavailable (model files missing — run train_cardiac_binary.py)"
    if svc is not None:
        if svc.mode == 'cardiac':
            meta_auc = svc.metadata.get('best_mean_auc')
            auc_str = f"{meta_auc * 100:.1f}% mean AUC" if meta_auc else "trained"
            xray_status = f"cardiac multi-label (NIH ChestX-ray14) — {auc_str}"
        elif svc.mode == 'cardiac_binary':
            meta_auc = svc.metadata.get('test_auc', svc.metadata.get('val_auc'))
            auc_str = f"AUC {meta_auc:.4f}" if meta_auc else "trained"
            xray_status = (
                f"cardiac binary (DenseNet121, cardiomegaly) — {auc_str} "
                f"| threshold={getattr(svc, 'binary_threshold', 0.5):.4f} "
                "| detects cardiomegaly only"
            )
        elif svc.mode == 'binary':
            meta_acc = svc.metadata.get('accuracy')
            acc_str = f"{meta_acc * 100:.1f}% val accuracy" if meta_acc else "trained"
            xray_status = (
                f"binary fallback (pneumonia domain) — {acc_str} — "
                "WARNING: not cardiac-specific, run train_cardiac_binary.py"
            )

    return {
        "service": "PulseX AI Service",
        "version": "4.0.0",
        "status":  "operational",
        "features": {
            "xray_cardiac_classifier": xray_status,
            "ct_analysis":             "not available — dedicated CT model required",
            "heart_health_chatbot":    "Medical intent validation + risk assessment",
            "smart_recommendation":    "Framingham ML-based 10-year CHD risk prediction",
            "ecg_storage":             "Secure file upload",
        },
        "swagger_ui": "http://localhost:8001/docs",
        "openapi":    "http://localhost:8001/openapi.json",
    }


@app.get(
    "/health",
    tags=["System"],
    summary="Liveness health check",
)
async def health_check():
    """Simple liveness probe — returns 200 OK when the service is running."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ============================================================================
# Cardiac Imaging endpoints
# ============================================================================

@app.get(
    "/api/xray/model-info",
    tags=["Cardiac Imaging"],
    summary="Active X-ray model metadata",
    response_description="Model name, metrics, classes, threshold, and training details.",
)
async def xray_model_info():
    """
    Returns detailed information about the currently loaded X-ray model.

    Useful before running inference to understand:
    - Which model is active (`mode`)
    - Training dataset and architecture
    - Test-set AUC, accuracy, sensitivity, specificity
    - Youden's-J decision threshold
    - Supported finding classes
    """
    try:
        svc = get_xray_service()
        meta = svc.metadata
        return {
            "success": True,
            "mode": svc.mode,
            "architecture": meta.get("architecture", "unknown"),
            "model_version": meta.get("model_version", "unknown"),
            "dataset": meta.get("dataset", "unknown"),
            "classes": meta.get("classes", {}),
            "threshold": getattr(svc, "binary_threshold", None),
            "epochs_trained": meta.get("epochs_trained"),
            "training_date": meta.get("training_date"),
            "val_auc": meta.get("val_auc"),
            "test_auc": meta.get("test_auc"),
            "val_metrics": meta.get("val_metrics", {}),
            "test_metrics": meta.get("test_metrics", {}),
            "limitations": meta.get("limitations", ""),
            "note": (
                "cardiac_binary mode: detects Cardiomegaly only. "
                "For 5-class multi-label (Cardiomegaly, Effusion, Edema, Atelectasis, Consolidation), "
                "run train_cardiac_xray.py with the full NIH ChestX-ray14 dataset."
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/xray/analyze",
    tags=["Cardiac Imaging"],
    summary="Cardiac chest X-ray analysis",
    response_model=ImagingResponse,
    response_description=(
        "Prediction, confidence (0–100 %), risk level (Low/Medium/High/Critical), "
        "clinical recommendation, and model metadata."
    ),
)
async def analyze_xray(
    file: UploadFile = File(
        ...,
        description=(
            "Frontal-view (PA or AP) chest X-ray image. "
            "Accepted formats: PNG, JPEG. "
            "Recommended: at least 128×128 px. "
            "The model was trained on 128×128 greyscale NIH images."
        ),
    ),
):
    """
    Analyse a chest X-ray for cardiac findings.

    ### What the model detects
    **Current mode — `cardiac_binary` (DenseNet121):**
    Detects the presence or absence of **cardiomegaly** (enlarged cardiac silhouette,
    cardiothoracic ratio > 0.5). This is the primary radiographic sign of structural
    cardiac disease including heart failure, cardiomyopathy, and valvular disease.

    **If `cardiac_xray_model.pth` is present (multi-label mode):**
    Also detects Pleural Effusion, Pulmonary Oedema, Atelectasis, and Consolidation.

    ### Risk level mapping
    | Risk | Meaning |
    |------|---------|
    | `Low` | No cardiomegaly, confident negative |
    | `Medium` | Borderline (near decision threshold) or low-confidence positive |
    | `High` | Cardiomegaly detected, confidence ≥ 70 % |
    | `Critical` | Acute pulmonary oedema (multi-label mode only) |

    ### Response fields
    All fields in `result` are documented in the `XRayResult` schema below.

    ### Test images (from NIH cardiomegaly dataset subset)
    See `/api/xray/test-images` for ready-to-use file paths.
    """
    if not _is_image_upload(file):
        return ImagingResponse(
            success=False,
            error=(
                f"Invalid file type '{file.content_type}'. "
                "Please upload a PNG or JPEG chest X-ray image."
            ),
        )

    try:
        service  = get_xray_service()
        contents = await file.read()

        import asyncio
        raw = await asyncio.to_thread(
            service.analyze_xray, contents, file.filename or "upload.png"
        )
        # Coerce raw dict → XRayResult so the response validates and Swagger shows
        # the real schema. Unknown extra keys are silently ignored by Pydantic.
        result = XRayResult(**raw)
        return ImagingResponse(success=raw.get('success', True), result=result)

    except Exception as e:
        logger.error("X-Ray analysis endpoint error: %s", e)
        return ImagingResponse(success=False, error=str(e))


@app.get(
    "/api/xray/test-images",
    tags=["Cardiac Imaging"],
    summary="Test image paths for manual Swagger testing",
    response_description=(
        "Absolute file paths of representative test images with expected predictions."
    ),
)
async def xray_test_images():
    """
    Returns absolute paths to representative chest X-ray images from the downloaded
    NIH cardiomegaly dataset subset.

    Use these in Swagger: **Try it out → Choose File → Navigate to path → Execute**.

    Images are split into three groups:
    - **Normal / Low risk** — confident negative, no cardiomegaly
    - **Cardiomegaly / High risk** — confident positive
    - **Borderline / Medium risk** — probability near the decision threshold (0.6031)
    """
    base = Path(__file__).parent / "data" / "cardiomegaly_raw" / "test" / "test"
    return {
        "model_threshold": 0.6031,
        "note": (
            "Probabilities and risk levels are from the trained model. "
            "'true_class' is the ground-truth label from the NIH dataset."
        ),
        "normal_low_risk": [
            {
                "path": str(base / "false" / "113.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "8.2%",
                "expected_risk": "Low",
                "true_class": "normal",
            },
            {
                "path": str(base / "false" / "124.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "11.2%",
                "expected_risk": "Low",
                "true_class": "normal",
            },
            {
                "path": str(base / "false" / "12.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "13.1%",
                "expected_risk": "Low",
                "true_class": "normal",
            },
        ],
        "cardiomegaly_high_risk": [
            {
                "path": str(base / "true" / "134.png"),
                "expected_prediction": "Cardiomegaly Detected",
                "model_cardiomegaly_prob": "75.7%",
                "expected_risk": "High",
                "true_class": "cardiomegaly",
            },
            {
                "path": str(base / "true" / "126.png"),
                "expected_prediction": "Cardiomegaly Detected",
                "model_cardiomegaly_prob": "74.6%",
                "expected_risk": "High",
                "true_class": "cardiomegaly",
            },
            {
                "path": str(base / "true" / "125.png"),
                "expected_prediction": "Cardiomegaly Detected",
                "model_cardiomegaly_prob": "74.2%",
                "expected_risk": "High",
                "true_class": "cardiomegaly",
            },
        ],
        "borderline_medium_risk": [
            {
                "path": str(base / "false" / "120.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "61.9%",
                "expected_risk": "Medium",
                "note": "Prob 61.9% — just below threshold 60.31%. Medium risk because prob ≥ 40%.",
                "true_class": "normal",
            },
            {
                "path": str(base / "true" / "122.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "62.7%",
                "expected_risk": "Medium",
                "note": "True cardiomegaly the model missed — borderline false negative.",
                "true_class": "cardiomegaly",
            },
            {
                "path": str(base / "true" / "109.png"),
                "expected_prediction": "No Cardiomegaly Detected",
                "model_cardiomegaly_prob": "57.7%",
                "expected_risk": "Medium",
                "note": "True cardiomegaly — model near-miss. Good for showing Medium risk.",
                "true_class": "cardiomegaly",
            },
        ],
        "dataset_location": str(
            Path(__file__).parent / "data" / "cardiomegaly_raw"
        ),
        "total_test_images": 1114,
    }


@app.post(
    "/api/ct/analyze",
    tags=["Cardiac Imaging"],
    summary="Cardiac CT analysis (not implemented — honest placeholder)",
    response_model=ImagingResponse,
)
async def analyze_ct(
    file: UploadFile = File(..., description="CT scan image (PNG or JPEG)."),
):
    """
    Cardiac CT analysis — **NOT currently implemented**.

    This endpoint always returns `success=false` with an honest explanation and
    a recommendation to consult a radiologist. CT analysis requires a dedicated model
    trained on annotated coronary CT angiography datasets.

    The endpoint exists to keep the API contract intact for the `.NET` proxy
    (`AiProxyController.AnalyzeCt`) and the React frontend `analyzeCt()` function.
    """
    if not _is_image_upload(file):
        return ImagingResponse(
            success=False,
            error=(
                f"Invalid file type '{file.content_type}'. "
                "Please upload a PNG or JPEG image."
            ),
        )

    try:
        service  = get_xray_service()
        contents = await file.read()

        import asyncio
        raw = await asyncio.to_thread(
            service.analyze_ct, contents, file.filename or "upload.png"
        )
        return ImagingResponse(success=False, result=XRayResult(**raw))

    except Exception as e:
        logger.error("CT analysis endpoint error: %s", e)
        return ImagingResponse(success=False, error=str(e))


# ============================================================================
# Chatbot endpoint
# ============================================================================

@app.post(
    "/api/chat",
    tags=["Chatbot"],
    summary="Heart-health chatbot",
    response_model=ChatResponse,
)
async def chat(message: ChatMessage):
    """
    Conversational heart-health AI.

    Validates that the message is health-related and provides medically grounded
    responses. Includes risk-level tagging when the message describes symptoms.
    """
    try:
        service  = get_chatbot_service()
        response = await service.process_message(
            message=message.message,
            user_data=message.user_data or {}
        )
        return ChatResponse(
            response=response.get('response', ''),
            type=response.get('type'),
            risk_level=response.get('risk_level'),
            risk_score=response.get('risk_score'),
            session_id=message.session_id or str(uuid.uuid4())
        )
    except Exception as e:
        logger.error("Chat error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Heart Risk / Recommendation endpoints
# ============================================================================

@app.post(
    "/api/recommendation",
    tags=["Heart Risk"],
    summary="Framingham 10-year CHD risk prediction",
    response_model=RecommendationResponse,
)
async def get_recommendation(request: FraminghamRequest):
    """
    Framingham-based 10-year coronary heart disease (CHD) risk prediction.

    Input: 15 Framingham Study risk factor features.

    Output: `risk_level` (Low / Moderate / High / Very High), `risk_score` (0–1),
    `confidence`, personalised `recommendations`, `alert_message`, and `risk_factors`.
    """
    try:
        service      = get_recommendation_service()
        patient_data = request.model_dump()
        result       = service.predict(patient_data)
        return RecommendationResponse(
            success=True,
            result=result,
            timestamp=datetime.now().isoformat()
        )
    except ValueError as e:
        return RecommendationResponse(
            success=False,
            error=str(e),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error("Recommendation error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/recommendation/model-info",
    tags=["Heart Risk"],
    summary="Recommendation model metadata",
)
async def get_recommendation_model_info():
    """Returns metadata for the Framingham recommendation model (scikit-learn)."""
    try:
        service = get_recommendation_service()
        return {
            "success": True,
            "model_info": service.get_model_info(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ECG endpoint
# ============================================================================

@app.post(
    "/api/ecg/upload",
    tags=["ECG"],
    summary="ECG file upload",
    response_model=ECGUploadResponse,
)
async def upload_ecg(
    file: UploadFile = File(..., description="ECG image or PDF (PNG, JPG, JPEG, PDF)."),
    patient_id: str = Form(default="unknown", description="Patient identifier for file naming."),
):
    """
    Secure ECG file upload and storage.

    Files are stored in `uploads/ecg/` with a UUID-prefixed filename.
    Returns a `file_id` that can be used to reference the uploaded file.
    """
    if not file.filename:
        return ECGUploadResponse(success=False, error="No filename provided")

    allowed_extensions = {'.png', '.jpg', '.jpeg', '.pdf'}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        return ECGUploadResponse(
            success=False,
            error=f"Extension '{file_ext}' not allowed. Use PNG, JPG, JPEG, or PDF."
        )

    file_id     = str(uuid.uuid4())
    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_name = f"ecg_{timestamp}_{file_id}{file_ext}"
    save_path   = ECG_DIR / unique_name

    try:
        with open(save_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
        return ECGUploadResponse(
            success=True,
            file_id=file_id,
            message="ECG file uploaded successfully"
        )
    except Exception as e:
        logger.error("ECG upload error: %s", e)
        return ECGUploadResponse(success=False, error=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
