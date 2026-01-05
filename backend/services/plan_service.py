from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
from datetime import datetime, timedelta
from models import Plan, PlanLimits
import os

class PlanService:
    """Service for managing plans and subscriptions"""
    
    def __init__(self):
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'chatbase_db')
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.plans_collection = self.db.plans
        self.subscriptions_collection = self.db.subscriptions
        self.users_collection = self.db.users
        
    async def initialize_plans(self):
        """Initialize default plans in database"""
        plans_data = [
            {
                "id": "free",
                "name": "Free",
                "price": 0.0,
                "description": "Perfect for trying out BotSmith",
                "limits": {
                    "max_chatbots": 1,
                    "max_messages_per_month": 100,
                    "max_file_uploads": 5,
                    "max_file_size_mb": 10,
                    "max_website_sources": 2,
                    "max_text_sources": 5,
                    "max_leads": 50,
                    "conversation_history_days": 7,
                    "allowed_ai_providers": ["openai"],
                    "api_access": False,
                    "custom_branding": False,
                    "analytics_level": "basic",
                    "support_level": "community"
                },
                "features": [
                    "1 chatbot",
                    "100 messages/month",
                    "Basic analytics",
                    "Community support",
                    "Standard AI models"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
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
                    "max_leads": 100,
                    "conversation_history_days": 30,
                    "allowed_ai_providers": ["openai", "anthropic"],
                    "api_access": True,
                    "custom_branding": True,
                    "analytics_level": "advanced",
                    "support_level": "priority"
                },
                "features": [
                    "5 chatbots",
                    "15,000 messages/month",
                    "Advanced analytics",
                    "Priority support",
                    "Custom branding",
                    "API access",
                    "All AI models"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": "professional",
                "name": "Professional",
                "price": 24999.0,
                "description": "For large teams & high volume",
                "limits": {
                    "max_chatbots": 25,
                    "max_messages_per_month": 125000,
                    "max_file_uploads": 100,
                    "max_file_size_mb": 100,
                    "max_website_sources": 50,
                    "max_text_sources": 100,
                    "max_leads": 1000,
                    "conversation_history_days": 90,
                    "allowed_ai_providers": ["openai", "anthropic", "google"],
                    "api_access": True,
                    "custom_branding": True,
                    "analytics_level": "advanced",
                    "support_level": "24/7 priority"
                },
                "features": [
                    "25 chatbots",
                    "1,25,000 messages/month",
                    "Advanced analytics",
                    "24/7 priority support",
                    "Custom branding",
                    "Full API access",
                    "All AI models",
                    "Custom integrations",
                    "Dedicated account manager"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price": -1.0,  # Custom pricing
                "description": "Tailored solutions for your needs",
                "limits": {
                    "max_chatbots": 999999,  # Unlimited
                    "max_messages_per_month": 999999999,  # Unlimited
                    "max_file_uploads": 999999,  # Unlimited
                    "max_file_size_mb": 100,
                    "max_website_sources": 999999,  # Unlimited
                    "max_text_sources": 999999,  # Unlimited
                    "max_leads": 999999,  # Unlimited
                    "conversation_history_days": 999999,  # Unlimited
                    "allowed_ai_providers": ["openai", "anthropic", "google"],
                    "api_access": True,
                    "custom_branding": True,
                    "analytics_level": "custom",
                    "support_level": "dedicated 24/7"
                },
                "features": [
                    "Unlimited chatbots",
                    "Unlimited messages",
                    "Custom analytics",
                    "Dedicated 24/7 support",
                    "White-label solution",
                    "Custom AI model training",
                    "On-premise deployment",
                    "SLA guarantee",
                    "Custom contracts",
                    "Enterprise security"
                ],
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        # Clear existing plans and insert new ones
        await self.plans_collection.delete_many({})
        await self.plans_collection.insert_many(plans_data)
        print("✅ Plans initialized successfully")
    
    async def get_all_plans(self) -> List[dict]:
        """Get all active plans"""
        plans = await self.plans_collection.find({"is_active": True}).to_list(length=100)
        return plans
    
    async def get_plan_by_id(self, plan_id: str) -> Optional[dict]:
        """Get plan by ID"""
        plan = await self.plans_collection.find_one({"id": plan_id})
        return plan
    
    async def get_user_subscription(self, user_id: str) -> Optional[dict]:
        """Get user's current subscription"""
        subscription = await self.subscriptions_collection.find_one({"user_id": user_id})
        if not subscription:
            # Create default free subscription
            await self.create_subscription(user_id, "free")
            subscription = await self.subscriptions_collection.find_one({"user_id": user_id})
        return subscription
    
    async def create_subscription(self, user_id: str, plan_id: str = "free") -> dict:
        """Create a new subscription for user"""
        # Calculate expiration date - 6 days for free plan, 30 days for paid plans
        started_at = datetime.utcnow()
        days_to_add = 6 if plan_id == "free" else 30
        expires_at = started_at + timedelta(days=days_to_add)
        
        subscription = {
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "auto_renew": False,
            "billing_cycle": "monthly",  # monthly, yearly
            "usage": {
                "chatbots_count": 0,
                "messages_this_month": 0,
                "file_uploads_count": 0,
                "website_sources_count": 0,
                "text_sources_count": 0,
                "last_reset": datetime.utcnow()
            }
        }
        
        result = await self.subscriptions_collection.insert_one(subscription)
        subscription["_id"] = str(result.inserted_id)
        return subscription
    
    async def upgrade_plan(self, user_id: str, new_plan_id: str) -> dict:
        """
        Upgrade user to a new plan
        
        NEW SUBSCRIPTION MODEL (2025):
        - When upgrading from FREE to PAID plan (Starter/Professional/Enterprise):
          Subscription starts FRESH with exactly 30 days from now
        - No carry-forward of remaining FREE plan time
        - No extra days, no billing confusion
        - Paid subscription always starts with full duration
        """
        # Get current subscription
        subscription = await self.get_user_subscription(user_id)
        
        # Calculate new expiration date - 6 days for free plan, 30 days for paid plans
        # ALWAYS start fresh from now, no carry-forward from previous plan
        started_at = datetime.utcnow()
        days_to_add = 6 if new_plan_id == "free" else 30
        expires_at = started_at + timedelta(days=days_to_add)
        
        # Update plan with fresh subscription dates
        update_data = {
            "plan_id": new_plan_id,
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "auto_renew": False,
            "billing_cycle": "monthly"
        }
        
        await self.subscriptions_collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Get updated subscription
        updated_subscription = await self.get_user_subscription(user_id)
        return updated_subscription
    
    async def check_limit(self, user_id: str, limit_type: str) -> dict:
        """Check if user has reached a specific limit"""
        subscription = await self.get_user_subscription(user_id)
        plan = await self.get_plan_by_id(subscription["plan_id"])
        
        # Get user's custom limits if they exist
        user = await self.users_collection.find_one({"id": user_id})
        custom_limits = user.get("custom_limits", {}) if user else {}
        
        usage = subscription.get("usage", {})
        limits = plan["limits"]
        
        # Apply custom limits (they override plan limits if set)
        # Check both custom_limits dict and legacy custom_max_* fields
        effective_max_chatbots = custom_limits.get("max_chatbots") or user.get("custom_max_chatbots") if user else None
        effective_max_messages = custom_limits.get("max_messages_per_month") or user.get("custom_max_messages") if user else None
        effective_max_file_uploads = custom_limits.get("max_file_uploads") or user.get("custom_max_file_uploads") if user else None
        effective_max_website_sources = custom_limits.get("max_website_sources") if custom_limits else None
        effective_max_text_sources = custom_limits.get("max_text_sources") if custom_limits else None
        
        # Use custom limits if set, otherwise use plan limits
        max_chatbots = effective_max_chatbots if effective_max_chatbots is not None else limits["max_chatbots"]
        max_messages = effective_max_messages if effective_max_messages is not None else limits["max_messages_per_month"]
        max_file_uploads = effective_max_file_uploads if effective_max_file_uploads is not None else limits["max_file_uploads"]
        max_website_sources = effective_max_website_sources if effective_max_website_sources is not None else limits["max_website_sources"]
        max_text_sources = effective_max_text_sources if effective_max_text_sources is not None else limits["max_text_sources"]
        
        limit_checks = {
            "chatbots": {
                "current": usage.get("chatbots_count", 0),
                "max": max_chatbots,
                "reached": usage.get("chatbots_count", 0) >= max_chatbots,
                "custom_limit_applied": effective_max_chatbots is not None
            },
            "messages": {
                "current": usage.get("messages_this_month", 0),
                "max": max_messages,
                "reached": usage.get("messages_this_month", 0) >= max_messages,
                "custom_limit_applied": effective_max_messages is not None
            },
            "file_uploads": {
                "current": usage.get("file_uploads_count", 0),
                "max": max_file_uploads,
                "reached": usage.get("file_uploads_count", 0) >= max_file_uploads,
                "custom_limit_applied": effective_max_file_uploads is not None
            },
            "website_sources": {
                "current": usage.get("website_sources_count", 0),
                "max": max_website_sources,
                "reached": usage.get("website_sources_count", 0) >= max_website_sources,
                "custom_limit_applied": effective_max_website_sources is not None
            },
            "text_sources": {
                "current": usage.get("text_sources_count", 0),
                "max": max_text_sources,
                "reached": usage.get("text_sources_count", 0) >= max_text_sources,
                "custom_limit_applied": effective_max_text_sources is not None
            }
        }
        
        if limit_type in limit_checks:
            return limit_checks[limit_type]
        
        return {"error": "Invalid limit type"}
    
    async def increment_usage(self, user_id: str, usage_type: str, amount: int = 1):
        """Increment usage counter"""
        field_map = {
            "chatbots": "usage.chatbots_count",
            "messages": "usage.messages_this_month",
            "file_uploads": "usage.file_uploads_count",
            "website_sources": "usage.website_sources_count",
            "text_sources": "usage.text_sources_count"
        }
        
        if usage_type in field_map:
            await self.subscriptions_collection.update_one(
                {"user_id": user_id},
                {"$inc": {field_map[usage_type]: amount}}
            )
    
    async def decrement_usage(self, user_id: str, usage_type: str, amount: int = 1):
        """Decrement usage counter (when deleting resources)"""
        field_map = {
            "chatbots": "usage.chatbots_count",
            "file_uploads": "usage.file_uploads_count",
            "website_sources": "usage.website_sources_count",
            "text_sources": "usage.text_sources_count"
        }
        
        if usage_type in field_map:
            await self.subscriptions_collection.update_one(
                {"user_id": user_id},
                {"$inc": {field_map[usage_type]: -amount}}
            )
    
    async def reset_monthly_usage(self, user_id: str):
        """Reset monthly counters"""
        await self.subscriptions_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "usage.messages_this_month": 0,
                    "usage.last_reset": datetime.utcnow()
                }
            }
        )
    
    async def check_subscription_status(self, user_id: str) -> dict:
        """Check if subscription is expired or about to expire"""
        subscription = await self.get_user_subscription(user_id)
        
        if not subscription:
            return {"status": "no_subscription", "is_expired": True}
        
        expires_at = subscription.get("expires_at")
        if not expires_at:
            return {"status": "active", "is_expired": False, "days_remaining": None}
        
        now = datetime.utcnow()
        
        # Check if expired
        if now > expires_at:
            # Auto-expire the subscription
            await self.subscriptions_collection.update_one(
                {"user_id": user_id},
                {"$set": {"status": "expired"}}
            )
            return {
                "status": "expired",
                "is_expired": True,
                "expired_on": expires_at,
                "days_overdue": (now - expires_at).days
            }
        
        # Calculate days remaining
        days_remaining = (expires_at - now).days
        
        # Check if expiring soon (within 3 days)
        is_expiring_soon = days_remaining <= 3
        
        return {
            "status": subscription.get("status", "active"),
            "is_expired": False,
            "is_expiring_soon": is_expiring_soon,
            "days_remaining": days_remaining,
            "expires_at": expires_at
        }
    
    async def renew_subscription(self, user_id: str) -> dict:
        """Renew user's current subscription for another month"""
        subscription = await self.get_user_subscription(user_id)
        
        now = datetime.utcnow()
        current_expires_at = subscription.get("expires_at")
        plan_id = subscription.get("plan_id", "free")
        
        # Determine renewal duration based on plan
        days_to_add = 6 if plan_id == "free" else 30
        
        # Calculate new expiration date
        # If subscription is expired or has no expiration, start from now
        # If subscription is still active, extend from current expiration date
        if not current_expires_at or now > current_expires_at:
            # Subscription is expired or no expiration set - start from now
            expires_at = now + timedelta(days=days_to_add)
            started_at = now
        else:
            # Subscription is still active - extend from current expiration
            expires_at = current_expires_at + timedelta(days=days_to_add)
            started_at = subscription.get("started_at", now)  # Keep original start date
        
        # Update subscription
        update_data = {
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at
        }
        
        await self.subscriptions_collection.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Get updated subscription
        updated_subscription = await self.get_user_subscription(user_id)
        return updated_subscription
    
    async def get_usage_stats(self, user_id: str) -> dict:
        """Get detailed usage statistics with limits"""
        subscription = await self.get_user_subscription(user_id)
        plan = await self.get_plan_by_id(subscription["plan_id"])
        
        usage = subscription.get("usage", {})
        limits = plan["limits"]
        
        # Check if user has custom limits and override plan limits
        users_collection = self.db.users
        user_doc = await users_collection.find_one({"id": user_id})
        
        if user_doc:
            # Get custom limits from both new dict format and legacy fields
            custom_limits = user_doc.get("custom_limits", {})
            
            # Override with custom limits if they exist
            # Check new custom_limits dict first, then legacy fields
            if custom_limits.get("max_chatbots") is not None:
                limits["max_chatbots"] = custom_limits["max_chatbots"]
            elif user_doc.get("custom_max_chatbots") is not None:
                limits["max_chatbots"] = user_doc["custom_max_chatbots"]
                
            if custom_limits.get("max_messages_per_month") is not None:
                limits["max_messages_per_month"] = custom_limits["max_messages_per_month"]
            elif user_doc.get("custom_max_messages") is not None:
                limits["max_messages_per_month"] = user_doc["custom_max_messages"]
                
            if custom_limits.get("max_file_uploads") is not None:
                limits["max_file_uploads"] = custom_limits["max_file_uploads"]
            elif user_doc.get("custom_max_file_uploads") is not None:
                limits["max_file_uploads"] = user_doc["custom_max_file_uploads"]
                
            # Also check for website and text sources from custom_limits
            if custom_limits.get("max_website_sources") is not None:
                limits["max_website_sources"] = custom_limits["max_website_sources"]
                
            if custom_limits.get("max_text_sources") is not None:
                limits["max_text_sources"] = custom_limits["max_text_sources"]
        
        # Get subscription status
        subscription_status = await self.check_subscription_status(user_id)
        
        return {
            "plan": {
                "id": plan["id"],
                "name": plan["name"],
                "price": plan["price"],
                "limits": limits  # Include limits with custom_branding flag for frontend
            },
            "subscription": {
                "status": subscription.get("status", "active"),
                "started_at": subscription.get("started_at"),
                "expires_at": subscription.get("expires_at"),
                "is_expired": subscription_status.get("is_expired", False),
                "is_expiring_soon": subscription_status.get("is_expiring_soon", False),
                "days_remaining": subscription_status.get("days_remaining"),
                "auto_renew": subscription.get("auto_renew", False),
                "billing_cycle": subscription.get("billing_cycle", "monthly")
            },
            "usage": {
                "chatbots": {
                    "current": usage.get("chatbots_count", 0),
                    "limit": limits["max_chatbots"],
                    "percentage": round((usage.get("chatbots_count", 0) / limits["max_chatbots"]) * 100, 1) if limits["max_chatbots"] < 999999 else 0,
                    "is_custom": (user_doc.get("custom_limits", {}).get("max_chatbots") is not None or user_doc.get("custom_max_chatbots") is not None) if user_doc else False
                },
                "messages": {
                    "current": usage.get("messages_this_month", 0),
                    "limit": limits["max_messages_per_month"],
                    "percentage": round((usage.get("messages_this_month", 0) / limits["max_messages_per_month"]) * 100, 1) if limits["max_messages_per_month"] < 999999 else 0,
                    "is_custom": (user_doc.get("custom_limits", {}).get("max_messages_per_month") is not None or user_doc.get("custom_max_messages") is not None) if user_doc else False
                },
                "file_uploads": {
                    "current": usage.get("file_uploads_count", 0),
                    "limit": limits["max_file_uploads"],
                    "percentage": round((usage.get("file_uploads_count", 0) / limits["max_file_uploads"]) * 100, 1) if limits["max_file_uploads"] < 999999 else 0,
                    "is_custom": (user_doc.get("custom_limits", {}).get("max_file_uploads") is not None or user_doc.get("custom_max_file_uploads") is not None) if user_doc else False
                },
                "website_sources": {
                    "current": usage.get("website_sources_count", 0),
                    "limit": limits["max_website_sources"],
                    "percentage": round((usage.get("website_sources_count", 0) / limits["max_website_sources"]) * 100, 1) if limits["max_website_sources"] < 999999 else 0,
                    "is_custom": (user_doc.get("custom_limits", {}).get("max_website_sources") is not None) if user_doc else False
                },
                "text_sources": {
                    "current": usage.get("text_sources_count", 0),
                    "limit": limits["max_text_sources"],
                    "percentage": round((usage.get("text_sources_count", 0) / limits["max_text_sources"]) * 100, 1) if limits["max_text_sources"] < 999999 else 0,
                    "is_custom": (user_doc.get("custom_limits", {}).get("max_text_sources") is not None) if user_doc else False
                }
            },
            "last_reset": usage.get("last_reset", datetime.utcnow())
        }

# Global instance
plan_service = PlanService()
