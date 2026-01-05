from fastapi import APIRouter, Depends, HTTPException, Query, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import json
import csv
import io
from fastapi.responses import StreamingResponse
import logging
from uuid import uuid4

router = APIRouter(prefix="/admin/chatbots", tags=["Admin Chatbots"])
db_instance = None
logger = logging.getLogger(__name__)

def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance
    db_instance = db

# Pydantic Models
class ChatbotUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    enabled: Optional[bool] = None
    public_access: Optional[bool] = None
    widget_position: Optional[str] = None
    widget_theme: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

class BulkOperationRequest(BaseModel):
    ids: List[str]
    operation: str  # 'delete', 'enable', 'disable', 'export'

class TransferOwnershipRequest(BaseModel):
    new_owner_id: str

class ChatbotTestRequest(BaseModel):
    message: str


@router.get("/detailed")
async def get_all_chatbots_detailed(
    search: Optional[str] = Query(None),
    ai_provider: Optional[str] = Query(None),
    enabled: Optional[bool] = Query(None),
    owner_id: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
) -> Dict[str, Any]:
    """
    Get all chatbots with detailed information including owner details and statistics
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
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
        
        # Get chatbots collection
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        integrations_collection = db_instance['integrations']
        
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
        logger.error(f"Error fetching chatbots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/details")
async def get_chatbot_details(chatbot_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific chatbot
    """
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


@router.put("/{chatbot_id}/update")
async def update_chatbot(chatbot_id: str, update_data: ChatbotUpdateRequest) -> Dict[str, Any]:
    """
    Update chatbot settings
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Prepare update data
        update_dict = {}
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_dict[field] = value
        
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at timestamp
        update_dict['updated_at'] = datetime.utcnow().isoformat()
        
        # Update chatbot
        result = await chatbots_collection.update_one(
            {'id': chatbot_id},
            {'$set': update_dict}
        )
        
        if result.modified_count == 0:
            return {
                'success': True,
                'message': 'No changes made',
                'modified': False
            }
        
        # Log activity
        activity_log = {
            'id': str(uuid4()),
            'type': 'chatbot_updated',
            'chatbot_id': chatbot_id,
            'user_id': 'admin',
            'timestamp': datetime.utcnow().isoformat(),
            'details': update_dict
        }
        await db_instance['activity_logs'].insert_one(activity_log)
        
        return {
            'success': True,
            'message': 'Chatbot updated successfully',
            'modified': True,
            'updated_fields': list(update_dict.keys())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{chatbot_id}/toggle")
async def toggle_chatbot(chatbot_id: str) -> Dict[str, Any]:
    """
    Toggle chatbot enabled status
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Get current status
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        current_status = chatbot.get('enabled', True)
        new_status = not current_status
        
        # Update status
        await chatbots_collection.update_one(
            {'id': chatbot_id},
            {'$set': {
                'enabled': new_status,
                'updated_at': datetime.utcnow().isoformat()
            }}
        )
        
        return {
            'success': True,
            'chatbot_id': chatbot_id,
            'enabled': new_status,
            'message': f"Chatbot {'enabled' if new_status else 'disabled'} successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk")
async def bulk_operations(request: BulkOperationRequest) -> Dict[str, Any]:
    """
    Perform bulk operations on chatbots
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        if not request.ids:
            raise HTTPException(status_code=400, detail="No chatbot IDs provided")
        
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        integrations_collection = db_instance['integrations']
        
        affected_count = 0
        
        if request.operation == 'enable':
            result = await chatbots_collection.update_many(
                {'id': {'$in': request.ids}},
                {'$set': {
                    'enabled': True,
                    'updated_at': datetime.utcnow().isoformat()
                }}
            )
            affected_count = result.modified_count
            
        elif request.operation == 'disable':
            result = await chatbots_collection.update_many(
                {'id': {'$in': request.ids}},
                {'$set': {
                    'enabled': False,
                    'updated_at': datetime.utcnow().isoformat()
                }}
            )
            affected_count = result.modified_count
            
        elif request.operation == 'delete':
            # Delete chatbots and all related data
            chunks_collection = db_instance['chunks']
            from services.cache_service import cache_service
            from services.plan_service import plan_service
            
            for chatbot_id in request.ids:
                # Get chatbot to find user_id
                chatbot = await chatbots_collection.find_one({'id': chatbot_id})
                user_id = chatbot.get('user_id') if chatbot else None
                
                # Delete sources
                await sources_collection.delete_many({'chatbot_id': chatbot_id})
                # Delete messages
                await messages_collection.delete_many({'chatbot_id': chatbot_id})
                # Delete conversations
                await conversations_collection.delete_many({'chatbot_id': chatbot_id})
                # Delete integrations
                await integrations_collection.delete_many({'chatbot_id': chatbot_id})
                # Delete chunks
                await chunks_collection.delete_many({'chatbot_id': chatbot_id})
                
                # Invalidate cache
                cache_service.delete(f"chatbot:{chatbot_id}")
                cache_service.delete(f"public_chatbot:{chatbot_id}")
                
                # Delete chatbot
                await chatbots_collection.delete_one({'id': chatbot_id})
                
                # Decrement user's chatbot usage count
                if user_id:
                    try:
                        await plan_service.decrement_usage(user_id, "chatbots")
                    except Exception as e:
                        logger.warning(f"Failed to decrement usage count for user {user_id}: {e}")
                
                affected_count += 1
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: {request.operation}")
        
        return {
            'success': True,
            'operation': request.operation,
            'affected': affected_count,
            'message': f"Successfully {request.operation}d {affected_count} chatbot(s)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bulk operation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}")
async def delete_chatbot(chatbot_id: str) -> Dict[str, Any]:
    """
    Delete a chatbot and all its related data
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        sources_collection = db_instance['sources']
        conversations_collection = db_instance['conversations']
        messages_collection = db_instance['messages']
        integrations_collection = db_instance['integrations']
        chunks_collection = db_instance['chunks']
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        user_id = chatbot.get('user_id')
        
        # Delete all related data
        await sources_collection.delete_many({'chatbot_id': chatbot_id})
        await messages_collection.delete_many({'chatbot_id': chatbot_id})
        await conversations_collection.delete_many({'chatbot_id': chatbot_id})
        await integrations_collection.delete_many({'chatbot_id': chatbot_id})
        await chunks_collection.delete_many({'chatbot_id': chatbot_id})
        
        # Delete chatbot
        await chatbots_collection.delete_one({'id': chatbot_id})
        
        # Invalidate cache for this chatbot
        from services.cache_service import cache_service
        cache_service.delete(f"chatbot:{chatbot_id}")
        cache_service.delete(f"public_chatbot:{chatbot_id}")
        logger.info(f"Cache invalidated for deleted chatbot {chatbot_id}")
        
        # Decrement user's chatbot usage count
        if user_id:
            from services.plan_service import plan_service
            try:
                await plan_service.decrement_usage(user_id, "chatbots")
                logger.info(f"Decremented chatbot usage count for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to decrement usage count for user {user_id}: {e}")
        
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


