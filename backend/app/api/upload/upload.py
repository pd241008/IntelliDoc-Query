# app/api/upload/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import secrets
from pathlib import Path
import os

from app.data_access.redis import file_repo
from app.core.config.ocr_trigger import trigger_ocr_pipeline

router = APIRouter(tags=["Upload"])

# --------------------------------------------------
# CONSTANTS
# --------------------------------------------------
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]  

# ==================================================
# /upload — POST
# ==================================================
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # 1️⃣ FILE SIZE CHECK
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    await file.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit."
        )

    # 2️⃣ VALIDATION
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")

    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 3️⃣ SAVE FILE
    file_id = secrets.token_urlsafe(16)

    try:
        filepath = await file_repo.save_uploaded_file(
            file=file,
            file_id=file_id,
            file_extension=file_extension
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {str(e)}"
        )

    # 4️⃣ ASYNC OCR PIPELINE TRIGGER
    try:
        await trigger_ocr_pipeline(file_id)
    except Exception as e:
        # Upload success ≠ pipeline success
        print(f"[WARN] OCR trigger failed for {file_id}: {e}")

    # 5️⃣ RESPONSE
    return {
        "file_id": file_id,
        "filename": file.filename,
        "status": "UPLOADED",
        "message": "File uploaded successfully. OCR pipeline started."
    }
