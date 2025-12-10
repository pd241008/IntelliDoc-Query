# vector/processing.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
import asyncio
import json
import os
from pathlib import Path
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["Process"])
TEMP_DIR = Path("temp")

REDIS_URL = os.getenv("REDIS_KEY")
redis_client: redis.Redis | None = None  # will hold the actual Redis instance


# -------------------------------
# Async Redis Getter (safe)
# -------------------------------
async def get_redis():
    global redis_client
    if redis_client is None:
        if not REDIS_URL:
            return None
        try:
            redis_client = redis.from_url(REDIS_URL, decode_responses=True)
            pong = await redis_client.ping() # type: ignore
            if pong:
                print("✔ Redis connected")
            else:
                print("❌ Redis ping failed")
                redis_client = None
        except Exception as e:
            print(f"❌ Redis connection error: {e}")
            redis_client = None
    return redis_client


# -------------------------------
# Update status in Redis
# -------------------------------
async def update_status(file_id: str, step: str, message: str, status: str = "Running"):
    print(f"[{file_id}] {step} → {message} ({status})")
    r = await get_redis()
    if r:
        status_key = f"status:{file_id}"
        data = json.dumps({
            "file_id": file_id,
            "step": step,
            "message": message,
            "status": status
        })
        await r.set(status_key, data, ex=86400)


# -------------------------------
# Placeholder processing utils
# -------------------------------
def clean_text_utility(text: str):
    return text.lower()

def generate_metadata_utility(text: str):
    return {"title": "Doc Title"}

def create_embeddings_utility(text: str):
    return [0.1, 0.2, 0.3]

def store_data_in_chroma(file_id, text, metadata, embeddings):
    print(f"✔ Stored in ChromaDB for {file_id}")


# -------------------------------
# Background workflow
# -------------------------------
async def run_embedding_workflow(file_id: str, raw_ocr_text: str):
    cache_key = f"data:{file_id}"
    r = await get_redis()
    try:
        await update_status(file_id, "START", "Workflow started")

        cleaned = clean_text_utility(raw_ocr_text)
        await update_status(file_id, "CLEANED", "Text cleaned")

        metadata = generate_metadata_utility(cleaned)
        await update_status(file_id, "METADATA", "Metadata generated")

        embeddings = create_embeddings_utility(cleaned)
        await update_status(file_id, "EMBEDDING", "Embedding generated")

        store_data_in_chroma(file_id, cleaned, metadata, embeddings)
        await update_status(file_id, "STORED", "Saved to vector DB")

        if r:
            await r.delete(cache_key)
        await update_status(file_id, "COMPLETE", "Processing finished", status="COMPLETE")

    except Exception as e:
        await update_status(file_id, "FAILED", str(e), status="FAILED")
        if r:
            await r.delete(cache_key)


# Wrapper for BackgroundTasks
def run_embedding_workflow_wrapper(file_id, text):
    asyncio.create_task(run_embedding_workflow(file_id, text))


# -------------------------------
# POST /process
# -------------------------------
@router.post("/process")
async def process_page(file_id: str, background_tasks: BackgroundTasks):
    r = await get_redis()
    if r is None:
        raise HTTPException(500, "Redis not connected")

    text_key = f"data:{file_id}"
    raw_text = await r.get(text_key)
    if not raw_text:
        raise HTTPException(404, "OCR text missing. Run /ocr first.")

    await update_status(file_id, "QUEUED", "Job queued")
    background_tasks.add_task(run_embedding_workflow_wrapper, file_id, raw_text)

    return {"file_id": file_id, "message": "Processing started"}


# -------------------------------
# GET /status
# -------------------------------
@router.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    r = await get_redis()
    if r is None:
        raise HTTPException(500, "Redis not connected")

    key = f"status:{file_id}"
    raw = await r.get(key)

    if not raw:
        return {
            "file_id": file_id,
            "status": "NOT_FOUND",
            "message": "No status found or expired"
        }

    try:
        return json.loads(raw)
    except Exception:
        raise HTTPException(500, "Corrupted JSON in Redis")
