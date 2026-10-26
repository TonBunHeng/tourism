import time
from typing import Any, Dict, Optional

class CacheService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired."""
        entry = self._cache.get(key)
        if not entry:
            return None
        
        now = time.time()
        if entry["expires_at"] <= now:
            del self._cache[key]
            return None
            
        return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: int = 3600, source: str = "memory") -> None:
        """Store value in cache with TTL."""
        now = time.time()
        self._cache[key] = {
            "value": value,
            "cached_at": now,
            "expires_at": now + ttl_seconds,
            "source": source
        }

    def get_with_meta(self, key: str) -> Optional[Dict[str, Any]]:
        """Get cached value along with metadata (cached_at, expires_at, source)."""
        entry = self._cache.get(key)
        if not entry:
            return None
            
        now = time.time()
        is_expired = entry["expires_at"] <= now
        return {
            "value": entry["value"],
            "cached_at": entry["cached_at"],
            "expires_at": entry["expires_at"],
            "is_expired": is_expired,
            "source": entry.get("source", "cache")
        }

    def clear(self) -> None:
        self._cache.clear()

cache_service = CacheService()
