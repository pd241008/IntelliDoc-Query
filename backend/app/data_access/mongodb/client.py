from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
# Use the client to get the database, default to docsense if env var is missing
db_name = os.getenv("MONGO_DB_NAME", "docsense")
db = client[db_name]
