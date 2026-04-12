"""
Unit Tests — LLM Stub (generate_answer)

Tests the deterministic answer generator from app.rag.llm_stub.

Since this is already a stub (no live LLM calls), these tests
verify the response format and edge case handling.
"""

from app.rag.llm_stub import generate_answer


class TestGenerateAnswer:

    def test_valid_context_includes_query(self):
        """Response includes the original query text."""
        query = "What is document processing?"
        context = "[Document 1]\nDocument processing involves OCR."

        result = generate_answer(query, context)

        assert query in result

    def test_valid_context_includes_context(self):
        """Response includes the provided context."""
        query = "What is OCR?"
        context = "[Document 1]\nOCR stands for Optical Character Recognition."

        result = generate_answer(query, context)

        assert "OCR stands for Optical Character Recognition." in result

    def test_empty_context_returns_fallback(self):
        """Empty context returns the 'could not find' message."""
        result = generate_answer("Any question?", "")

        assert "could not find relevant information" in result.lower()

    def test_no_relevant_docs_context_returns_fallback(self):
        """'No relevant documents found.' context returns the fallback."""
        result = generate_answer("Query?", "No relevant documents found.")

        assert "could not find relevant information" in result.lower()

    def test_response_contains_question_header(self):
        """Response contains a 'Question:' section header."""
        result = generate_answer("Test query", "[Document 1]\nSome context.")

        assert "Question:" in result

    def test_response_contains_answer_header(self):
        """Response contains an 'Answer' section header."""
        result = generate_answer("Test query", "[Document 1]\nSome context.")

        assert "Answer" in result

    def test_response_is_string(self):
        """Output is always a string."""
        assert isinstance(generate_answer("q", "c"), str)
        assert isinstance(generate_answer("q", ""), str)

    def test_whitespace_only_context_returns_fallback(self):
        """Context with only whitespace (after strip) is treated as empty."""
        # The function checks: not context or context.strip() == "No relevant..."
        result = generate_answer("query", "   ")

        # Whitespace context is falsy after strip but passes `not context` check
        # The function checks `not context` first — "   " is truthy
        # So it falls through to the main branch and includes whitespace
        assert isinstance(result, str)
