# app/core/config/ocr_trigger.py

import asyncio
from app.services import ocr_service
from app.data_access.redis.redis_repo import (
    update_status,
    mark_pipeline_activity
)

async def trigger_ocr_pipeline(file_id: str):
    # Initial queue state
    await update_status(
        file_id=file_id,
        step="OCR",
        message="OCR pipeline queued",
        status="Queued"
    )

    async def _run():
        try:
            await mark_pipeline_activity("ocr")

            await update_status(
                file_id=file_id,
                step="OCR",
                message="OCR processing started",
                status="Running"
            )

            await ocr_service.run_document_ocr_workflow(file_id)

            await update_status(
                file_id=file_id,
                step="OCR",
                message="OCR completed successfully",
                status="Completed"
            )

        except Exception as e:
            await update_status(
                file_id=file_id,
                step="OCR",
                message=f"OCR failed: {str(e)}",
                status="Failed"
            )
            raise

    asyncio.create_task(_run())
