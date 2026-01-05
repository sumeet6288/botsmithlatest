"""Performance optimization middleware for handling high concurrent load"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import logging
import asyncio
from typing import Callable

logger = logging.getLogger(__name__)


class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce request timeouts to prevent resource exhaustion"""
    
    def __init__(self, app: ASGIApp, timeout: int = 30):
        super().__init__(app)
        self.timeout = timeout
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            # Set timeout for request processing
            response = await asyncio.wait_for(
                call_next(request),
                timeout=self.timeout
            )
            return response
        except asyncio.TimeoutError:
            logger.warning(f"Request timeout for {request.url.path}")
            return Response(
                content="Request timeout",
                status_code=504,
                media_type="text/plain"
            )
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            raise


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor request performance and log slow requests"""
    
    def __init__(self, app: ASGIApp, slow_request_threshold: float = 5.0):
        super().__init__(app)
        self.slow_request_threshold = slow_request_threshold
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        
        # Log slow requests for performance monitoring
        if process_time > self.slow_request_threshold:
            logger.warning(
                f"Slow request detected: {request.method} {request.url.path} "
                f"took {process_time:.2f}s"
            )
        
        # Add performance headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class ConnectionPoolMiddleware(BaseHTTPMiddleware):
    """Middleware to manage database connections efficiently"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Database connections are managed by Motor's connection pool
        # This middleware can be extended to add connection health checks
        response = await call_next(request)
        return response


class AsyncConcurrencyLimiter:
    """Limit concurrent async operations to prevent resource exhaustion"""
    
    def __init__(self, limit: int = 1000):
        self.semaphore = asyncio.Semaphore(limit)
        self.limit = limit
        logger.info(f"✅ Async concurrency limiter initialized with limit: {limit}")
    
    async def __aenter__(self):
        await self.semaphore.acquire()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.semaphore.release()


# Global concurrency limiter instance
concurrency_limiter = AsyncConcurrencyLimiter(limit=1000)
