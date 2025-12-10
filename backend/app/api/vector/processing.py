# app/api/v1/processing.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
import json
from app.data_access import redis_repo
from app.services import processing_service

router = APIRouter(tags=["Process"])


# -------------------------------
# POST /process
# -------------------------------
@router.post("/process")
async def process_page(file_id: str, background_tasks: BackgroundTasks):
    
    # Check if Redis is connected (initial check)
    if await redis_repo.get_redis_client() is None:
        raise HTTPException(500, "Redis not connected. Cannot queue job.")

    # Fetch raw text from the Data Access layer
    raw_text = await redis_repo.get_raw_ocr_text(file_id)
    if not raw_text:
        # User must run the /ocr step first
        raise HTTPException(404, "OCR text missing. Run /ocr first.")

    # Update status and delegate work to the Service Layer
    await redis_repo.update_status(file_id, "QUEUED", "Job queued")
    
    # Use the wrapper function from the Service Layer
    background_tasks.add_task(processing_service.run_embedding_workflow_wrapper, file_id, raw_text)

    return {"file_id": file_id, "message": "Processing started"}


# -------------------------------
# GET /status
# -------------------------------
@router.get("/status/{file_id}")
async def get_processing_status(file_id: str):
    
    try:
        # Retrieve status data from the Data Access layer
        return await redis_repo.get_status_data(file_id)
    except ConnectionError:
        raise HTTPException(500, "Redis not connected.")
    except ValueError as e:
        raise HTTPException(500, str(e))