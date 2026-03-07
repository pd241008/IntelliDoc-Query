import os
from dotenv import load_dotenv
from app.database.chromadb.chromaconnection import _get_collection

load_dotenv()

try:
    collection = _get_collection()
    count = collection.count()
    print(f"✅ Connection successful!")
    print(f"📊 Total documents in 'docsense' collection: {count}")
    
    if count > 0:
        print("🔍 Sample data:", collection.peek(1))
except Exception as e:
    print(f"❌ Error connecting to ChromaDB: {e}")