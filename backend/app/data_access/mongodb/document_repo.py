import datetime
from app.data_access.mongodb.client import db

documents_collection = db["documents"]

def create_document(file_id: str, client_id: str, filename: str):
    doc = {
        "file_id": file_id,
        "client_id": client_id,
        "filename": filename,
        "status": "UPLOADED",
        "created_at": datetime.datetime.utcnow()
    }
    documents_collection.insert_one(doc)

def get_document(file_id: str):
    return documents_collection.find_one({"file_id": file_id})
