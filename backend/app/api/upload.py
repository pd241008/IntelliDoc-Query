from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
import shutil
import pytesseract
import os
import asyncio

router = APIRouter()
# --- 1. Tesseract Configuration (Essential for Windows) ---
# You MUST replace the path below with the actual location of tesseract.exe 
# on your system, which is typically C:\Program Files\Tesseract-OCR\tesseract.exe
try:
    TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    print(f"--- [DEBUG] Tesseract path set to: {TESSERACT_PATH} ---")
except Exception as e:
    # This block usually only catches errors if pytesseract fails to import, 
    # but the path setting is critical.
    print(f"--- [ERROR] Failed to set Tesseract path or import pytesseract: {e} ---")

# --- 2. FastAPI Setup ---
print("--- [DEBUG] Starting application setup ---")
router = APIRouter()
TEMP_FILE_PATH = "temp_uploaded_image.bin" # Using .bin for generic binary storage

# --- 3. OCR Endpoint ---
@router.post("/upload")
async def upload_image_for_ocr(image: UploadFile = File(...)):
    print(f"--- [DEBUG] Request received for /upload. Filename: {image.filename} ---")
    
    # 1. Save the uploaded file temporarily
    try:
        # Read the file content asynchronously
        file_content = await image.read()
        print(f"--- [DEBUG] Reading file content. Size: {len(file_content)} bytes ---")
        
        # Write the binary content to a temporary file
        with open(TEMP_FILE_PATH, "wb") as buffer:
            buffer.write(file_content)
        print(f"--- [DEBUG] File successfully saved to: {TEMP_FILE_PATH} ---")

        # 2. Perform OCR using pytesseract
        # We use asyncio.to_thread to run the synchronous pytesseract call 
        # in a separate thread, preventing the entire FastAPI server from blocking.
        extracted_text = await asyncio.to_thread(
            pytesseract.image_to_string, TEMP_FILE_PATH, lang='eng'
        )
        
        print("--- [DEBUG] OCR complete. Extracted text sample: " + extracted_text[:50].replace('\n', ' ') + " ---")
        
        # 3. Clean up the temporary file
        os.remove(TEMP_FILE_PATH)
        print(f"--- [DEBUG] Temporary file removed: {TEMP_FILE_PATH} ---")
        
        # 4. Return the extracted text
        return {
            "filename": image.filename, 
            "extracted_text": extracted_text
        }

    except pytesseract.TesseractNotFoundError:
        # Specific error handling for Tesseract path issues
        raise HTTPException(
            status_code=500, 
            detail="Tesseract is not installed or the path is incorrect. Please check TESSERACT_PATH in the script."
        )
    except Exception as e:
        print(f"--- [ERROR] An error occurred during processing: {e} ---")
        # Ensure cleanup even if an error occurs during processing
        if os.path.exists(TEMP_FILE_PATH):
             os.remove(TEMP_FILE_PATH)
             print(f"--- [DEBUG] Cleaned up temporary file after error: {TEMP_FILE_PATH} ---")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

# --- 4. Main Application Instance ---

print("--- [DEBUG] Router included in FastAPI application. Ready to serve. ---")