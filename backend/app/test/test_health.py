from app.core.config.health import mark_broker, mark_vector_db, mark_pipeline

mark_broker("connected")
mark_vector_db("connected")
mark_pipeline("ingestion", "idle")
mark_pipeline("semantic_search", "idle")