FROM python:3.11-slim

# ---------- ENV ----------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Force CPU-only torch
ENV TORCH_DEVICE=cpu
ENV CUDA_VISIBLE_DEVICES=""
ENV TRANSFORMERS_NO_CUDA=1

WORKDIR /app

# ---------- SYSTEM DEPS ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# ---------- INSTALL CPU TORCH FIRST ----------
RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# ---------- COPY REQUIREMENTS ----------
COPY backend/requirements.api.txt requirements.api.txt
COPY backend/requirements.rag.txt requirements.rag.txt
COPY backend/requirements.worker.txt requirements.worker.txt

# ---------- INSTALL ALL DEPENDENCIES ----------
RUN pip install --no-cache-dir -r requirements.api.txt \
    && pip install --no-cache-dir -r requirements.rag.txt \
    && pip install --no-cache-dir -r requirements.worker.txt

# ---------- COPY APP ----------
COPY . .

# ---------- COPY ENV ----------
COPY .env . 

# ---------- RUN ----------
# Change this:
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Set the environment variable so imports like 'from app.api...' work
ENV PYTHONPATH=/app/backend

# Ensure your CMD points to the correct main file

# To this:
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

