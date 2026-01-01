from services.search_service import semantic_search
from middleware.messaging.rabbitmq.producers import publish_message

def handle_search(message: dict):
    query = message["query"]

    results = semantic_search(query)

    publish_message(
        queue="llm_queue",
        message={
            "query": query,
            "results": results
        }
    )
