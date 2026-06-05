from app.data_access.mongodb.client import db
from typing import Any
import platform
import sys

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


def get_all_users() -> list[dict[str, Any]]:
    """
    Returns one row per unique user (auth0Id) with their document count
    and the date of their most recent upload.
    """
    pipeline = [
        {
            "$group": {
                "_id": "$auth0Id",
                "document_count": {"$sum": 1},
                "last_active": {"$max": "$createdAt"},
                "statuses": {"$addToSet": "$status"},
            }
        },
        {"$sort": {"last_active": -1}},
        {"$limit": 200},  # Safety cap
    ]
    results = list(documents_collection.aggregate(pipeline))
    return [
        {
            "user_id": r["_id"] or "Unknown",
            "document_count": r["document_count"],
            "last_active": r["last_active"].isoformat() if r.get("last_active") else None,
            "statuses": list(r.get("statuses", [])),
        }
        for r in results
    ]


def get_system_info() -> dict[str, Any]:
    """
    Returns read-only system metadata useful on a settings/info page.
    Does NOT expose any secrets or mutable config.
    """
    # MongoDB server info
    try:
        server_info = db.client.server_info()
        mongo_version = server_info.get("version", "unknown")
        mongo_status = "connected"
    except Exception:
        mongo_version = "unknown"
        mongo_status = "disconnected"

    # Collection stats
    total_docs = documents_collection.count_documents({})
    total_users = len(documents_collection.distinct("auth0Id"))
    indexed_docs = documents_collection.count_documents({"vectorIndexed": True})
    pending_docs = documents_collection.count_documents({"status": "pending"})

    return {
        "platform": {
            "python_version": sys.version.split()[0],
            "os": platform.system(),
            "arch": platform.machine(),
        },
        "database": {
            "status": mongo_status,
            "mongo_version": mongo_version,
            "db_name": db.name,
        },
        "data": {
            "total_documents": total_docs,
            "total_users": total_users,
            "vector_indexed": indexed_docs,
            "pending_processing": pending_docs,
        },
    }
