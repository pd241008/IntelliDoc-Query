from app.middleware.messaging.rabbitmq.consumers import consume
from app.middleware.messaging.rabbitmq.producers import publish_message
from app.services.llm_chain import run_llm

def handle(msg):
    answer = run_llm(msg["query"], msg["docs"])

    publish_message(
        queue="semantic.store",
        message={
            "user_id": msg["user_id"],
            "answer": answer
        }
    )

consume("semantic.llm", handle)