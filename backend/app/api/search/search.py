import uuid
from app.middleware.messaging.rabbitmq.producers import publish_message
from app.core.config.health import mark_pipeline


def trigger_semantic_search_pipeline(query: str, user_id: str):
    """
    Pipeline trigger only.
    """
    pipeline_id = str(uuid.uuid4())

    mark_pipeline(pipeline_id, "started")

    publish_message(
        queue="semantic.search.requested",
        message={
            "pipeline_id": pipeline_id,
            "query": query,
            "user_id": user_id,
        }
    )

    return {
        "status": "accepted",
        "pipeline_id": pipeline_id,
        "message": "Semantic search pipeline started",
    }
    