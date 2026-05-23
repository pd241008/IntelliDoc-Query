import os
from typing import List, Dict, Any
import chromadb
from chromadb.types import Metadata
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
MAIN_COLLECTION_NAME = "docsense"

def _get_collection():
    """
    Core connection logic. Connects to ChromaDB Cloud and returns the main collection.
    This ensures both FastAPI and Celery use the exact same connection parameters.
    """
    api_key = os.getenv("CHROMA_API_KEY")
    if not api_key:
        raise ValueError("CHROMA_API_KEY must be set in environment variables.")

    client = chromadb.CloudClient(
        api_key=api_key,
        tenant=os.getenv("CHROMA_TENANT", "default_tenant"),
        database=os.getenv("CHROMA_DATABASE", "default_database"),
    )
    
    return client.get_or_create_collection(name=MAIN_COLLECTION_NAME)


# -----------------------------
# WRITE (Used by Celery Worker)
# -----------------------------
def save_document_embeddings(
    ids: List[str], 
    documents: List[str], 
    embeddings: Any,  # ✅ Fixed Error 1: Changed to Any to satisfy Pylance's strict checks
    metadatas: List[Metadata]
):
    """Saves chunked documents and their embeddings to ChromaDB."""
    collection = _get_collection()
    
    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )
    print(f"[DB] Successfully saved {len(ids)} chunks to ChromaDB.")


# -----------------------------
# READ (Used by FastAPI)
# -----------------------------
def query_documents(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Queries the database for similar documents based on text."""
    collection = _get_collection()

    result = collection.query(
        query_texts=[query],
        n_results=limit,
    )

    if not result:
        return []

    # ✅ Fixed Errors 2, 3, 4: Safely handling the Optional return types before subscripting
    docs_list = result.get("documents")
    metas_list = result.get("metadatas")
    dists_list = result.get("distances")

    docs = docs_list[0] if docs_list else []
    metas = metas_list[0] if metas_list else []
    dists = dists_list[0] if dists_list else []

    return [
        {
            "text": doc,
            "metadata": meta,
            "score": 1 - dist if dist is not None else None,
        }
        for doc, meta, dist in zip(docs, metas, dists)
    ]


# -----------------------------
# Health Check / Verification
# -----------------------------
def ping_database() -> bool:
    """
    A lightweight check to see if the database is reachable.
    Used for the health dashboard and CLI verification.
    """
    try:
        _get_collection()
        return True
    except Exception as e:
        print(f"❌ DB Ping Failed: {e}")
        return False


# --- Standalone Script Execution ---
if __name__ == "__main__":
    print("🚀 Starting ChromaDB Connection Test...")
    is_connected = ping_database()
    
    if is_connected:
        print("✨ Database connection verified successfully! ✨")
        exit(0)
    else:
        print("❌ Database connection failed.")
        exit(1)