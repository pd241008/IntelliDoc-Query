"""
Fake LLM Generation Stub

Returns a static, deterministic response instead of calling
any live LLM API (OpenAI, Gemini, HuggingFace, etc.).
"""

MOCK_LLM_RESPONSE = (
    "This is a mocked LLM response based on the provided context."
)


def mock_generate_answer(query: str, context: str) -> str:
    """
    Drop-in replacement for app.rag.llm_stub.generate_answer.
    Returns a static string for deterministic assertions.
    """
    return MOCK_LLM_RESPONSE
