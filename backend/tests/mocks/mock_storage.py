"""
Fake File Storage Stub

Uses a temporary directory instead of the project's temp/ folder.
Provides the same API as app.data_access.redis.file_repo.
"""

import os
import shutil
from pathlib import Path
from typing import Optional
import tempfile


# Create a dedicated temp directory for tests
_test_temp_dir: Optional[Path] = None


def get_test_temp_dir() -> Path:
    """Returns (and creates if needed) the test-specific temp directory."""
    global _test_temp_dir
    if _test_temp_dir is None or not _test_temp_dir.exists():
        _test_temp_dir = Path(tempfile.mkdtemp(prefix="intellidoc_test_"))
    return _test_temp_dir


async def mock_save_uploaded_file(file, file_id: str, file_extension: str) -> Path:
    """
    Saves the uploaded file to a test-specific temp directory.
    Mirrors file_repo.save_uploaded_file().
    """
    temp_dir = get_test_temp_dir()
    filepath = temp_dir / f"{file_id}{file_extension}"

    await file.seek(0)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return filepath


def mock_find_file_path(file_id: str) -> Optional[Path]:
    """Finds a file in the test temp directory."""
    temp_dir = get_test_temp_dir()
    matches = list(temp_dir.glob(f"{file_id}.*"))
    return matches[0] if matches else None


def mock_cleanup_local_file(filepath: Path) -> None:
    """Removes a file from the test temp directory."""
    if filepath.exists():
        os.remove(filepath)


def cleanup_test_storage() -> None:
    """Removes the entire test temp directory. Call in teardown."""
    global _test_temp_dir
    if _test_temp_dir and _test_temp_dir.exists():
        shutil.rmtree(_test_temp_dir, ignore_errors=True)
        _test_temp_dir = None
