"""
Fake Redis Stubs — Async & Sync

Dict-backed implementations that mirror the redis-py API surface
used by the IntelliDoc backend. No network calls, no dependencies.
"""

from typing import Any, Optional


class FakeSyncRedis:
    """
    Drop-in replacement for redis.Redis (sync).

    Used by:
      - redis_repo_sync.py (health system)
      - ingestion_tasks.py (pipeline claim-check pattern)
    """

    def __init__(self, store: Optional[dict] = None):
        self._store: dict = store if store is not None else {}

    def ping(self) -> bool:
        return True

    def get(self, key: str) -> Optional[str]:
        return self._store.get(key)

    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        self._store[key] = value
        return True

    def delete(self, *keys: str) -> int:
        count = 0
        for key in keys:
            if key in self._store:
                del self._store[key]
                count += 1
        return count

    def exists(self, key: str) -> int:
        return 1 if key in self._store else 0

    def hset(self, name: str, key: str, value: Any) -> int:
        if name not in self._store:
            self._store[name] = {}
        self._store[name][key] = value
        return 1

    def hget(self, name: str, key: str) -> Optional[str]:
        bucket = self._store.get(name)
        if isinstance(bucket, dict):
            return bucket.get(key)
        return None

    def hdel(self, name: str, *keys: str) -> int:
        bucket = self._store.get(name)
        if not isinstance(bucket, dict):
            return 0
        count = 0
        for key in keys:
            if key in bucket:
                del bucket[key]
                count += 1
        return count


class FakeAsyncRedis:
    """
    Drop-in replacement for redis.asyncio.Redis (async).

    Used by:
      - redis_repo.py (status updates, OCR cache, pipeline activity)
    """

    def __init__(self):
        self._store: dict = {}

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> Optional[bytes]:
        return self._store.get(key)

    async def set(
        self, key: str, value: Any, ex: Optional[int] = None
    ) -> bool:
        # Store as-is (bytes or str) — matches redis decode_responses=False
        self._store[key] = value
        return True

    async def delete(self, *keys: str) -> int:
        count = 0
        for key in keys:
            if key in self._store:
                del self._store[key]
                count += 1
        return count

    async def exists(self, key: str) -> int:
        return 1 if key in self._store else 0

    async def hset(self, name: str, key: str, value: Any) -> int:
        if name not in self._store:
            self._store[name] = {}
        self._store[name][key] = value
        return 1

    async def hget(self, name: str, key: str) -> Optional[str]:
        bucket = self._store.get(name)
        if isinstance(bucket, dict):
            return bucket.get(key)
        return None