@router.get("/{chatbot_id}/sources")
async def get_chatbot_sources(chatbot_id: str) -> Dict[str, Any]:
    """
    Get all sources for a chatbot
    """
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


@router.delete("/{chatbot_id}/sources/{source_id}")
async def delete_chatbot_source(chatbot_id: str, source_id: str) -> Dict[str, Any]:
    """
    Delete a specific source from a chatbot
    """
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


@router.get("/{chatbot_id}/analytics")
async def get_chatbot_analytics(
    chatbot_id: str,
    days: int = Query(30, ge=1, le=365)
) -> Dict[str, Any]:
    """
    Get analytics for a specific chatbot
    """
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
        
        # Get message trend (daily)
        messages_cursor = messages_collection.find({
            'chatbot_id': chatbot_id,
            'timestamp': {'$gte': start_date.isoformat()}
        })
        messages = await messages_cursor.to_list(length=None)
        
        # Group by date
        daily_counts = {}
        for msg in messages:
            try:
                msg_date = msg.get('timestamp', '')
                if isinstance(msg_date, str):
                    date_key = msg_date.split('T')[0]
                else:
                    date_key = msg_date.date().isoformat() if hasattr(msg_date, 'date') else str(msg_date)
                daily_counts[date_key] = daily_counts.get(date_key, 0) + 1
            except Exception as e:
                logger.warning(f"Error processing message date: {e}")
                continue
        
        return {
            'success': True,
            'chatbot_id': chatbot_id,
            'period_days': days,
            'analytics': {
                'total_messages': total_messages,
                'recent_messages': recent_messages,
                'total_conversations': total_conversations,
                'active_conversations': active_conversations,
                'daily_message_count': daily_counts,
                'average_daily_messages': recent_messages / days if days > 0 else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting chatbot analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/transfer-ownership")
async def transfer_chatbot_ownership(
    chatbot_id: str,
    request: TransferOwnershipRequest
) -> Dict[str, Any]:
    """
    Transfer chatbot ownership to another user
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        users_collection = db_instance['users']
        
        # Check if chatbot exists
        chatbot = await chatbots_collection.find_one({'id': chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Check if new owner exists
        new_owner = await users_collection.find_one({'id': request.new_owner_id})
        if not new_owner:
            raise HTTPException(status_code=404, detail="New owner not found")
        
        old_owner_id = chatbot.get('user_id')
        
        # Transfer ownership
        await chatbots_collection.update_one(
            {'id': chatbot_id},
            {'$set': {
                'user_id': request.new_owner_id,
                'updated_at': datetime.utcnow().isoformat()
            }}
        )
        
        return {
            'success': True,
            'message': 'Ownership transferred successfully',
            'chatbot_id': chatbot_id,
            'old_owner_id': old_owner_id,
            'new_owner_id': request.new_owner_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring ownership: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_all_chatbots(format: str = Query("json")) -> Response:
    """
    Export all chatbots data
    """
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
            return Response(
                content=json.dumps(export_data, indent=2),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=chatbots_{datetime.utcnow().strftime('%Y%m%d')}.json"}
            )
        
    except Exception as e:
        logger.error(f"Error exporting chatbots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers/stats")
async def get_providers_stats() -> Dict[str, Any]:
    """
    Get statistics about AI providers usage
    """
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        chatbots_collection = db_instance['chatbots']
        
        # Aggregate by provider
        pipeline = [
            {
                '$group': {
                    '_id': '$ai_provider',
                    'count': {'$sum': 1},
                    'models': {'$addToSet': '$ai_model'}
                }
            }
        ]
        
        cursor = chatbots_collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        
        provider_stats = {
            r['_id']: {
                'count': r['count'],
                'models': r['models']
            } for r in results
        }
        
        return {
            'success': True,
            'providers': provider_stats,
            'total_chatbots': sum(r['count'] for r in results)
        }
        
    except Exception as e:
        logger.error(f"Error getting provider stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
