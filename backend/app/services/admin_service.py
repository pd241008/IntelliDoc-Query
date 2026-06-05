from app.data_access.mongodb.admin_repo import (
    get_admin_stats,
    get_all_users,
    get_system_info,
)


def fetch_dashboard_stats() -> dict:
    """
    Service layer — orchestrates admin data retrieval.
    Isolated here so the router stays thin and this logic can be unit-tested independently.
    """
    return get_admin_stats()


def fetch_all_users() -> list:
    """Returns all users derived from document ownership records."""
    return get_all_users()


def fetch_system_info() -> dict:
    """Returns read-only platform and database metadata."""
    return get_system_info()

