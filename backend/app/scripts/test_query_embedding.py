from app.rag.query_embedding import embed_query

query = "What is the contract duration?"

embedding = embed_query(query)

print("Embedding type:", type(embedding))
print("Embedding length:", len(embedding))
print("First 5 values:", embedding[:5])
