import datetime
from app.data_access.mongodb.client import db

documents_collection = db["documents"]

def create_document(file_id: str, client_id: str, filename: str):
    doc = {
        "fileId": file_id,
        "auth0Id": client_id,
        "filename": filename,
        "fileUrl": "", # placeholder until uploaded
        "status": "pending",
        "vectorIndexed": False,
        "createdAt": datetime.datetime.utcnow(),
        "updatedAt": datetime.datetime.utcnow()
    }
    documents_collection.insert_one(doc)

def get_document(file_id: str):
    return documents_collection.find_one({"fileId": file_id})
