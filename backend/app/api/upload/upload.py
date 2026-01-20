# app/api/upload/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import secrets
from pathlib import Path
import os

from app.data_access.redis import file_repo
from app.core.config.ocr_trigger import trigger_ocr_pipeline  # ✅ INTERNAL trigger

router = APIRouter(tags=["Upload"])

# --------------------------------------------------
# CONSTANTS
# --------------------------------------------------
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".docx"]


# ==================================================
# 1️⃣ /upload — POST (PRIMARY ENTRY POINT)
# ==================================================
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # --------------------------------------------------
    # 1. FILE SIZE CHECK
    # --------------------------------------------------
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    await file.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit."
        )

    # --------------------------------------------------
    # 2. VALIDATION
    # --------------------------------------------------
    original_filename = file.filename
    if not original_filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")

    file_extension = Path(original_filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} allowed."
        )

    # --------------------------------------------------
    # 3. SAVE FILE
    # --------------------------------------------------
    file_id = secrets.token_urlsafe(16)

    try:
     filepath = await file_repo.save_uploaded_file(
     file=file,
     file_id=file_id,
     file_extension=file_extension
)

    except IOError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {str(e)}"
        )

    # --------------------------------------------------
    # 4. 🔥 TRIGGER OCR PIPELINE (ASYNC, SAFE)
    # --------------------------------------------------
    try:
        await trigger_ocr_pipeline(file_id)
    except Exception as e:
        # Upload succeeded, pipeline failed → DO NOT rollback
        print(f"[WARN] OCR trigger failed for {file_id}: {e}")

    # --------------------------------------------------
    # 5. RESPONSE (IMMEDIATE)
    # --------------------------------------------------
    return {
        "file_id": file_id,
        "filename": original_filename,
        "status": "UPLOADED",
        "message": "File uploaded successfully. OCR pipeline started."
    }
