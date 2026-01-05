"""Supabase Configuration and JWT Token Verification

This module provides utilities for verifying Supabase JWT tokens locally
without making external API calls.
"""

import os
import jwt
from typing import Dict, Optional
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


def is_supabase_enabled() -> bool:
    """Check if Supabase is properly configured."""
    return bool(SUPABASE_URL and SUPABASE_JWT_SECRET)


def verify_supabase_token(token: str) -> Dict:
    """Verify Supabase JWT token locally using JWT secret.
    
    Args:
        token: The JWT token from Supabase
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or verification fails
    """
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase JWT secret not configured"
        )
    
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase tokens don't always have audience
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error verifying Supabase token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify token"
        )


def get_user_from_token(token: str) -> Dict:
    """Extract user information from verified Supabase JWT token.
    
    Args:
        token: The JWT token from Supabase
        
    Returns:
        Dictionary with user information including:
        - user_id: Supabase user ID
        - email: User's email
        - email_verified: Whether email is verified
        - user_metadata: Additional user data (name, avatar, etc.)
        - provider: OAuth provider (google, github, etc.)
    """
    payload = verify_supabase_token(token)
    
    # Extract user information from token payload
    user_info = {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "email_verified": payload.get("email_confirmed_at") is not None,
        "user_metadata": payload.get("user_metadata", {}),
        "app_metadata": payload.get("app_metadata", {}),
        "role": payload.get("role", "authenticated"),
        "provider": payload.get("app_metadata", {}).get("provider", "email"),
        "last_sign_in_at": payload.get("last_sign_in_at"),
    }
    
    return user_info


def extract_user_info_from_token(token: str) -> Optional[Dict]:
    """Extract user info from token for user creation/update.
    
    Args:
        token: JWT token from Supabase
        
    Returns:
        User information dict or None if extraction fails
    """
    try:
        user_info = get_user_from_token(token)
        
        # Build user data for database
        user_data = {
            "supabase_user_id": user_info["user_id"],
            "email": user_info["email"],
            "email_verified": user_info["email_verified"],
            "oauth_provider": user_info["provider"],
            "full_name": user_info["user_metadata"].get("full_name", ""),
            "avatar_url": user_info["user_metadata"].get("avatar_url", ""),
            "last_login": user_info.get("last_sign_in_at"),
        }
        
        return user_data
        
    except Exception as e:
        logger.error(f"Error extracting user info from token: {str(e)}")
        return None
