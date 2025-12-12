# app/middleware/celery/tasks.py

from celery import shared_task
import requests
import os
from dotenv import load_dotenv
import asyncio 
# NOTE: We need to run the imported async function synchronously
from app.data_access.redis_repo import update_status, delete_ocr_cache # <--- MODIFIED: Imported new function

load_dotenv()

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
    return cleaned


# ---------------------------------------------------------
# 2️⃣ GENERATE EMBEDDINGS USING GEMINI
# ---------------------------------------------------------
@shared_task
def generate_embeddings_task(file_id: str, cleaned_text: str):
    # FIX: Run async update_status synchronously
    asyncio.run(update_status(file_id, "Embedding", "Generating Gemini embeddings..."))

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-005:embedText?key={GEMINI_API_KEY}"

        payload = {
            "text": cleaned_text
        }

        response = requests.post(url, json=payload)
        data = response.json()

        if "embedding" not in data:
            raise Exception(f"Gemini error: {data}")

        embedding = data["embedding"]["value"]

        return {
            "file_id": file_id,
            "cleaned_text": cleaned_text,
            "embedding": embedding
        }

    except Exception as e:
        # FIX: Run async update_status synchronously
        asyncio.run(update_status(file_id, "Embedding", f"Failed: {e}", status="Error"))
        raise


# ---------------------------------------------------------
# 3️⃣ STORE IN CHROMA CLOUD
# ---------------------------------------------------------
@shared_task
def store_in_chroma_task(payload: dict):
    file_id = payload["file_id"]
    cleaned_text = payload["cleaned_text"]
    embedding = payload["embedding"]

    # FIX: Run async update_status synchronously
    asyncio.run(update_status(file_id, "Vector Storage", "Uploading to Chroma Cloud..."))

    try:
        url = f"https://api.trychroma.com/v1/collections/{CHROMA_COLLECTION_ID}/upsert"

        headers = {
            "Authorization": f"Bearer {CHROMA_API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "ids": [file_id],
            "embeddings": [embedding],
            "documents": [cleaned_text],
            "metadatas": [{"file_id": file_id}]
        }

        resp = requests.post(url, headers=headers, json=data)

        if resp.status_code >= 300:
            raise Exception(f"Chroma API error: {resp.text}")

        # FIX: Run async update_status synchronously
        asyncio.run(update_status(file_id, "Vector Storage", "Completed", status="Completed"))

        return {"file_id": file_id, "success": True} # <--- MODIFIED: Return file_id for next task

    except Exception as e:
        # FIX: Run async update_status synchronously
        asyncio.run(update_status(file_id, "Vector Storage", f"Failed: {e}", status="Error"))
        raise


# ---------------------------------------------------------
# 4️⃣ EMPTY REDIS CACHE
# ---------------------------------------------------------
@shared_task
def delete_redis_cache_task(payload: dict): # <--- NEW TASK
    file_id = payload["file_id"]
    
    # Run the async delete_ocr_cache synchronously
    asyncio.run(delete_ocr_cache(file_id))
    
    # FIX: Run async update_status synchronously
    asyncio.run(update_status(
        file_id, 
        "Cleanup", 
        "Raw OCR text deleted from Redis cache.", 
        status="Completed"
    ))
    
    return {"status": "Cache Cleared", "file_id": file_id}