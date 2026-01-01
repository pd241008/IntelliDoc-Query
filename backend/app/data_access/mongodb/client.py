from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = MongoClient(os.getenv("MONGO_DB"))
