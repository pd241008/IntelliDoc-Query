"""
Unit Tests — Text Cleaning Utilities

Tests the clean_text_utility() function from app.utils.ml_utils
and the cleaning logic in ingestion_tasks.clean_text_task.
"""

from app.utils.ml_utils import clean_text_utility


class TestCleanTextUtility:

    def test_strips_leading_whitespace(self):
        """Leading whitespace is removed."""
        assert clean_text_utility("   hello") == "hello"

    def test_strips_trailing_whitespace(self):
        """Trailing whitespace is removed."""
        assert clean_text_utility("hello   ") == "hello"

    def test_strips_both_ends(self):
        """Both leading and trailing whitespace are removed."""
        assert clean_text_utility("  hello world  ") == "hello world"

    def test_lowercases_text(self):
        """Text is converted to lowercase."""
        assert clean_text_utility("Hello World") == "hello world"

    def test_lowercases_mixed_case(self):
        """Mixed case text is fully lowercased."""
        assert clean_text_utility("InTeLLiDoC PDF") == "intellidoc pdf"

    def test_preserves_internal_whitespace(self):
        """Internal whitespace is preserved."""
        assert clean_text_utility("hello   world") == "hello   world"

    def test_empty_string(self):
        """Empty string returns empty string."""
        assert clean_text_utility("") == ""

    def test_whitespace_only(self):
        """Whitespace-only string returns empty string."""
        assert clean_text_utility("   ") == ""

    def test_newlines_and_tabs(self):
        """Newlines and tabs at boundaries are stripped."""
        assert clean_text_utility("\n\thello\n\t") == "hello"

    def test_numbers_and_symbols(self):
        """Numbers and symbols are preserved (not affected by lowercase)."""
        result = clean_text_utility("  File123.PDF  ")
        assert result == "file123.pdf"

    def test_unicode_text(self):
        """Unicode characters are handled correctly."""
        result = clean_text_utility("  Héllo Wörld  ")
        assert result == "héllo wörld"

    def test_idempotent(self):
        """Applying clean twice produces the same result."""
        text = "  Some TEXT  "
        first = clean_text_utility(text)
        second = clean_text_utility(first)
        assert first == second


class TestIngestionTextCleaning:
    """
    Tests the inline cleaning logic used in clean_text_task:
        cleaned = " ".join(raw_ocr_text.split())

    This normalizes all whitespace (newlines, tabs, multiple spaces)
    into single spaces.
    """

    @staticmethod
    def _clean(text: str) -> str:
        """Mirrors the cleaning logic from clean_text_task."""
        return " ".join(text.split())

    def test_normalizes_multiple_spaces(self):
        """Multiple spaces collapsed to single space."""
        assert self._clean("hello    world") == "hello world"

    def test_normalizes_newlines(self):
        """Newlines are replaced with spaces."""
        assert self._clean("hello\nworld") == "hello world"

    def test_normalizes_tabs(self):
        """Tabs are replaced with spaces."""
        assert self._clean("hello\tworld") == "hello world"

    def test_normalizes_mixed_whitespace(self):
        """Mixed whitespace types are all normalized."""
        assert self._clean("hello \n\t  world") == "hello world"

    def test_strips_boundaries(self):
        """Leading and trailing whitespace is removed."""
        assert self._clean("  hello  ") == "hello"

    def test_ocr_page_break_normalization(self):
        """OCR page breaks are normalized to inline text."""
        text = "Page 1 content\n\n--- PAGE BREAK ---\n\nPage 2 content"
        result = self._clean(text)
        assert result == "Page 1 content --- PAGE BREAK --- Page 2 content"

    def test_empty_string(self):
        """Empty string returns empty string."""
        assert self._clean("") == ""

    def test_preserves_words(self):
        """Words themselves are never modified."""
        assert self._clean("IntelliDoc   PDF\nProcessor") == "IntelliDoc PDF Processor"
