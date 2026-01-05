from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/direct-login", tags=["Admin Direct Login"])

# MongoDB connection
client = AsyncIOMotorClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.getenv("DB_NAME", "chatbase_db")]

SECRET_KEY = os.getenv("SECRET_KEY", "chatbase-secret-key-change-in-production-2024")
ALGORITHM = "HS256"

class DirectLoginResponse(BaseModel):
    success: bool
    token: str
    user_id: str
    user_email: str
    expires_in: int
    login_url: str

class TokenVerificationResponse(BaseModel):
    success: bool
    user: dict
    message: str

@router.post("/generate-token/{user_id}", response_model=DirectLoginResponse)
async def generate_direct_login_token(
    user_id: str,
    # In production, add: current_admin: dict = Depends(get_current_admin)
):
    """
    Generate a simple JWT token for admin to directly login as a user.
    Token is valid for 1 hour and contains standard user data.
    """
    try:
        # Get user details - try both user_id and id fields
        user = await db.users.find_one({"$or": [{"user_id": user_id}, {"id": user_id}]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create standard JWT token (valid for 1 hour)
        expiration = datetime.utcnow() + timedelta(hours=1)
        actual_user_id = user.get("user_id") or user.get("id")
        
        token_data = {
            "sub": user["email"],  # CRITICAL: "sub" field required by auth system
            "user_id": actual_user_id,
            "id": actual_user_id,
            "email": user["email"],
            "name": user.get("name", "User"),
            "role": user.get("role", "user"),
            "exp": expiration
        }
        
        # Generate standard JWT token
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        
        # Log the direct login attempt
        logger.info(f"Admin direct login token generated for user {user_id} ({user['email']})")
        
        # Create login URL
        login_url = f"/direct-login?token={token}"
        
        return DirectLoginResponse(
            success=True,
            token=token,
            user_id=actual_user_id,
            user_email=user["email"],
            expires_in=3600,  # 1 hour in seconds
            login_url=login_url
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating direct login token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")

@router.post("/verify-token", response_model=TokenVerificationResponse)
async def verify_direct_login_token(token: str):
    """
    Verify a direct login token and return user data.
    This is a standard JWT verification.
    """
    try:
        # Decode and verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check if token is expired
        exp_timestamp = payload.get("exp")
        if exp_timestamp and datetime.utcnow().timestamp() > exp_timestamp:
            raise HTTPException(status_code=401, detail="Token has expired")
        
        # Get fresh user data from database
        user_id = payload.get("user_id") or payload.get("id")
        user = await db.users.find_one({"$or": [{"user_id": user_id}, {"id": user_id}]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove sensitive fields
        user.pop("password", None)
        user.pop("_id", None)
        
        # Convert ObjectId and other non-serializable fields to strings
        for key, value in user.items():
            if hasattr(value, '__str__') and not isinstance(value, (str, int, float, bool, list, dict)):
                user[key] = str(value)
        
        return TokenVerificationResponse(
            success=True,
            user=user,
            message="Direct login successful"
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify token: {str(e)}")
