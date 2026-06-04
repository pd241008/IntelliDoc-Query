from app.data_access.mongodb.admin_repo import get_admin_stats


def fetch_dashboard_stats() -> dict:
    """
    Service layer — orchestrates admin data retrieval.
    Isolated here so the router stays thin and this logic can be unit-tested independently.
    """
    return get_admin_stats()
