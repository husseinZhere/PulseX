"""
Shared pytest fixtures for the PulseX AI Service test suite.
"""

import asyncio
import io
import sys
from pathlib import Path

import pytest
from PIL import Image

# Make the ai-service root importable from the tests/ subdirectory
sys.path.insert(0, str(Path(__file__).parent.parent))


# ── Sample data fixtures ──────────────────────────────────────────────────────

@pytest.fixture
def sample_framingham_patient():
    """A realistic Framingham patient record (moderate-risk profile)."""
    return {
        'male':           1,
        'age':            55,
        'education':      2,
        'currentSmoker':  1,
        'cigsPerDay':     10.0,
        'BPMeds':         0,
        'prevalentStroke': 0,
        'prevalentHyp':   1,
        'diabetes':       0,
        'totChol':        240.0,
        'sysBP':          145.0,
        'diaBP':          90.0,
        'BMI':            27.5,
        'heartRate':      75.0,
        'glucose':        95.0,
    }

@pytest.fixture
def low_risk_patient():
    """A low-risk Framingham patient."""
    return {
        'male':           0,
        'age':            35,
        'education':      4,
        'currentSmoker':  0,
        'cigsPerDay':     0.0,
        'BPMeds':         0,
        'prevalentStroke': 0,
        'prevalentHyp':   0,
        'diabetes':       0,
        'totChol':        180.0,
        'sysBP':          115.0,
        'diaBP':          75.0,
        'BMI':            22.0,
        'heartRate':      65.0,
        'glucose':        85.0,
    }

@pytest.fixture
def high_risk_patient():
    """A high-risk Framingham patient."""
    return {
        'male':            1,
        'age':             68,
        'education':       1,
        'currentSmoker':   1,
        'cigsPerDay':      20.0,
        'BPMeds':          1,
        'prevalentStroke': 1,
        'prevalentHyp':    1,
        'diabetes':        1,
        'totChol':         290.0,
        'sysBP':           170.0,
        'diaBP':           100.0,
        'BMI':             33.0,
        'heartRate':       88.0,
        'glucose':         140.0,
    }

@pytest.fixture
def dummy_xray_bytes():
    """Create a minimal valid PNG image in memory for X-ray endpoint tests."""
    img = Image.new('RGB', (224, 224), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

@pytest.fixture
def chatbot_service():
    """Instantiate a ChatbotService for unit tests (no model files required)."""
    from services.chatbot_service import ChatbotService
    return ChatbotService()

@pytest.fixture
def event_loop():
    """Provide an asyncio event loop for async test functions."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()
