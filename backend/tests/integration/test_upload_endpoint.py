"""
Integration Tests — Upload Endpoint

Full request lifecycle:
  POST /upload → file validation → save file → trigger OCR pipeline → response

The OCR pipeline trigger is mocked to prevent Tesseract/pdf2image dependency.
File saving is mocked to avoid I/O side effects.
"""

from io import BytesIO
from pathlib import Path
from unittest.mock import patch, AsyncMock


class TestUploadEndpoint:

    ENDPOINT = "/upload"

    # ─── Valid Upload ────────────────────────────────────────

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_valid_pdf_returns_200(self, mock_save, mock_ocr, client):
        """Valid PDF upload returns HTTP 200."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("test.pdf", BytesIO(b"%PDF-1.4 test"), "application/pdf")},
        )
        assert response.status_code == 200

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_response_contains_file_id(self, mock_save, mock_ocr, client):
        """Response includes a generated file_id."""
        body = client.post(
            self.ENDPOINT,
            files={"file": ("doc.pdf", BytesIO(b"%PDF-1.4 test"), "application/pdf")},
        ).json()

        assert "file_id" in body
        assert isinstance(body["file_id"], str)
        assert len(body["file_id"]) > 0

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_response_contains_filename(self, mock_save, mock_ocr, client):
        """Response echoes back the original filename."""
        body = client.post(
            self.ENDPOINT,
            files={"file": ("report.pdf", BytesIO(b"%PDF-1.4"), "application/pdf")},
        ).json()

        assert body["filename"] == "report.pdf"

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_response_status_is_uploaded(self, mock_save, mock_ocr, client):
        """Response status field is 'UPLOADED'."""
        body = client.post(
            self.ENDPOINT,
            files={"file": ("doc.pdf", BytesIO(b"%PDF-1.4"), "application/pdf")},
        ).json()

        assert body["status"] == "UPLOADED"

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_response_contains_message(self, mock_save, mock_ocr, client):
        """Response includes a confirmation message."""
        body = client.post(
            self.ENDPOINT,
            files={"file": ("doc.pdf", BytesIO(b"%PDF-1.4"), "application/pdf")},
        ).json()

        assert "message" in body

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.png"),
    )
    def test_valid_image_accepted(self, mock_save, mock_ocr, client):
        """PNG image upload is accepted."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("photo.png", BytesIO(b"\x89PNG..."), "image/png")},
        )
        assert response.status_code == 200

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.jpg"),
    )
    def test_valid_jpeg_accepted(self, mock_save, mock_ocr, client):
        """JPEG image upload is accepted."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("photo.jpg", BytesIO(b"\xff\xd8..."), "image/jpeg")},
        )
        assert response.status_code == 200

    # ─── Save + OCR Called ───────────────────────────────────

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_save_file_is_called(self, mock_save, mock_ocr, client):
        """File repo save function is called exactly once."""
        client.post(
            self.ENDPOINT,
            files={"file": ("doc.pdf", BytesIO(b"%PDF"), "application/pdf")},
        )
        mock_save.assert_called_once()

    @patch("app.api.upload.upload.trigger_ocr_pipeline", new_callable=AsyncMock)
    @patch(
        "app.api.upload.upload.file_repo.save_uploaded_file",
        new_callable=AsyncMock,
        return_value=Path("/tmp/faketest.pdf"),
    )
    def test_ocr_pipeline_triggered(self, mock_save, mock_ocr, client):
        """OCR pipeline is triggered after successful save."""
        client.post(
            self.ENDPOINT,
            files={"file": ("doc.pdf", BytesIO(b"%PDF"), "application/pdf")},
        )
        mock_ocr.assert_called_once()

    # ─── Validation Failures ─────────────────────────────────

    def test_invalid_extension_returns_400(self, client):
        """Unsupported file type returns 400."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("script.py", BytesIO(b"print()"), "text/plain")},
        )
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

    def test_txt_extension_returns_400(self, client):
        """TXT file is not in the allowed list."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("notes.txt", BytesIO(b"Hello"), "text/plain")},
        )
        assert response.status_code == 400

    def test_exe_extension_returns_400(self, client):
        """Executable file is rejected."""
        response = client.post(
            self.ENDPOINT,
            files={"file": ("malware.exe", BytesIO(b"\x00"), "application/octet-stream")},
        )
        assert response.status_code == 400
