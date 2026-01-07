from app.middleware.messaging.rabbitmq.consumers import consume
from app.middleware.messaging.rabbitmq.producers import publish_message
from app.data_access.chromadb.search_repo import query_documents
from app.core.config.health import mark_pipeline


def handle_search(message: dict):
    pipeline_id = message["pipeline_id"]
    query = message["query"]

    mark_pipeline(pipeline_id, "running")

    results = query_documents(query)

    publish_message(
        queue="semantic.search.completed",
        message={
            "pipeline_id": pipeline_id,
            "results": results,
        }
    )


if __name__ == "__main__":
    consume(
        queue="semantic.search.requested",
        handler=handle_search
    )
