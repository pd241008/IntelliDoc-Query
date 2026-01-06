import os
from chromadb import CloudClient
from dotenv import load_dotenv

load_dotenv()

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "docsense")

chroma_client = CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
)

collection = chroma_client.get_collection(
    name=CHROMA_COLLECTION_NAME
)

def retrieve_similar_chunks(
    query_embedding: list[float],
    top_k: int = 5
) -> list[str]:
    """
    Fetch top-k similar document chunks from Chroma.
    """

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    documents = results.get("documents", [])
    if not documents:
        return []

    # documents = [[chunk1, chunk2, ...]]
    return documents[0]
