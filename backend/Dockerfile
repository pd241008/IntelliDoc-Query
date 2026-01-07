FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV TORCH_DEVICE=cpu
ENV CUDA_VISIBLE_DEVICES=""
ENV TRANSFORMERS_NO_CUDA=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    torch==2.2.2+cpu \
    torchvision==0.17.2+cpu \
    torchaudio==2.2.2+cpu \
    --index-url https://download.pytorch.org/whl/cpu

COPY backend/requirements.api.txt requirements.api.txt
COPY backend/requirements.rag.txt requirements.rag.txt
COPY backend/requirements.worker.txt requirements.worker.txt

RUN pip install --no-cache-dir -r requirements.api.txt \
    && pip install --no-cache-dir -r requirements.rag.txt \
    && pip install --no-cache-dir -r requirements.worker.txt

COPY . .

ENV PYTHONPATH=/app/backend

EXPOSE 7860

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
