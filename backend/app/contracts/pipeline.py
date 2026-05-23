from pydantic import BaseModel
from typing import List, Dict, Any

# -----------------------------
# 1️⃣ Input to ingestion pipeline
# -----------------------------
class IngestionStartContract(BaseModel):
    file_id: str
    raw_text: str


# -----------------------------
# 2️⃣ After cleaning
# -----------------------------
class CleanTextContract(BaseModel):
    file_id: str
    cleaned_text: str


# -----------------------------
# 3️⃣ After embedding
# -----------------------------
class EmbeddingContract(BaseModel):
    file_id: str
    cleaned_text: str
    embedding: List[float]


# -----------------------------
# 4️⃣ Storage confirmation
# -----------------------------
class StorageResultContract(BaseModel):
    file_id: str
    status: str  # STORED / FAILED
