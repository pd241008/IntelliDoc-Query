import os
import redis
import time
import json
import logging
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from chromadb.types import Metadata

from app.middleware.workers.ingestion_pipeline.celery_app import celery_app
from app.database.chromadb.chromaconnection import save_document_embeddings

# -----------------------------------------------------
# Logging
# -----------------------------------------------------

logger = logging.getLogger(__name__)

# -----------------------------------------------------
# External Services Initialization
# -----------------------------------------------------

REDIS_URL = os.getenv("REDIS_URL")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True
)

# Load embedding model once per worker
logger.info("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("Embedding model loaded")

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
# Celery Tasks (Claim Check Pattern)
# -----------------------------------------------------

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def clean_text_task(self, file_id: str, raw_ocr_text: str) -> str:
    logger.info(f"[{file_id}] Cleaning OCR text")
    cleaned = " ".join(raw_ocr_text.split())
    
    # Use 'pipeline:' prefix to avoid WRONGTYPE collisions with other services
    redis_client.hset(f"pipeline:{file_id}", "clean_text", cleaned)
    
    return file_id


@celery_app.task(bind=True)
def chunk_document_task(self, file_id: str) -> str:
    logger.info(f"[{file_id}] Chunking document")
    
    text = redis_client.hget(f"pipeline:{file_id}", "clean_text")
    
    if not isinstance(text, str):
        raise ValueError(f"Clean text not found or invalid type in Redis for {file_id}")

    chunks = chunk_text(text)
    
    redis_client.hset(f"pipeline:{file_id}", "chunks", json.dumps(chunks))
    
    logger.info(f"[{file_id}] Generated {len(chunks)} chunks")
    
    return file_id


@celery_app.task(bind=True)
def generate_embeddings_task(self, file_id: str) -> str:
    logger.info(f"[{file_id}] Generating embeddings")
    start = time.time()
    
    chunks_json = redis_client.hget(f"pipeline:{file_id}", "chunks")
    
    if not isinstance(chunks_json, str):
        raise ValueError(f"Chunks not found or invalid type in Redis for {file_id}")
        
    chunks = json.loads(chunks_json)

    embeddings = embedding_model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=False
    ).tolist()

    latency = time.time() - start
    logger.info(
        f"[{file_id}] Embeddings generated | chunks={len(embeddings)} | dim={len(embeddings[0])} | latency={latency:.2f}s"
    )

    redis_client.hset(f"pipeline:{file_id}", "embeddings", json.dumps(embeddings))

    return file_id


@celery_app.task(bind=True)
def store_in_chroma_task(self, file_id: str) -> str:
    logger.info(f"[{file_id}] Storing embeddings in ChromaDB")
    
    chunks_json = redis_client.hget(f"pipeline:{file_id}", "chunks")
    embeddings_json = redis_client.hget(f"pipeline:{file_id}", "embeddings")
    
    if not isinstance(chunks_json, str) or not isinstance(embeddings_json, str):
        raise ValueError(f"Missing or invalid chunks/embeddings in Redis for {file_id}")
        
    chunks = json.loads(chunks_json)
    embeddings = json.loads(embeddings_json)

    ids = [f"{file_id}_{i}" for i in range(len(chunks))]

    metadatas: List[Metadata] = [
        {
            "file_id": file_id,
            "chunk_index": i
        }
        for i in range(len(chunks))
    ]

    save_document_embeddings(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )

    logger.info(f"[{file_id}] Saved {len(chunks)} chunks to ChromaDB")

    return file_id


@celery_app.task(bind=True)
def delete_redis_cache_task(self, file_id: str) -> Dict:
    logger.info(f"[{file_id}] Cleaning Redis OCR and Pipeline caches")

    # Clean up BOTH the OCR service key and our new pipeline hash
    redis_client.delete(f"data:{file_id}")
    redis_client.delete(f"pipeline:{file_id}")

    logger.info(f"[{file_id}] Ingestion pipeline completed")

    return {
        "status": "completed",
        "file_id": file_id
    }