# app/services/ocr_service.py

import os
import asyncio
from pathlib import Path
from typing import List
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

from app.data_access import redis_repo
from app.data_access import file_repo

# --- Helper Function (from original code) ---
def run_ocr_on_image(img: Image.Image) -> str:
    """Runs OCR on a single PIL Image object."""
    # This must remain synchronous to be used with asyncio.to_thread
    return pytesseract.image_to_string(img, lang='eng')


async def run_document_ocr_workflow(file_id: str):
    """
    Main OCR workflow: loads file, runs OCR, saves result to Redis, and cleans up local file.
    """
    filepath = file_repo.find_file_path(file_id)
    if not filepath:
        raise FileNotFoundError(f"File ID {file_id} not found locally.")

    file_extension = filepath.suffix.lower()
    extracted_text = ""
    
    # We define a context manager list for cleanup in case of error
    files_to_clean = [filepath]

    try:
        if file_extension == ".pdf":
            # Running synchronous PDF conversion in a separate thread
            images: List[Image.Image] = await asyncio.to_thread(convert_from_path, filepath, dpi=300)
            
            all_page_texts = []
            for img in images:
                # Running synchronous OCR in a separate thread for each image
                page_text = await asyncio.to_thread(run_ocr_on_image, img)
                all_page_texts.append(page_text)
                
            extracted_text = "\n\n--- PAGE BREAK ---\n\n".join(all_page_texts)
            
        elif file_extension in [".jpg", ".jpeg", ".png"]:
            img: Image.Image = await asyncio.to_thread(Image.open, filepath)
            extracted_text = await asyncio.to_thread(run_ocr_on_image, img)
            
        else:
            raise ValueError("File extension was found but is not supported for OCR processing.")

        if not extracted_text:
            raise Exception("OCR failed to produce any text.")

        # --- Persistence Step (Crucial Change: Save to Redis Cache) ---
        r = await redis_repo.get_redis_client()
        if not r:
            raise ConnectionError("Redis is not connected to save OCR text.")
            
        # The key we established earlier for raw data
        text_key = f"data:{file_id}"
        await r.set(text_key, extracted_text) 
        print(f"--- [DEBUG] OCR text saved to Redis key: {text_key} ---")
        
        # Clean up the original document file (PDF/Image) only after successful save
        file_repo.cleanup_local_file(filepath) 
        
        return extracted_text

    except pytesseract.TesseractNotFoundError:
        raise RuntimeError("Tesseract is not installed or the path is incorrect.")
    
    except Exception as e:
        # Cleanup original file in case of error
        file_repo.cleanup_local_file(filepath)
        raise RuntimeError(f"OCR workflow failed for {file_id}: {str(e)}")