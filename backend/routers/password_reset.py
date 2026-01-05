from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import secrets
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["password-reset"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['chatbase_db']
users_collection = db['users']
reset_tokens_collection = db['password_reset_tokens']


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


def generate_reset_token():
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Send password reset instructions to user's email.
    In production, this would send an actual email.
    For now, we'll just create a reset token and return success.
    """
    # Check if user exists
    user = await users_collection.find_one({"email": request.email})
    
    if not user:
        # Don't reveal if email exists or not for security reasons
        return {
            "message": "If an account with that email exists, password reset instructions have been sent.",
            "success": True
        }
    
    # Generate reset token
    reset_token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)  # Token valid for 24 hours
    
    # Store reset token in database
    await reset_tokens_collection.update_one(
        {"email": request.email},
        {
            "$set": {
                "token": reset_token,
                "expires_at": expires_at,
                "used": False,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    # In production, send email with reset link:
    # reset_link = f"https://your-domain.com/reset-password?token={reset_token}"
    # send_email(request.email, "Password Reset", f"Click here to reset: {reset_link}")
    
    # For development, log the token (remove in production)
    print(f"[DEV] Password reset token for {request.email}: {reset_token}")
    print(f"[DEV] Reset link: /reset-password?token={reset_token}")
    
    return {
        "message": "If an account with that email exists, password reset instructions have been sent.",
        "success": True,
        # Include token in development for testing (remove in production)
        "dev_token": reset_token,
        "dev_reset_link": f"/reset-password?token={reset_token}"
    }


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset user's password using the token received via email
    """
    # Find the reset token
    reset_token_doc = await reset_tokens_collection.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_token_doc:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if reset_token_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired. Please request a new one."
        )
    
    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )
    
    # Hash the new password
    hashed_password = hash_password(request.new_password)
    
    # Update user's password
    update_result = await users_collection.update_one(
        {"email": reset_token_doc["email"]},
        {
            "$set": {
                "password": hashed_password,
                "password_updated_at": datetime.utcnow()
            }
        }
    )
    
    if update_result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Mark token as used
    await reset_tokens_collection.update_one(
        {"token": request.token},
        {
            "$set": {
                "used": True,
                "used_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Password has been reset successfully",
        "success": True
    }


@router.post("/validate-reset-token")
async def validate_reset_token(token: str):
    """
    Validate if a reset token is still valid
    """
    reset_token_doc = await reset_tokens_collection.find_one({
        "token": token,
        "used": False
    })
    
    if not reset_token_doc:
        return {
            "valid": False,
            "message": "Invalid token"
        }
    
    if reset_token_doc["expires_at"] < datetime.utcnow():
        return {
            "valid": False,
            "message": "Token has expired"
        }
    
    return {
        "valid": True,
        "message": "Token is valid",
        "expires_at": reset_token_doc["expires_at"].isoformat()
    }
