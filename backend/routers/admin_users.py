from fastapi import APIRouter, HTTPException, Query, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from models import (
    User, AdminUserUpdate, PasswordReset, LoginHistory, LoginHistoryResponse,
    ActivityLog, ActivityLogResponse, BulkUserOperation
)
from passlib.context import CryptContext
import logging
import uuid
import json
import io
import csv

router = APIRouter(prefix="/admin/users", tags=["admin-users"])
db_instance = None
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

logger = logging.getLogger(__name__)

def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance
    db_instance = db


# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/test-db")
async def test_database():
    """Test database connection and user count"""
    if db_instance is None:
        return {"error": "Database not initialized", "db_instance": None}
    
    try:
        users_collection = db_instance['users']
        count = await users_collection.count_documents({})
        all_users = await users_collection.find({}).to_list(length=10)
        
        return {
            "database_connected": True,
            "collection_name": users_collection.name,
            "total_users": count,
            "sample_users": [{"id": u.get("id"), "email": u.get("email")} for u in all_users]
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/enhanced")
async def get_enhanced_users(
    sortBy: str = Query("created_at", description="Field to sort by"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    status: Optional[str] = Query(None, description="Filter by status"),
    role: Optional[str] = Query(None, description="Filter by role"),
    search: Optional[str] = Query(None, description="Search term")
):
    """
    Get enhanced user list with all details for admin panel
    """
    if db_instance is None:
        logger.error("Database not initialized in admin_users router")
        return {"success": False, "users": [], "total": 0, "error": "Database not initialized"}
    
    try:
        users_collection = db_instance['users']
        
        # Simple test: just count users
        total_users = await users_collection.count_documents({})
        
        if total_users == 0:
            return {"success": True, "users": [], "total": 0, "message": "No users in database", "debug": "count is zero"}
        
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        sources_collection = db_instance['sources']
        
        # Build query
        query = {}
        if status:
            query['status'] = status
        if role:
            query['role'] = role
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}}
            ]
        
        # Get users
        sort_direction = -1 if sortOrder == "desc" else 1
        users = await users_collection.find(query).sort(sortBy, sort_direction).to_list(length=1000)
        
        # Enhance with statistics
        enhanced_users = []
        for user in users:
            user_id = user.get('id')
            
            # Count chatbots
            chatbots_count = await chatbots_collection.count_documents({'user_id': user_id})
            
            # Get all chatbot IDs for this user first
            user_chatbot_ids = []
            async for bot in chatbots_collection.find({'user_id': user_id}, {'id': 1}):
                user_chatbot_ids.append(bot['id'])
            
            # Count messages for all chatbots
            messages_count = 0
            if user_chatbot_ids:
                messages_count = await messages_collection.count_documents({
                    'chatbot_id': {'$in': user_chatbot_ids}
                })
            
            # Count sources for all chatbots
            sources_count = 0
            if user_chatbot_ids:
                sources_count = await sources_collection.count_documents({
                    'chatbot_id': {'$in': user_chatbot_ids}
                })
            
            enhanced_users.append({
                'user_id': user.get('id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'role': user.get('role', 'user'),
                'status': user.get('status', 'active'),
                'plan_id': user.get('plan_id', 'free'),
                'phone': user.get('phone'),
                'avatar_url': user.get('avatar_url'),
                'company': user.get('company'),
                'job_title': user.get('job_title'),
                'tags': user.get('tags', []),
                'created_at': user.get('created_at'),
                'last_login': user.get('last_login'),
                'login_count': user.get('login_count', 0),
                'last_ip': user.get('last_ip'),
                'suspension_reason': user.get('suspension_reason'),
                'suspension_until': user.get('suspension_until'),
                'custom_max_chatbots': user.get('custom_max_chatbots'),
                'custom_max_messages': user.get('custom_max_messages'),
                'custom_max_file_uploads': user.get('custom_max_file_uploads'),
                'admin_notes': user.get('admin_notes'),
                'statistics': {
                    'chatbots_count': chatbots_count,
                    'messages_count': messages_count,
                    'sources_count': sources_count
                }
            })
        
        return {"success": True, "users": enhanced_users, "total": len(enhanced_users)}
    
    except Exception as e:
        logger.error(f"Error fetching enhanced users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/details")
async def get_user_details(user_id: str):
    """
    Get detailed information about a specific user
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        user = await users_collection.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove sensitive data
        user.pop('password_hash', None)
        user.pop('_id', None)
        
        return {"success": True, "user": user}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}/update")
async def update_user(user_id: str, update_data: AdminUserUpdate):
    """
    Update user information (admin only)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        # Build update document
        update_doc = {}
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_doc[field] = value
        
        if not update_doc:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_doc['updated_at'] = datetime.now(timezone.utc)
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="updated_user",
            resource_type="user",
            resource_id=user_id,
            details=f"Updated fields: {', '.join(update_doc.keys())}"
        )
        
        return {"success": True, "message": "User updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """
    Delete a user and all associated data
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        
        # Get user's chatbots
        chatbots = await chatbots_collection.find({'user_id': user_id}).to_list(length=1000)
        chatbot_ids = [bot['id'] for bot in chatbots]
        
        # Delete all related data
        if chatbot_ids:
            await sources_collection.delete_many({'chatbot_id': {'$in': chatbot_ids}})
            await messages_collection.delete_many({'chatbot_id': {'$in': chatbot_ids}})
            await conversations_collection.delete_many({'chatbot_id': {'$in': chatbot_ids}})
            await chatbots_collection.delete_many({'user_id': user_id})
        
        # Delete user
        result = await users_collection.delete_one({'id': user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="deleted_user",
            resource_type="user",
            resource_id=user_id,
            details=f"Deleted user and {len(chatbot_ids)} chatbots"
        )
        
        return {"success": True, "message": "User and all associated data deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/reset-password")
async def reset_user_password(user_id: str, password_data: PasswordReset):
    """
    Reset user password (admin only)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        # Hash new password
        hashed_password = pwd_context.hash(password_data.new_password)
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'password_hash': hashed_password,
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="reset_password",
            resource_type="user",
            resource_id=user_id,
            details="Admin reset user password"
        )
        
        return {"success": True, "message": "Password reset successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ACTIVITY TRACKING ENDPOINTS
# ============================================================================

@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    limit: int = Query(50, description="Number of activities to return"),
    skip: int = Query(0, description="Number of activities to skip")
):
    """
    Get user activity logs
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        activity_logs_collection = db_instance['activity_logs']
        
        activities = await activity_logs_collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Remove MongoDB _id
        for activity in activities:
            activity.pop('_id', None)
        
        return {"success": True, "activities": activities, "total": len(activities)}
    
    except Exception as e:
        logger.error(f"Error fetching user activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/login-history")
async def get_login_history(
    user_id: str,
    limit: int = Query(20, description="Number of logins to return")
):
    """
    Get user login history
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        login_history_collection = db_instance['login_history']
        
        logins = await login_history_collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).limit(limit).to_list(length=limit)
        
        # Remove MongoDB _id
        for login in logins:
            login.pop('_id', None)
        
        return {"success": True, "logins": logins, "total": len(logins)}
    
    except Exception as e:
        logger.error(f"Error fetching login history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Get comprehensive user statistics
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        activity_logs_collection = db_instance['activity_logs']
        
        # Get user
        user = await users_collection.find_one({'id': user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's chatbots
        chatbots = await chatbots_collection.find({'user_id': user_id}).to_list(length=1000)
        chatbot_ids = [bot['id'] for bot in chatbots]
        
        # Count statistics
        total_chatbots = len(chatbots)
        active_chatbots = len([bot for bot in chatbots if bot.get('status') == 'active'])
        
        total_messages = 0
        total_conversations = 0
        total_sources = 0
        
        if chatbot_ids:
            total_messages = await messages_collection.count_documents({'chatbot_id': {'$in': chatbot_ids}})
            total_conversations = await conversations_collection.count_documents({'chatbot_id': {'$in': chatbot_ids}})
            total_sources = await sources_collection.count_documents({'chatbot_id': {'$in': chatbot_ids}})
        
        # Activity in last 30 days
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        recent_activities = await activity_logs_collection.count_documents({
            'user_id': user_id,
            'timestamp': {'$gte': thirty_days_ago}
        })
        
        # Messages trend (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_messages = await messages_collection.count_documents({
            'chatbot_id': {'$in': chatbot_ids} if chatbot_ids else {'$in': []},
            'timestamp': {'$gte': seven_days_ago}
        })
        
        return {
            "success": True,
            "stats": {
                "user_info": {
                    "name": user.get('name'),
                    "email": user.get('email'),
                    "role": user.get('role', 'user'),
                    "status": user.get('status', 'active'),
                    "created_at": user.get('created_at'),
                    "last_login": user.get('last_login'),
                    "login_count": user.get('login_count', 0)
                },
                "usage": {
                    "total_chatbots": total_chatbots,
                    "active_chatbots": active_chatbots,
                    "total_messages": total_messages,
                    "total_conversations": total_conversations,
                    "total_sources": total_sources
                },
                "activity": {
                    "recent_activities_30d": recent_activities,
                    "recent_messages_7d": recent_messages
                },
                "limits": {
                    "custom_max_chatbots": user.get('custom_max_chatbots'),
                    "custom_max_messages": user.get('custom_max_messages'),
                    "custom_max_file_uploads": user.get('custom_max_file_uploads')
                }
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BULK OPERATIONS ENDPOINTS
# ============================================================================

@router.post("/bulk-operation")
async def bulk_user_operation(operation: BulkUserOperation):
    """
    Perform bulk operations on multiple users
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        results = {
            "success": True,
            "operation": operation.operation,
            "processed": 0,
            "failed": 0,
            "details": []
        }
        
        if operation.operation == "delete":
            for user_id in operation.user_ids:
                try:
                    await delete_user(user_id)
                    results["processed"] += 1
                except Exception as e:
                    results["failed"] += 1
                    results["details"].append(f"Failed to delete user {user_id}: {str(e)}")
        
        elif operation.operation == "change_role":
            if not operation.role:
                raise HTTPException(status_code=400, detail="Role is required for change_role operation")
            
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$set': {
                    'role': operation.role,
                    'updated_at': datetime.now(timezone.utc)
                }}
            )
            results["processed"] = result.modified_count
            
            # Log activity
            await log_activity(
                user_id="admin",
                action="bulk_role_change",
                resource_type="user",
                details=f"Changed role to {operation.role} for {result.modified_count} users"
            )
        
        elif operation.operation == "change_status":
            if not operation.status:
                raise HTTPException(status_code=400, detail="Status is required for change_status operation")
            
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$set': {
                    'status': operation.status,
                    'updated_at': datetime.now(timezone.utc)
                }}
            )
            results["processed"] = result.modified_count
            
            # Log activity
            await log_activity(
                user_id="admin",
                action="bulk_status_change",
                resource_type="user",
                details=f"Changed status to {operation.status} for {result.modified_count} users"
            )
        
        elif operation.operation == "add_tags":
            if not operation.tags:
                raise HTTPException(status_code=400, detail="Tags are required for add_tags operation")
            
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$addToSet': {'tags': {'$each': operation.tags}}}
            )
            results["processed"] = result.modified_count
        
        elif operation.operation == "export":
            # Get users data
            users = await users_collection.find({'id': {'$in': operation.user_ids}}).to_list(length=1000)
            for user in users:
                user.pop('_id', None)
                user.pop('password_hash', None)
            
            return {"success": True, "users": users, "count": len(users)}
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: {operation.operation}")
        
        return results
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing bulk operation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NOTES ENDPOINTS
# ============================================================================

