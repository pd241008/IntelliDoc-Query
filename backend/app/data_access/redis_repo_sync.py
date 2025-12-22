import redis
import os
import json
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise ValueError("REDIS_KEY environment variable not set")

# ---------------------------------------------------------
# REDIS CLIENT (SYNC)
# ---------------------------------------------------------
redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True
)


# ---------------------------------------------------------
# UPDATE STATUS (SYNC)
# ---------------------------------------------------------
def update_status_sync(
    file_id: str,
    step: str,
    message: str,
    status: str = "Running"
):
    key = f"status:{file_id}"

    payload = {
        "step": step,
        "message": message,
        "status": status
    }

    redis_client.set(
        key,
        json.dumps(payload),
        ex=86400  # 24 hours
    )


# ---------------------------------------------------------
# DELETE OCR CACHE (SYNC)
# ---------------------------------------------------------
def delete_ocr_cache_sync(file_id: str):
    key = f"ocr:{file_id}"
    redis_client.delete(key)
