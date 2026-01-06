def build_context(documents: list[str], max_chars: int = 4000) -> str:
    """
    Builds an LLM-ready context string from retrieved documents.
    Trims safely to avoid token overflow.
    """
    context = "\n\n---\n\n".join(documents)

    # Safety trim (MVP)
    if len(context) > max_chars:
        context = context[:max_chars]

    return context
