class SimpleLLM:
    """
    MVP placeholder.
    Replace with Gemini / HF / OpenAI later.
    """

    def generate(self, prompt: str) -> str:
        return (
            "This is a placeholder response.\n\n"
            "Prompt received:\n"
            f"{prompt[:500]}..."
        )
