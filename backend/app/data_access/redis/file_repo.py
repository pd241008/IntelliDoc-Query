
# app/data_access/file_repo.py

import os
import shutil
from pathlib import Path
from fastapi import UploadFile

# --- Constants & Setup ---
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)


async def save_uploaded_file(file: UploadFile, file_id: str, file_extension: str) -> Path:
    """Saves the uploaded file stream to the temporary directory."""
    filepath = TEMP_DIR / (file_id + file_extension)
    
    # Reset file pointer and save file
    await file.seek(0)
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"--- [DEBUG] File saved successfully: {filepath} ---")
        return filepath
    except Exception as e:
        if filepath.exists():
            os.remove(filepath)
        raise IOError(f"Could not save file: {e}")


def find_file_path(file_id: str) -> Path | None:
    """Finds the temporary file path by file_id, regardless of extension."""
    matching_files = list(TEMP_DIR.glob(f"{file_id}.*"))
    return matching_files[0] if matching_files else None


def cleanup_local_file(filepath: Path):
    """Safely deletes a local file."""
    if filepath.exists():
        os.remove(filepath)
        print(f"--- [DEBUG] Cleaned up file: {filepath} ---")