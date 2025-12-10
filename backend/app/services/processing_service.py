# app/services/processing_service.py

import asyncio
from app.data_access import redis_repo
from app.utils import ml_utils

# -------------------------------
# Core Background Workflow
# -------------------------------
async def run_embedding_workflow(file_id: str, raw_ocr_text: str):
    """
    The full document processing and embedding pipeline.
    Implements safe cache deletion only after successful storage.
    """
    
    try:
        await redis_repo.update_status(file_id, "START", "Workflow started")

        # 1. Cleaning
        cleaned = ml_utils.clean_text_utility(raw_ocr_text)
        await redis_repo.update_status(file_id, "CLEANED", "Text cleaned")

        # 2. Metadata/Classification
        metadata = ml_utils.generate_metadata_utility(cleaned)
        await redis_repo.update_status(file_id, "METADATA", "Metadata generated")

        # 3. Embedding
        embeddings = ml_utils.create_embeddings_utility(cleaned)
        await redis_repo.update_status(file_id, "EMBEDDING", "Embedding generated")

        # 4. Store (The critical step)
        ml_utils.store_data_in_chroma(file_id, cleaned, metadata, embeddings)
        await redis_repo.update_status(file_id, "STORED", "Saved to vector DB")

        # 5. Confirmation and Cleanup (SAFER ORDER)
        await redis_repo.update_status(file_id, "COMPLETE", "Processing finished", status="COMPLETE")
        await redis_repo.delete_ocr_cache(file_id) # DELETE ONLY AFTER COMPLETE STATUS

    except Exception as e:
        # Handle failure: update status and delete cache (to allow fresh upload/retry if error persists)
        error_message = f"Processing failed: {e}"
        await redis_repo.update_status(file_id, "FAILED", error_message, status="FAILED")
        await redis_repo.delete_ocr_cache(file_id)


# -------------------------------
# Wrapper for BackgroundTasks
# -------------------------------
def run_embedding_workflow_wrapper(file_id: str, text: str):
    """
    Non-async wrapper required for FastAPI BackgroundTasks. 
    In a Celery setup, this function is replaced by the Celery task call.
    """
    # Uses asyncio to run the async workflow function
    asyncio.create_task(run_embedding_workflow(file_id, text))