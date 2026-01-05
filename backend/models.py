from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime, timezone, date
import uuid


# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Role & Permissions
    role: Literal["user", "moderator", "admin"] = "user"
    
    # Account Status
    status: Literal["active", "suspended", "banned"] = "active"
    suspension_reason: Optional[str] = None
    suspension_until: Optional[datetime] = None
    
    # Profile Information
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    
    # Usage Limits (overrides plan limits if set)
    custom_max_chatbots: Optional[int] = None
    custom_max_messages: Optional[int] = None
    custom_max_file_uploads: Optional[int] = None
    
    # Activity Tracking
    last_login: Optional[datetime] = None
    login_count: int = 0
    last_ip: Optional[str] = None
    last_active: Optional[datetime] = None
    
    # Lifecycle Management
    lifecycle_stage: Literal["new", "active", "engaged", "at_risk", "churned"] = "new"
    onboarding_completed: bool = False
    onboarding_progress: int = 0  # 0-100
    churn_risk_score: float = 0.0  # 0.0-1.0
    
    # Financial
    total_spent: float = 0.0
    lifetime_value: float = 0.0
    current_plan: Optional[str] = None
    plan_start_date: Optional[datetime] = None
    
    # Segmentation
    tags: List[str] = []
    segments: List[str] = []  # e.g., ["high-value", "power-user", "enterprise"]
    custom_fields: Dict[str, Any] = {}
    
    # Admin & Notes
    admin_notes: Optional[str] = None
    internal_notes: List[Dict[str, Any]] = []  # [{"note": "...", "author": "...", "timestamp": "..."}]
    
    # Preferences
    email_notifications: bool = True
    marketing_emails: bool = True
    timezone: Optional[str] = None
    language: Optional[str] = "en"
    
    # Advanced Features & Permissions (Ultimate Edition)
    permissions: Dict[str, bool] = {
        "canCreateChatbots": True,
        "canDeleteChatbots": True,
        "canViewAnalytics": True,
        "canExportData": True,
        "canManageIntegrations": True,
        "canAccessAPI": True,
        "canUploadFiles": True,
        "canScrapeWebsites": True,
        "canUseAdvancedFeatures": False,
        "canInviteTeamMembers": False,
        "canManageBilling": False,
    }
    
    # Security Settings
    email_verified: bool = False
    two_factor_enabled: bool = False
    password_expires_at: Optional[datetime] = None
    force_password_change: bool = False
    allowed_ips: List[str] = []
    blocked_ips: List[str] = []
    max_sessions: int = 5
    session_timeout: int = 3600  # seconds
    
    # Subscription & Billing (Extended)
    plan_id: str = "free"
    stripe_customer_id: Optional[str] = None
    billing_email: Optional[str] = None
    payment_method: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    lifetime_access: bool = False
    discount_code: Optional[str] = None
    custom_pricing: Optional[float] = None
    
    # Custom Limits (Override Plan Limits)
    custom_limits: Dict[str, Optional[int]] = {
        "max_chatbots": None,
        "max_messages_per_month": None,
        "max_file_uploads": None,
        "max_website_sources": None,
        "max_text_sources": None,
        "max_storage_mb": None,
        "max_ai_models": None,
        "max_integrations": None,
    }
    
    # Feature Flags
    feature_flags: Dict[str, bool] = {
        "betaFeatures": False,
        "advancedAnalytics": False,
        "customBranding": False,
        "apiAccess": False,
        "prioritySupport": False,
        "customDomain": False,
        "whiteLabel": False,
        "ssoEnabled": False,
    }
    
    # API Rate Limits
    api_rate_limits: Dict[str, int] = {
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "requests_per_day": 10000,
        "burst_limit": 100,
    }
    
    # Appearance & Branding
    theme: Literal["light", "dark", "auto"] = "light"
    custom_css: Optional[str] = None
    branding: Dict[str, str] = {
        "logo_url": "",
        "favicon_url": "",
        "primary_color": "#7c3aed",
        "secondary_color": "#ec4899",
        "font_family": "Inter",
    }
    
    # Notification Preferences
    notification_preferences: Dict[str, bool] = {
        "newChatbotCreated": True,
        "limitReached": True,
        "weeklyReport": True,
        "monthlyReport": True,
        "securityAlerts": True,
        "systemUpdates": True,
        "promotionalOffers": False,
    }
    
    # Tracking & Analytics
    tracking_enabled: bool = True
    analytics_enabled: bool = True
    last_activity_at: Optional[datetime] = None
    onboarding_step: int = 0
    
    # API & Integrations
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    webhook_events: List[str] = []
    oauth_tokens: Dict[str, Any] = {}
    integration_preferences: Dict[str, Any] = {}


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime
    role: str = "user"
    status: str = "active"
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    
    # Profile Information
    company: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    
    # Subscription & Plan
    plan_id: Optional[str] = "free"
    subscription_status: Optional[str] = None
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    lifetime_access: bool = False
    
    # Custom Limits (if set by admin)
    custom_limits: Optional[Dict[str, Any]] = None
    
    # Feature Flags
    feature_flags: Optional[Dict[str, Any]] = None
    
    # Settings
    timezone: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    
    # Branding (for custom white-label)
    branding: Optional[Dict[str, Any]] = None
    
    # Metadata
    tags: List[str] = []
    segments: List[str] = []


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None


