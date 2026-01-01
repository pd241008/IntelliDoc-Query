from app.middleware.messaging.rabbitmq.consumers import consume

def handle(msg):
    print(f"✅ Semantic pipeline closed for {msg['user_id']}")

consume("semantic.cleanup", handle)
