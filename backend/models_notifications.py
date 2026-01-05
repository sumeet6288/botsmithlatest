from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime, timezone
import uuid


# Notification Models
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: Literal[
        "new_conversation",
        "high_priority_message",
        "performance_alert",
        "usage_warning",
        "new_user_signup",
        "webhook_event",
        "source_processing",
        "chatbot_down",
        "api_error",
        "admin_message"
    ]
    title: str
    message: str
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    read: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None  # URL to navigate when clicked


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    priority: str = "medium"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    action_url: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    priority: str
    read: bool
    metadata: Dict[str, Any]
    created_at: datetime
    read_at: Optional[datetime]
    action_url: Optional[str]


class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Email Notification Settings
    email_enabled: bool = True
    email_new_conversation: bool = True
    email_high_priority: bool = True
    email_performance_alert: bool = True
    email_usage_warning: bool = True
    email_digest: Literal["none", "daily", "weekly"] = "daily"
    email_digest_time: str = "09:00"  # Time to send digest
    
    # Push Notification Settings
    push_enabled: bool = True
    push_new_conversation: bool = True
    push_high_priority: bool = True
    push_performance_alert: bool = True
    push_usage_warning: bool = True
    
    # In-app Notification Settings
    inapp_enabled: bool = True
    inapp_sound: bool = True
    
    # Admin-only notifications
    admin_new_user_signup: bool = True
    admin_webhook_events: bool = True
    
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NotificationPreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    email_new_conversation: Optional[bool] = None
    email_high_priority: Optional[bool] = None
    email_performance_alert: Optional[bool] = None
    email_usage_warning: Optional[bool] = None
    email_digest: Optional[Literal["none", "daily", "weekly"]] = None
    email_digest_time: Optional[str] = None
    
    push_enabled: Optional[bool] = None
    push_new_conversation: Optional[bool] = None
    push_high_priority: Optional[bool] = None
    push_performance_alert: Optional[bool] = None
    push_usage_warning: Optional[bool] = None
    
    inapp_enabled: Optional[bool] = None
    inapp_sound: Optional[bool] = None
    
    admin_new_user_signup: Optional[bool] = None
    admin_webhook_events: Optional[bool] = None


class PushSubscription(BaseModel):
    """Model for storing browser push notification subscriptions"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    endpoint: str
    keys: Dict[str, str]  # p256dh and auth keys
    browser: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
