from datetime import datetime
from data_access.mongodb.connections import search_results_collection


class SearchResultRepository:

    @staticmethod
    def insert_result(
        pipeline_id: str,
        answer: str,
        results: list[dict]
    ):
        search_results_collection.insert_one({
            "pipeline_id": pipeline_id,
            "answer": answer,
            "results": results,
            "created_at": datetime.utcnow()
        })
