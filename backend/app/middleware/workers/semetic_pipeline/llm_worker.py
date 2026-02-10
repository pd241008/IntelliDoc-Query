from app.middleware.messaging.rabbitmq.consumers import consume
from app.middleware.messaging.rabbitmq.producers import publish_message
from app.services.llm_chain_service import run_llm
from app.core.config.health import mark_pipeline


def handle_llm(message: dict):
    pipeline_id = message["pipeline_id"]
    results = message["results"]

    mark_pipeline(pipeline_id, "running")

    # Extract docs text for LLM
    docs = [r["text"] for r in results]

    answer = run_llm(
        query=message.get("query", ""),
        docs=docs
    )

    publish_message(
        queue="semantic.llm.completed",
        message={
            "pipeline_id": pipeline_id,
            "answer": answer,
            "results": results
        }
    )


if __name__ == "__main__":
    consume(
        queue="semantic.search.completed",
        handler=handle_llm
    )
