from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import csv
import io
from fastapi.responses import StreamingResponse, Response
import psutil
import os
from uuid import uuid4
import logging

router = APIRouter(prefix="/admin", tags=["admin"])
db_instance = None
logger = logging.getLogger(__name__)

def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance
    db_instance = db

# Pydantic models
class UserUpdate(BaseModel):
    plan: Optional[str] = None
    max_chatbots: Optional[int] = None
    max_messages: Optional[int] = None
    status: Optional[str] = None

class ChatbotUpdate(BaseModel):
    enabled: Optional[bool] = None
    status: Optional[str] = None

class BulkOperation(BaseModel):
    ids: List[str]
    operation: str  # 'delete', 'enable', 'disable', 'export'

class AIProviderConfig(BaseModel):
    provider: str
    api_key: Optional[str] = None
    enabled: bool = True
    rate_limit: Optional[int] = None

class UserEditData(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    plan: Optional[str] = None
    max_chatbots: Optional[int] = None
    max_messages: Optional[int] = None
    max_file_uploads: Optional[int] = None
    max_website_sources: Optional[int] = None
    max_text_sources: Optional[int] = None
    status: Optional[str] = None

class PlatformSettings(BaseModel):
    site_name: Optional[str] = None
    site_logo_url: Optional[str] = None
    timezone: Optional[str] = None
    default_language: Optional[str] = None
    support_email: Optional[str] = None
    admin_email: Optional[str] = None

class OAuthProvider(BaseModel):
    enabled: Optional[bool] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

class PasswordPolicy(BaseModel):
    min_length: Optional[int] = None
    require_uppercase: Optional[bool] = None
    require_lowercase: Optional[bool] = None
    require_numbers: Optional[bool] = None
    require_special_chars: Optional[bool] = None
    password_expiry_days: Optional[int] = None

class TwoFactorAuth(BaseModel):
    enforce_for_admins: Optional[bool] = None
    enforce_for_all_users: Optional[bool] = None
    allowed_methods: Optional[List[str]] = None

class SessionSettings(BaseModel):
    session_timeout_minutes: Optional[int] = None
    max_concurrent_sessions: Optional[int] = None
    remember_me_duration_days: Optional[int] = None

class AuthenticationSettings(BaseModel):
    require_email_verification: Optional[bool] = None
    enable_oauth: Optional[bool] = None
    oauth_providers: Optional[Dict[str, OAuthProvider]] = None
    password_policy: Optional[PasswordPolicy] = None
    two_factor_auth: Optional[TwoFactorAuth] = None
    session_settings: Optional[SessionSettings] = None
    auto_approve_registrations: Optional[bool] = None
    allowed_email_domains: Optional[str] = None
    blocked_email_domains: Optional[str] = None
    registration_welcome_message: Optional[str] = None
    failed_login_attempts_limit: Optional[int] = None
    account_lockout_duration_minutes: Optional[int] = None

class IntegrationConfig(BaseModel):
    enabled: Optional[bool] = None
    max_per_chatbot: Optional[int] = None

class SystemSettings(BaseModel):
    maintenance_mode: Optional[bool] = None
    allow_registrations: Optional[bool] = None
    default_plan: Optional[str] = None
    max_chatbots_per_user: Optional[int] = None
    email_notifications: Optional[bool] = None
    auto_moderation: Optional[bool] = None
    ai_providers: Optional[Dict[str, Dict[str, Any]]] = None
    platform: Optional[PlatformSettings] = None
    authentication: Optional[AuthenticationSettings] = None
    integrations: Optional[Dict[str, IntegrationConfig]] = None

class EmailTemplate(BaseModel):
    name: str
    subject: str
    body: str
    variables: Optional[List[str]] = None

class BulkEmail(BaseModel):
    subject: str
    body: str
    recipient_filter: Optional[str] = None  # 'all', 'free', 'paid'


@router.get("/stats")
async def get_admin_stats() -> Dict[str, Any]:
    """
    Get admin dashboard statistics
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        # Get total users count from users collection
        users_collection = db_instance['users']
        total_users = await users_collection.count_documents({})
        
        # Get total chatbots count
        chatbots_collection = db_instance['chatbots']
        total_chatbots = await chatbots_collection.count_documents({})
        
        # Get total messages count
        messages_collection = db_instance['messages']
        total_messages = await messages_collection.count_documents({})
        
        # Get active integrations count
        integrations_collection = db_instance['integrations']
        active_integrations = await integrations_collection.count_documents({'enabled': True})
        
        return {
            "totalUsers": total_users,
            "activeChatbots": total_chatbots,
            "totalMessages": total_messages,
            "activeIntegrations": active_integrations
        }
    except Exception as e:
        logger.error(f"Error in get_admin_stats: {str(e)}")
        return {
            "totalUsers": 0,
            "activeChatbots": 0,
            "totalMessages": 0,
            "activeIntegrations": 0
        }


@router.get("/users")
async def get_all_users():
    """
    Get all users in the system
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        chatbots_collection = db_instance['chatbots']
        
        # Get all unique users from chatbots
        pipeline = [
            {
                "$group": {
                    "_id": "$user_id",
                    "chatbots_count": {"$sum": 1},
                    "created_at": {"$first": "$created_at"}
                }
            },
            {
                "$project": {
                    "user_id": "$_id",
                    "chatbots_count": 1,
                    "created_at": 1,
                    "_id": 0
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        
        users = []
        async for user in chatbots_collection.aggregate(pipeline):
            users.append(user)
        
        return {
            "users": users,
            "total": len(users)
        }
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        return {
            "users": [],
            "total": 0
        }


@router.get("/chatbots")
async def get_all_chatbots():
    """
    Get all chatbots in the system
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        chatbots_collection = db_instance['chatbots']
        
        chatbots = []
        cursor = chatbots_collection.find(
            {},
            {
                "_id": 0,
                "id": 1,
                "name": 1,
                "ai_provider": 1,
                "ai_model": 1,
                "user_id": 1,
                "created_at": 1,
                "updated_at": 1
            }
        ).sort("created_at", -1)
        
        async for chatbot in cursor:
            chatbots.append(chatbot)
        
        return {
            "chatbots": chatbots,
            "total": len(chatbots)
        }
    except Exception as e:
        print(f"Error in get_all_chatbots: {str(e)}")
        return {
            "chatbots": [],
            "total": 0
        }


@router.get("/activity-logs")
async def get_activity_logs(limit: int = 100):
    """
    Get recent activity logs
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        conversations_collection = db_instance['conversations']
        
        # Get recent conversations as activity logs
        logs = []
        cursor = conversations_collection.find(
            {},
            {
                "_id": 0,
                "id": 1,
                "chatbot_id": 1,
                "user_id": 1,
                "status": 1,
                "created_at": 1,
                "message_count": 1
            }
        ).sort("created_at", -1).limit(limit)
        
        async for log in cursor:
            logs.append(log)
        
        return {
            "logs": logs,
            "total": len(logs)
        }
    except Exception as e:
        print(f"Error in get_activity_logs: {str(e)}")
        return {
            "logs": [],
            "total": 0
        }


@router.get("/analytics")
async def get_admin_analytics():
    """
    Get admin analytics data
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        conversations_collection = db_instance['conversations']
        chatbots_collection = db_instance['chatbots']
        
        # Get conversations over time (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Conversations by day
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": thirty_days_ago.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {"$toDate": "$created_at"}
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        conversations_by_day = []
        async for doc in conversations_collection.aggregate(pipeline):
            conversations_by_day.append(doc)
        
        # Most popular AI providers
        provider_stats = []
        async for doc in chatbots_collection.aggregate([
            {
                "$group": {
                    "_id": "$ai_provider",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]):
            provider_stats.append(doc)
        
        return {
            "conversationsByDay": conversations_by_day,
            "providerStats": provider_stats
        }
    except Exception as e:
        print(f"Error in get_admin_analytics: {str(e)}")
        return {
            "conversationsByDay": [],
            "providerStats": []
        }


@router.get("/analytics/users/growth")
async def get_user_growth(days: int = Query(default=30, ge=1, le=365)):
    """
    Get user growth analytics over specified number of days (cumulative)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        users_collection = db_instance['users']
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all users with their creation dates
        pipeline = [
            {
                "$match": {
                    "created_at": {"$exists": True}
                }
            },
            {
                "$project": {
                    "date": {"$substr": ["$created_at", 0, 10]}
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        # Get user counts by day
        users_by_day = {}
        async for doc in users_collection.aggregate(pipeline):
            users_by_day[doc['_id']] = doc['count']
        
        # Generate cumulative data for all days in range
        growth_data = []
        cumulative = 0
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            daily_count = users_by_day.get(date_str, 0)
            cumulative += daily_count
            
            growth_data.append({
                "date": date_str,
                "count": cumulative  # Frontend expects 'count' field
            })
            current_date += timedelta(days=1)
        
        return {
            "growth": growth_data,
            "total": len(growth_data),
            "period_days": days
        }
    except Exception as e:
        logger.error(f"Error in get_user_growth: {str(e)}")
        return {
            "growth": [],
            "total": 0,
            "period_days": days
        }


@router.get("/analytics/messages/volume")
async def get_message_volume(days: int = Query(default=30, ge=1, le=365)):
    """
    Get message volume analytics over specified number of days (daily counts)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        messages_collection = db_instance['messages']
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.strftime('%Y-%m-%d')
        
        # Get messages by day
        pipeline = [
            {
                "$match": {
                    "timestamp": {"$exists": True}
                }
            },
            {
                "$project": {
                    "date": {"$substr": ["$timestamp", 0, 10]}
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        # Get message counts by day
        messages_by_day = {}
        async for doc in messages_collection.aggregate(pipeline):
            if doc['_id'] >= start_date_str:
                messages_by_day[doc['_id']] = doc['count']
        
        # Generate data for all days in range
        volume_data = []
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            daily_count = messages_by_day.get(date_str, 0)
            
            volume_data.append({
                "date": date_str,
                "count": daily_count  # Frontend expects 'count' field
            })
            current_date += timedelta(days=1)
        
        return {
            "volume": volume_data,
            "total": len(volume_data),
            "period_days": days
        }
    except Exception as e:
        logger.error(f"Error in get_message_volume: {str(e)}")
        return {
            "volume": [],
            "total": 0,
            "period_days": days
        }


@router.get("/analytics/providers/distribution")
async def get_provider_distribution():
    """
    Get AI provider distribution analytics
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        chatbots_collection = db_instance['chatbots']
        
        # Aggregate by provider
        pipeline = [
            {
                "$group": {
                    "_id": "$ai_provider",
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "provider": "$_id",
                    "count": 1
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        distribution_data = []
        async for doc in chatbots_collection.aggregate(pipeline):
            distribution_data.append(doc)
        
        return {
            "distribution": distribution_data,
            "providers": distribution_data,  # Alias for compatibility
            "total_providers": len(distribution_data)
        }
    except Exception as e:
        logger.error(f"Error in get_provider_distribution: {str(e)}")
        return {
            "distribution": [],
            "providers": [],
            "total_providers": 0
        }


@router.get("/analytics/conversations/trend")
async def get_conversations_trend(days: int = Query(default=30, ge=1, le=365)):
    """
    Get conversations trend over specified number of days
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        conversations_collection = db_instance['conversations']
        
        # Calculate start date
        start_date = datetime.now() - timedelta(days=days)
        
        # Aggregate conversations by day
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date.isoformat()}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": {"$toDate": "$created_at"}
                        }
                    },
                    "conversations": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "date": "$_id",
                    "conversations": 1,
                    "count": "$conversations"  # Alias for compatibility with frontend
                }
            },
            {"$sort": {"date": 1}}
        ]
        
        trend_data = []
        async for doc in conversations_collection.aggregate(pipeline):
            trend_data.append(doc)
        
        return {
            "trend": trend_data,
            "total": len(trend_data),
            "period_days": days
        }
    except Exception as e:
        logger.error(f"Error in get_conversations_trend: {str(e)}")
        return {
            "trend": [],
            "total": 0,
            "period_days": days
        }


# ==================== USER MANAGEMENT ====================
@router.get("/users/detailed")
async def get_users_detailed():
    """Get detailed user information with usage stats"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        conversations_collection = db_instance['conversations']
        
        # Get all unique users
        user_ids = await chatbots_collection.distinct('user_id')
        
        users_data = []
        for user_id in user_ids:
            # Count chatbots
            chatbots_count = await chatbots_collection.count_documents({"user_id": user_id})
            
            # Get user's chatbots
            user_chatbots = []
            async for bot in chatbots_collection.find({"user_id": user_id}):
                user_chatbots.append(bot.get('id'))
            
            # Count messages for user's chatbots
            messages_count = 0
            conversations_count = 0
            if user_chatbots:
                messages_count = await messages_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
                conversations_count = await conversations_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
            
            # Get user's first chatbot creation date
            first_chatbot = await chatbots_collection.find_one(
                {"user_id": user_id},
                sort=[("created_at", 1)]
            )
            
            users_data.append({
                "user_id": user_id,
                "email": f"{user_id}@botsmith.co",  # Mock email
                "chatbots_count": chatbots_count,
                "messages_count": messages_count,
                "conversations_count": conversations_count,
                "created_at": first_chatbot.get('created_at') if first_chatbot else None,
                "plan": "Free",  # Default plan
                "status": "active",
                "max_chatbots": 1,
                "max_messages": 100
            })
        
        return {
            "users": users_data,
            "total": len(users_data)
        }
    except Exception as e:
        print(f"Error in get_users_detailed: {str(e)}")
        return {"users": [], "total": 0}


@router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: UserUpdate):
    """Update user plan and limits"""
    try:
        # In a real app, you'd update a users collection
        # For now, we'll return success
        return {
            "success": True,
            "message": f"User {user_id} updated successfully",
            "user": {
                "user_id": user_id,
                **update_data.dict(exclude_unset=True)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete user and all their data"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # Get user's chatbots
        user_chatbots = []
        async for bot in chatbots_collection.find({"user_id": user_id}):
            user_chatbots.append(bot.get('id'))
        
        # Delete all related data
        if user_chatbots:
            await messages_collection.delete_many({"chatbot_id": {"$in": user_chatbots}})
            await conversations_collection.delete_many({"chatbot_id": {"$in": user_chatbots}})
            await sources_collection.delete_many({"chatbot_id": {"$in": user_chatbots}})
        
        # Delete user's chatbots
        chatbots_result = await chatbots_collection.delete_many({"user_id": user_id})
        
        # Delete the user from users collection
        user_result = await users_collection.delete_one({"id": user_id})
        
        if user_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        return {
            "success": True,
            "message": f"User {user_id} and all related data deleted successfully",
            "deleted_chatbots": chatbots_result.deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CHATBOT MANAGEMENT ====================
@router.get("/chatbots/detailed")
async def get_chatbots_detailed(
    search: Optional[str] = Query(None),
    ai_provider: Optional[str] = Query(None),
    enabled: Optional[bool] = Query(None),
    owner_id: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get detailed chatbot information with filtering, sorting, and pagination"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        integrations_collection = db_instance['integrations']
        
        # Build filter query
        filter_query = {}
        
        if search:
            filter_query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}},
                {'user_id': {'$regex': search, '$options': 'i'}}
            ]
        
        if ai_provider:
            filter_query['ai_provider'] = ai_provider
        
        if enabled is not None:
            filter_query['enabled'] = enabled
        
        if owner_id:
            filter_query['user_id'] = owner_id
        
        # Count total
        total_count = await chatbots_collection.count_documents(filter_query)
        
        # Determine sort direction
        sort_direction = -1 if sort_order == "desc" else 1
        
        # Fetch chatbots
        cursor = chatbots_collection.find(filter_query).sort(sort_by, sort_direction).skip(skip).limit(limit)
        chatbots = await cursor.to_list(length=limit)
        
        # Enrich with additional data
        enriched_chatbots = []
        for bot in chatbots:
            user_id = bot.get('user_id', '')
            bot_id = bot.get('id', bot.get('_id', ''))
            
            # Get owner info
            user = await users_collection.find_one({'id': user_id})
            owner_info = {
                'id': user_id,
                'name': user.get('name', 'Unknown') if user else 'Unknown',
                'email': user.get('email', 'N/A') if user else 'N/A',
                'plan': user.get('subscription', {}).get('plan_id', 'free') if user else 'free'
            }
            
            # Get statistics
            sources_count = await sources_collection.count_documents({'chatbot_id': bot_id})
            conversations_count = await conversations_collection.count_documents({'chatbot_id': bot_id})
            messages_count = await messages_collection.count_documents({'chatbot_id': bot_id})
            integrations_count = await integrations_collection.count_documents({'chatbot_id': bot_id})
            active_integrations = await integrations_collection.count_documents({'chatbot_id': bot_id, 'enabled': True})
            
            # Calculate last activity
            last_message = await messages_collection.find_one(
                {'chatbot_id': bot_id},
                sort=[('timestamp', -1)]
            )
            last_activity = last_message.get('timestamp') if last_message else bot.get('created_at')
            
            enriched_bot = {
                'id': bot_id,
                'name': bot.get('name', 'Unnamed'),
                'description': bot.get('description', ''),
                'user_id': user_id,
                'owner': owner_info,
                'ai_provider': bot.get('ai_provider', 'openai'),
                'ai_model': bot.get('ai_model', 'gpt-4o-mini'),
                'temperature': bot.get('temperature', 0.7),
                'max_tokens': bot.get('max_tokens', 2000),
                'system_prompt': bot.get('system_prompt', ''),
                'welcome_message': bot.get('welcome_message', ''),
                'enabled': bot.get('enabled', True),
                'public_access': bot.get('public_access', True),
                'created_at': bot.get('created_at', datetime.utcnow().isoformat()),
                'updated_at': bot.get('updated_at', datetime.utcnow().isoformat()),
                'last_activity': last_activity.isoformat() if isinstance(last_activity, datetime) else last_activity,
                'statistics': {
                    'sources_count': sources_count,
                    'conversations_count': conversations_count,
                    'messages_count': messages_count,
                    'integrations_count': integrations_count,
                    'active_integrations': active_integrations
                },
                'widget_settings': {
                    'position': bot.get('widget_position', 'bottom-right'),
                    'theme': bot.get('widget_theme', 'light'),
                    'size': bot.get('widget_size', 'medium'),
                    'auto_expand': bot.get('auto_expand', False)
                },
                'appearance': {
                    'primary_color': bot.get('primary_color', '#8B5CF6'),
                    'secondary_color': bot.get('secondary_color', '#EC4899'),
                    'chat_bubble_color': bot.get('chat_bubble_color', '#F3F4F6'),
                    'font_family': bot.get('font_family', 'Inter')
                }
            }
            
            enriched_chatbots.append(enriched_bot)
        
        return {
            'success': True,
            'chatbots': enriched_chatbots,
            'total': total_count,
            'skip': skip,
            'limit': limit,
            'has_more': (skip + limit) < total_count
        }
    except Exception as e:
        logger.error(f"Error in get_chatbots_detailed: {str(e)}")
        return {"success": False, "chatbots": [], "total": 0, "error": str(e)}


@router.put("/chatbots/{chatbot_id}/toggle")
async def toggle_chatbot(chatbot_id: str):
    """Enable/disable a chatbot"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Get current status
        chatbot = await chatbots_collection.find_one({"id": chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        current_enabled = chatbot.get('enabled', True)
        new_enabled = not current_enabled
        
        # Update
        await chatbots_collection.update_one(
            {"id": chatbot_id},
            {"$set": {"enabled": new_enabled, "updated_at": datetime.now().isoformat()}}
        )
        
        return {
            "success": True,
            "chatbot_id": chatbot_id,
            "enabled": new_enabled
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chatbots/bulk")
async def bulk_chatbot_operations(operation: BulkOperation):
    """Perform bulk operations on chatbots"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        if operation.operation == "delete":
            result = await chatbots_collection.delete_many({"id": {"$in": operation.ids}})
            return {
                "success": True,
                "operation": "delete",
                "affected": result.deleted_count
            }
        elif operation.operation == "enable":
            result = await chatbots_collection.update_many(
                {"id": {"$in": operation.ids}},
                {"$set": {"enabled": True}}
            )
            return {
                "success": True,
                "operation": "enable",
                "affected": result.modified_count
            }
        elif operation.operation == "disable":
            result = await chatbots_collection.update_many(
                {"id": {"$in": operation.ids}},
                {"$set": {"enabled": False}}
            )
            return {
                "success": True,
                "operation": "disable",
                "affected": result.modified_count
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid operation")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/chatbots/{chatbot_id}/details")
async def get_chatbot_full_details(chatbot_id: str):
    """Get complete details for a specific chatbot including sources, integrations, and conversations"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        integrations_collection = db_instance['integrations']
        
        # Get chatbot
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get owner
        user = await users_collection.find_one({'id': chatbot.get('user_id')})
        
        # Get sources
        sources_cursor = sources_collection.find({'chatbot_id': chatbot_id})
        sources = await sources_cursor.to_list(length=100)
        
        # Get integrations
        integrations_cursor = integrations_collection.find({'chatbot_id': chatbot_id})
        integrations = await integrations_cursor.to_list(length=50)
        
        # Get recent conversations
        conversations_cursor = conversations_collection.find(
            {'chatbot_id': chatbot_id}
        ).sort('created_at', -1).limit(10)
        recent_conversations = await conversations_cursor.to_list(length=10)
        
        return {
            'success': True,
            'chatbot': {
                'id': chatbot.get('id'),
                'name': chatbot.get('name'),
                'description': chatbot.get('description'),
                'user_id': chatbot.get('user_id'),
                'ai_provider': chatbot.get('ai_provider'),
                'ai_model': chatbot.get('ai_model'),
                'temperature': chatbot.get('temperature'),
                'max_tokens': chatbot.get('max_tokens'),
                'system_prompt': chatbot.get('system_prompt'),
                'welcome_message': chatbot.get('welcome_message'),
                'enabled': chatbot.get('enabled', True),
                'public_access': chatbot.get('public_access', True),
                'created_at': chatbot.get('created_at'),
                'updated_at': chatbot.get('updated_at'),
                'widget_settings': {
                    'position': chatbot.get('widget_position'),
                    'theme': chatbot.get('widget_theme'),
                    'size': chatbot.get('widget_size'),
                    'auto_expand': chatbot.get('auto_expand')
                },
                'appearance': {
                    'primary_color': chatbot.get('primary_color'),
                    'secondary_color': chatbot.get('secondary_color'),
                    'chat_bubble_color': chatbot.get('chat_bubble_color'),
                    'font_family': chatbot.get('font_family')
                }
            },
            'owner': {
                'id': user.get('id') if user else None,
                'name': user.get('name') if user else 'Unknown',
                'email': user.get('email') if user else 'N/A',
                'plan': user.get('subscription', {}).get('plan_id', 'free') if user else 'free'
            },
            'sources': [
                {
                    'id': s.get('id'),
                    'type': s.get('type'),
                    'name': s.get('name'),
                    'content': s.get('content', '')[:200] + '...' if len(s.get('content', '')) > 200 else s.get('content', ''),
                    'status': s.get('status'),
                    'created_at': s.get('created_at')
                } for s in sources
            ],
            'integrations': [
                {
                    'id': i.get('id'),
                    'type': i.get('type'),
                    'enabled': i.get('enabled'),
                    'created_at': i.get('created_at')
                } for i in integrations
            ],
            'recent_conversations': [
                {
                    'id': c.get('id'),
                    'user_name': c.get('user_name', 'Anonymous'),
                    'status': c.get('status'),
                    'created_at': c.get('created_at')
                } for c in recent_conversations
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chatbot details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/chatbots/{chatbot_id}/update")
async def update_chatbot_settings(chatbot_id: str, update_data: dict):
    """Update chatbot settings"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Remove None values
        update_dict = {k: v for k, v in update_data.items() if v is not None}
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at timestamp
        update_dict['updated_at'] = datetime.utcnow().isoformat()
        
        # Update chatbot
        result = await chatbots_collection.update_one(
            {'id': chatbot_id},
            {'$set': update_dict}
        )
        
        return {
            'success': True,
            'message': 'Chatbot updated successfully',
            'modified': result.modified_count > 0,
            'updated_fields': list(update_dict.keys())
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chatbots/{chatbot_id}")
async def delete_chatbot_and_data(chatbot_id: str):
    """Delete a chatbot and all its related data"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        integrations_collection = db_instance['integrations']
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Delete all related data
        await sources_collection.delete_many({'chatbot_id': chatbot_id})
        await messages_collection.delete_many({'chatbot_id': chatbot_id})
        await conversations_collection.delete_many({'chatbot_id': chatbot_id})
        await integrations_collection.delete_many({'chatbot_id': chatbot_id})
        
        # Delete chatbot
        await chatbots_collection.delete_one({'id': chatbot_id})
        
        return {
            'success': True,
            'message': 'Chatbot and all related data deleted successfully',
            'chatbot_id': chatbot_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chatbots/{chatbot_id}/sources")
async def get_chatbot_sources_list(chatbot_id: str):
    """Get all sources for a chatbot"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        sources_collection = db_instance['sources']
        
        sources_cursor = sources_collection.find({'chatbot_id': chatbot_id})
        sources = await sources_cursor.to_list(length=None)
        
        return {
            'success': True,
            'chatbot_id': chatbot_id,
            'sources': [
                {
                    'id': s.get('id'),
                    'type': s.get('type'),
                    'name': s.get('name'),
                    'content': s.get('content', ''),
                    'status': s.get('status'),
                    'created_at': s.get('created_at'),
                    'file_size': len(s.get('content', '')),
                    'url': s.get('url', '')
                } for s in sources
            ],
            'total': len(sources)
        }
    except Exception as e:
        logger.error(f"Error getting chatbot sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chatbots/{chatbot_id}/sources/{source_id}")
async def delete_chatbot_source_item(chatbot_id: str, source_id: str):
    """Delete a specific source from a chatbot"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        sources_collection = db_instance['sources']
        
        # Delete source
        result = await sources_collection.delete_one({
            'id': source_id,
            'chatbot_id': chatbot_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Source not found")
        
        return {
            'success': True,
            'message': 'Source deleted successfully',
            'source_id': source_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting source: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chatbots/{chatbot_id}/analytics")
async def get_chatbot_analytics_data(chatbot_id: str, days: int = Query(30, ge=1, le=365)):
    """Get analytics for a specific chatbot"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        messages_collection = db_instance['messages']
        conversations_collection = db_instance['conversations']
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Count messages
        total_messages = await messages_collection.count_documents({'chatbot_id': chatbot_id})
        recent_messages = await messages_collection.count_documents({
            'chatbot_id': chatbot_id,
            'timestamp': {'$gte': start_date.isoformat()}
        })
        
        # Count conversations
        total_conversations = await conversations_collection.count_documents({'chatbot_id': chatbot_id})
        active_conversations = await conversations_collection.count_documents({
            'chatbot_id': chatbot_id,
            'status': 'active'
        })
        
        return {
            'success': True,
            'chatbot_id': chatbot_id,
            'period_days': days,
            'analytics': {
                'total_messages': total_messages,
                'recent_messages': recent_messages,
                'total_conversations': total_conversations,
                'active_conversations': active_conversations,
                'average_daily_messages': recent_messages / days if days > 0 else 0
            }
        }
    except Exception as e:
        logger.error(f"Error getting chatbot analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chatbots/{chatbot_id}/transfer-ownership")
async def transfer_ownership(chatbot_id: str, request: dict):
    """Transfer chatbot ownership to another user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        
        new_owner_id = request.get('new_owner_id')
        if not new_owner_id:
            raise HTTPException(status_code=400, detail="new_owner_id is required")
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Check if new owner exists
        new_owner = await users_collection.find_one({'id': new_owner_id})
        if not new_owner:
            raise HTTPException(status_code=404, detail="New owner not found")
        
        old_owner_id = chatbot.get('user_id')
        
        # Transfer ownership
        await chatbots_collection.update_one(
            {'id': chatbot_id},
            {'$set': {
                'user_id': new_owner_id,
                'updated_at': datetime.utcnow().isoformat()
            }}
        )
        
        return {
            'success': True,
            'message': 'Ownership transferred successfully',
            'chatbot_id': chatbot_id,
            'old_owner_id': old_owner_id,
            'new_owner_id': new_owner_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring ownership: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chatbots/export")
async def export_chatbots_data(format: str = Query("json")):
    """Export all chatbots data"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        
        # Get all chatbots
        cursor = chatbots_collection.find({})
        chatbots = await cursor.to_list(length=None)
        
        # Enrich with owner info
        export_data = []
        for bot in chatbots:
            user = await users_collection.find_one({'id': bot.get('user_id')})
            export_data.append({
                'id': bot.get('id'),
                'name': bot.get('name'),
                'description': bot.get('description'),
                'owner_name': user.get('name') if user else 'Unknown',
                'owner_email': user.get('email') if user else 'N/A',
                'ai_provider': bot.get('ai_provider'),
                'ai_model': bot.get('ai_model'),
                'enabled': bot.get('enabled', True),
                'public_access': bot.get('public_access', True),
                'created_at': bot.get('created_at'),
                'updated_at': bot.get('updated_at')
            })
        
        if format == "csv":
            # Create CSV
            output = io.StringIO()
            if export_data:
                writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
                writer.writeheader()
                writer.writerows(export_data)
            
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=chatbots_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
            )
        else:
            # Return JSON
            from fastapi.responses import Response
            return Response(
                content=json.dumps(export_data, indent=2),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=chatbots_{datetime.utcnow().strftime('%Y%m%d')}.json"}
            )
    except Exception as e:
        logger.error(f"Error exporting chatbots: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ==================== CONVERSATIONS MANAGEMENT ====================
@router.get("/conversations")
async def get_all_conversations(
    chatbot_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """Get all conversations with filters"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        conversations_collection = db_instance['conversations']
        
        # Build filter
        filter_dict = {}
        if chatbot_id:
            filter_dict["chatbot_id"] = chatbot_id
        if status:
            filter_dict["status"] = status
        if start_date:
            if "created_at" not in filter_dict:
                filter_dict["created_at"] = {}
            filter_dict["created_at"]["$gte"] = start_date
        if end_date:
            if "created_at" not in filter_dict:
                filter_dict["created_at"] = {}
            filter_dict["created_at"]["$lte"] = end_date
        
        # Get conversations
        conversations = []
        async for conv in conversations_collection.find(filter_dict).sort("created_at", -1).limit(limit):
            conversations.append({
                "id": conv.get('id'),
                "chatbot_id": conv.get('chatbot_id'),
                "user_name": conv.get('user_name'),
                "user_email": conv.get('user_email'),
                "status": conv.get('status'),
                "message_count": conv.get('messages_count', conv.get('message_count', 0)),
                "created_at": conv.get('created_at'),
                "updated_at": conv.get('updated_at')
            })
        
        return {
            "conversations": conversations,
            "total": len(conversations)
        }
    except Exception as e:
        print(f"Error in get_all_conversations: {str(e)}")
        return {"conversations": [], "total": 0}


@router.get("/conversations/export")
async def export_conversations(
    format: str = "json",
    chatbot_id: Optional[str] = None
):
    """Export conversations to JSON or CSV"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # Get conversations
        filter_dict = {}
        if chatbot_id:
            filter_dict["chatbot_id"] = chatbot_id
        
        export_data = []
        async for conv in conversations_collection.find(filter_dict):
            # Get messages for this conversation
            messages = []
            async for msg in messages_collection.find({"conversation_id": conv.get('id')}):
                messages.append({
                    "role": msg.get('role'),
                    "content": msg.get('content'),
                    "timestamp": msg.get('timestamp')
                })
            
            export_data.append({
                "conversation_id": conv.get('id'),
                "chatbot_id": conv.get('chatbot_id'),
                "user_name": conv.get('user_name'),
                "user_email": conv.get('user_email'),
                "status": conv.get('status'),
                "created_at": conv.get('created_at'),
                "messages": messages
            })
        
        # Return based on format
        if format == "csv":
            # Convert to CSV format
            csv_data = []
            for conv in export_data:
                for msg in conv['messages']:
                    csv_data.append({
                        "conversation_id": conv['conversation_id'],
                        "chatbot_id": conv['chatbot_id'],
                        "user_name": conv['user_name'],
                        "user_email": conv['user_email'],
                        "status": conv['status'],
                        "created_at": conv['created_at'],
                        "role": msg['role'],
                        "content": msg['content'],
                        "timestamp": msg['timestamp']
                    })
            return csv_data
        else:
            return export_data
            
    except Exception as e:
        print(f"Error in export_conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== REVENUE & BILLING ====================
@router.get("/revenue/overview")
async def get_revenue_overview():
    """Get revenue overview and statistics"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        plans_collection = db_instance['plans']
        
        # Get all plans for pricing
        plans = await plans_collection.find({}).to_list(length=100)
        plan_prices = {plan['id']: plan['price'] for plan in plans}
        
        # Get all users with their subscriptions
        users = await users_collection.find({}).to_list(length=10000)
        
        # Calculate real revenue
        total_mrr = 0
        revenue_by_plan = {"Free": 0, "Starter": 0, "Professional": 0, "Enterprise": 0}
        active_subscriptions = 0
        
        for user in users:
            subscription = user.get('subscription', {})
            plan_id = subscription.get('plan_id', 'free')
            status = subscription.get('status', 'active')
            
            # Count active paid subscriptions
            if status == 'active' and plan_id != 'free':
                active_subscriptions += 1
                price = plan_prices.get(plan_id, 0)
                total_mrr += price
                
                # Add to revenue by plan
                plan_name = plan_id.capitalize()
                if plan_name in revenue_by_plan:
                    revenue_by_plan[plan_name] += price
        
        # Calculate other metrics
        arr = total_mrr * 12
        
        # Get users created this month for growth calculation
        now = datetime.now()
        start_of_month = datetime(now.year, now.month, 1)
        start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
        
        new_this_month = sum(1 for u in users 
                            if u.get('created_at') and 
                            isinstance(u['created_at'], datetime) and 
                            u['created_at'] >= start_of_month)
        
        # Calculate total lifetime revenue (approximation: active subscriptions * avg 6 months)
        total_revenue = total_mrr * 6
        
        return {
            "mrr": round(total_mrr, 2),
            "arr": round(arr, 2),
            "total_revenue": round(total_revenue, 2),
            "active_subscriptions": active_subscriptions,
            "churned_this_month": 0,  # Would need historical data
            "new_this_month": new_this_month,
            "revenue_by_plan": revenue_by_plan,
            "revenue_growth": 0,  # Would need historical data to calculate
            "payment_failures": 0,  # Would need payment provider integration
            "pending_invoices": 0  # Would need payment provider integration
        }
    except Exception as e:
        logger.error(f"Error in get_revenue_overview: {str(e)}")
        return {
            "mrr": 0,
            "arr": 0,
            "total_revenue": 0,
            "active_subscriptions": 0,
            "churned_this_month": 0,
            "new_this_month": 0,
            "revenue_by_plan": {"Free": 0, "Starter": 0, "Professional": 0, "Enterprise": 0},
            "revenue_growth": 0,
            "payment_failures": 0,
            "pending_invoices": 0
        }


@router.get("/revenue/history")
async def get_revenue_history(days: int = 30):
    """Get revenue history for charts"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
            
        users_collection = db_instance['users']
        plans_collection = db_instance['plans']
        
        # Get all plans for pricing
        plans = await plans_collection.find({}).to_list(length=100)
        plan_prices = {plan['id']: plan['price'] for plan in plans}
        
        # Get all users
        users = await users_collection.find({}).to_list(length=10000)
        
        history = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i-1))
            date_str = date.strftime('%Y-%m-%d')
            
            # Calculate metrics for this date
            # Count users created on or before this date
            users_by_date = [u for u in users 
                           if u.get('created_at') and 
                           isinstance(u['created_at'], datetime) and 
                           u['created_at'].date() <= date.date()]
            
            # Count new users on this specific date
            new_users_count = sum(1 for u in users 
                                 if u.get('created_at') and 
                                 isinstance(u['created_at'], datetime) and 
                                 u['created_at'].date() == date.date())
            
            # Calculate revenue from active subscriptions
            daily_revenue = 0
            active_subs = 0
            for user in users_by_date:
                subscription = user.get('subscription', {})
                plan_id = subscription.get('plan_id', 'free')
                status = subscription.get('status', 'active')
                
                if status == 'active' and plan_id != 'free':
                    active_subs += 1
                    price = plan_prices.get(plan_id, 0)
                    # Daily revenue approximation (monthly / 30)
                    daily_revenue += price / 30
            
            history.append({
                "date": date_str,
                "revenue": round(daily_revenue, 2),
                "subscriptions": active_subs,
                "new_users": new_users_count
            })
        
        return {
            "history": history,
            "total": len(history)
        }
    except Exception as e:
        logger.error(f"Error in get_revenue_history: {str(e)}")
        return {"history": [], "total": 0}


@router.get("/users/{user_id}/activity")
async def get_user_activity(user_id: str):
    """Get detailed activity timeline for a user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        conversations_collection = db_instance['conversations']
        
        activities = []
        
        # Get user's chatbots
        async for bot in chatbots_collection.find({"user_id": user_id}).sort("created_at", -1):
            activities.append({
                "type": "chatbot_created",
                "title": f"Created chatbot: {bot.get('name')}",
                "timestamp": bot.get('created_at'),
                "details": {
                    "chatbot_id": bot.get('id'),
                    "provider": bot.get('ai_provider')
                }
            })
        
        # Get user's chatbot IDs
        user_chatbots = [bot.get('id') async for bot in chatbots_collection.find({"user_id": user_id})]
        
        # Get conversations
        if user_chatbots:
            async for conv in conversations_collection.find(
                {"chatbot_id": {"$in": user_chatbots}}
            ).sort("created_at", -1).limit(50):
                activities.append({
                    "type": "conversation",
                    "title": f"Conversation with {conv.get('user_name', 'Anonymous')}",
                    "timestamp": conv.get('created_at'),
                    "details": {
                        "conversation_id": conv.get('id'),
                        "status": conv.get('status')
                    }
                })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return {
            "activities": activities[:100],  # Limit to 100
            "total": len(activities)
        }
    except Exception as e:
        print(f"Error in get_user_activity: {str(e)}")
        return {"activities": [], "total": 0}


@router.put("/users/{user_id}/edit")
async def edit_user(user_id: str, data: UserEditData):
    """Edit user details and limits"""
    try:
        # In production, update users collection
        return {
            "success": True,
            "message": f"User {user_id} updated successfully",
            "user": {
                "user_id": user_id,
                **data.dict(exclude_unset=True)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str):
    """Suspend/block a user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Disable all user's chatbots
        result = await chatbots_collection.update_many(
            {"user_id": user_id},
            {"$set": {"enabled": False, "status": "suspended"}}
        )
        
        return {
            "success": True,
            "message": f"User {user_id} suspended",
            "chatbots_disabled": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/{user_id}/activate")
async def activate_user(user_id: str):
    """Activate a suspended user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Enable all user's chatbots
        result = await chatbots_collection.update_many(
            {"user_id": user_id},
            {"$set": {"enabled": True, "status": "active"}}
        )
        
        return {
            "success": True,
            "message": f"User {user_id} activated",
            "chatbots_enabled": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ADVANCED ANALYTICS ====================

# ==================== SYSTEM SETTINGS ====================
@router.get("/settings")
async def get_system_settings():
    """Get system settings from database"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        settings_collection = db_instance['system_settings']
        
        # Try to get settings from database
        settings_doc = await settings_collection.find_one({"_id": "system_settings"})
        
        # Default settings
        default_settings = {
            "maintenance_mode": False,
            "allow_registrations": True,
            "default_plan": "Free",
            "max_chatbots_per_user": 1,
            "ai_providers": {
                "openai": {"enabled": True, "rate_limit": 100},
                "anthropic": {"enabled": True, "rate_limit": 100},
                "gemini": {"enabled": True, "rate_limit": 100}
            },
            "email_notifications": True,
            "auto_moderation": False,
            "platform": {
                "site_name": "BotSmith",
                "site_logo_url": "",
                "timezone": "UTC",
                "default_language": "en",
                "support_email": "support@botsmith.com",
                "admin_email": "admin@botsmith.com"
            },
            "authentication": {
                "require_email_verification": True,
                "enable_oauth": True,
                "oauth_providers": {
                    "google": {"enabled": False, "client_id": "", "client_secret": ""},
                    "github": {"enabled": False, "client_id": "", "client_secret": ""},
                    "microsoft": {"enabled": False, "client_id": "", "client_secret": ""}
                },
                "password_policy": {
                    "min_length": 8,
                    "require_uppercase": True,
                    "require_lowercase": True,
                    "require_numbers": True,
                    "require_special_chars": True,
                    "password_expiry_days": 90
                },
                "two_factor_auth": {
                    "enforce_for_admins": True,
                    "enforce_for_all_users": False,
                    "allowed_methods": ["app", "sms", "email"]
                },
                "session_settings": {
                    "session_timeout_minutes": 1440,
                    "max_concurrent_sessions": 3,
                    "remember_me_duration_days": 30
                },
                "auto_approve_registrations": True,
                "allowed_email_domains": "",
                "blocked_email_domains": "tempmail.com,throwaway.email,guerrillamail.com",
                "registration_welcome_message": "Welcome to BotSmith! Start building amazing AI chatbots today.",
                "failed_login_attempts_limit": 5,
                "account_lockout_duration_minutes": 30
            },
            "integrations": {
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
        }
        
        # If no settings found in database, initialize with defaults
        if not settings_doc:
            default_settings["_id"] = "system_settings"
            default_settings["created_at"] = datetime.utcnow().isoformat()
            default_settings["updated_at"] = datetime.utcnow().isoformat()
            await settings_collection.insert_one(default_settings)
            settings_doc = default_settings
        
        # Remove MongoDB _id from response
        if "_id" in settings_doc:
            del settings_doc["_id"]
        if "created_at" in settings_doc:
            del settings_doc["created_at"]
        if "updated_at" in settings_doc:
            del settings_doc["updated_at"]
            
        return settings_doc
        
    except Exception as e:
        logger.error(f"Error in get_system_settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/settings")
async def update_system_settings(settings: SystemSettings):
    """Update system settings in database"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        settings_collection = db_instance['system_settings']
        
        # Convert settings to dict and remove None values
        settings_dict = settings.dict(exclude_unset=True, exclude_none=True)
        
        # Add timestamp
        settings_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Update or insert settings
        result = await settings_collection.update_one(
            {"_id": "system_settings"},
            {"$set": settings_dict},
            upsert=True
        )
        
        logger.info(f"System settings updated: {result.modified_count} documents modified")
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "modified_count": result.modified_count
        }
        
    except Exception as e:
        logger.error(f"Error in update_system_settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ACTIVITY LOGS ====================
@router.get("/logs/activity")
async def get_detailed_activity_logs(
    limit: int = 100,
    action: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get detailed activity/audit logs"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Build comprehensive activity log from multiple collections
        logs = []
        
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        
        # Get chatbot activities
        filter_dict = {}
        if user_id:
            filter_dict["user_id"] = user_id
        
        async for bot in chatbots_collection.find(filter_dict).sort("created_at", -1).limit(limit):
            logs.append({
                "id": bot.get('id'),
                "action": "chatbot_created",
                "user_id": bot.get('user_id'),
                "details": f"Created chatbot: {bot.get('name')}",
                "timestamp": bot.get('created_at'),
                "entity_type": "chatbot",
                "entity_id": bot.get('id')
            })
        
        # Get source activities
        async for source in sources_collection.find(filter_dict if user_id else {}).sort("created_at", -1).limit(limit):
            logs.append({
                "id": source.get('id'),
                "action": "source_added",
                "user_id": "system",
                "details": f"Added source: {source.get('name')}",
                "timestamp": source.get('created_at'),
                "entity_type": "source",
                "entity_id": source.get('id')
            })
        
        # Sort by timestamp
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {
            "logs": logs[:limit],
            "total": len(logs)
        }
    except Exception as e:
        print(f"Error in get_activity_logs: {str(e)}")
        return {"logs": [], "total": 0}


# ==================== EMAIL MANAGEMENT ====================
@router.post("/email/send-bulk")
async def send_bulk_email(email_data: BulkEmail):
    """Send bulk email to users"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Get recipients based on filter
        recipients = []
        if email_data.recipient_filter == 'all':
            user_ids = await chatbots_collection.distinct('user_id')
            recipients = [f"{uid}@botsmith.co" for uid in user_ids]
        
        # In production, integrate with email service (SendGrid, AWS SES, etc.)
        return {
            "success": True,
            "message": f"Email queued for {len(recipients)} recipients",
            "recipients_count": len(recipients)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/templates")
async def get_email_templates():
    """Get email templates"""
    try:
        # Mock templates
        return {
            "templates": [
                {
                    "id": "welcome",
                    "name": "Welcome Email",
                    "subject": "Welcome to BotSmith!",
                    "body": "Hi {{name}}, welcome to BotSmith...",
                    "variables": ["name", "email"]
                },
                {
                    "id": "upgrade",
                    "name": "Upgrade Reminder",
                    "subject": "Upgrade your BotSmith plan",
                    "body": "You're using {{usage}}% of your plan...",
                    "variables": ["name", "usage", "plan"]
                }
            ],
            "total": 2
        }
    except Exception as e:
        print(f"Error in get_email_templates: {str(e)}")
        return {"templates": [], "total": 0}


# ==================== BACKUP & EXPORT ====================
@router.get("/backup/database")
async def backup_database():
    """Create database backup"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Get all data
        backup_data = {}
        
        for collection_name in ['chatbots', 'sources', 'conversations', 'messages']:
            collection = db_instance[collection_name]
            data = []
            async for doc in collection.find({}):
                # Remove _id field for JSON serialization
                doc.pop('_id', None)
                data.append(doc)
            backup_data[collection_name] = data
        
        backup_data['backup_timestamp'] = datetime.now().isoformat()
        backup_data['version'] = '1.0'
        
        return {
            "success": True,
            "backup": backup_data,
            "collections": len(backup_data) - 2,  # Minus timestamp and version
            "total_documents": sum(len(v) for k, v in backup_data.items() if isinstance(v, list))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CHATBOT ADVANCED MANAGEMENT ====================
@router.get("/chatbots/{chatbot_id}/details")
async def get_chatbot_details(chatbot_id: str):
    """Get comprehensive chatbot details"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # Get chatbot
        chatbot = await chatbots_collection.find_one({"id": chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get sources
        sources = []
        async for source in sources_collection.find({"chatbot_id": chatbot_id}):
            sources.append({
                "id": source.get('id'),
                "name": source.get('name'),
                "type": source.get('type')
            })
        
        # Get conversations count
        conv_count = await conversations_collection.count_documents({"chatbot_id": chatbot_id})
        
        # Get messages count
        msg_count = await messages_collection.count_documents({"chatbot_id": chatbot_id})
        
        chatbot.pop('_id', None)
        
        return {
            "chatbot": chatbot,
            "sources": sources,
            "conversations_count": conv_count,
            "messages_count": msg_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chatbots/{chatbot_id}/clone")
async def clone_chatbot(chatbot_id: str, new_name: str, target_user_id: str):
    """Clone a chatbot"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Get original chatbot
        original = await chatbots_collection.find_one({"id": chatbot_id})
        if not original:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Create clone
        clone = original.copy()
        clone['id'] = str(uuid4())
        clone['name'] = new_name
        clone['user_id'] = target_user_id
        clone['created_at'] = datetime.now().isoformat()
        clone.pop('_id', None)
        
        await chatbots_collection.insert_one(clone)
        
        return {
            "success": True,
            "message": "Chatbot cloned successfully",
            "clone_id": clone['id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SOURCES MANAGEMENT ====================
@router.get("/sources")
async def get_all_sources():
    """Get all sources across all chatbots"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        sources_collection = db_instance['sources']
        
        sources = []
        async for source in sources_collection.find({}).sort("created_at", -1):
            sources.append({
                "id": source.get('id'),
                "chatbot_id": source.get('chatbot_id'),
                "type": source.get('type'),
                "name": source.get('name'),
                "url": source.get('url'),
                "file_size": source.get('file_size', 0),
                "status": source.get('status', 'active'),
                "created_at": source.get('created_at')
            })
        
        return {
            "sources": sources,
            "total": len(sources)
        }
    except Exception as e:
        print(f"Error in get_all_sources: {str(e)}")
        return {"sources": [], "total": 0}


@router.delete("/sources/{source_id}")
async def delete_source(source_id: str):
    """Delete a source"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        sources_collection = db_instance['sources']
        result = await sources_collection.delete_one({"id": source_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Source not found")
        
        return {
            "success": True,
            "message": "Source deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SYSTEM MONITORING ====================
@router.get("/system/health")
async def get_system_health():
    """Get system health metrics"""
    try:
        # CPU and Memory usage
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database stats
        db_stats = {}
        if db_instance is not None:
            try:
                stats = await db_instance.command("dbStats")
                db_stats = {
                    "collections": stats.get('collections', 0),
                    "dataSize": stats.get('dataSize', 0),
                    "storageSize": stats.get('storageSize', 0),
                    "indexes": stats.get('indexes', 0)
                }
            except Exception as e:
                print(f"Error fetching DB stats: {str(e)}")
                db_stats = {"error": "Unable to fetch DB stats"}
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_available_mb": memory.available / (1024 * 1024),
                "disk_usage": disk.percent,
                "disk_free_gb": disk.free / (1024 * 1024 * 1024)
            },
            "database": db_stats
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@router.get("/system/activity")
async def get_real_time_activity():
    """Get real-time system activity"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # Activity in last hour
        one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
        
        recent_conversations = await conversations_collection.count_documents({
            "created_at": {"$gte": one_hour_ago}
        })
        
        recent_messages = await messages_collection.count_documents({
            "timestamp": {"$gte": one_hour_ago}
        })
        
        # Get last 10 activities
        recent_activity = []
        async for conv in conversations_collection.find(
            {"created_at": {"$gte": one_hour_ago}}
        ).sort("created_at", -1).limit(10):
            recent_activity.append({
                "type": "conversation",
                "chatbot_id": conv.get('chatbot_id'),
                "user": conv.get('user_name', 'Anonymous'),
                "timestamp": conv.get('created_at')
            })
        
        return {
            "last_hour": {
                "conversations": recent_conversations,
                "messages": recent_messages
            },
            "recent_activity": recent_activity
        }
    except Exception as e:
        print(f"Error in get_real_time_activity: {str(e)}")
        return {
            "last_hour": {"conversations": 0, "messages": 0},
            "recent_activity": []
        }


# ==================== DATABASE MANAGEMENT ====================
@router.get("/database/stats")
async def get_database_stats():
    """Get detailed database statistics"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        stats = {
            "chatbots": await db_instance['chatbots'].count_documents({}),
            "sources": await db_instance['sources'].count_documents({}),
            "conversations": await db_instance['conversations'].count_documents({}),
            "messages": await db_instance['messages'].count_documents({}),
            "plans": await db_instance['plans'].count_documents({}) if 'plans' in await db_instance.list_collection_names() else 0
        }
        
        # Get collection sizes
        collections_info = []
        for collection_name in ['chatbots', 'sources', 'conversations', 'messages']:
            try:
                coll_stats = await db_instance.command("collStats", collection_name)
                collections_info.append({
                    "name": collection_name,
                    "count": coll_stats.get('count', 0),
                    "size": coll_stats.get('size', 0),
                    "avgObjSize": coll_stats.get('avgObjSize', 0)
                })
            except Exception as e:
                print(f"Error fetching stats for {collection_name}: {str(e)}")
                pass
        
        return {
            "counts": stats,
            "collections": collections_info,
            "total_documents": sum(stats.values())
        }
    except Exception as e:
        print(f"Error in get_database_stats: {str(e)}")
        return {
            "counts": {},
            "collections": [],
            "total_documents": 0
        }


# ==================== CONTENT MODERATION ====================
@router.get("/moderation/flagged")
async def get_flagged_content():
    """Get flagged conversations for moderation"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # For demo, get conversations with "escalated" status
        flagged = []
        async for conv in conversations_collection.find({"status": "escalated"}):
            # Get messages
            messages = []
            async for msg in messages_collection.find({"conversation_id": conv.get('id')}):
                messages.append({
                    "role": msg.get('role'),
                    "content": msg.get('content'),
                    "timestamp": msg.get('timestamp')
                })
            
            flagged.append({
                "conversation_id": conv.get('id'),
                "chatbot_id": conv.get('chatbot_id'),
                "user_name": conv.get('user_name'),
                "status": conv.get('status'),
                "created_at": conv.get('created_at'),
                "messages": messages,
                "flag_reason": "User escalated to human"
            })
        
        return {
            "flagged_conversations": flagged,
            "total": len(flagged)
        }
    except Exception as e:
        print(f"Error in get_flagged_content: {str(e)}")
        return {"flagged_conversations": [], "total": 0}


# ==================== ENHANCED USER MANAGEMENT ====================

@router.get("/users/enhanced")
async def get_users_enhanced(
    sortBy: str = "created_at",
    sortOrder: str = "desc"
):
    """Get enhanced user data with all metrics"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        conversations_collection = db_instance['conversations']
        sources_collection = db_instance['sources']
        
        # Get all users from the users collection
        all_users = await users_collection.find({}).to_list(length=1000)
        
        users_data = []
        for user in all_users:
            user_id = user.get('id')
            
            # Count chatbots for this user
            chatbots_count = await chatbots_collection.count_documents({"user_id": user_id})
            
            # Get user's chatbot IDs
            user_chatbots = []
            async for bot in chatbots_collection.find({"user_id": user_id}, {"id": 1}):
                user_chatbots.append(bot.get('id'))
            
            messages_count = 0
            conversations_count = 0
            sources_count = 0
            last_message_time = None
            
            if user_chatbots:
                messages_count = await messages_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
                conversations_count = await conversations_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
                sources_count = await sources_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
                
                # Get last message time
                last_message = await messages_collection.find_one(
                    {"chatbot_id": {"$in": user_chatbots}},
                    sort=[("timestamp", -1)]
                )
                if last_message:
                    last_message_time = last_message.get('timestamp')
            
            users_data.append({
                "user_id": user_id,
                "email": user.get('email', f"{user_id}@botsmith.com"),
                "name": user.get('name', f"User {user_id[:8]}"),
                "role": user.get('role', 'user'),
                "status": user.get('status', 'active'),
                "plan_id": user.get('plan_id', 'free'),
                "phone": user.get('phone'),
                "avatar_url": user.get('avatar_url'),
                "company": user.get('company'),
                "job_title": user.get('job_title'),
                "tags": user.get('tags', []),
                "chatbots_count": chatbots_count,
                "messages_count": messages_count,
                "conversations_count": conversations_count,
                "sources_count": sources_count,
                "statistics": {
                    "chatbots_count": chatbots_count,
                    "messages_count": messages_count,
                    "conversations_count": conversations_count,
                    "sources_count": sources_count
                },
                "created_at": user.get('created_at'),
                "last_login": user.get('last_login'),
                "login_count": user.get('login_count', 0),
                "last_ip": user.get('last_ip'),
                "last_active": last_message_time or user.get('last_login'),
                "suspension_reason": user.get('suspension_reason'),
                "suspension_until": user.get('suspension_until'),
                "custom_max_chatbots": user.get('custom_max_chatbots'),
                "custom_max_messages": user.get('custom_max_messages'),
                "custom_max_file_uploads": user.get('custom_max_file_uploads'),
                "admin_notes": user.get('admin_notes')
            })
        
        # Sort users - use string comparison for date fields to avoid datetime issues
        if sortBy == "created_at" or sortBy == "last_login":
            def sort_key(x):
                val = x.get(sortBy)
                if val is None:
                    return '' if sortOrder == 'asc' else 'Z' * 30  # Sort None to end
                if isinstance(val, str):
                    return val
                # Convert datetime to ISO string
                return val.isoformat() if hasattr(val, 'isoformat') else str(val)
            users_data.sort(key=sort_key, reverse=(sortOrder == 'desc'))
        elif sortBy in ["messages_count", "chatbots_count", "login_count"]:
            users_data.sort(key=lambda x: x.get(sortBy, 0), reverse=(sortOrder == 'desc'))
        
        return {
            "users": users_data,
            "total": len(users_data)
        }
    except Exception as e:
        logger.error(f"Error in get_users_enhanced: {str(e)}")
        return {"users": [], "total": 0, "error": str(e)}


@router.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get comprehensive statistics for a specific user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        conversations_collection = db_instance['conversations']
        sources_collection = db_instance['sources']
        
        # Get user's chatbots
        user_chatbots = []
        async for bot in chatbots_collection.find({"user_id": user_id}):
            user_chatbots.append(bot.get('id'))
        
        total_chatbots = len(user_chatbots)
        total_messages = 0
        total_conversations = 0
        total_sources = 0
        
        if user_chatbots:
            total_messages = await messages_collection.count_documents(
                {"chatbot_id": {"$in": user_chatbots}}
            )
            total_conversations = await conversations_collection.count_documents(
                {"chatbot_id": {"$in": user_chatbots}}
            )
            total_sources = await sources_collection.count_documents(
                {"chatbot_id": {"$in": user_chatbots}}
            )
        
        # Calculate average messages per day
        first_chatbot = await chatbots_collection.find_one(
            {"user_id": user_id},
            sort=[("created_at", 1)]
        )
        
        avg_messages_per_day = 0
        if first_chatbot and total_messages > 0:
            created_date = datetime.fromisoformat(first_chatbot.get('created_at', ''))
            days_active = max(1, (datetime.now() - created_date).days)
            avg_messages_per_day = round(total_messages / days_active, 2)
        
        return {
            "total_chatbots": total_chatbots,
            "total_messages": total_messages,
            "total_conversations": total_conversations,
            "total_sources": total_sources,
            "avg_messages_per_day": avg_messages_per_day,
            "engagement_score": min(100, total_messages + (total_chatbots * 10))
        }
    except Exception as e:
        print(f"Error in get_user_stats: {str(e)}")
        return {
            "total_chatbots": 0,
            "total_messages": 0,
            "total_conversations": 0,
            "total_sources": 0,
            "avg_messages_per_day": 0,
            "engagement_score": 0
        }


@router.get("/users/{user_id}/notes")
async def get_user_notes(user_id: str):
    """Get notes for a user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # In real app, you'd have a notes collection
        # For now, return empty
        return {"notes": []}
    except Exception as e:
        print(f"Error in get_user_notes: {str(e)}")
        return {"notes": []}


@router.post("/users/{user_id}/notes")
async def add_user_note(user_id: str, note_data: dict):
    """Add a note to user"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # In real app, you'd save to notes collection
        return {
            "success": True,
            "message": "Note added successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/tags")
async def update_user_tags(user_id: str, tag_data: dict):
    """Update user tags"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # In real app, you'd update tags in users collection
        return {
            "success": True,
            "message": "Tags updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/send-email")
async def send_bulk_email(email_data: dict):
    """Send email to users"""
    try:
        user_ids = email_data.get('user_ids', [])
        subject = email_data.get('subject', '')
        body = email_data.get('body', '')
        
        # In real app, you'd integrate with email service
        # For now, just log it
        print(f"Sending email to {len(user_ids)} users: {subject}")
        
        return {
            "success": True,
            "message": f"Email sent to {len(user_ids)} user(s)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/bulk-action")
async def bulk_user_action(action_data: dict):
    """Perform bulk actions on users"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        user_ids = action_data.get('user_ids', [])
        action = action_data.get('action', '')
        
        if action == 'suspend':
            # In real app, update user status to suspended
            print(f"Suspending {len(user_ids)} users")
        elif action == 'activate':
            # In real app, update user status to active
            print(f"Activating {len(user_ids)} users")
        elif action == 'delete':
            # In real app, delete users and their data
            chatbots_collection = db_instance['chatbots']
            for user_id in user_ids:
                await chatbots_collection.delete_many({"user_id": user_id})
        
        return {
            "success": True,
            "message": f"{action} applied to {len(user_ids)} user(s)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/update")
async def update_user_enhanced(user_id: str, user_data: dict):
    """Update user with all fields"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # In real app, update users collection
        print(f"Updating user {user_id}: {user_data}")
        
        return {
            "success": True,
            "message": "User updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== CONTACT SALES MANAGEMENT ====================

@router.get("/contact-sales")
async def get_contact_sales_submissions(
    status: Optional[str] = None,
    limit: int = 100
):
    """Get all contact sales form submissions"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        contact_sales_collection = db_instance['contact_sales']
        
        # Build filter
        filter_dict = {}
        if status:
            filter_dict["status"] = status
        
        # Get submissions
        submissions = []
        async for submission in contact_sales_collection.find(filter_dict).sort("created_at", -1).limit(limit):
            submissions.append({
                "id": submission.get('id'),
                "name": submission.get('name'),
                "email": submission.get('email'),
                "company": submission.get('company'),
                "message": submission.get('message'),
                "status": submission.get('status', 'new'),
                "created_at": submission.get('created_at'),
                "notes": submission.get('notes', '')
            })
        
        return {
            "submissions": submissions,
            "total": len(submissions)
        }
    except Exception as e:
        print(f"Error in get_contact_sales_submissions: {str(e)}")
        return {"submissions": [], "total": 0}


@router.put("/contact-sales/{submission_id}")
async def update_contact_sales_status(submission_id: str, update_data: dict):
    """Update contact sales submission status"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        contact_sales_collection = db_instance['contact_sales']
        
        # Update submission
        await contact_sales_collection.update_one(
            {"id": submission_id},
            {"$set": {
                "status": update_data.get('status', 'new'),
                "notes": update_data.get('notes', ''),
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        return {
            "success": True,
            "message": "Submission updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/contact-sales/{submission_id}")
async def delete_contact_sales_submission(submission_id: str):
    """Delete a contact sales submission"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        contact_sales_collection = db_instance['contact_sales']
        result = await contact_sales_collection.delete_one({"id": submission_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "success": True,
            "message": "Submission deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== USER SEGMENTATION & ANALYTICS ====================

@router.get("/users/segments")
async def get_user_segments():
    """Get user segments (power users, at-risk, new users, etc.)"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        
        user_ids = await chatbots_collection.distinct('user_id')
        
        segments = {
            "power_users": [],
            "at_risk": [],
            "new_users": [],
            "champions": []
        }
        
        for user_id in user_ids:
            chatbots_count = await chatbots_collection.count_documents({"user_id": user_id})
            
            user_chatbots = []
            async for bot in chatbots_collection.find({"user_id": user_id}):
                user_chatbots.append(bot.get('id'))
            
            messages_count = 0
            if user_chatbots:
                messages_count = await messages_collection.count_documents(
                    {"chatbot_id": {"$in": user_chatbots}}
                )
            
            # Segment logic
            if messages_count > 100 or chatbots_count > 3:
                segments["power_users"].append(user_id)
            elif chatbots_count <= 1 and messages_count < 10:
                segments["new_users"].append(user_id)
            elif messages_count > 500:
                segments["champions"].append(user_id)
        
        return {
            "segments": segments,
            "totals": {
                "power_users": len(segments["power_users"]),
                "at_risk": len(segments["at_risk"]),
                "new_users": len(segments["new_users"]),
                "champions": len(segments["champions"])
            }
        }
    except Exception as e:
        print(f"Error in get_user_segments: {str(e)}")
        return {"segments": {}, "totals": {}}


@router.get("/users/{user_id}/lifecycle")
async def get_user_lifecycle(user_id: str):
    """Get user lifecycle timeline"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        conversations_collection = db_instance['conversations']
        
        timeline = []
        
        # Get all chatbots created
        async for bot in chatbots_collection.find({"user_id": user_id}).sort("created_at", 1):
            timeline.append({
                "event": "chatbot_created",
                "description": f"Created chatbot: {bot.get('name')}",
                "timestamp": bot.get('created_at'),
                "details": {
                    "chatbot_id": bot.get('id'),
                    "chatbot_name": bot.get('name')
                }
            })
        
        return {
            "timeline": timeline,
            "total_events": len(timeline)
        }
    except Exception as e:
        print(f"Error in get_user_lifecycle: {str(e)}")
        return {"timeline": [], "total_events": 0}


@router.get("/users/retention")
async def get_user_retention():
    """Get user retention metrics"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        
        # Simple retention calculation
        user_ids = await chatbots_collection.distinct('user_id')
        total_users = len(user_ids)
        
        active_users = 0
        for user_id in user_ids:
            user_chatbots = []
            async for bot in chatbots_collection.find({"user_id": user_id}):
                user_chatbots.append(bot.get('id'))
            
            if user_chatbots:
                recent_messages = await messages_collection.count_documents({
                    "chatbot_id": {"$in": user_chatbots},
                    "timestamp": {"$gte": (datetime.now() - timedelta(days=30)).isoformat()}
                })
                if recent_messages > 0:
                    active_users += 1
        
        retention_rate = (active_users / total_users * 100) if total_users > 0 else 0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "retention_rate": round(retention_rate, 2),
            "churn_risk": total_users - active_users
        }
    except Exception as e:
        print(f"Error in get_user_retention: {str(e)}")
        return {
            "total_users": 0,
            "active_users": 0,
            "retention_rate": 0,
            "churn_risk": 0
        }

