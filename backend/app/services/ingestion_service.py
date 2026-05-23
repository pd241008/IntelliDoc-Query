from app.middleware.workers.ingestion_pipeline.ingestion_pipeline import start_ingestion_pipeline


def trigger_ingestion_pipeline(file_id: str, raw_text: str):
    """
    HTTP-safe ingestion pipeline trigger.
    """
    start_ingestion_pipeline(file_id, raw_text)
