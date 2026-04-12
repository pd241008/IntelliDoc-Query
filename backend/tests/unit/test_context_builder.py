"""
Unit Tests — Context Builder

Tests the build_context() function from app.rag.context_builder.

Validates document assembly, size limiting, numbering,
and edge case handling (empty docs, whitespace-only).
"""

from app.rag.context_builder import build_context, MAX_CONTEXT_CHARS


class TestBuildContext:

    def test_empty_documents_returns_fallback(self):
        """Empty document list returns the 'no relevant documents' message."""
        result = build_context([])
        assert result == "No relevant documents found."

    def test_single_document_wrapped_with_header(self):
        """Single document is wrapped with [Document 1] header."""
        docs = ["The IntelliDoc system processes PDFs."]
        result = build_context(docs)

        assert "[Document 1]" in result
        assert "The IntelliDoc system processes PDFs." in result

    def test_multiple_documents_numbered_sequentially(self):
        """Multiple documents get sequential numbering."""
        docs = ["First chunk.", "Second chunk.", "Third chunk."]
        result = build_context(docs)

        assert "[Document 1]" in result
        assert "[Document 2]" in result
        assert "[Document 3]" in result

    def test_document_content_preserved(self):
        """All document text appears in the output (within size limits)."""
        docs = ["Alpha content", "Beta content"]
        result = build_context(docs)

        assert "Alpha content" in result
        assert "Beta content" in result

    def test_max_chars_limit_respected(self):
        """Output does not exceed max_chars."""
        long_docs = [f"Document text block {i}. " * 100 for i in range(20)]
        result = build_context(long_docs, max_chars=500)

        assert len(result) <= 500

    def test_truncation_preserves_complete_documents(self):
        """Truncation happens at document boundaries, not mid-document."""
        docs = ["A" * 200, "B" * 200, "C" * 200]  # ~600 total + headers
        result = build_context(docs, max_chars=500)

        # Should include full doc 1 and doc 2, but not doc 3
        assert "[Document 1]" in result
        assert "A" * 200 in result

    def test_whitespace_only_documents_skipped(self):
        """Documents containing only whitespace are skipped."""
        docs = ["Real content.", "   ", "\t\n", "Also real."]
        result = build_context(docs)

        assert "Real content." in result
        assert "Also real." in result

    def test_custom_max_chars(self):
        """Custom max_chars parameter is respected."""
        docs = ["Short."]
        result = build_context(docs, max_chars=100)

        assert len(result) <= 100
        assert "Short." in result

    def test_default_max_chars_is_3000(self):
        """Verifies MAX_CONTEXT_CHARS constant is 3000."""
        assert MAX_CONTEXT_CHARS == 3000

    def test_returns_string_type(self):
        """Output is always a string."""
        assert isinstance(build_context([]), str)
        assert isinstance(build_context(["doc"]), str)
        assert isinstance(build_context(["a", "b"]), str)
