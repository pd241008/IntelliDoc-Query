from app.data_access.mongodb.client import db
from typing import Any

documents_collection = db["documents"]


def get_admin_stats() -> dict[str, Any]:
    """
    Queries MongoDB to return aggregate stats for the admin dashboard.
    Counts total documents, unique users, and a rough storage estimate.
    """
    total_docs = documents_collection.count_documents({})
    unique_users = len(documents_collection.distinct("auth0Id"))

    # Pull the most recent 10 activity events ordered by creation time
    recent_activity_cursor = documents_collection.find(
        {},
        {"filename": 1, "auth0Id": 1, "createdAt": 1, "status": 1, "_id": 0},
    ).sort("createdAt", -1).limit(10)

    recent_activity = [
        {
            "action": f"Document Uploaded: {doc.get('filename', 'Unknown')}",
            "user": doc.get("auth0Id", "SYSTEM"),
            "time": doc["createdAt"].isoformat() if doc.get("createdAt") else "Unknown",
        }
        for doc in recent_activity_cursor
    ]

    return {
        "total_documents": total_docs,
        "active_users": unique_users,
        "recent_activity": recent_activity,
    }
