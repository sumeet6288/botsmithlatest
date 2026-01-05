from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class PlanLimits(BaseModel):
    """Plan usage limits"""
    max_chatbots: int = Field(description="Maximum number of chatbots")
    max_messages_per_month: int = Field(description="Maximum messages per month")
    max_file_uploads: int = Field(description="Maximum file uploads")
    max_file_size_mb: int = Field(description="Maximum file size in MB")
    max_website_sources: int = Field(description="Maximum website sources")
    max_text_sources: int = Field(description="Maximum text sources")
    conversation_history_days: int = Field(description="Days to keep conversation history")
    allowed_ai_providers: list[str] = Field(default=["openai"], description="Allowed AI providers")
    api_access: bool = Field(default=False, description="API access enabled")
    custom_branding: bool = Field(default=False, description="Custom branding enabled")
    analytics_level: str = Field(default="basic", description="Analytics level: basic or advanced")
    support_level: str = Field(default="community", description="Support level")

class Plan(BaseModel):
    """Subscription plan model"""
    id: str = Field(description="Plan ID (free, starter, professional, enterprise)")
    name: str = Field(description="Plan name")
    price: float = Field(description="Monthly price in INR (0 for free, -1 for custom)")
    description: str = Field(description="Plan description")
    limits: PlanLimits = Field(description="Plan limits")
    features: list[str] = Field(default=[], description="Plan features list")
    is_active: bool = Field(default=True, description="Is plan active")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "starter",
                "name": "Starter",
                "price": 7999.0,
                "description": "For growing businesses",
                "limits": {
                    "max_chatbots": 5,
                    "max_messages_per_month": 15000,
                    "max_file_uploads": 20,
                    "max_file_size_mb": 50,
                    "max_website_sources": 10,
                    "max_text_sources": 20,
                    "conversation_history_days": 30,
                    "allowed_ai_providers": ["openai", "anthropic"],
                    "api_access": True,
                    "custom_branding": True,
                    "analytics_level": "advanced",
                    "support_level": "priority"
                },
                "features": [
                    "5 chatbots",
                    "10,000 messages/month",
                    "Advanced analytics",
                    "Priority support",
                    "Custom branding",
                    "API access"
                ]
            }
        }
    }

class UserSubscription(BaseModel):
    """User subscription model"""
    user_id: str = Field(description="User ID")
    plan_id: str = Field(description="Current plan ID")
    status: str = Field(default="active", description="Subscription status: active, expired, cancelled")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None, description="Expiration date (None for free plan)")
    auto_renew: bool = Field(default=True)
    
    # Usage tracking
    usage: Dict[str, Any] = Field(default_factory=dict, description="Current usage statistics")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "user123",
                "plan_id": "starter",
                "status": "active",
                "started_at": "2025-01-01T00:00:00Z",
                "expires_at": None,
                "usage": {
                    "chatbots_count": 2,
                    "messages_this_month": 150,
                    "file_uploads_count": 5,
                    "website_sources_count": 3,
                    "text_sources_count": 8,
                    "last_reset": "2025-01-01T00:00:00Z"
                }
            }
        }
    }

class UsageStats(BaseModel):
    """User usage statistics"""
    chatbots_count: int = 0
    messages_this_month: int = 0
    file_uploads_count: int = 0
    website_sources_count: int = 0
    text_sources_count: int = 0
    last_reset: datetime = Field(default_factory=datetime.utcnow)

class PlanUpgradeRequest(BaseModel):
    """Plan upgrade request"""
    new_plan_id: str = Field(description="ID of the plan to upgrade to")
