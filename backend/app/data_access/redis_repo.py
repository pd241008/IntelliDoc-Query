# app/data_access/redis_repo.py

import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
redis_client: redis.Redis | None = None


# --- Core Connection Management ---
async def get_redis_client() -> redis.Redis | None:
    """Initializes and returns the shared Redis client instance."""
    global redis_client
    if redis_client is None:
        if not REDIS_URL:
            print("❌ REDIS_URL environment variable not set.")
            return None

        try:
            # decode_responses=False is required for handling bytes safely
            redis_client = redis.from_url(
                REDIS_URL,
                decode_responses=False
            )

            pong = await redis_client.ping()  # type: ignore
            if pong:
                print("✔ Redis connected")
            else:
                print("❌ Redis ping failed")
                redis_client = None

        except Exception as e:
            print(f"❌ Redis connection error: {e}")
            redis_client = None

    return redis_client


# --- Data and Status Operations ---
async def update_status(file_id: str, step: str, message: str, status: str = "Running"):
    """Updates the processing status for a file in Redis."""
    print(f"[{file_id}] {step} → {message} ({status})")

    r = await get_redis_client()
    if r:
        status_key = f"status:{file_id}"
        data = json.dumps({
            "file_id": file_id,
            "step": step,
            "message": message,
            "status": status
        })

        # store as bytes so decode later is predictable
        await r.set(status_key, data.encode("utf-8"), ex=86400)


async def get_status_data(file_id: str) -> dict:
    """Retrieves the status data for a file from Redis."""
    r = await get_redis_client()
    if r is None:
        raise ConnectionError("Redis not connected.")

    key = f"status:{file_id}"
    raw = await r.get(key)

    if not raw:
        return {
            "file_id": file_id,
            "status": "NOT_FOUND",
            "message": "No status found or expired"
        }

    try:
        return json.loads(raw.decode("utf-8"))
    except Exception:
        raise ValueError("Corrupted JSON in Redis.")


async def get_raw_ocr_text(file_id: str) -> str | None:
    """Retrieves the raw OCR text from Redis cache."""
    r = await get_redis_client()
    if r:
        text_key = f"data:{file_id}"
        raw = await r.get(text_key)

        # decode bytes safely
        return raw.decode("utf-8") if raw else None

    return None


async def delete_ocr_cache(file_id: str):
    """Deletes the temporary raw OCR text cache from Redis."""
    r = await get_redis_client()
    if r:
        cache_key = f"data:{file_id}"
        await r.delete(cache_key)
