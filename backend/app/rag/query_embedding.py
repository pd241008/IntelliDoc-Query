from sentence_transformers import SentenceTransformer

_query_embedding_model = None

def _get_model():
    global _query_embedding_model
    if _query_embedding_model is None:
        _query_embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _query_embedding_model

def embed_query(query: str) -> list[float]:
    """
    Converts user query into vector embedding.
    """
    embedding = _get_model().encode(
        query,
        normalize_embeddings=True,
    )
    return embedding.tolist()
