import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("CHROMA_API_KEY")
if not api_key:
    raise ValueError("CHROMA_API_KEY not set in environment variables.")

# Use CloudClient with your API key
client = chromadb.CloudClient(api_key=api_key)

collection = client.get_or_create_collection(name="test_collection_verification")

# Example adding a vector
import numpy as np

ids = ["id1", "id2"]
documents = ["This is doc 1", "This is doc 2"]
embeddings = np.array([[0.1, 0.2], [0.3, 0.4]], dtype=np.float32)

collection.add(
    embeddings=embeddings,
    documents=documents,
    ids=ids,
    metadatas=[{"source": "sdk-test"}, {"source": "sdk-test"}]
)

print("✅ Data added to cloud collection!")
