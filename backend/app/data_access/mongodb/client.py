from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Ensure .env is loaded (path relative to backend/app/data_access/mongodb)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".env"))
client = MongoClient(os.getenv("MONGO_URI"))
# Use the client to get the database, default to docsense if env var is missing
db_name = os.getenv("MONGO_DB_NAME", "docsense")
db = client[db_name]
