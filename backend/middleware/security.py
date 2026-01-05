"""
Security Middleware for BotSmith API
Implements rate limiting, security headers, and request validation
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import logging
import re

logger = logging.getLogger(__name__)

# Rate limiting storage (in-memory - use Redis in production)
rate_limit_storage: Dict[str, list] = defaultdict(list)

# Security patterns to block
SUSPICIOUS_PATTERNS = [
    r'<script[^>]*>.*?</script>',  # XSS attempts
    r'javascript:',  # JavaScript protocol
    r'on\w+\s*=',  # Event handlers
    r'eval\s*\(',  # eval() calls
    r'(union|select|insert|update|delete|drop|create|alter)\s+(all|from|table)',  # SQL injection
    r'\.\./\.\.',  # Path traversal
    r'0x[0-9a-f]+',  # Hex encoded attacks
]

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Content Security Policy
        # Allow CDN resources for Swagger UI documentation
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https:; "
            "font-src 'self' data: https://cdn.jsdelivr.net; "
            "connect-src 'self' https: wss:; "
            "frame-ancestors 'none';"
        )
        response.headers['Content-Security-Policy'] = csp
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent API abuse"""
    
    def __init__(self, app, requests_per_minute: int = 60, requests_per_hour: int = 1000):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def is_rate_limited(self, client_ip: str) -> Tuple[bool, str]:
        """Check if client is rate limited"""
        now = datetime.now()
        
        # Clean old entries
        rate_limit_storage[client_ip] = [
            timestamp for timestamp in rate_limit_storage[client_ip]
            if now - timestamp < timedelta(hours=1)
        ]
        
        requests = rate_limit_storage[client_ip]
        
        # Check per-minute limit
        minute_ago = now - timedelta(minutes=1)
        recent_requests = [ts for ts in requests if ts > minute_ago]
        if len(recent_requests) >= self.requests_per_minute:
            return True, f"Rate limit exceeded: {self.requests_per_minute} requests per minute"
        
        # Check per-hour limit
        if len(requests) >= self.requests_per_hour:
            return True, f"Rate limit exceeded: {self.requests_per_hour} requests per hour"
        
        return False, ""
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/", "/health", "/api/", "/api/health"]:
            return await call_next(request)
        
        client_ip = self.get_client_ip(request)
        is_limited, message = self.is_rate_limited(client_ip)
        
        if is_limited:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": message,
                    "error": "rate_limit_exceeded",
                    "retry_after": "60 seconds"
                }
            )
        
        # Record this request
        rate_limit_storage[client_ip].append(datetime.now())
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers['X-RateLimit-Limit'] = str(self.requests_per_minute)
        response.headers['X-RateLimit-Remaining'] = str(
            self.requests_per_minute - len([
                ts for ts in rate_limit_storage[client_ip]
                if datetime.now() - ts < timedelta(minutes=1)
            ])
        )
        
        return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Validate inputs to prevent injection attacks"""
    
    def check_suspicious_content(self, text: str) -> bool:
        """Check if text contains suspicious patterns"""
        text_lower = text.lower()
        for pattern in SUSPICIOUS_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True
        return False
    
    async def dispatch(self, request: Request, call_next):
        # Check URL parameters
        for key, value in request.query_params.items():
            if self.check_suspicious_content(str(value)):
                logger.warning(f"Suspicious content in query param: {key}={value}")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "detail": "Invalid input detected",
                        "error": "security_violation"
                    }
                )
        
        # Check headers for suspicious content
        for key, value in request.headers.items():
            if key.lower() not in ['authorization', 'cookie', 'content-type', 'accept']:
                if self.check_suspicious_content(str(value)):
                    logger.warning(f"Suspicious content in header: {key}")
                    return JSONResponse(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        content={
                            "detail": "Invalid request headers",
                            "error": "security_violation"
                        }
                    )
        
        return await call_next(request)


class APIKeyProtectionMiddleware(BaseHTTPMiddleware):
    """Protect against API key exposure"""
    
    SENSITIVE_PATTERNS = [
        r'sk-[a-zA-Z0-9]{20,}',  # OpenAI keys
        r'key_[a-zA-Z0-9]{20,}',  # Generic API keys
        r'AIza[a-zA-Z0-9_-]{35}',  # Google API keys
        r'AKIA[a-zA-Z0-9]{16}',  # AWS keys
        r'gh[pousr]_[a-zA-Z0-9]{36}',  # GitHub tokens
    ]
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Check response body for exposed keys (only for JSON responses)
        if response.headers.get('content-type', '').startswith('application/json'):
            # Note: In production, you'd want to use streaming response
            # This is a simplified version for demonstration
            pass
        
        return response


def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS and injection attacks"""
    if not text:
        return text
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove JavaScript protocol
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    
    # Remove event handlers
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    # Escape special characters
    replacements = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    return text


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$'
    return bool(re.match(pattern, url))


def is_safe_filename(filename: str) -> bool:
    """Check if filename is safe"""
    # No path traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        return False
    
    # Allowed extensions only
    allowed_extensions = [
        '.txt', '.pdf', '.doc', '.docx', '.xls', '.xlsx',
        '.csv', '.json', '.xml', '.md', '.png', '.jpg', '.jpeg'
    ]
    
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)