@router.get("/{user_id}/notes")
async def get_user_notes(user_id: str):
    """
    Get admin notes for a user
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        user = await users_collection.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # For now, return admin_notes as a single note
        # In a more advanced system, you could have a separate notes collection
        notes = []
        if user.get('admin_notes'):
            notes.append({
                "id": "1",
                "content": user.get('admin_notes'),
                "created_at": user.get('updated_at'),
                "created_by": "admin"
            })
        
        return {"success": True, "notes": notes}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/notes")
async def add_user_note(user_id: str, note: dict):
    """
    Add an admin note for a user
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        note_content = note.get('content', '')
        if not note_content:
            raise HTTPException(status_code=400, detail="Note content is required")
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'admin_notes': note_content,
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "message": "Note added successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding user note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================================
# ADVANCED USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/create")
async def create_user(user_data: dict):
    """
    Manually create a new user from admin panel.
    Password is optional - can be empty for OAuth-only users (Google, etc.)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        subscriptions_collection = db_instance['subscriptions']
        
        # Validate required fields (password is now optional)
        email = user_data.get('email')
        name = user_data.get('name')
        password = user_data.get('password', '').strip()  # Allow empty password
        
        if not email or not name:
            raise HTTPException(status_code=400, detail="Email and name are required")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({'email': email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create user
        user_id = str(uuid.uuid4())
        
        # Hash password only if provided, otherwise set empty string for OAuth users
        hashed_password = pwd_context.hash(password) if password else ''
        
        new_user = {
            'id': user_id,
            'email': email,
            'name': name,
            'password_hash': hashed_password,
            'role': user_data.get('role', 'user'),
            'status': user_data.get('status', 'active'),
            'phone': user_data.get('phone'),
            'avatar_url': user_data.get('avatar_url'),
            'company': user_data.get('company'),
            'job_title': user_data.get('job_title'),
            'address': user_data.get('address'),
            'bio': user_data.get('bio'),
            'tags': user_data.get('tags', []),
            'custom_max_chatbots': user_data.get('custom_max_chatbots'),
            'custom_max_messages': user_data.get('custom_max_messages'),
            'custom_max_file_uploads': user_data.get('custom_max_file_uploads'),
            'custom_max_website_sources': user_data.get('custom_max_website_sources'),
            'custom_max_text_sources': user_data.get('custom_max_text_sources'),
            'admin_notes': user_data.get('admin_notes', ''),
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
            'last_login': None,
            'login_count': 0,
            'last_ip': None,
            'email_verified': user_data.get('email_verified', True),  # Auto-verify admin-created users
            'two_factor_enabled': False,
            'oauth_provider': 'google' if not password else None  # Mark as OAuth user if no password
        }
        
        await users_collection.insert_one(new_user)
        
        # Create subscription with selected plan (default: Free)
        plan_id = user_data.get('plan_id', 'free')
        subscription = {
            'id': str(uuid.uuid4()),
            'user_id': user_id,
            'plan_id': plan_id,
            'status': 'active',
            'usage': {
                'chatbots': 0,
                'messages_this_month': 0,
                'file_uploads': 0,
                'website_sources': 0,
                'text_sources': 0
            },
            'current_period_start': datetime.now(timezone.utc),
            'current_period_end': datetime.now(timezone.utc) + timedelta(days=30),
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        await subscriptions_collection.insert_one(subscription)
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="created_user",
            resource_type="user",
            resource_id=user_id,
            details=f"Created user: {email}"
        )
        
        return {
            "success": True, 
            "message": "User created successfully",
            "user_id": user_id,
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "role": new_user['role'],
                "status": new_user['status']
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/export-data")
async def export_user_data(user_id: str):
    """
    Export all user data (GDPR compliance)
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        subscriptions_collection = db_instance['subscriptions']
        
        # Get user
        user = await users_collection.find_one({'id': user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Remove sensitive data
        user.pop('password_hash', None)
        user.pop('_id', None)
        
        # Get all related data
        chatbots = await chatbots_collection.find({'user_id': user_id}).to_list(length=1000)
        chatbot_ids = [bot['id'] for bot in chatbots]
        
        sources = []
        conversations = []
        messages = []
        
        if chatbot_ids:
            sources = await sources_collection.find({'chatbot_id': {'$in': chatbot_ids}}).to_list(length=10000)
            conversations = await conversations_collection.find({'chatbot_id': {'$in': chatbot_ids}}).to_list(length=10000)
            messages = await messages_collection.find({'chatbot_id': {'$in': chatbot_ids}}).to_list(length=100000)
        
        subscription = await subscriptions_collection.find_one({'user_id': user_id})
        
        # Clean MongoDB _id fields
        for item in chatbots + sources + conversations + messages:
            item.pop('_id', None)
        if subscription:
            subscription.pop('_id', None)
        
        # Compile all data
        user_data = {
            'user': user,
            'subscription': subscription,
            'chatbots': chatbots,
            'sources': sources,
            'conversations': conversations,
            'messages': messages,
            'export_date': datetime.now(timezone.utc).isoformat(),
            'total_counts': {
                'chatbots': len(chatbots),
                'sources': len(sources),
                'conversations': len(conversations),
                'messages': len(messages)
            }
        }
        
        # Create JSON file
        json_str = json.dumps(user_data, indent=2, default=str)
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="exported_user_data",
            resource_type="user",
            resource_id=user_id,
            details=f"Exported all data for user: {user.get('email')}"
        )
        
        return StreamingResponse(
            io.BytesIO(json_str.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=user_{user_id}_data.json"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/suspend")
async def suspend_user(user_id: str, suspension_data: dict):
    """
    Suspend user account with optional time limit
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        reason = suspension_data.get('reason', 'No reason provided')
        duration_days = suspension_data.get('duration_days')  # None = indefinite
        
        update_doc = {
            'status': 'suspended',
            'suspension_reason': reason,
            'suspended_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        if duration_days:
            update_doc['suspension_until'] = datetime.now(timezone.utc) + timedelta(days=duration_days)
        else:
            update_doc['suspension_until'] = None
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="suspended_user",
            resource_type="user",
            resource_id=user_id,
            details=f"Suspended for {duration_days or 'indefinite'} days. Reason: {reason}"
        )
        
        return {
            "success": True, 
            "message": f"User suspended {'until ' + update_doc.get('suspension_until', '').isoformat() if duration_days else 'indefinitely'}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suspending user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/unsuspend")
async def unsuspend_user(user_id: str):
    """
    Remove suspension from user account
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'status': 'active',
                'suspension_reason': None,
                'suspension_until': None,
                'suspended_at': None,
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="unsuspended_user",
            resource_type="user",
            resource_id=user_id,
            details="Suspension removed"
        )
        
        return {"success": True, "message": "User suspension removed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unsuspending user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/ban")
async def ban_user(user_id: str, ban_data: dict):
    """
    Permanently ban user account
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        reason = ban_data.get('reason', 'No reason provided')
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'status': 'banned',
                'ban_reason': reason,
                'banned_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="banned_user",
            resource_type="user",
            resource_id=user_id,
            details=f"Banned. Reason: {reason}"
        )
        
        return {"success": True, "message": "User banned permanently"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error banning user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/unban")
async def unban_user(user_id: str):
    """
    Remove ban from user account
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'status': 'active',
                'ban_reason': None,
                'banned_at': None,
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="unbanned_user",
            resource_type="user",
            resource_id=user_id,
            details="Ban removed"
        )
        
        return {"success": True, "message": "User ban removed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unbanning user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/verify-email")
