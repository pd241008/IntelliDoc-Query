# app/scripts/test_vector_search.py

from sentence_transformers import SentenceTransformer
from chromadb import CloudClient
import os
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------
# ENV
# ---------------------------------------------------------
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "docsense")

# ---------------------------------------------------------
# EMBEDDING MODEL (SAME AS INGESTION)
# ---------------------------------------------------------
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# ---------------------------------------------------------
# CHROMA CLOUD CLIENT
# ---------------------------------------------------------
client = CloudClient(
    api_key=CHROMA_API_KEY,
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
)

collection = client.get_collection(CHROMA_COLLECTION_NAME)

# ---------------------------------------------------------
# TEST QUERY
# ---------------------------------------------------------
query = "What is this document about?"

query_embedding = model.encode(
    query,
    normalize_embeddings=True
).tolist()

# ---------------------------------------------------------
# VECTOR SEARCH
# ---------------------------------------------------------
results = collection.query(
    query_embeddings=[query_embedding],
    n_results=3
)

print("\n🔍 Retrieved Documents:\n")

documents = results.get("documents")

if not documents or not documents[0]:
    print("❌ No documents found in vector DB")
else:
    print("\n🔍 Retrieved Documents:\n")
    for idx, doc in enumerate(documents[0]):
        print(f"Result {idx + 1}:")
        print(doc[:300])
        print("-" * 50)
