"""Supabase Authentication Service

This service handles user synchronization between Supabase Auth and MongoDB.
It ensures that users authenticated via Supabase have corresponding records in MongoDB.
"""

import os
import logging
from datetime import datetime, timezone
from typing import Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client, Client
import uuid

logger = logging.getLogger(__name__)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # Service role key for admin operations
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# MongoDB connection - will be initialized from server
db = None
supabase: Optional[Client] = None


def init_supabase_service(database):
    """Initialize Supabase auth service with database connection."""
    global db, supabase
    db = database
    
    # Initialize Supabase client if configured
    if SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY):
        try:
            # Use service key if available, otherwise anon key
            api_key = SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY
            supabase = create_client(SUPABASE_URL, api_key)
            logger.info("✅ Supabase auth service initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {str(e)}")
    else:
        logger.warning("⚠️ Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env")


def is_supabase_configured() -> bool:
    """Check if Supabase is properly configured."""
    return bool(SUPABASE_URL and (SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY))


async def sync_user_from_supabase(supabase_user: Dict) -> Dict:
    """Sync user from Supabase to MongoDB.
    
    Args:
        supabase_user: User data from Supabase auth
        
    Returns:
        MongoDB user document
    """
    if db is None:
        raise ValueError("Database not initialized")
    
    users_collection = db.users
    
    # Extract user information
    supabase_user_id = supabase_user.get('id')
    email = supabase_user.get('email')
    user_metadata = supabase_user.get('user_metadata', {})
    
    if not supabase_user_id or not email:
        raise ValueError("Invalid Supabase user data: missing id or email")
    
    # Check if user already exists (by supabase_user_id or email)
    existing_user = await users_collection.find_one({
        "$or": [
            {"supabase_user_id": supabase_user_id},
            {"email": email}
        ]
    })
    
    # Prepare user data
    now = datetime.now(timezone.utc)
    
    if existing_user:
        # Update existing user
        update_data = {
            "supabase_user_id": supabase_user_id,
            "email": email,
            "email_verified": supabase_user.get('email_confirmed_at') is not None,
            "last_login": now.isoformat(),
            "updated_at": now.isoformat(),
        }
        
        # Update metadata if provided
        if user_metadata.get('full_name'):
            update_data['name'] = user_metadata['full_name']
        if user_metadata.get('avatar_url'):
            update_data['avatar_url'] = user_metadata['avatar_url']
        
        # Update provider info
        app_metadata = supabase_user.get('app_metadata', {})
        if app_metadata.get('provider'):
            update_data['oauth_provider'] = app_metadata['provider']
        
        await users_collection.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": update_data,
                "$inc": {"login_count": 1}
            }
        )
        
        # Fetch and return updated user
        updated_user = await users_collection.find_one({"_id": existing_user["_id"]})
        logger.info(f"✅ Updated existing user: {email} (Supabase ID: {supabase_user_id})")
        return updated_user
    
    else:
        # Create new user
        new_user = {
            "id": str(uuid.uuid4()),
            "supabase_user_id": supabase_user_id,
            "email": email,
            "name": user_metadata.get('full_name', email.split('@')[0]),
            "email_verified": supabase_user.get('email_confirmed_at') is not None,
            "avatar_url": user_metadata.get('avatar_url', ''),
            "oauth_provider": supabase_user.get('app_metadata', {}).get('provider', 'email'),
            "role": "user",
            "plan_id": "free",
            "status": "active",
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "last_login": now.isoformat(),
            "login_count": 1,
            "subscription_status": "trial",
            "onboarding_completed": False,
            "preferences": {
                "notifications": {
                    "email": True,
                    "push": True,
                    "sms": False
                },
                "language": "en",
                "timezone": "UTC"
            },
            "limits": {
                "chatbots": 1,
                "messages": 100,
                "file_uploads": 5,
                "website_sources": 1,
                "text_sources": 5
            },
            "features": {
                "beta_features": False,
                "advanced_analytics": False,
                "custom_branding": False,
                "api_access": False,
                "priority_support": False
            },
            "metadata": {
                "signup_source": "supabase_auth",
                "ip_address": "",
                "user_agent": ""
            }
        }
        
        await users_collection.insert_one(new_user)
        logger.info(f"✅ Created new user: {email} (Supabase ID: {supabase_user_id})")
        return new_user


async def get_user_by_supabase_id(supabase_user_id: str) -> Optional[Dict]:
    """Get MongoDB user by Supabase user ID.
    
    Args:
        supabase_user_id: Supabase user ID
        
    Returns:
        MongoDB user document or None
    """
    if db is None:
        raise ValueError("Database not initialized")
    
    users_collection = db.users
    return await users_collection.find_one({"supabase_user_id": supabase_user_id})


async def get_user_by_email(email: str) -> Optional[Dict]:
    """Get MongoDB user by email.
    
    Args:
        email: User email
        
    Returns:
        MongoDB user document or None
    """
    if db is None:
        raise ValueError("Database not initialized")
    
    users_collection = db.users
    return await users_collection.find_one({"email": email})


async def update_user_metadata(user_id: str, metadata: Dict) -> bool:
    """Update user metadata in MongoDB.
    
    Args:
        user_id: MongoDB user ID
        metadata: Metadata to update
        
    Returns:
        True if successful, False otherwise
    """
    if db is None:
        raise ValueError("Database not initialized")
    
    users_collection = db.users
    
    try:
        result = await users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    **metadata,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Failed to update user metadata: {str(e)}")
        return False
