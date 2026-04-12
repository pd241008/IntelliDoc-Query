"""
Unit Tests — Text Chunking

Tests the chunk_text() function from both:
  - app.middleware.workers.ingestion_pipeline.tasks.ingestion_tasks
  - app.utils.ml_utils

Validates chunk size limits, overlap correctness,
boundary conditions, and edge cases.
"""

from app.middleware.workers.ingestion_pipeline.tasks.ingestion_tasks import (
    chunk_text as pipeline_chunk_text,
)
from app.utils.ml_utils import chunk_text as utils_chunk_text


class TestPipelineChunking:
    """Tests for the ingestion pipeline's chunk_text (chunk_size=500, overlap=100)."""

    def test_short_text_single_chunk(self):
        """Text shorter than chunk_size produces exactly one chunk."""
        text = "Hello world. This is a short text."
        chunks = pipeline_chunk_text(text, chunk_size=500, overlap=100)

        assert len(chunks) == 1
        assert chunks[0] == text

    def test_chunk_size_respected(self):
        """No chunk exceeds the specified chunk_size."""
        text = "a" * 2000
        chunks = pipeline_chunk_text(text, chunk_size=500, overlap=100)

        for chunk in chunks:
            assert len(chunk) <= 500

    def test_overlap_correctness(self):
        """Each chunk starts at (chunk_size - overlap) from the previous start."""
        text = "a" * 2000
        chunk_size = 500
        overlap = 100
        chunks = pipeline_chunk_text(text, chunk_size=chunk_size, overlap=overlap)

        # Verify overlap: consecutive chunks share `overlap` characters
        for i in range(len(chunks) - 1):
            # The end of chunk[i] should overlap with the start of chunk[i+1]
            tail = chunks[i][-overlap:]
            head = chunks[i + 1][:overlap]
            assert tail == head, f"Overlap mismatch at chunk {i} → {i + 1}"

    def test_full_text_coverage(self):
        """All characters from the original text appear in at least one chunk."""
        text = "".join(str(i % 10) for i in range(1500))
        chunks = pipeline_chunk_text(text, chunk_size=500, overlap=100)

        # Reconstruct: first chunk + non-overlapping parts of subsequent chunks
        reconstructed = chunks[0]
        for chunk in chunks[1:]:
            reconstructed += chunk[100:]  # skip the overlapping portion

        assert reconstructed == text

    def test_exact_chunk_size_boundary(self):
        """
        Text exactly equal to chunk_size produces 2 chunks because
        the loop advances by (chunk_size - overlap), so start=400
        is still < 500, yielding a trailing overlap chunk.
        """
        text = "x" * 500
        chunks = pipeline_chunk_text(text, chunk_size=500, overlap=100)

        assert len(chunks) == 2
        assert chunks[0] == text  # first chunk is the full text
        assert len(chunks[1]) == 100  # overlap tail

    def test_empty_text(self):
        """Empty text produces an empty list."""
        chunks = pipeline_chunk_text("", chunk_size=500, overlap=100)

        assert chunks == []

    def test_chunk_count_formula(self):
        """Verify the expected number of chunks for a known input length."""
        text = "a" * 1200
        chunk_size = 500
        overlap = 100
        chunks = pipeline_chunk_text(text, chunk_size=chunk_size, overlap=overlap)

        # Expected: ceil((1200 - 500) / (500 - 100)) + 1 = ceil(700/400) + 1 = 2 + 1 = 3
        assert len(chunks) == 3

    def test_custom_parameters(self):
        """Chunking works with non-default parameters."""
        text = "word " * 200  # 1000 chars
        chunks = pipeline_chunk_text(text, chunk_size=300, overlap=50)

        for chunk in chunks:
            assert len(chunk) <= 300

        assert len(chunks) >= 3


class TestUtilsChunking:
    """Tests for ml_utils chunk_text (chunk_size=500, overlap=50)."""

    def test_short_text(self):
        """Short text returns a single chunk."""
        text = "Brief document."
        chunks = utils_chunk_text(text, chunk_size=500, overlap=50)

        assert len(chunks) == 1
        assert chunks[0] == text

    def test_size_limit(self):
        """Chunks respect the size limit."""
        text = "b" * 1500
        chunks = utils_chunk_text(text, chunk_size=500, overlap=50)

        for chunk in chunks:
            assert len(chunk) <= 500

    def test_overlap_default(self):
        """Default overlap of 50 is applied correctly."""
        text = "c" * 1000
        chunks = utils_chunk_text(text)  # defaults: 500, 50

        if len(chunks) > 1:
            tail = chunks[0][-50:]
            head = chunks[1][:50]
            assert tail == head
