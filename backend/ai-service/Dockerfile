FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only PyTorch first (avoids downloading the huge CUDA build)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies (torch/torchvision already satisfied above)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads models test_images

EXPOSE 7860

# HF Spaces uses 7860; Render injects $PORT at runtime
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}
