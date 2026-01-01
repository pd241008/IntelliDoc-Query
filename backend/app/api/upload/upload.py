# app/api/upload/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import secrets
from pathlib import Path
import os

from app.data_access.redis import file_repo
from app.services import ocr_service

router = APIRouter(tags=["Upload"])

# --- Constants & Setup (Moved here for route validation) ---
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]


# ===============================================
# 1️⃣ /upload — POST
# ===============================================

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    
    # 1. File Size Check (must use synchronous file methods before await)
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    await file.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit.")

    # 2. Validation
    original_filename: str | None = file.filename
    if original_filename is None:
        raise HTTPException(status_code=400, detail="Filename is missing.")
        
    file_extension = Path(original_filename).suffix.lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} allowed.")
        
    # 3. Save File (Delegated to Data Access Layer)
    file_id = secrets.token_urlsafe(16)
    try:
        filepath = await file_repo.save_uploaded_file(file, file_id, file_extension)
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # 4. Return file info
    return {"file_id": file_id, "filename": original_filename, "file_path": str(filepath)}

# ===============================================
# 2️⃣ /ocr — POST
# ===============================================

@router.post("/ocr")
async def extract_text_from_file(file_id: str = Query(...)):
    print(f"--- [DEBUG] OCR request received for file_id: {file_id} ---")
    
    # The OCR is run synchronously but inside a threadpool by ocr_service.py
    try:
        # Delegation to the Service Layer
        extracted_text = await ocr_service.run_document_ocr_workflow(file_id)
        
        # We don't return the full text, just confirmation and a snippet.
        return {
            "file_id": file_id, 
            "status": "OCR_COMPLETE_SAVED_TO_REDIS", 
            "text_snippet": extracted_text[:100] + "...",
            "message": "OCR text successfully saved to Redis cache."
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File ID not found. Upload the file first.")
    except ConnectionError:
        raise HTTPException(status_code=500, detail="Could not connect to Redis to save OCR text.")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during OCR: {str(e)}")