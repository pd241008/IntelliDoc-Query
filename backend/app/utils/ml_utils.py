# app/utils/ml_utils.py

from typing import List, Dict
import os
from chromadb import CloudClient
from dotenv import load_dotenv

load_dotenv()
from sentence_transformers import SentenceTransformer
import uuid

# --------------------------------------------------
# GLOBAL INITIALIZATION (safe for workers)
# --------------------------------------------------

# Sentence Transformer model (load once per worker)
_embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "docsense")

# Chroma client (Cloud connection)
_chroma_client = CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
)

_collection = _chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION_NAME
)

# --------------------------------------------------
# TEXT UTILITIES
# --------------------------------------------------

def clean_text_utility(text: str) -> str:
    """
    Basic text cleaning.
    Extend later with spaCy / regex / heuristics.
    """
    return text.strip().lower()


def generate_metadata_utility(text: str) -> Dict:
    """
    Generate lightweight metadata.
    """
    return {
        "source": "ocr",
        "char_count": len(text)
    }


# --------------------------------------------------
# CHUNKING
# --------------------------------------------------

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits text into overlapping chunks.
    """
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap

    return chunks


# --------------------------------------------------
# EMBEDDINGS
# --------------------------------------------------

def create_embeddings_utility(text: str) -> List[Dict]:
    """
    Returns a list of:
    [
        {
            "chunk": "...",
            "embedding": [...]
        }
    ]
    """
    chunks = chunk_text(text)
    embeddings = _embedding_model.encode(chunks, convert_to_list=True)

    return [
        {
            "chunk": chunk,
            "embedding": embedding
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]


# --------------------------------------------------
# CHROMA STORAGE
# --------------------------------------------------

def store_data_in_chroma(
    file_id: str,
    chunks_with_embeddings: List[Dict],
    metadata: Dict
):
    """
    Stores embeddings in ChromaDB.
    Persistence is AUTOMATIC.
    """

    ids = []
    documents = []
    embeddings = []
    metadatas = []

    for idx, item in enumerate(chunks_with_embeddings):
        ids.append(f"{file_id}_{idx}_{uuid.uuid4().hex[:6]}")
        documents.append(item["chunk"])
        embeddings.append(item["embedding"])

        metadatas.append({
            **metadata,
            "file_id": file_id,
            "chunk_index": idx
        })

    _collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

    print(f"✔ Stored {len(ids)} chunks in ChromaDB for file_id={file_id}")
