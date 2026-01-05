"""Supabase Authentication Router

Handles Supabase authentication callbacks and user synchronization.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
from datetime import datetime, timezone, timedelta

from services.supabase_auth_service import (
    sync_user_from_supabase,
    get_user_by_supabase_id,
    is_supabase_configured
)
from supabase_config import verify_supabase_token, get_user_from_token
from auth import create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/supabase", tags=["Supabase Authentication"])

# Database will be injected
db = None

def init_router(database):
    """Initialize router with database connection."""
    global db
    db = database
    # Also initialize the supabase auth service
    from services.supabase_auth_service import init_supabase_service
    init_supabase_service(database)


class SupabaseAuthRequest(BaseModel):
    """Request model for Supabase authentication."""
    access_token: str
    refresh_token: Optional[str] = None


class EmailVerificationRequest(BaseModel):
    """Request model for email verification."""
    email: EmailStr


class PasswordResetRequest(BaseModel):
    """Request model for password reset."""
    email: EmailStr


class SupabaseAuthResponse(BaseModel):
    """Response model for Supabase authentication."""
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/callback", response_model=SupabaseAuthResponse)
async def supabase_auth_callback(request: SupabaseAuthRequest):
    """Handle Supabase authentication callback.
    
    This endpoint receives the Supabase access token from the frontend,
    verifies it, syncs the user to MongoDB, and returns our app's JWT token.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_JWT_SECRET in environment variables."
        )
    
    try:
        # Verify Supabase token and extract user info
        user_info = get_user_from_token(request.access_token)
        
        # Build Supabase user object for sync
        supabase_user = {
            "id": user_info["user_id"],
            "email": user_info["email"],
            "email_confirmed_at": datetime.now(timezone.utc).isoformat() if user_info["email_verified"] else None,
            "user_metadata": user_info["user_metadata"],
            "app_metadata": user_info["app_metadata"],
        }
        
        # Sync user to MongoDB
        mongo_user = await sync_user_from_supabase(supabase_user)
        
        if not mongo_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to sync user to database"
            )
        
        # Create our app's JWT token
        app_token = create_access_token(
            data={"sub": mongo_user["email"]},
            expires_delta=timedelta(days=7)
        )
        
        # Return response with user data
        return SupabaseAuthResponse(
            access_token=app_token,
            token_type="bearer",
            user={
                "id": mongo_user["id"],
                "email": mongo_user["email"],
                "name": mongo_user["name"],
                "email_verified": mongo_user.get("email_verified", False),
                "avatar_url": mongo_user.get("avatar_url", ""),
                "role": mongo_user.get("role", "user"),
                "plan_id": mongo_user.get("plan_id", "free"),
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Supabase auth callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/verify-email")
async def request_email_verification(request: EmailVerificationRequest):
    """Request email verification.
    
    This endpoint is informational - actual email verification is handled
    by Supabase automatically when users sign up.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured"
        )
    
    return {
        "message": "Email verification is handled automatically by Supabase. Please check your email for the verification link.",
        "email": request.email,
        "success": True
    }


@router.post("/reset-password")
async def request_password_reset(request: PasswordResetRequest):
    """Request password reset.
    
    This endpoint is informational - actual password reset is handled
    by Supabase Auth with built-in email templates.
    """
    if not is_supabase_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured"
        )
    
    return {
        "message": "Password reset is handled by Supabase Auth. Please use the Supabase password reset flow in your frontend application.",
        "email": request.email,
        "success": True,
        "info": "Call supabase.auth.resetPasswordForEmail() from the frontend to trigger the password reset email."
    }


@router.get("/status")
async def get_supabase_status():
    """Get Supabase authentication status."""
    return {
        "configured": is_supabase_configured(),
        "message": "Supabase authentication is configured and ready" if is_supabase_configured() 
                  else "Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_JWT_SECRET"
    }