async def verify_user_email(user_id: str):
    """
    Manually verify user email
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': {
                'email_verified': True,
                'email_verified_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="verified_user_email",
            resource_type="user",
            resource_id=user_id,
            details="Email manually verified by admin"
        )
        
        return {"success": True, "message": "User email verified"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/send-notification")
async def send_user_notification(user_id: str, notification_data: dict):
    """
    Send notification/email to user - Creates in-app notification that user will see
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        user = await users_collection.find_one({'id': user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        subject = notification_data.get('subject', 'Message from Admin')
        message = notification_data.get('message', '')
        
        # Create in-app notification using NotificationService
        from services.notification_service import NotificationService
        notification_service = NotificationService(db_instance)
        
        notification = await notification_service.create_notification(
            user_id=user_id,
            notification_type="admin_message",
            title=subject,
            message=message,
            priority="high",
            metadata={
                "from": "admin",
                "admin_sent": True
            },
            action_url=None
        )
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="sent_notification",
            resource_type="user",
            resource_id=user_id,
            details=f"Sent notification: {subject}"
        )
        
        return {
            "success": True, 
            "message": "Notification sent successfully and will appear in user's notification center",
            "details": {
                "to": user.get('email'),
                "subject": subject,
                "notification_id": notification.id
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/advanced")
async def advanced_user_search(
    email: Optional[str] = None,
    name: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    company: Optional[str] = None,
    tag: Optional[str] = None,
    created_after: Optional[str] = None,
    created_before: Optional[str] = None,
    last_login_after: Optional[str] = None,
    has_chatbots: Optional[bool] = None
):
    """
    Advanced search with multiple criteria
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        
        # Build query
        query = {}
        
        if email:
            query['email'] = {'$regex': email, '$options': 'i'}
        if name:
            query['name'] = {'$regex': name, '$options': 'i'}
        if role:
            query['role'] = role
        if status:
            query['status'] = status
        if company:
            query['company'] = {'$regex': company, '$options': 'i'}
        if tag:
            query['tags'] = tag
        if created_after:
            query['created_at'] = {'$gte': datetime.fromisoformat(created_after)}
        if created_before:
            if 'created_at' not in query:
                query['created_at'] = {}
            query['created_at']['$lte'] = datetime.fromisoformat(created_before)
        if last_login_after:
            query['last_login'] = {'$gte': datetime.fromisoformat(last_login_after)}
        
        # Get users
        users = await users_collection.find(query).to_list(length=1000)
        
        # Filter by chatbot ownership if requested
        if has_chatbots is not None:
            filtered_users = []
            for user in users:
                chatbot_count = await chatbots_collection.count_documents({'user_id': user['id']})
                if (has_chatbots and chatbot_count > 0) or (not has_chatbots and chatbot_count == 0):
                    filtered_users.append(user)
            users = filtered_users
        
        # Remove sensitive data
        for user in users:
            user.pop('password_hash', None)
            user.pop('_id', None)
        
        return {
            "success": True,
            "users": users,
            "total": len(users),
            "query": query
        }
    
    except Exception as e:
        logger.error(f"Error in advanced search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/all")
async def export_all_users_csv():
    """
    Export all users to CSV
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        
        users = await users_collection.find({}).to_list(length=10000)
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow([
            'User ID', 'Name', 'Email', 'Role', 'Status', 'Company', 'Job Title',
            'Phone', 'Created At', 'Last Login', 'Login Count', 'Chatbots Count',
            'Email Verified', 'Tags'
        ])
        
        # Write data
        for user in users:
            chatbot_count = await chatbots_collection.count_documents({'user_id': user['id']})
            writer.writerow([
                user.get('id', ''),
                user.get('name', ''),
                user.get('email', ''),
                user.get('role', 'user'),
                user.get('status', 'active'),
                user.get('company', ''),
                user.get('job_title', ''),
                user.get('phone', ''),
                user.get('created_at', ''),
                user.get('last_login', ''),
                user.get('login_count', 0),
                chatbot_count,
                user.get('email_verified', False),
                ', '.join(user.get('tags', []))
            ])
        
        output.seek(0)
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="exported_all_users",
            resource_type="users",
            details=f"Exported {len(users)} users to CSV"
        )
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=all_users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    
    except Exception as e:
        logger.error(f"Error exporting users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics/overview")
async def get_users_statistics():
    """
    Get comprehensive statistics about all users
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        subscriptions_collection = db_instance['subscriptions']
        
        # Total users
        total_users = await users_collection.count_documents({})
        
        # Users by status
        active_users = await users_collection.count_documents({'status': 'active'})
        suspended_users = await users_collection.count_documents({'status': 'suspended'})
        banned_users = await users_collection.count_documents({'status': 'banned'})
        
        # Users by role
        admin_users = await users_collection.count_documents({'role': 'admin'})
        moderator_users = await users_collection.count_documents({'role': 'moderator'})
        regular_users = await users_collection.count_documents({'role': 'user'})
        
        # Recent activity - handle both datetime objects and ISO string dates
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Convert to ISO strings for comparison (since dates are stored as strings)
        today_str = today.isoformat()
        week_ago_str = week_ago.isoformat()
        month_ago_str = month_ago.isoformat()
        
        # Try both datetime and string comparison
        new_today = await users_collection.count_documents({
            '$or': [
                {'created_at': {'$gte': today}},
                {'created_at': {'$gte': today_str}}
            ]
        })
        new_this_week = await users_collection.count_documents({
            '$or': [
                {'created_at': {'$gte': week_ago}},
                {'created_at': {'$gte': week_ago_str}}
            ]
        })
        new_this_month = await users_collection.count_documents({
            '$or': [
                {'created_at': {'$gte': month_ago}},
                {'created_at': {'$gte': month_ago_str}}
            ]
        })
        
        active_today = await users_collection.count_documents({
            '$or': [
                {'last_login': {'$gte': today}},
                {'last_login': {'$gte': today_str}}
            ]
        })
        active_this_week = await users_collection.count_documents({
            '$or': [
                {'last_login': {'$gte': week_ago}},
                {'last_login': {'$gte': week_ago_str}}
            ]
        })
        
        # Subscription stats
        free_plan = await subscriptions_collection.count_documents({'plan_id': 'free'})
        starter_plan = await subscriptions_collection.count_documents({'plan_id': 'starter'})
        professional_plan = await subscriptions_collection.count_documents({'plan_id': 'professional'})
        enterprise_plan = await subscriptions_collection.count_documents({'plan_id': 'enterprise'})
        
        # Total chatbots
        total_chatbots = await chatbots_collection.count_documents({})
        
        # Email verification
        verified_emails = await users_collection.count_documents({'email_verified': True})
        unverified_emails = await users_collection.count_documents({'email_verified': False})
        
        return {
            "success": True,
            "statistics": {
                "total_users": total_users,
                "by_status": {
                    "active": active_users,
                    "suspended": suspended_users,
                    "banned": banned_users
                },
                "by_role": {
                    "admin": admin_users,
                    "moderator": moderator_users,
                    "user": regular_users
                },
                "activity": {
                    "new_today": new_today,
                    "new_this_week": new_this_week,
                    "new_this_month": new_this_month,
                    "active_today": active_today,
                    "active_this_week": active_this_week
                },
                "subscriptions": {
                    "free": free_plan,
                    "starter": starter_plan,
                    "professional": professional_plan,
                    "enterprise": enterprise_plan
                },
                "total_chatbots": total_chatbots,
                "email_verification": {
                    "verified": verified_emails,
                    "unverified": unverified_emails
                }
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/duplicate")
async def duplicate_user(user_id: str, new_email: str):
    """
    Duplicate/clone a user with new email
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        subscriptions_collection = db_instance['subscriptions']
        
        # Get original user
        original_user = await users_collection.find_one({'id': user_id})
        if not original_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if new email already exists
        existing = await users_collection.find_one({'email': new_email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        # Create new user
        new_user_id = str(uuid.uuid4())
        new_user = original_user.copy()
        new_user['id'] = new_user_id
        new_user['email'] = new_email
        new_user['created_at'] = datetime.now(timezone.utc)
        new_user['updated_at'] = datetime.now(timezone.utc)
        new_user['last_login'] = None
        new_user['login_count'] = 0
        new_user.pop('_id', None)
        
        await users_collection.insert_one(new_user)
        
        # Duplicate subscription
        original_sub = await subscriptions_collection.find_one({'user_id': user_id})
        if original_sub:
            new_sub = original_sub.copy()
            new_sub['id'] = str(uuid.uuid4())
            new_sub['user_id'] = new_user_id
            new_sub['created_at'] = datetime.now(timezone.utc)
            new_sub['updated_at'] = datetime.now(timezone.utc)
            new_sub['usage'] = {
                'chatbots': 0,
                'messages_this_month': 0,
                'file_uploads': 0,
                'website_sources': 0,
                'text_sources': 0
            }
            new_sub.pop('_id', None)
            await subscriptions_collection.insert_one(new_sub)
        
        # Log activity
        await log_activity(
            user_id="admin",
            action="duplicated_user",
            resource_type="user",
            resource_id=new_user_id,
            details=f"Duplicated from user {user_id}"
        )
        
        return {
            "success": True,
            "message": "User duplicated successfully",
            "new_user_id": new_user_id,
            "email": new_email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def log_activity(user_id: str, action: str, resource_type: str = None, 
                       resource_id: str = None, details: str = None, ip_address: str = None):
    """
    Log user activity
    """
    try:
        if db_instance is None:
            return
        
        activity_logs_collection = db_instance['activity_logs']
        
        activity = ActivityLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address
        )
        
        await activity_logs_collection.insert_one(activity.dict())
    
    except Exception as e:
        logger.error(f"Error logging activity: {str(e)}")
        # Don't raise exception, just log it



# ============================================================================
# ULTIMATE USER UPDATE ENDPOINT
# ============================================================================

@router.put("/{user_id}/ultimate-update")
async def ultimate_update_user(user_id: str, update_data: Dict[str, Any]):
    """
    Ultimate user update endpoint with comprehensive field support
    Supports all advanced customization features including:
    - Permissions, security settings, custom limits
    - Feature flags, API rate limits, branding
    - Notifications, metadata, tracking settings
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        users_collection = db_instance['users']
        
        # Find user
        user = await users_collection.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update document
        update_doc = {
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Basic Info
        if "name" in update_data:
            update_doc["name"] = update_data["name"]
        if "email" in update_data:
            # Check if email already exists
            existing = await users_collection.find_one({"email": update_data["email"], "id": {"$ne": user_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Email already in use")
            update_doc["email"] = update_data["email"]
        if "phone" in update_data:
            update_doc["phone"] = update_data["phone"]
        if "address" in update_data:
            update_doc["address"] = update_data["address"]
        if "bio" in update_data:
            update_doc["bio"] = update_data["bio"]
        if "avatar_url" in update_data:
            update_doc["avatar_url"] = update_data["avatar_url"]
        if "company" in update_data:
            update_doc["company"] = update_data["company"]
        if "job_title" in update_data:
            update_doc["job_title"] = update_data["job_title"]
        
        # Role & Permissions
        if "role" in update_data:
            update_doc["role"] = update_data["role"]
        if "permissions" in update_data:
            update_doc["permissions"] = update_data["permissions"]
        
        # Account Status & Security
        if "status" in update_data:
            update_doc["status"] = update_data["status"]
        if "suspension_reason" in update_data:
            update_doc["suspension_reason"] = update_data["suspension_reason"]
        if "email_verified" in update_data:
            update_doc["email_verified"] = update_data["email_verified"]
        if "two_factor_enabled" in update_data:
            update_doc["two_factor_enabled"] = update_data["two_factor_enabled"]
        if "force_password_change" in update_data:
            update_doc["force_password_change"] = update_data["force_password_change"]
        if "allowed_ips" in update_data:
            update_doc["allowed_ips"] = update_data["allowed_ips"]
        if "blocked_ips" in update_data:
            update_doc["blocked_ips"] = update_data["blocked_ips"]
        if "max_sessions" in update_data:
            update_doc["max_sessions"] = update_data["max_sessions"]
        if "session_timeout" in update_data:
            update_doc["session_timeout"] = update_data["session_timeout"]
        
        # Subscription & Billing
        if "plan_id" in update_data:
            update_doc["plan_id"] = update_data["plan_id"]
        if "stripe_customer_id" in update_data:
            update_doc["stripe_customer_id"] = update_data["stripe_customer_id"]
        if "billing_email" in update_data:
            update_doc["billing_email"] = update_data["billing_email"]
        if "payment_method" in update_data:
            update_doc["payment_method"] = update_data["payment_method"]
        if "trial_ends_at" in update_data:
            update_doc["trial_ends_at"] = update_data["trial_ends_at"]
        if "subscription_ends_at" in update_data:
            update_doc["subscription_ends_at"] = update_data["subscription_ends_at"]
        if "lifetime_access" in update_data:
            update_doc["lifetime_access"] = update_data["lifetime_access"]
        if "discount_code" in update_data:
            update_doc["discount_code"] = update_data["discount_code"]
        if "custom_pricing" in update_data:
            update_doc["custom_pricing"] = update_data["custom_pricing"]
        
        # Custom Limits & Features
        if "custom_limits" in update_data:
            update_doc["custom_limits"] = update_data["custom_limits"]
        if "feature_flags" in update_data:
            update_doc["feature_flags"] = update_data["feature_flags"]
        if "api_rate_limits" in update_data:
            update_doc["api_rate_limits"] = update_data["api_rate_limits"]
        
        # Profile & Appearance
        if "timezone" in update_data:
            update_doc["timezone"] = update_data["timezone"]
        if "language" in update_data:
            update_doc["language"] = update_data["language"]
        if "theme" in update_data:
            update_doc["theme"] = update_data["theme"]
        if "custom_css" in update_data:
            update_doc["custom_css"] = update_data["custom_css"]
        if "branding" in update_data:
            update_doc["branding"] = update_data["branding"]
        
        # Notifications & Preferences
        if "email_notifications" in update_data:
            update_doc["email_notifications"] = update_data["email_notifications"]
        if "marketing_emails" in update_data:
            update_doc["marketing_emails"] = update_data["marketing_emails"]
        if "notification_preferences" in update_data:
            update_doc["notification_preferences"] = update_data["notification_preferences"]
        
        # Metadata & Custom Fields
        if "tags" in update_data:
            update_doc["tags"] = update_data["tags"]
        if "segments" in update_data:
            update_doc["segments"] = update_data["segments"]
        if "custom_fields" in update_data:
            update_doc["custom_fields"] = update_data["custom_fields"]
        if "admin_notes" in update_data:
            update_doc["admin_notes"] = update_data["admin_notes"]
        if "internal_notes" in update_data:
            update_doc["internal_notes"] = update_data["internal_notes"]
        
        # Activity & Tracking
        if "tracking_enabled" in update_data:
            update_doc["tracking_enabled"] = update_data["tracking_enabled"]
        if "analytics_enabled" in update_data:
            update_doc["analytics_enabled"] = update_data["analytics_enabled"]
        if "onboarding_completed" in update_data:
            update_doc["onboarding_completed"] = update_data["onboarding_completed"]
        if "onboarding_step" in update_data:
            update_doc["onboarding_step"] = update_data["onboarding_step"]
        
        # API & Integrations
        if "api_key" in update_data:
            update_doc["api_key"] = update_data["api_key"]
        if "webhook_url" in update_data:
            update_doc["webhook_url"] = update_data["webhook_url"]
        if "webhook_events" in update_data:
            update_doc["webhook_events"] = update_data["webhook_events"]
        if "oauth_tokens" in update_data:
            update_doc["oauth_tokens"] = update_data["oauth_tokens"]
        if "integration_preferences" in update_data:
            update_doc["integration_preferences"] = update_data["integration_preferences"]
        
        # Update user in database
        result = await users_collection.update_one(
            {"id": user_id},
            {"$set": update_doc}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            # CRITICAL FIX: Update subscription plan_id and duration if plan changed
            if "plan_id" in update_data:
                subscriptions_collection = db_instance['subscriptions']
                plans_collection = db_instance['plans']
                
                # Get the new plan details from database to determine correct duration
                new_plan = await plans_collection.find_one({"id": update_data["plan_id"]})
                
                # Determine subscription duration based on plan
                # Free plan: 6 days, All paid plans: 30 days
                if update_data["plan_id"] == "free":
                    days_duration = 6
                else:
                    # For paid plans (starter, professional, enterprise), always use 30 days
                    days_duration = 30
                
                # Calculate new subscription dates
                started_at = datetime.now(timezone.utc)
                expires_at = started_at + timedelta(days=days_duration)
                
                # Check if subscription exists
                existing_sub = await subscriptions_collection.find_one({"user_id": user_id})
                
                if existing_sub:
                    # Update existing subscription with new plan AND proper expiration dates
                    subscription_update = {
                        "plan_id": update_data["plan_id"],
                        "status": "active",
                        "started_at": started_at,
                        "expires_at": expires_at,
                        "updated_at": started_at
                    }
                    await subscriptions_collection.update_one(
                        {"user_id": user_id},
                        {"$set": subscription_update}
                    )
                    logger.info(f"✅ Admin plan change: Updated subscription for user {user_id} to plan '{update_data['plan_id']}' with {days_duration} days duration (expires: {expires_at.isoformat()})")
                else:
                    # Create new subscription with proper dates
                    new_subscription = {
                        "user_id": user_id,
                        "plan_id": update_data["plan_id"],
                        "status": "active",
                        "started_at": started_at,
                        "expires_at": expires_at,
                        "auto_renew": True,
                        "usage": {
                            "chatbots_count": 0,
                            "messages_this_month": 0,
                            "file_uploads_count": 0,
                            "website_sources_count": 0,
                            "text_sources_count": 0,
                            "last_reset": started_at
                        },
                        "created_at": started_at,
                        "updated_at": started_at
                    }
                    await subscriptions_collection.insert_one(new_subscription)
                    logger.info(f"✅ Admin plan change: Created new subscription for user {user_id} with plan '{update_data['plan_id']}' for {days_duration} days (expires: {expires_at.isoformat()})")
            
            # Log activity
            await log_activity(
                user_id=user_id,
                action="updated_user_ultimate",
                resource_type="user",
                resource_id=user_id,
                details=f"Ultimate update with {len(update_doc)} fields modified",
                ip_address="admin"
            )
            
            # Get updated user
            updated_user = await users_collection.find_one({"id": user_id})
            
            return {
                "success": True,
                "message": "User updated successfully with all advanced settings",
                "user": {
                    "id": updated_user.get("id"),
                    "name": updated_user.get("name"),
                    "email": updated_user.get("email"),
                    "role": updated_user.get("role"),
                    "status": updated_user.get("status"),
                    "updated_fields": len(update_doc)
                }
            }
        else:
            raise HTTPException(status_code=404, detail="User not found or no changes made")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ultimate user update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

