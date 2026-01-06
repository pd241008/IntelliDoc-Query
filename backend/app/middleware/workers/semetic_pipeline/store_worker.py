from app.middleware.messaging.rabbitmq.consumers import consume
from app.core.config.health import mark_pipeline
from data_access.mongodb.search_result_repository import SearchResultRepository


def handle_store(message: dict):
    pipeline_id = message["pipeline_id"]
    answer = message["answer"]
    results = message["results"]

    mark_pipeline(pipeline_id, "running")

    SearchResultRepository.insert_result(
        pipeline_id=pipeline_id,
        answer=answer,
        results=results
    )

    mark_pipeline(pipeline_id, "completed")


if __name__ == "__main__":
    consume(
        queue="semantic.llm.completed",
        handler=handle_store
    )
