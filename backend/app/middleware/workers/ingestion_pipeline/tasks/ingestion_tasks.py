import os
import redis
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from chromadb.types import Metadata

from app.middleware.workers.ingestion_pipeline.celery_app import celery_app

# ✅ Import your centralized Cloud DB connection
from app.database.chromadb.chromaconnection import save_document_embeddings

# -----------------------------------------------------
# External Services Initialization
# -----------------------------------------------------

REDIS_URL = os.getenv("REDIS_URL")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)

# Load embedding model once per worker
print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded")


# -----------------------------------------------------
# Utility: Text Chunking
# -----------------------------------------------------

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:

    chunks: List[str] = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


# -----------------------------------------------------
# Celery Tasks
# -----------------------------------------------------

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def clean_text_task(self, file_id: str, raw_ocr_text: str):

    cleaned = " ".join(raw_ocr_text.split())

    return {
        "file_id": file_id,
        "clean_text": cleaned
    }


@celery_app.task(bind=True)
def chunk_document_task(self, payload: Dict):

    text = payload["clean_text"]
    chunks = chunk_text(text)
    payload["chunks"] = chunks

    return payload


@celery_app.task(bind=True)
def generate_embeddings_task(self, payload: Dict):

    chunks = payload["chunks"]

    embeddings = embedding_model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=False
    ).tolist()

    payload["embeddings"] = embeddings

    return payload


@celery_app.task(bind=True)
def store_in_chroma_task(self, payload: Dict):

    file_id = payload["file_id"]
    chunks = payload["chunks"]
    embeddings = payload["embeddings"]

    ids = [f"{file_id}_{i}" for i in range(len(chunks))]

    metadatas: List[Metadata] = [
        {
            "file_id": file_id,
            "chunk_index": i
        }
        for i in range(len(chunks))
    ]

    # ✅ Route the data to your centralized Cloud connection!
    save_document_embeddings(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    return payload


@celery_app.task(bind=True)
def delete_redis_cache_task(self, payload: Dict):

    file_id = payload["file_id"]
    redis_client.delete(f"data:{file_id}")

    return {
        "status": "completed",
        "file_id": file_id
    }