from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CacheService:
    """
    Simple in-memory cache service with TTL (Time To Live)
    Used for caching frequently accessed data like chatbot settings
    """
    
    def __init__(self, default_ttl_seconds: int = 300):
        """
        Initialize cache service
        
        Args:
            default_ttl_seconds: Default time to live for cache entries (5 minutes)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds
        self.hits = 0
        self.misses = 0
        logger.info(f"Cache service initialized with {default_ttl_seconds}s TTL")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        if key not in self._cache:
            self.misses += 1
            return None
        
        entry = self._cache[key]
        
        # Check if expired
        if datetime.now() > entry["expires_at"]:
            del self._cache[key]
            self.misses += 1
            return None
        
        self.hits += 1
        return entry["value"]
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Optional custom TTL (uses default if not provided)
        """
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expires_at = datetime.now() + timedelta(seconds=ttl)
        
        self._cache[key] = {
            "value": value,
            "expires_at": expires_at,
            "created_at": datetime.now()
        }
    
    def delete(self, key: str):
        """Delete a key from cache"""
        if key in self._cache:
            del self._cache[key]
    
    def clear(self):
        """Clear all cache entries"""
        self._cache.clear()
        self.hits = 0
        self.misses = 0
        logger.info("Cache cleared")
    
    def clear_expired(self):
        """Remove all expired entries"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self._cache.items()
            if now > entry["expires_at"]
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"Cleared {len(expired_keys)} expired cache entries")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "size": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "total_requests": total_requests
        }


# Global cache instance
cache_service = CacheService(default_ttl_seconds=300)  # 5 minutes default TTL
