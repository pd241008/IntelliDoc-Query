from pydantic import BaseModel
from typing import List

class CleanTextContract(BaseModel):
    file_id: str
    cleaned_text: str


class EmbeddingContract(BaseModel):
    file_id: str
    cleaned_text: str
    embedding: List[float]


class StorageResultContract(BaseModel):
    file_id: str
