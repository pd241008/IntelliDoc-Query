from app.middleware.messaging.rabbitmq.producers import publish_message

def semantic_search(query: str, user_id: str):
    publish_message(
        queue="semantic.search",
        message={
            "query": query,
            "user_id": user_id
        }
    )
    return {"status": "Semantic search started"}
