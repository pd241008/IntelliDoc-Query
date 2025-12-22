# app/middleware/celery/tasks.py

from celery import shared_task
import requests
import os
from dotenv import load_dotenv

from app.data_access.redis_repo_sync import (
    update_status_sync,
    delete_ocr_cache_sync,
)

load_dotenv()

# ---------------------------------------------------------
# ENV
# ---------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_COLLECTION_ID = os.getenv("CHROMA_COLLECTION_ID")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing!")
if not CHROMA_API_KEY:
    raise ValueError("CHROMA_API_KEY missing!")
if not CHROMA_COLLECTION_ID:
    raise ValueError("CHROMA_COLLECTION_ID missing!")


# ---------------------------------------------------------
# 1️⃣ CLEAN TEXT
# ---------------------------------------------------------
@shared_task
def clean_text_task(file_id: str, raw_text: str):
    cleaned = " ".join(raw_text.split())
    return {
        "file_id": file_id,
        "cleaned_text": cleaned,
    }


# ---------------------------------------------------------
# 2️⃣ GENERATE EMBEDDINGS (GEMINI)
# ---------------------------------------------------------
@shared_task(bind=True)
def generate_embeddings_task(self, payload: dict):
    file_id = payload["file_id"]
    cleaned_text = payload["cleaned_text"]

    try:
        update_status_sync(
            file_id,
            "Embedding",
            "Generating Gemini embeddings..."
        )

        url = (
            "https://generativelanguage.googleapis.com/v1beta/"
            "models/embedding-001:embedContent"
            f"?key={GEMINI_API_KEY}"
        )

        data = {
            "content": {
                "parts": [
                    {"text": cleaned_text}
                ]
            }
        }

        response = requests.post(url, json=data, timeout=30)
        result = response.json()

        if "embedding" not in result:
            raise Exception(result)

        embedding = result["embedding"]["values"]

        update_status_sync(
            file_id,
            "Embedding",
            "Embedding generated successfully",
            status="Completed"
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
            status="Error"
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
            "Uploading to Chroma Cloud..."
        )

        url = f"https://api.trychroma.com/v1/collections/{CHROMA_COLLECTION_ID}/upsert"

        headers = {
            "Authorization": f"Bearer {CHROMA_API_KEY}",
            "Content-Type": "application/json",
        }

        body = {
            "ids": [file_id],
            "embeddings": [embedding],
            "documents": [cleaned_text],
            "metadatas": [{"file_id": file_id}],
        }

        resp = requests.post(url, headers=headers, json=body, timeout=30)

        if resp.status_code >= 300:
            raise Exception(resp.text)

        update_status_sync(
            file_id,
            "Vector Storage",
            "Stored in Chroma Cloud",
            status="Completed"
        )

        return {"file_id": file_id}

    except Exception as e:
        update_status_sync(
            file_id,
            "Vector Storage",
            f"Failed: {str(e)}",
            status="Error"
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
        "Raw OCR text deleted from Redis cache",
        status="Completed"
    )

    return {"file_id": file_id, "status": "Cache Cleared"}
