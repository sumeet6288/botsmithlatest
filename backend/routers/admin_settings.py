"""
Admin Settings API Router
Handles system-wide settings management
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging
import os

router = APIRouter()
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')

def get_database():
    client = AsyncIOMotorClient(MONGO_URL)
    return client[DB_NAME]

# ========================================
# MODELS
# ========================================

class AIProviderConfig(BaseModel):
    enabled: bool = True
    rate_limit: int = 100

class PlatformSettings(BaseModel):
    site_name: str = "BotSmith"
    site_logo_url: str = ""
    timezone: str = "UTC"
    default_language: str = "en"
    support_email: str = "support@botsmith.com"
    admin_email: str = "sumeetemail26@gmail.com"

class OAuthProviderConfig(BaseModel):
    enabled: bool = False
    client_id: str = ""
    client_secret: str = ""

class PasswordPolicy(BaseModel):
    min_length: int = 8
    require_uppercase: bool = True
    require_lowercase: bool = True
    require_numbers: bool = True
    require_special_chars: bool = True
    password_expiry_days: int = 90

class TwoFactorAuthSettings(BaseModel):
    enforce_for_admins: bool = True
    enforce_for_all_users: bool = False
    allowed_methods: List[str] = ["app", "sms", "email"]

class SessionSettings(BaseModel):
    session_timeout_minutes: int = 1440
    max_concurrent_sessions: int = 3
    remember_me_duration_days: int = 30

class AuthenticationSettings(BaseModel):
    require_email_verification: bool = True
    enable_oauth: bool = True
    oauth_providers: Dict[str, OAuthProviderConfig] = Field(default_factory=lambda: {
        "google": OAuthProviderConfig(),
        "github": OAuthProviderConfig(),
        "microsoft": OAuthProviderConfig()
    })
    password_policy: PasswordPolicy = Field(default_factory=PasswordPolicy)
    two_factor_auth: TwoFactorAuthSettings = Field(default_factory=TwoFactorAuthSettings)
    session_settings: SessionSettings = Field(default_factory=SessionSettings)
    auto_approve_registrations: bool = True
    allowed_email_domains: str = ""
    blocked_email_domains: str = "tempmail.com,throwaway.email,guerrillamail.com"
    registration_welcome_message: str = "Welcome to BotSmith! Start building amazing AI chatbots today."
    failed_login_attempts_limit: int = 5
    account_lockout_duration_minutes: int = 30

class IntegrationConfig(BaseModel):
    enabled: bool = True
    max_per_chatbot: int = 5

class SystemSettings(BaseModel):
    # General Settings
    maintenance_mode: bool = False
    allow_registrations: bool = True
    default_plan: str = "Free"
    max_chatbots_per_user: int = 1
    email_notifications: bool = True
    auto_moderation: bool = False
    
    # AI Providers
    ai_providers: Dict[str, AIProviderConfig] = Field(default_factory=lambda: {
        "openai": AIProviderConfig(enabled=True, rate_limit=100),
        "anthropic": AIProviderConfig(enabled=True, rate_limit=100),
        "google": AIProviderConfig(enabled=True, rate_limit=100)
    })
    
    # Platform Settings
    platform: PlatformSettings = Field(default_factory=PlatformSettings)
    
    # Authentication Settings
    authentication: AuthenticationSettings = Field(default_factory=AuthenticationSettings)
    
    # Integrations Management
    integrations: Dict[str, IntegrationConfig] = Field(default_factory=lambda: {
        "slack": IntegrationConfig(enabled=True, max_per_chatbot=5),
        "telegram": IntegrationConfig(enabled=True, max_per_chatbot=5),
        "discord": IntegrationConfig(enabled=True, max_per_chatbot=5),
        "whatsapp": IntegrationConfig(enabled=True, max_per_chatbot=3),
        "messenger": IntegrationConfig(enabled=False, max_per_chatbot=3),
        "instagram": IntegrationConfig(enabled=False, max_per_chatbot=3),
        "teams": IntegrationConfig(enabled=False, max_per_chatbot=3),
        "webchat": IntegrationConfig(enabled=True, max_per_chatbot=10),
        "api": IntegrationConfig(enabled=True, max_per_chatbot=10)
    })
    
    # Metadata
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

# ========================================
# ROUTES
# ========================================

@router.get("")
async def get_settings():
    """
    Get current system settings
    """
    try:
        db = get_database()
        
        # Try to get settings from database
        settings_doc = await db.system_settings.find_one({"_id": "system_config"})
        
        if settings_doc:
            # Remove MongoDB _id field
            settings_doc.pop('_id', None)
            return settings_doc
        else:
            # Return default settings if no config exists
            default_settings = SystemSettings()
            return default_settings.model_dump()
            
    except Exception as e:
        logger.error(f"Error fetching settings: {e}")
        # Return defaults on error
        return SystemSettings().model_dump()

@router.put("")
async def update_settings(settings: SystemSettings):
    """
    Update system settings
    """
    try:
        db = get_database()
        
        # Add metadata
        settings_dict = settings.model_dump()
        settings_dict['updated_at'] = datetime.utcnow()
        settings_dict['updated_by'] = 'admin'  # In production, get from auth token
        
        # Upsert settings (update or insert)
        result = await db.system_settings.update_one(
            {"_id": "system_config"},
            {"$set": settings_dict},
            upsert=True
        )
        
        logger.info(f"Settings updated successfully. Modified: {result.modified_count}, Upserted: {result.upserted_id}")
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "updated_at": settings_dict['updated_at'].isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@router.post("/reset")
async def reset_settings():
    """
    Reset settings to defaults
    """
    try:
        db = get_database()
        
        # Create default settings
        default_settings = SystemSettings()
        settings_dict = default_settings.model_dump()
        settings_dict['updated_at'] = datetime.utcnow()
        settings_dict['updated_by'] = 'admin'
        
        # Replace with defaults
        result = await db.system_settings.replace_one(
            {"_id": "system_config"},
            settings_dict,
            upsert=True
        )
        
        logger.info("Settings reset to defaults")
        
        return {
            "success": True,
            "message": "Settings reset to defaults successfully"
        }
        
    except Exception as e:
        logger.error(f"Error resetting settings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reset settings: {str(e)}")

@router.get("/maintenance-mode")
async def get_maintenance_mode():
    """
    Get current maintenance mode status
    Quick endpoint for checking if site is in maintenance
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"maintenance_mode": 1}
        )
        
        if settings_doc and 'maintenance_mode' in settings_doc:
            return {
                "maintenance_mode": settings_doc['maintenance_mode']
            }
        else:
            return {"maintenance_mode": False}
            
    except Exception as e:
        logger.error(f"Error checking maintenance mode: {e}")
        return {"maintenance_mode": False}

