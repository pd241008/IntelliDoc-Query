from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException,Query
import shutil
import pytesseract
import os
import secrets
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image
from typing import List
import asyncio

# --- Tesseract Configuration ---
# IMPORTANT: SET YOUR PATH HERE!

# --- Constants & Setup ---
TEMP_DIR = Path("temp")
MAX_FILE_SIZE_MB = 25
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"]

TEMP_DIR.mkdir(exist_ok=True)
print(f"--- [DEBUG] Temporary directory created: {TEMP_DIR} ---")

router = APIRouter()

# --- Helper Function ---
def run_ocr_on_image(img: Image.Image) -> str:
    """Runs OCR on a single PIL Image object."""
    return pytesseract.image_to_string(img, lang='eng')

# ===============================================
# 1️⃣ /uploadapi/upload — POST (Updated)
# ===============================================

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 🎯 STEP 4: Add file-size checks
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    await file.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit.")

    # 1. Validate type and get extension
    original_filename: str | None = file.filename
    
    # --- FIX START: Type Narrowing for Path constructor ---
    if original_filename is None:
        raise HTTPException(status_code=400, detail="Filename is missing from the upload request.")
        
    # The type checker is now happy because original_filename is guaranteed to be a string (str).
    file_extension = Path(original_filename).suffix.lower()
    # --- FIX END ---
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} allowed.")
        
    # 🎯 STEP 3: Rename your temp file correctly
    file_id = secrets.token_urlsafe(16)
    unique_filename = file_id + file_extension
    filepath = TEMP_DIR / unique_filename
    
    # 2. Save file
    try:
        with open(filepath, "wb") as buffer:
            # Note: We rely on file.file.seek(0) and shutil.copyfileobj to read the stream content.
            shutil.copyfileobj(file.file, buffer)
        print(f"--- [DEBUG] File saved successfully: {filepath} ---")
    except Exception:
        if filepath.exists():
            os.remove(filepath)
        raise HTTPException(status_code=500, detail="Could not save file.")

    # 3. Return { file_id: ... }
    return {"file_id": file_id, "filename": original_filename, "file_path": str(filepath)}

# ===============================================
# 2️⃣ /uploadapi/ocr — POST (Unchanged, remains correct)
# ===============================================

@router.post("/ocr")
async def extract_text_from_file(file_id: str = Query(...)):
    print(f"--- [DEBUG] OCR request received for file_id: {file_id} ---")
    
    # 1. Load saved file & Detect file type
    matching_files = list(TEMP_DIR.glob(f"{file_id}.*"))
    
    if not matching_files:
        raise HTTPException(status_code=404, detail="File ID not found. Upload the file first.")
        
    filepath = matching_files[0]
    file_extension = filepath.suffix.lower()
    extracted_text = ""
    
    try:
        if file_extension == ".pdf":
            print("--- [DEBUG] Detected PDF. Converting pages to images... ---")
            
            # 🎯 STEP 2: Handle PDF correctly (running synchronously in a separate thread)
            images: List[Image.Image] = await asyncio.to_thread(convert_from_path, filepath, dpi=300)
            
            all_page_texts = []
            for i, img in enumerate(images):
                page_text = await asyncio.to_thread(run_ocr_on_image, img)
                all_page_texts.append(page_text)
                
            extracted_text = "\n\n--- PAGE BREAK ---\n\n".join(all_page_texts)
            
        elif file_extension in [".jpg", ".jpeg", ".png"]:
            print("--- [DEBUG] Detected Image. Starting OCR... ---")
            img: Image.Image = await asyncio.to_thread(Image.open, filepath)
            extracted_text = await asyncio.to_thread(run_ocr_on_image, img)
            
        # Clean up the temporary file after processing
        os.remove(filepath)
        print(f"--- [DEBUG] Cleaned up temporary file: {filepath} ---")
            
    except pytesseract.TesseractNotFoundError:
        raise HTTPException(status_code=500, detail="Tesseract is not installed or the path is incorrect.")
    except Exception as e:
        print(f"--- [ERROR] Processing failed: {e} ---")
        if os.path.exists(filepath):
             os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

    return {"file_id": file_id, "extracted_text": extracted_text}

# --- Main Application ---
