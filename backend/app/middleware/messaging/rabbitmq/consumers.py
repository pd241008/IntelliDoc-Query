import json
from .connection import get_connection

def consume(queue: str, handler):
    connection = get_connection()
    channel = connection.channel()

    channel.queue_declare(queue=queue, durable=True)
    channel.basic_qos(prefetch_count=1)

    def callback(ch, method, properties, body):
        msg = json.loads(body)
        handler(msg)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=queue, on_message_callback=callback)
    print(f"🚀 Listening on {queue}")
    channel.start_consuming()