@router.post("/maintenance-mode")
async def toggle_maintenance_mode(enabled: bool):
    """
    Quickly toggle maintenance mode on/off
    """
    try:
        db = get_database()
        
        result = await db.system_settings.update_one(
            {"_id": "system_config"},
            {
                "$set": {
                    "maintenance_mode": enabled,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        logger.info(f"Maintenance mode {'enabled' if enabled else 'disabled'}")
        
        return {
            "success": True,
            "maintenance_mode": enabled,
            "message": f"Maintenance mode {'enabled' if enabled else 'disabled'}"
        }
        
    except Exception as e:
        logger.error(f"Error toggling maintenance mode: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to toggle maintenance mode: {str(e)}")

@router.get("/registrations-enabled")
async def get_registrations_status():
    """
    Check if registrations are currently allowed
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"allow_registrations": 1}
        )
        
        if settings_doc and 'allow_registrations' in settings_doc:
            return {
                "registrations_enabled": settings_doc['allow_registrations']
            }
        else:
            return {"registrations_enabled": True}  # Default to enabled
            
    except Exception as e:
        logger.error(f"Error checking registrations status: {e}")
        return {"registrations_enabled": True}

@router.get("/ai-providers")
async def get_ai_providers():
    """
    Get AI provider configurations
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"ai_providers": 1}
        )
        
        if settings_doc and 'ai_providers' in settings_doc:
            return settings_doc['ai_providers']
        else:
            # Return defaults
            return {
                "openai": {"enabled": True, "rate_limit": 100},
                "anthropic": {"enabled": True, "rate_limit": 100},
                "google": {"enabled": True, "rate_limit": 100}
            }
            
    except Exception as e:
        logger.error(f"Error fetching AI providers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI providers")

@router.get("/integrations")
async def get_integrations_settings():
    """
    Get integration management settings
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"integrations": 1}
        )
        
        if settings_doc and 'integrations' in settings_doc:
            return settings_doc['integrations']
        else:
            # Return defaults
            return {
                "slack": {"enabled": True, "max_per_chatbot": 5},
                "telegram": {"enabled": True, "max_per_chatbot": 5},
                "discord": {"enabled": True, "max_per_chatbot": 5},
                "whatsapp": {"enabled": True, "max_per_chatbot": 3},
                "messenger": {"enabled": False, "max_per_chatbot": 3},
                "instagram": {"enabled": False, "max_per_chatbot": 3},
                "teams": {"enabled": False, "max_per_chatbot": 3},
                "webchat": {"enabled": True, "max_per_chatbot": 10},
                "api": {"enabled": True, "max_per_chatbot": 10}
            }
            
    except Exception as e:
        logger.error(f"Error fetching integrations settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch integrations settings")

@router.get("/platform")
async def get_platform_settings():
    """
    Get platform settings (site name, logo, etc.)
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"platform": 1}
        )
        
        if settings_doc and 'platform' in settings_doc:
            return settings_doc['platform']
        else:
            # Return defaults
            return {
                "site_name": "BotSmith",
                "site_logo_url": "",
                "timezone": "UTC",
                "default_language": "en",
                "support_email": "support@botsmith.com",
                "admin_email": "admin@botsmith.com"
            }
            
    except Exception as e:
        logger.error(f"Error fetching platform settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch platform settings")

