import os
import json
import redis.asyncio as redis
from dotenv import load_dotenv

from app.core.config.health import mark_broker  # ✅ Health hook

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
redis_client: redis.Redis | None = None


# ---------------------------------------------------------
# CORE CONNECTION MANAGEMENT
# ---------------------------------------------------------
async def get_redis_client() -> redis.Redis | None:
    """Initializes and returns the shared Redis client instance."""
    global redis_client

    if redis_client is None:
        if not REDIS_URL:
            print("❌ REDIS_URL environment variable not set.")
            mark_broker("disconnected")
            return None

        try:
            redis_client = redis.from_url(
                REDIS_URL,
                decode_responses=False
            )

            pong = await redis_client.ping()  # type: ignore
            if pong:
                print("✔ Redis connected")
                mark_broker("connected")
            else:
                print("❌ Redis ping failed")
                mark_broker("disconnected")
                redis_client = None

        except Exception as e:
            print(f"❌ Redis connection error: {e}")
            mark_broker("disconnected")
            redis_client = None

    return redis_client


# ---------------------------------------------------------
# STATUS OPERATIONS (FILE PROGRESS)
# ---------------------------------------------------------
async def update_status(
    file_id: str,
    step: str,
    message: str,
    status: str = "Running"
):
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


# ---------------------------------------------------------
# OCR CACHE OPERATIONS
# ---------------------------------------------------------
async def get_raw_ocr_text(file_id: str) -> str | None:
    """Retrieves the raw OCR text from Redis cache."""
    r = await get_redis_client()
    if r:
        raw = await r.get(f"data:{file_id}")
        return raw.decode("utf-8") if raw else None
    return None


async def delete_ocr_cache(file_id: str):
    """Deletes the temporary raw OCR text cache from Redis."""
    r = await get_redis_client()
    if r:
        await r.delete(f"data:{file_id}")


# ---------------------------------------------------------
# PIPELINE ACTIVITY (HEALTH FLAGS)
# ---------------------------------------------------------
async def mark_pipeline_activity(pipeline: str):
    """
    Marks a pipeline as active using a short TTL.
    Health checks read this.
    """
    r = await get_redis_client()
    if r:
        await r.set(
            f"pipeline:{pipeline}:last_seen",
            b"active",
            ex=120  # 2 minutes TTL
        )


async def is_pipeline_active(pipeline: str) -> bool:
    """
    Returns True if pipeline has run recently.
    """
    r = await get_redis_client()
    if not r:
        return False

    return await r.exists(f"pipeline:{pipeline}:last_seen") == 1