class AdminUserUpdate(BaseModel):
    """Admin-only user update model with more permissions"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Literal["user", "moderator", "admin"]] = None
    status: Optional[Literal["active", "suspended", "banned"]] = None
    suspension_reason: Optional[str] = None
    suspension_until: Optional[datetime] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    custom_max_chatbots: Optional[int] = None
    custom_max_messages: Optional[int] = None
    custom_max_file_uploads: Optional[int] = None
    tags: Optional[List[str]] = None
    segments: Optional[List[str]] = None
    admin_notes: Optional[str] = None
    lifecycle_stage: Optional[Literal["new", "active", "engaged", "at_risk", "churned"]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class PasswordReset(BaseModel):
    """Admin password reset for users"""
    new_password: str


class Token(BaseModel):
    """JWT Token response"""
    access_token: str
    token_type: str = "bearer"


# Login History Model
class LoginHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    success: bool = True


class LoginHistoryResponse(BaseModel):
    id: str
    user_id: str
    timestamp: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    location: Optional[str]
    success: bool


# Activity Log Model
class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str  # e.g., "created_chatbot", "deleted_source", "updated_settings"
    resource_type: Optional[str] = None  # e.g., "chatbot", "source", "user"
    resource_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None


class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    details: Optional[str]
    timestamp: datetime
    ip_address: Optional[str]


class BulkUserOperation(BaseModel):
    """Bulk operations on multiple users"""
    user_ids: List[str]
    operation: Literal["delete", "change_role", "change_status", "export", "add_tag", "remove_tag", "add_segment", "send_email"]
    parameters: Optional[Dict[str, Any]] = None  # e.g., {"role": "moderator"}, {"status": "suspended"}


# User Segment Model
class UserSegment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    filters: Dict[str, Any]  # Flexible filter criteria
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_count: int = 0


class UserSegmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    filters: Dict[str, Any]


# Email Template Model
class EmailTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    body: str  # HTML or plain text
    template_type: Literal["marketing", "transactional", "notification", "announcement"] = "marketing"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    variables: List[str] = []  # e.g., ["user_name", "plan_name"]


class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    body: str
    template_type: Literal["marketing", "transactional", "notification", "announcement"] = "marketing"
    variables: List[str] = []


# Bulk Email Campaign Model
class EmailCampaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    template_id: str
    target_user_ids: List[str]
    target_segments: List[str] = []
    status: Literal["draft", "scheduled", "sending", "sent", "failed"] = "draft"
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    sent_count: int = 0
    failed_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EmailCampaignCreate(BaseModel):
    name: str
    template_id: str
    target_user_ids: List[str] = []
    target_segments: List[str] = []
    scheduled_at: Optional[datetime] = None


# User Note Model
class UserNote(BaseModel):
    note: str
    author: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    note_type: Literal["general", "support", "sales", "billing"] = "general"


# Impersonation Session Model
class ImpersonationSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_id: str
    admin_email: str
    target_user_id: str
    target_user_email: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None
    reason: str
    ip_address: Optional[str] = None
    actions_performed: List[Dict[str, Any]] = []


class ImpersonationRequest(BaseModel):
    target_user_id: str
    reason: str


# Lead Models
class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # User who owns this lead
    name: str
    contact: str  # Email or Phone
    status: Literal["New", "Contacted", "Closed"] = "New"
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Optional[Dict[str, Any]] = {}


class LeadCreate(BaseModel):
    name: str
    contact: str
    status: Optional[Literal["New", "Contacted", "Closed"]] = "New"
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    status: Optional[Literal["New", "Contacted", "Closed"]] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    user_id: str
    name: str
    contact: str
    status: Literal["New", "Contacted", "Closed"]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class LeadStatsResponse(BaseModel):
    current_leads: int
    max_leads: int
    percentage_used: float
    can_add_more: bool
    plan_name: str


# Chatbot Models
class Chatbot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: Optional[str] = None
    model: str = "gpt-4o-mini"
    provider: Literal["openai", "anthropic", "google"] = "openai"
    temperature: float = 0.7
    max_tokens: int = 500
    system_message: str = "You are a helpful assistant."
    instructions: Optional[str] = None  # Alternative field name for system_message
    status: str = "active"  # Chatbot status: active, inactive, paused
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    messages_count: int = 0
    public_access: bool = True
    
    # Appearance Settings
    primary_color: str = "#7c3aed"
    secondary_color: str = "#ec4899"
    accent_color: str = "#ec4899"
    welcome_message: str = "Hi! I'm your AI assistant. How can I help you today?"
    logo_url: Optional[str] = None
    avatar_url: Optional[str] = None
    font_family: str = "Inter, system-ui, sans-serif"
    font_size: Literal["small", "medium", "large"] = "medium"
    bubble_style: str = "rounded"
    
    # Widget Settings
    widget_position: Literal["bottom-right", "bottom-left", "top-right", "top-left"] = "bottom-right"
    widget_theme: Literal["light", "dark", "auto"] = "auto"
    widget_size: Literal["small", "medium", "large"] = "medium"
    auto_expand: bool = False
    
    # White Label Branding (for paid plans only)
    powered_by_text: Optional[str] = None  # Custom "Powered by [Brand]" text for paid plans
    
    # Rate Limiting
    rate_limit_enabled: bool = False
    messages_per_hour: int = 60
    
    # Webhooks
    webhook_url: Optional[str] = None
    webhook_events: List[str] = []


class ChatbotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model: str = "gpt-4o-mini"
    provider: Literal["openai", "anthropic", "google"] = "openai"
    temperature: float = 0.7
    max_tokens: int = 500
    system_message: str = "You are a helpful assistant."
    instructions: Optional[str] = None  # Alias for system_message
    welcome_message: str = "Hi! I'm your AI assistant. How can I help you today?"


class ChatbotUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[Literal["openai", "anthropic", "google"]] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_message: Optional[str] = None
    instructions: Optional[str] = None  # Alias for system_message
    status: Optional[str] = None
    public_access: Optional[bool] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    welcome_message: Optional[str] = None
    logo_url: Optional[str] = None
    avatar_url: Optional[str] = None
    font_family: Optional[str] = None
    font_size: Optional[Literal["small", "medium", "large"]] = None
    bubble_style: Optional[str] = None
    widget_position: Optional[Literal["bottom-right", "bottom-left", "top-right", "top-left"]] = None
    widget_theme: Optional[Literal["light", "dark", "auto"]] = None
    widget_size: Optional[Literal["small", "medium", "large"]] = None
    auto_expand: Optional[bool] = None
    powered_by_text: Optional[str] = None  # Custom "Powered by [Brand]" text
    rate_limit_enabled: Optional[bool] = None
    messages_per_hour: Optional[int] = None
    webhook_url: Optional[str] = None
    webhook_events: Optional[List[str]] = None


class ChatbotResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    model: str
    provider: str
    temperature: float
    max_tokens: int
    system_message: str
    instructions: Optional[str] = None  # Alias for system_message
    status: str = "active"
    created_at: datetime
    updated_at: datetime
    messages_count: int
    conversations_count: int = 0
    public_access: bool = True
    primary_color: str = "#7c3aed"
    secondary_color: str = "#ec4899"
    accent_color: str = "#ec4899"
    welcome_message: str = "Hi! I'm your AI assistant. How can I help you today?"
    logo_url: Optional[str] = None
    avatar_url: Optional[str] = None
    font_family: str = "Inter, system-ui, sans-serif"
    font_size: str = "medium"
    bubble_style: str = "rounded"
    widget_position: str = "bottom-right"
    widget_theme: str = "auto"
    widget_size: str = "medium"
    auto_expand: bool = False
    powered_by_text: Optional[str] = None  # Custom "Powered by" text for white label


# Source Models
class SourceCreate(BaseModel):
    """Model for creating a new source"""
    chatbot_id: str
    type: Literal["file", "website", "text"]
    name: str
    content: Optional[str] = None
    url: Optional[str] = None


class Source(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chatbot_id: str
    type: Literal["file", "website", "text"]
    name: str
    content: Optional[str] = None
    url: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: Literal["processing", "completed", "failed"] = "processing"
    error_message: Optional[str] = None


class SourceResponse(BaseModel):
    id: str
    chatbot_id: str
    type: str
    name: str
    url: Optional[str]
    file_type: Optional[str]
    file_size: Optional[int]
    created_at: datetime
    status: str
    error_message: Optional[str]


# Chat Models
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    chatbot_id: str
    session_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    session_id: str


class MessageRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chatbot_id: str
    conversation_id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session_id: Optional[str] = None


# Alias for compatibility
Message = MessageRecord


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime


class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chatbot_id: str
    session_id: Optional[str] = None  # Session ID for tracking user sessions
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    status: Literal["active", "resolved", "escalated"] = "active"
    rating: Optional[int] = None  # 1-5 stars
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message_count: int = 0
    messages_count: int = 0  # Alias for message_count (compatibility)


class ConversationResponse(BaseModel):
    id: str
    chatbot_id: str
    session_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    status: str = "active"
    rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    messages_count: int = 0  # Alias for message_count


# Analytics Models
class AnalyticsResponse(BaseModel):
    total_conversations: int
    total_messages: int
    active_chatbots: int
    total_chatbots: int
    total_leads: int = 0


# Alias for compatibility
DashboardAnalytics = AnalyticsResponse


class ChatbotAnalytics(BaseModel):
    total_messages: int
    total_conversations: int
    avg_messages_per_conversation: float
    date_range: str


# Advanced Analytics Models
class TrendDataPoint(BaseModel):
    """Single data point for trend analytics"""
    date: str
    conversations: int
    messages: int


class TrendAnalytics(BaseModel):
    """Trend analytics response"""
    chatbot_id: str
    period: str
    data: List[TrendDataPoint]
    total_conversations: int
    total_messages: int
    avg_daily_conversations: float
    avg_daily_messages: float


class TopQuestion(BaseModel):
    """Single top question item"""
    question: str
    count: int
    percentage: float


class TopQuestionsAnalytics(BaseModel):
    """Top questions analytics response"""
    chatbot_id: str
    top_questions: List[TopQuestion]
    total_unique_questions: int


class SatisfactionAnalytics(BaseModel):
    """Satisfaction ratings analytics response"""
    chatbot_id: str
    average_rating: float
    total_ratings: int
    rating_distribution: dict
    satisfaction_percentage: float


class PerformanceMetrics(BaseModel):
    """Performance metrics response"""
    chatbot_id: str
    avg_response_time_ms: float
    total_responses: int
    fastest_response_ms: float
    slowest_response_ms: float


class RatingCreate(BaseModel):
    """Create or update conversation rating"""
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None


class RatingResponse(BaseModel):
    """Rating response"""
    id: str
    conversation_id: str
    chatbot_id: str
    rating: int
    feedback: Optional[str]
    created_at: datetime


# Public Chat Models
class PublicChatbotInfo(BaseModel):
    """Public chatbot information for public access"""
    id: str
    name: str
    welcome_message: str
    primary_color: Optional[str] = "#7c3aed"
    secondary_color: Optional[str] = "#a78bfa"
    accent_color: Optional[str] = "#ec4899"
    logo_url: Optional[str] = None
    avatar_url: Optional[str] = None
    font_family: Optional[str] = "Inter, system-ui, sans-serif"
    font_size: Optional[str] = "medium"
    bubble_style: Optional[str] = "rounded"
    widget_theme: Optional[str] = "light"
    widget_position: Optional[str] = "bottom-right"
    widget_size: Optional[str] = "medium"
    auto_expand: Optional[bool] = False
    powered_by_text: Optional[str] = None


class PublicChatRequest(BaseModel):
    """Request model for public chat"""
    message: str
    session_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class EmbedConfig(BaseModel):
    """Embed configuration for chatbot widget"""
    chatbot_id: str
    theme: str = "light"
    position: str = "bottom-right"
    auto_expand: bool = False


class EmbedCodeResponse(BaseModel):
    """Response containing embed code"""
    embed_code: str
    config: EmbedConfig


# Subscription/Plan Models
class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_name: str = "Free Plan"
    status: Literal["active", "cancelled", "expired"] = "active"
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = None
    auto_renew: bool = False
    usage: dict = {
        "chatbots": 0,
        "messages_this_month": 0,
        "file_uploads": 0,
        "website_sources": 0,
        "text_sources": 0
    }
    limits: dict = {
        "max_chatbots": 1,
        "max_messages_per_month": 100,
        "max_file_uploads": 5,
        "max_website_sources": 2,
        "max_text_sources": 5
    }


class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan_name: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    auto_renew: bool
    usage: dict
    limits: dict


# Integration Models
class Integration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chatbot_id: str
    integration_type: Literal["slack", "telegram", "discord", "whatsapp", "webchat", "api", "messenger", "msteams", "instagram", "zapier"]
    credentials: Dict[str, str]  # Different for each integration type
    metadata: Dict[str, Any] = Field(default_factory=dict)
    enabled: bool = False
    status: Literal["connected", "error", "pending"] = "pending"
    last_tested: Optional[datetime] = None
    last_used: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntegrationCreate(BaseModel):
    integration_type: Literal["slack", "telegram", "discord", "whatsapp", "webchat", "api", "messenger", "msteams", "instagram", "zapier"]
    credentials: Dict[str, str]
    metadata: Optional[Dict[str, Any]] = None


class IntegrationUpdate(BaseModel):
    """Model for updating integration"""
    credentials: Optional[Dict[str, str]] = None
    enabled: Optional[bool] = None


class IntegrationResponse(BaseModel):
    id: str
    chatbot_id: str
    integration_type: str
    enabled: bool
    status: str
    last_tested: Optional[datetime] = None
    last_used: Optional[datetime] = None
    error_message: Optional[str] = None
    has_credentials: bool
    created_at: datetime
    updated_at: datetime


class TestConnectionRequest(BaseModel):
    """Request model for testing integration connection"""
    credentials: Optional[Dict[str, str]] = None


class IntegrationLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    integration_id: str
    chatbot_id: str
    event_type: Literal["configured", "enabled", "disabled", "tested", "error"]
    status: Literal["success", "failure", "warning"]
    message: Optional[str] = None
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntegrationLogResponse(BaseModel):
    id: str
    integration_id: str
    event_type: str
    status: str
    message: Optional[str]
    timestamp: datetime



# Telegram Models
class TelegramWebhookSetup(BaseModel):
    base_url: str  # Base URL of your application (e.g., https://yourdomain.com)

class TelegramMessage(BaseModel):
    chat_id: int
    text: str
    parse_mode: Optional[str] = None


# Slack Models
class SlackWebhookSetup(BaseModel):
    base_url: str  # Base URL of your application (e.g., https://yourdomain.com)

class SlackMessage(BaseModel):
    channel: str  # Channel ID or DM ID
    text: str


class DiscordWebhookSetup(BaseModel):
    base_url: str  # Base URL of your application (e.g., https://yourdomain.com)

class DiscordMessage(BaseModel):
    channel_id: str  # Discord channel ID
    content: str


# MS Teams Models
class MSTeamsWebhookSetup(BaseModel):
    chatbot_id: str
    webhook_url: str
    status: Literal["pending", "active", "error"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MSTeamsMessage(BaseModel):
    conversation_id: str  # MS Teams conversation ID
    text: str
    service_url: Optional[str] = None  # Service URL for sending messages


# Instagram Models
class InstagramWebhookSetup(BaseModel):
    base_url: str  # Base URL of your application (e.g., https://yourdomain.com)

class InstagramMessage(BaseModel):
    recipient_id: str  # Instagram user ID
    text: str


# WhatsApp Models
class WhatsAppWebhookSetup(BaseModel):
    base_url: str  # Base URL of your application (e.g., https://yourdomain.com)

class WhatsAppMessage(BaseModel):
    recipient_phone: str  # Phone number with country code (e.g., +1234567890)
    text: str


# Zapier Integration Models
class ZapierWebhookPayload(BaseModel):
    message: Optional[str] = None
    text: Optional[str] = None
    content: Optional[str] = None
    user_id: Optional[str] = "zapier_user"
    user_name: Optional[str] = "Zapier User"
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# Plan Models
class PlanLimits(BaseModel):
    max_chatbots: int
    max_messages_per_month: int
    max_file_uploads: int
    max_website_sources: int
    max_text_sources: int


class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    interval: Literal["monthly", "yearly"] = "monthly"
    limits: PlanLimits
    features: List[str] = []
    is_popular: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PlanUpgradeRequest(BaseModel):
    plan_id: str
