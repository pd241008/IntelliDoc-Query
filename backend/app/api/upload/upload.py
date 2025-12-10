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

router = APIRouter(tags=["Upload"])

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
# 2️⃣ /uploadapi/ocr — POST (Revised)
# ===============================================

@router.post("/ocr")
async def extract_text_from_file(file_id: str = Query(...)):
    print(f"--- [DEBUG] OCR request received for file_id: {file_id} ---")
    
    # 1. Initialization and File Check
    matching_files = list(TEMP_DIR.glob(f"{file_id}.*"))
    
    if not matching_files:
        raise HTTPException(status_code=404, detail="File ID not found. Upload the file first.")
        
    # **SCOPE FIX:** Assigning file path outside the core logic for use in cleanup
    filepath = matching_files[0] 
    file_extension = filepath.suffix.lower()
    
    # **SCOPE FIX:** Initializing extracted_text so it's guaranteed to exist
    extracted_text = ""
    ocr_text_path = TEMP_DIR / f"{file_id}_ocr.txt"
    
    try:
        if file_extension == ".pdf":
            print("--- [DEBUG] Detected PDF. Converting pages to images... ---")
            
            images: List[Image.Image] = await asyncio.to_thread(convert_from_path, filepath, dpi=300)
            
            all_page_texts = []
            for img in images:
                page_text = await asyncio.to_thread(run_ocr_on_image, img)
                all_page_texts.append(page_text)
                
            extracted_text = "\n\n--- PAGE BREAK ---\n\n".join(all_page_texts)
            
        elif file_extension in [".jpg", ".jpeg", ".png"]:
            print("--- [DEBUG] Detected Image. Starting OCR... ---")
            img: Image.Image = await asyncio.to_thread(Image.open, filepath)
            extracted_text = await asyncio.to_thread(run_ocr_on_image, img)
            
        else:
            # Although the upload endpoint checks this, it's good defensive programming
            raise HTTPException(status_code=400, detail="File extension was found but not handled in OCR.")

        # --- Persistence Step (New Logic) ---
        if not extracted_text:
             raise Exception("OCR failed to produce any text.")

        # Save the OCR text content to a new, persistent file
        with open(ocr_text_path, "w", encoding="utf-8") as f:
            f.write(extracted_text)
            
        print(f"--- [DEBUG] OCR text saved to: {ocr_text_path} ---")

        # Clean up the original document file (PDF/Image) only after successful save
        os.remove(filepath) 
        print(f"--- [DEBUG] Cleaned up original file: {filepath} ---")
            
        return {"file_id": file_id, "status": "OCR_COMPLETE", "ocr_path": str(ocr_text_path)}

    except pytesseract.TesseractNotFoundError:
        # Re-raise exceptions within the try block
        raise HTTPException(status_code=500, detail="Tesseract is not installed or the path is incorrect.")
        
    except Exception as e:
        print(f"--- [ERROR] Processing failed: {e} ---")
        
        # **SCOPE FIX:** Clean up files if they exist after an error
        if os.path.exists(filepath):
            os.remove(filepath)
            
        if os.path.exists(ocr_text_path):
             os.remove(ocr_text_path) # Clean up potentially partial OCR file

        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")