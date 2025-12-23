# app/middleware/celery/tasks.py

from celery import shared_task
import os
from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
from chromadb import CloudClient

from app.data_access.redis_repo_sync import (
    update_status_sync,
    delete_ocr_cache_sync,
)

# ---------------------------------------------------------
# LOAD ENV
# ---------------------------------------------------------
load_dotenv()

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "docsense")

if not all([CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE]):
    raise ValueError("Chroma Cloud env vars missing!")

# ---------------------------------------------------------
# EMBEDDING MODEL (FREE, LOCAL)
# ---------------------------------------------------------
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# ---------------------------------------------------------
# ✅ CHROMA CLOUD CLIENT (ONLY CORRECT WAY)
# ---------------------------------------------------------
chroma_client = CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
)

collection = chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION_NAME,
    metadata={"project": "DocSense", "space": "cosine"},
)

# ---------------------------------------------------------
# 1️⃣ CLEAN TEXT
# ---------------------------------------------------------
@shared_task
def clean_text_task(file_id: str, raw_text: str):
    cleaned_text = " ".join(raw_text.split())

    return {
        "file_id": file_id,
        "cleaned_text": cleaned_text,
    }

# ---------------------------------------------------------
# 2️⃣ GENERATE EMBEDDINGS (FREE)
# ---------------------------------------------------------
@shared_task(bind=True)
def generate_embeddings_task(self, payload: dict):
    file_id = payload["file_id"]
    cleaned_text = payload["cleaned_text"]

    try:
        update_status_sync(
            file_id,
            "Embedding",
            "Generating local embeddings (SentenceTransformers)...",
        )

        embedding = embedding_model.encode(
            cleaned_text,
            normalize_embeddings=True,
        ).tolist()

        update_status_sync(
            file_id,
            "Embedding",
            "Embedding generated successfully",
            status="Completed",
        )

        return {
            "file_id": file_id,
            "cleaned_text": cleaned_text,
            "embedding": embedding,
        }

    except Exception as e:
        update_status_sync(
            file_id,
            "Embedding",
            f"Failed: {str(e)}",
            status="Error",
        )
        raise

# ---------------------------------------------------------
# 3️⃣ STORE IN CHROMA CLOUD
# ---------------------------------------------------------
@shared_task(bind=True)
def store_in_chroma_task(self, payload: dict):
    file_id = payload["file_id"]
    cleaned_text = payload["cleaned_text"]
    embedding = payload["embedding"]

    try:
        update_status_sync(
            file_id,
            "Vector Storage",
            "Storing document in Chroma Cloud...",
        )

        collection.add(
            ids=[file_id],
            documents=[cleaned_text],
            embeddings=[embedding],
            metadatas=[{"file_id": file_id}],
        )

        update_status_sync(
            file_id,
            "Vector Storage",
            "Stored successfully in Chroma Cloud",
            status="Completed",
        )

        return {"file_id": file_id}

    except Exception as e:
        update_status_sync(
            file_id,
            "Vector Storage",
            f"Failed: {str(e)}",
            status="Error",
        )
        raise

# ---------------------------------------------------------
# 4️⃣ CLEAN REDIS CACHE
# ---------------------------------------------------------
@shared_task
def delete_redis_cache_task(payload: dict):
    file_id = payload["file_id"]

    delete_ocr_cache_sync(file_id)

    update_status_sync(
        file_id,
        "Cleanup",
        "OCR cache removed from Redis",
        status="Completed",
    )

    return {
        "file_id": file_id,
        "status": "Cache Cleared",
    }
