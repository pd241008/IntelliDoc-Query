# app/api/v1/processing.py

from fastapi import APIRouter, HTTPException
from app.data_access import redis_repo
# Import the function directly
from app.middleware.celery.pipeline import vector_pipeline 

router = APIRouter(tags=["Process"])



# -------------------------------
# POST /process
# -------------------------------
@router.post("/process")
async def process_page(file_id: str):

    # 1. Ensure Redis is connected
    if await redis_repo.get_redis_client() is None:
        raise HTTPException(500, "Redis not connected. Cannot queue job.")

    # 2. Check OCR text exists
    raw_text = await redis_repo.get_raw_ocr_text(file_id)
    if not raw_text:
        raise HTTPException(
            404,
            "OCR text missing. Run OCR step first before processing."
        )

    # 3. Update initial status
    await redis_repo.update_status(
        file_id,
        step="QUEUED",
        message="Processing job queued",
        status="Pending"
    )

    # 4. Trigger Celery pipeline
    # 🌟 FIX: Call the function directly. Do NOT use .delay() here.
    # The .delay() is already happening inside 'vector_pipeline'.
    vector_pipeline(file_id, raw_text)

    return {
        "file_id": file_id,
        "message": "Processing pipeline started via Celery"
    }


# -------------------------------
# GET /status/{file_id}
# -------------------------------
@router.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    
    try:
        return await redis_repo.get_status_data(file_id)
    except ConnectionError:
        raise HTTPException(500, "Redis connection failed.")
    except ValueError as e:
        raise HTTPException(500, str(e))