@router.get("/authentication")
async def get_authentication_settings():
    """
    Get authentication and security settings
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one(
            {"_id": "system_config"},
            {"authentication": 1}
        )
        
        if settings_doc and 'authentication' in settings_doc:
            # Mask sensitive OAuth credentials
            auth_settings = settings_doc['authentication']
            if 'oauth_providers' in auth_settings:
                for provider, config in auth_settings['oauth_providers'].items():
                    if config.get('client_secret'):
                        config['client_secret'] = '********'
            return auth_settings
        else:
            # Return defaults (with masked secrets)
            return AuthenticationSettings().model_dump()
            
    except Exception as e:
        logger.error(f"Error fetching authentication settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch authentication settings")

@router.get("/export")
async def export_settings():
    """
    Export all settings as JSON for backup
    """
    try:
        db = get_database()
        settings_doc = await db.system_settings.find_one({"_id": "system_config"})
        
        if settings_doc:
            # Remove MongoDB _id
            settings_doc.pop('_id', None)
            
            # Mask sensitive data
            if 'authentication' in settings_doc and 'oauth_providers' in settings_doc['authentication']:
                for provider, config in settings_doc['authentication']['oauth_providers'].items():
                    if 'client_secret' in config and config['client_secret']:
                        config['client_secret'] = '********'
            
            return {
                "success": True,
                "settings": settings_doc,
                "exported_at": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": True,
                "settings": SystemSettings().model_dump(),
                "exported_at": datetime.utcnow().isoformat(),
                "note": "Using default settings (no custom configuration found)"
            }
            
    except Exception as e:
        logger.error(f"Error exporting settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to export settings")

# ========================================
# HEALTH CHECK
# ========================================

@router.get("/health")
async def health_check():
    """
    Health check endpoint for settings service
    """
    try:
        db = get_database()
        # Try to ping the database
        await db.command('ping')
        return {
            "status": "healthy",
            "service": "admin_settings",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "admin_settings",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
