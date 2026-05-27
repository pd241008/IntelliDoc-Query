# app/services/ocr_service.py

import asyncio
import logging
from typing import List
from pathlib import Path

from pdf2image import convert_from_path
from PIL import Image
import pytesseract

from app.data_access.redis import redis_repo
from app.data_access.redis import file_repo
from app.middleware.workers.ingestion_pipeline.ingestion_pipeline import start_ingestion_pipeline

# Configure logger for this module
logger = logging.getLogger(__name__)

# -----------------------------
# Configuration Constants
# -----------------------------
OCR_LANGUAGE = "eng"
PDF_DPI = 300
SUPPORTED_IMAGE_FORMATS = {".jpg", ".jpeg", ".png"}


# -----------------------------
# OCR Helper
# -----------------------------
def run_ocr_on_image(img: Image.Image) -> str:
    """Runs OCR on a single PIL Image."""
    return pytesseract.image_to_string(img, lang=OCR_LANGUAGE)


# -----------------------------
# OCR Workflow
# -----------------------------
async def run_document_ocr_workflow(file_id: str, client_id: str) -> str:
    """
    Retrieves a file, performs OCR based on its type (PDF or Image),
    stores the extracted text in Redis, and triggers the ingestion pipeline.
    """
    filepath = file_repo.find_file_path(file_id)

    if not filepath:
        logger.error(f"File ID {file_id} not found locally.")
        raise FileNotFoundError(f"File ID {file_id} not found locally.")

    # Ensure filepath is a Path object for safer attribute access
    if isinstance(filepath, str):
        filepath = Path(filepath)

    file_extension = filepath.suffix.lower()
    extracted_text = ""

    try:
        # -----------------------------
        # PDF Processing
        # -----------------------------
        if file_extension == ".pdf":
            logger.info(f"Starting PDF OCR processing for {file_id}")
            images: List[Image.Image] = await asyncio.to_thread(
                convert_from_path,
                filepath,
                dpi=PDF_DPI
            )

            page_texts = []
            for img in images:
                text = await asyncio.to_thread(run_ocr_on_image, img)
                page_texts.append(text)
                # Free memory immediately after processing each page
                img.close() 

            extracted_text = "\n\n--- PAGE BREAK ---\n\n".join(page_texts)

        # -----------------------------
        # Image Processing
        # -----------------------------
        elif file_extension in SUPPORTED_IMAGE_FORMATS:
            logger.info(f"Starting Image OCR processing for {file_id}")
            
            def process_single_image(path: Path) -> str:
                # Use context manager to ensure the file descriptor is safely closed
                with Image.open(path) as img:
                    return run_ocr_on_image(img)

            extracted_text = await asyncio.to_thread(process_single_image, filepath)

        else:
            logger.error(f"Unsupported file format for OCR: {file_extension} (File ID: {file_id})")
            raise ValueError(f"Unsupported file format for OCR: {file_extension}")

        if not extracted_text.strip():
            logger.warning(f"OCR produced no text for {file_id}")
            raise RuntimeError("OCR produced no text.")

        # -----------------------------
        # Save OCR result to Redis
        # -----------------------------
        r = await redis_repo.get_redis_client()
        if not r:
            logger.error("Redis connection not available.")
            raise ConnectionError("Redis connection not available.")

        text_key = f"data:{file_id}"
        await r.set(text_key, extracted_text)
        logger.debug(f"OCR text saved to Redis key: {text_key}")

        # -----------------------------
        # Trigger ingestion pipeline
        # -----------------------------
        # Ignored to resolve Pylance false-positive on Celery's dynamically added `.delay` method
        start_ingestion_pipeline.delay(file_id, client_id, extracted_text)  # type: ignore
        logger.debug(f"Ingestion pipeline triggered for {file_id}")

        return extracted_text

    except pytesseract.TesseractNotFoundError as e:
        logger.critical("Tesseract is not installed or not in PATH.", exc_info=True)
        raise RuntimeError("Tesseract is not installed or not in PATH.") from e

    except Exception as e:
        logger.error(f"OCR workflow failed for {file_id}: {str(e)}", exc_info=True)
        raise RuntimeError(f"OCR workflow failed for {file_id}: {str(e)}") from e

    finally:
        # -----------------------------
        # Cleanup local file
        # -----------------------------
        # The finally block guarantees cleanup even if an exception occurs mid-workflow
        try:
            file_repo.cleanup_local_file(filepath)
            logger.debug(f"Successfully cleaned up local file: {filepath}")
        except Exception as cleanup_error:
            logger.error(f"Failed to clean up local file {filepath}: {str(cleanup_error)}", exc_info=True)