from app.rag.context_builder import build_context

docs = [
    "Invoice dated 11 December 2025. Total: $1,950.",
    "Customer name: John Doe."
]

context = build_context(docs)
print(context)
