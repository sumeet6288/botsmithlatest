"""Scalability Configuration for Handling 1000+ Concurrent Users

This module provides optimized configuration for MongoDB connection pooling,
FastAPI server settings, and async operations to handle high concurrent load.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class ScalabilityConfig:
    """Configuration for high-performance scalable operations"""
    
    # MongoDB Connection Pool Settings
    MONGO_MAX_POOL_SIZE = int(os.getenv('MONGO_MAX_POOL_SIZE', '100'))  # Max connections in pool
    MONGO_MIN_POOL_SIZE = int(os.getenv('MONGO_MIN_POOL_SIZE', '10'))   # Min connections always available
    MONGO_MAX_IDLE_TIME_MS = int(os.getenv('MONGO_MAX_IDLE_TIME_MS', '45000'))  # 45 seconds
    MONGO_WAIT_QUEUE_TIMEOUT_MS = int(os.getenv('MONGO_WAIT_QUEUE_TIMEOUT_MS', '10000'))  # 10 seconds
    MONGO_SERVER_SELECTION_TIMEOUT_MS = int(os.getenv('MONGO_SERVER_SELECTION_TIMEOUT_MS', '30000'))  # 30 seconds
    MONGO_CONNECT_TIMEOUT_MS = int(os.getenv('MONGO_CONNECT_TIMEOUT_MS', '20000'))  # 20 seconds
    
    # FastAPI/Uvicorn Settings
    UVICORN_WORKERS = int(os.getenv('UVICORN_WORKERS', '4'))  # Number of worker processes
    UVICORN_BACKLOG = int(os.getenv('UVICORN_BACKLOG', '2048'))  # Socket backlog size
    UVICORN_TIMEOUT_KEEP_ALIVE = int(os.getenv('UVICORN_TIMEOUT_KEEP_ALIVE', '5'))  # Keep-alive timeout
    
    # Request/Response Settings
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))  # Request timeout in seconds
    MAX_REQUEST_SIZE = int(os.getenv('MAX_REQUEST_SIZE', '104857600'))  # 100MB max upload
    
    # Async Operation Settings
    ASYNC_CONCURRENCY_LIMIT = int(os.getenv('ASYNC_CONCURRENCY_LIMIT', '1000'))  # Max concurrent async tasks
    ASYNC_TIMEOUT = int(os.getenv('ASYNC_TIMEOUT', '60'))  # Async operation timeout
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', '200'))
    RATE_LIMIT_PER_HOUR = int(os.getenv('RATE_LIMIT_PER_HOUR', '5000'))
    
    # WebSocket Settings
    WEBSOCKET_MAX_CONNECTIONS = int(os.getenv('WEBSOCKET_MAX_CONNECTIONS', '10000'))
    WEBSOCKET_PING_INTERVAL = int(os.getenv('WEBSOCKET_PING_INTERVAL', '30'))
    WEBSOCKET_PING_TIMEOUT = int(os.getenv('WEBSOCKET_PING_TIMEOUT', '10'))
    
    # Caching Settings
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'true').lower() == 'true'
    CACHE_TTL = int(os.getenv('CACHE_TTL', '300'))  # 5 minutes default
    
    @classmethod
    def get_optimized_mongo_client(cls, mongo_url: str) -> AsyncIOMotorClient:
        """Create an optimized MongoDB client with connection pooling
        
        This client is configured to handle 1000+ concurrent connections efficiently:
        - Connection pooling with 10-100 connections
        - Automatic connection recycling
        - Proper timeout settings
        - Connection health monitoring
        """
        client = AsyncIOMotorClient(
            mongo_url,
            maxPoolSize=cls.MONGO_MAX_POOL_SIZE,
            minPoolSize=cls.MONGO_MIN_POOL_SIZE,
            maxIdleTimeMS=cls.MONGO_MAX_IDLE_TIME_MS,
            waitQueueTimeoutMS=cls.MONGO_WAIT_QUEUE_TIMEOUT_MS,
            serverSelectionTimeoutMS=cls.MONGO_SERVER_SELECTION_TIMEOUT_MS,
            connectTimeoutMS=cls.MONGO_CONNECT_TIMEOUT_MS,
            # Enable retryable writes for better reliability
            retryWrites=True,
            # Enable retryable reads
            retryReads=True,
            # Compression for better network performance
            compressors='snappy,zlib',
            # Use secondary reads to distribute load (for replica sets)
            # readPreference='secondaryPreferred',
        )
        
        logger.info(f"✅ MongoDB client created with optimized connection pool:")
        logger.info(f"   - Pool size: {cls.MONGO_MIN_POOL_SIZE}-{cls.MONGO_MAX_POOL_SIZE} connections")
        logger.info(f"   - Max idle time: {cls.MONGO_MAX_IDLE_TIME_MS}ms")
        logger.info(f"   - Connection timeout: {cls.MONGO_CONNECT_TIMEOUT_MS}ms")
        logger.info(f"   - Retryable operations: enabled")
        
        return client
    
    @classmethod
    def log_configuration(cls):
        """Log current scalability configuration"""
        logger.info("="*80)
        logger.info("🚀 SCALABILITY CONFIGURATION FOR HIGH CONCURRENT LOAD")
        logger.info("="*80)
        logger.info(f"MongoDB Connection Pool:")
        logger.info(f"  - Pool size: {cls.MONGO_MIN_POOL_SIZE} - {cls.MONGO_MAX_POOL_SIZE} connections")
        logger.info(f"  - Max idle time: {cls.MONGO_MAX_IDLE_TIME_MS}ms")
        logger.info(f"  - Wait queue timeout: {cls.MONGO_WAIT_QUEUE_TIMEOUT_MS}ms")
        logger.info(f"")
        logger.info(f"Uvicorn Server:")
        logger.info(f"  - Workers: {cls.UVICORN_WORKERS} processes")
        logger.info(f"  - Backlog: {cls.UVICORN_BACKLOG} connections")
        logger.info(f"  - Keep-alive: {cls.UVICORN_TIMEOUT_KEEP_ALIVE}s")
        logger.info(f"")
        logger.info(f"Async Operations:")
        logger.info(f"  - Concurrency limit: {cls.ASYNC_CONCURRENCY_LIMIT} tasks")
        logger.info(f"  - Timeout: {cls.ASYNC_TIMEOUT}s")
        logger.info(f"")
        logger.info(f"WebSocket:")
        logger.info(f"  - Max connections: {cls.WEBSOCKET_MAX_CONNECTIONS}")
        logger.info(f"  - Ping interval: {cls.WEBSOCKET_PING_INTERVAL}s")
        logger.info(f"")
        logger.info(f"Rate Limiting:")
        logger.info(f"  - Per minute: {cls.RATE_LIMIT_PER_MINUTE} requests")
        logger.info(f"  - Per hour: {cls.RATE_LIMIT_PER_HOUR} requests")
        logger.info(f"")
        logger.info(f"Caching: {'Enabled' if cls.CACHE_ENABLED else 'Disabled'}")
        logger.info(f"  - TTL: {cls.CACHE_TTL}s")
        logger.info("="*80)


class ConnectionPoolMonitor:
    """Monitor MongoDB connection pool health"""
    
    def __init__(self, client: AsyncIOMotorClient):
        self.client = client
    
    async def get_pool_stats(self) -> dict:
        """Get current connection pool statistics"""
        try:
            # Get server info to verify connection
            await self.client.admin.command('ping')
            
            return {
                "status": "healthy",
                "max_pool_size": ScalabilityConfig.MONGO_MAX_POOL_SIZE,
                "min_pool_size": ScalabilityConfig.MONGO_MIN_POOL_SIZE,
                "message": "Connection pool is operational"
            }
        except Exception as e:
            logger.error(f"Connection pool health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Singleton instance for connection pool monitoring
pool_monitor: Optional[ConnectionPoolMonitor] = None

def initialize_pool_monitor(client: AsyncIOMotorClient):
    """Initialize connection pool monitor"""
    global pool_monitor
    pool_monitor = ConnectionPoolMonitor(client)
    logger.info("✅ Connection pool monitor initialized")


async def get_pool_health() -> dict:
    """Get connection pool health status"""
    if pool_monitor is None:
        return {"status": "not_initialized"}
    return await pool_monitor.get_pool_stats()
