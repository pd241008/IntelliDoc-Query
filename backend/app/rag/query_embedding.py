from sentence_transformers import SentenceTransformer


_query_embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

def embed_query(query: str) -> list[float]:
    """
    Converts user query into vector embedding.
    """
    embedding = _query_embedding_model.encode(
        query,
        normalize_embeddings=True,
    )
    return embedding.tolist()
