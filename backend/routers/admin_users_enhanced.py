from fastapi import APIRouter, HTTPException, Query, Request, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from models import (
    User, AdminUserUpdate, PasswordReset, LoginHistory, LoginHistoryResponse,
    ActivityLog, ActivityLogResponse, BulkUserOperation, UserSegment, UserSegmentCreate,
    EmailTemplate, EmailTemplateCreate, EmailCampaign, EmailCampaignCreate,
    UserNote, ImpersonationSession, ImpersonationRequest
)
from passlib.context import CryptContext
import logging
import json
from collections import defaultdict

router = APIRouter(prefix="/admin/users-enhanced", tags=["admin-users-enhanced"])
db_instance = None
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

logger = logging.getLogger(__name__)

def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance
    db_instance = db


# ============================================================================
# ADVANCED USER SEARCH & FILTERING
# ============================================================================

@router.get("/advanced-search")
async def advanced_user_search(
    # Basic Filters
    search: Optional[str] = Query(None, description="Search in name, email, company"),
    status: Optional[str] = Query(None, description="Filter by status"),
    role: Optional[str] = Query(None, description="Filter by role"),
    
    # Location Filters
    country: Optional[str] = Query(None, description="Filter by country"),
    state: Optional[str] = Query(None, description="Filter by state"),
    city: Optional[str] = Query(None, description="Filter by city"),
    
    # Activity Filters
    last_active_days: Optional[int] = Query(None, description="Users active in last N days"),
    inactive_days: Optional[int] = Query(None, description="Users inactive for N days"),
    login_count_min: Optional[int] = Query(None, description="Minimum login count"),
    login_count_max: Optional[int] = Query(None, description="Maximum login count"),
    
    # Financial Filters
    total_spent_min: Optional[float] = Query(None, description="Minimum total spent"),
    total_spent_max: Optional[float] = Query(None, description="Maximum total spent"),
    lifetime_value_min: Optional[float] = Query(None, description="Minimum lifetime value"),
    current_plan: Optional[str] = Query(None, description="Filter by current plan"),
    
    # Lifecycle Filters
    lifecycle_stage: Optional[str] = Query(None, description="Filter by lifecycle stage"),
    churn_risk_min: Optional[float] = Query(None, description="Minimum churn risk (0-1)"),
    churn_risk_max: Optional[float] = Query(None, description="Maximum churn risk (0-1)"),
    onboarding_completed: Optional[bool] = Query(None, description="Filter by onboarding status"),
    
    # Segmentation
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    segments: Optional[str] = Query(None, description="Comma-separated segments"),
    
    # Date Filters
    created_after: Optional[str] = Query(None, description="Created after date (YYYY-MM-DD)"),
    created_before: Optional[str] = Query(None, description="Created before date (YYYY-MM-DD)"),
    
    # Usage Filters
    chatbots_min: Optional[int] = Query(None, description="Minimum chatbots count"),
    chatbots_max: Optional[int] = Query(None, description="Maximum chatbots count"),
    messages_min: Optional[int] = Query(None, description="Minimum messages count"),
    
    # Sorting & Pagination
    sortBy: str = Query("created_at", description="Field to sort by"),
    sortOrder: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=200, description="Results per page")
):
    """
    Advanced user search with comprehensive filtering options
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        chatbots_collection = db_instance['chatbots']
        messages_collection = db_instance['messages']
        
        # Build complex query
        query = {}
        
        # Basic search
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'company': {'$regex': search, '$options': 'i'}}
            ]
        
        # Status & Role
        if status:
            query['status'] = status
        if role:
            query['role'] = role
        
        # Location
        if country:
            query['country'] = {'$regex': country, '$options': 'i'}
        if state:
            query['state'] = {'$regex': state, '$options': 'i'}
        if city:
            query['city'] = {'$regex': city, '$options': 'i'}
        
        # Activity
        if last_active_days:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=last_active_days)
            query['last_active'] = {'$gte': cutoff_date}
        
        if inactive_days:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=inactive_days)
            query['last_active'] = {'$lte': cutoff_date}
        
        if login_count_min is not None:
            query.setdefault('login_count', {})['$gte'] = login_count_min
        if login_count_max is not None:
            query.setdefault('login_count', {})['$lte'] = login_count_max
        
        # Financial
        if total_spent_min is not None:
            query.setdefault('total_spent', {})['$gte'] = total_spent_min
        if total_spent_max is not None:
            query.setdefault('total_spent', {})['$lte'] = total_spent_max
        
        if lifetime_value_min is not None:
            query.setdefault('lifetime_value', {})['$gte'] = lifetime_value_min
        
        if current_plan:
            query['current_plan'] = current_plan
        
        # Lifecycle
        if lifecycle_stage:
            query['lifecycle_stage'] = lifecycle_stage
        
        if churn_risk_min is not None:
            query.setdefault('churn_risk_score', {})['$gte'] = churn_risk_min
        if churn_risk_max is not None:
            query.setdefault('churn_risk_score', {})['$lte'] = churn_risk_max
        
        if onboarding_completed is not None:
            query['onboarding_completed'] = onboarding_completed
        
        # Tags & Segments
        if tags:
            tag_list = [t.strip() for t in tags.split(',')]
            query['tags'] = {'$in': tag_list}
        
        if segments:
            segment_list = [s.strip() for s in segments.split(',')]
            query['segments'] = {'$in': segment_list}
        
        # Date filters
        if created_after:
            created_after_date = datetime.fromisoformat(created_after)
            query.setdefault('created_at', {})['$gte'] = created_after_date
        if created_before:
            created_before_date = datetime.fromisoformat(created_before)
            query.setdefault('created_at', {})['$lte'] = created_before_date
        
        # Count total matching users
        total_users = await users_collection.count_documents(query)
        
        # Get paginated users
        skip = (page - 1) * limit
        sort_direction = -1 if sortOrder == "desc" else 1
        users = await users_collection.find(query).sort(sortBy, sort_direction).skip(skip).limit(limit).to_list(length=limit)
        
        # Enhance with statistics
        enhanced_users = []
        for user in users:
            user_id = user.get('id')
            
            # Count chatbots
            chatbots_count = await chatbots_collection.count_documents({'user_id': user_id})
            
            # Get chatbot IDs
            user_chatbot_ids = []
            async for bot in chatbots_collection.find({'user_id': user_id}, {'id': 1}):
                user_chatbot_ids.append(bot['id'])
            
            # Count messages
            messages_count = 0
            if user_chatbot_ids:
                messages_count = await messages_collection.count_documents({
                    'chatbot_id': {'$in': user_chatbot_ids}
                })
            
            # Filter by chatbots/messages if specified
            if chatbots_min is not None and chatbots_count < chatbots_min:
                continue
            if chatbots_max is not None and chatbots_count > chatbots_max:
                continue
            if messages_min is not None and messages_count < messages_min:
                continue
            
            # Convert datetime fields to ISO format strings
            created_at = user.get('created_at')
            last_login = user.get('last_login')
            last_active = user.get('last_active')
            
            enhanced_users.append({
                'user_id': user.get('id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'role': user.get('role', 'user'),
                'status': user.get('status', 'active'),
                'avatar_url': user.get('avatar_url'),
                'company': user.get('company'),
                'country': user.get('country'),
                'state': user.get('state'),
                'city': user.get('city'),
                'tags': user.get('tags', []),
                'segments': user.get('segments', []),
                'lifecycle_stage': user.get('lifecycle_stage', 'new'),
                'churn_risk_score': user.get('churn_risk_score', 0.0),
                'total_spent': user.get('total_spent', 0.0),
                'lifetime_value': user.get('lifetime_value', 0.0),
                'current_plan': user.get('current_plan'),
                'created_at': created_at.isoformat() if isinstance(created_at, datetime) else str(created_at) if created_at else None,
                'last_login': last_login.isoformat() if isinstance(last_login, datetime) else str(last_login) if last_login else None,
                'last_active': last_active.isoformat() if isinstance(last_active, datetime) else str(last_active) if last_active else None,
                'login_count': user.get('login_count', 0),
                'onboarding_completed': user.get('onboarding_completed', False),
                'onboarding_progress': user.get('onboarding_progress', 0),
                'statistics': {
                    'chatbots_count': chatbots_count,
                    'messages_count': messages_count
                }
            })
        
        total_pages = (total_users + limit - 1) // limit
        
        # Build filters applied dictionary with only primitive types
        filters_applied = {}
        if search:
            filters_applied['search'] = search
        if status:
            filters_applied['status'] = status
        if role:
            filters_applied['role'] = role
        if current_plan:
            filters_applied['current_plan'] = current_plan
        if lifecycle_stage:
            filters_applied['lifecycle_stage'] = lifecycle_stage
        filters_applied['sortBy'] = sortBy
        filters_applied['sortOrder'] = sortOrder
        
        return {
            "success": True,
            "users": enhanced_users,
            "pagination": {
                "total": total_users,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "filters_applied": filters_applied
        }
    
    except Exception as e:
        logger.error(f"Error in advanced user search: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER SEGMENTATION
# ============================================================================

@router.post("/segments")
async def create_user_segment(segment_data: UserSegmentCreate):
    """
    Create a new user segment with custom filters
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        segments_collection = db_instance['user_segments']
        users_collection = db_instance['users']
        
        # Calculate user count for this segment
        user_count = await users_collection.count_documents(segment_data.filters)
        
        segment = UserSegment(
            name=segment_data.name,
            description=segment_data.description,
            filters=segment_data.filters,
            created_by="admin",
            user_count=user_count
        )
        
        await segments_collection.insert_one(segment.model_dump())
        
        return {
            "success": True,
            "message": "Segment created successfully",
            "segment": segment.model_dump(),
            "user_count": user_count
        }
    
    except Exception as e:
        logger.error(f"Error creating segment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments")
async def get_user_segments():
    """
    Get all user segments
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        segments_collection = db_instance['user_segments']
        segments = await segments_collection.find({}).to_list(length=1000)
        
        # Convert MongoDB documents to serializable format
        for segment in segments:
            if "_id" in segment:
                segment["_id"] = str(segment["_id"])
        
        return {
            "success": True,
            "segments": segments
        }
    
    except Exception as e:
        logger.error(f"Error fetching segments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments/{segment_id}/users")
async def get_segment_users(segment_id: str):
    """
    Get all users in a specific segment
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        segments_collection = db_instance['user_segments']
        users_collection = db_instance['users']
        
        segment = await segments_collection.find_one({'id': segment_id})
        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")
        
        users = await users_collection.find(segment['filters']).to_list(length=10000)
        
        return {
            "success": True,
            "segment": segment,
            "users": users,
            "count": len(users)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching segment users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/segments/{segment_id}")
async def update_user_segment(segment_id: str, segment_data: UserSegmentCreate):
    """
    Update an existing user segment
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        segments_collection = db_instance['user_segments']
        users_collection = db_instance['users']
        
        # Calculate new user count
        user_count = await users_collection.count_documents(segment_data.filters)
        
        result = await segments_collection.update_one(
            {'id': segment_id},
            {'$set': {
                'name': segment_data.name,
                'description': segment_data.description,
                'filters': segment_data.filters,
                'user_count': user_count,
                'updated_at': datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Segment not found")
        
        return {
            "success": True,
            "message": "Segment updated successfully",
            "user_count": user_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating segment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/segments/{segment_id}")
async def delete_user_segment(segment_id: str):
    """
    Delete a user segment
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        segments_collection = db_instance['user_segments']
        
        result = await segments_collection.delete_one({'id': segment_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Segment not found")
        
        return {
            "success": True,
            "message": "Segment deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting segment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BULK EMAIL & NOTIFICATION SYSTEM
# ============================================================================

@router.post("/email-templates")
async def create_email_template(template_data: EmailTemplateCreate):
    """
    Create a new email template
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        templates_collection = db_instance['email_templates']
        
        template = EmailTemplate(
            name=template_data.name,
            subject=template_data.subject,
            body=template_data.body,
            template_type=template_data.template_type,
            variables=template_data.variables,
            created_by="admin"
        )
        
        await templates_collection.insert_one(template.model_dump())
        
        return {
            "success": True,
            "message": "Email template created successfully",
            "template": template.model_dump()
        }
    
    except Exception as e:
        logger.error(f"Error creating email template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email-templates")
async def get_email_templates():
    """
    Get all email templates
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        templates_collection = db_instance['email_templates']
        templates = await templates_collection.find({}).to_list(length=1000)
        
        # Convert MongoDB documents to serializable format
        for template in templates:
            if "_id" in template:
                template["_id"] = str(template["_id"])
        
        return {
            "success": True,
            "templates": templates
        }
    
    except Exception as e:
        logger.error(f"Error fetching email templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/email-templates/{template_id}")
async def delete_email_template(template_id: str):
    """
    Delete an email template
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        templates_collection = db_instance['email_templates']
        
        result = await templates_collection.delete_one({'id': template_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return {
            "success": True,
            "message": "Email template deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting email template: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/email-campaigns")
async def create_email_campaign(campaign_data: EmailCampaignCreate, background_tasks: BackgroundTasks):
    """
    Create and send bulk email campaign to users
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        campaigns_collection = db_instance['email_campaigns']
        templates_collection = db_instance['email_templates']
        users_collection = db_instance['users']
        segments_collection = db_instance['user_segments']
        
        # Get template
        template = await templates_collection.find_one({'id': campaign_data.template_id})
        if not template:
            raise HTTPException(status_code=404, detail="Email template not found")
        
        # Collect all target user IDs
        target_user_ids = set(campaign_data.target_user_ids)
        
        # Add users from segments
        for segment_id in campaign_data.target_segments:
            segment = await segments_collection.find_one({'id': segment_id})
            if segment:
                segment_users = await users_collection.find(segment['filters'], {'id': 1}).to_list(length=10000)
                target_user_ids.update([u['id'] for u in segment_users])
        
        # Create campaign
        campaign = EmailCampaign(
            name=campaign_data.name,
            template_id=campaign_data.template_id,
            target_user_ids=list(target_user_ids),
            target_segments=campaign_data.target_segments,
            status="scheduled" if campaign_data.scheduled_at else "draft",
            scheduled_at=campaign_data.scheduled_at,
            created_by="admin"
        )
        
        await campaigns_collection.insert_one(campaign.model_dump())
        
        # If not scheduled, send immediately in background
        if not campaign_data.scheduled_at:
            background_tasks.add_task(send_campaign_emails, campaign.id, list(target_user_ids), template)
            campaign.status = "sending"
            await campaigns_collection.update_one(
                {'id': campaign.id},
                {'$set': {'status': 'sending'}}
            )
        
        return {
            "success": True,
            "message": "Email campaign created successfully",
            "campaign": campaign.model_dump(),
            "target_user_count": len(target_user_ids)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating email campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def send_campaign_emails(campaign_id: str, user_ids: List[str], template: dict):
    """
    Background task to send campaign emails
    Note: This is a mock implementation. In production, integrate with real email service.
    """
    try:
        campaigns_collection = db_instance['email_campaigns']
        users_collection = db_instance['users']
        
        sent_count = 0
        failed_count = 0
        
        for user_id in user_ids:
            try:
                user = await users_collection.find_one({'id': user_id})
                if user and user.get('email_notifications', True):
                    # Mock email sending
                    logger.info(f"Sending email to {user['email']}: {template['subject']}")
                    sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send email to user {user_id}: {str(e)}")
                failed_count += 1
        
        # Update campaign status
        await campaigns_collection.update_one(
            {'id': campaign_id},
            {'$set': {
                'status': 'sent',
                'sent_at': datetime.now(timezone.utc),
                'sent_count': sent_count,
                'failed_count': failed_count
            }}
        )
        
        logger.info(f"Campaign {campaign_id} completed: {sent_count} sent, {failed_count} failed")
    
    except Exception as e:
        logger.error(f"Error in send_campaign_emails: {str(e)}")


@router.get("/email-campaigns")
async def get_email_campaigns():
    """
    Get all email campaigns
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        campaigns_collection = db_instance['email_campaigns']
        campaigns = await campaigns_collection.find({}).sort('created_at', -1).to_list(length=1000)
        
        # Convert MongoDB documents to serializable format
        for campaign in campaigns:
            if "_id" in campaign:
                campaign["_id"] = str(campaign["_id"])
        
        return {
            "success": True,
            "campaigns": campaigns
        }
    
    except Exception as e:
        logger.error(f"Error fetching email campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email-campaigns/{campaign_id}")
async def get_email_campaign(campaign_id: str):
    """
    Get details of a specific email campaign
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        campaigns_collection = db_instance['email_campaigns']
        campaign = await campaigns_collection.find_one({'id': campaign_id})
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Convert MongoDB document to serializable format
        if "_id" in campaign:
            campaign["_id"] = str(campaign["_id"])
        
        return {
            "success": True,
            "campaign": campaign
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching email campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER LIFECYCLE MANAGEMENT
# ============================================================================

@router.post("/users/{user_id}/lifecycle")
async def update_user_lifecycle(user_id: str, lifecycle_data: dict):
    """
    Update user lifecycle stage and related metrics
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        update_doc = {}
        
        if 'lifecycle_stage' in lifecycle_data:
            update_doc['lifecycle_stage'] = lifecycle_data['lifecycle_stage']
        
        if 'churn_risk_score' in lifecycle_data:
            update_doc['churn_risk_score'] = lifecycle_data['churn_risk_score']
        
        if 'onboarding_completed' in lifecycle_data:
            update_doc['onboarding_completed'] = lifecycle_data['onboarding_completed']
        
        if 'onboarding_progress' in lifecycle_data:
            update_doc['onboarding_progress'] = lifecycle_data['onboarding_progress']
        
        update_doc['updated_at'] = datetime.now(timezone.utc)
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$set': update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "message": "User lifecycle updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user lifecycle: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lifecycle-analytics")
async def get_lifecycle_analytics():
    """
    Get analytics about user lifecycle stages
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        # Count users by lifecycle stage
        pipeline = [
            {
                '$group': {
                    '_id': '$lifecycle_stage',
                    'count': {'$sum': 1},
                    'avg_churn_risk': {'$avg': '$churn_risk_score'},
                    'avg_lifetime_value': {'$avg': '$lifetime_value'}
                }
            }
        ]
        
        lifecycle_stats = await users_collection.aggregate(pipeline).to_list(length=100)
        
        # Count users at risk of churning
        at_risk_count = await users_collection.count_documents({'churn_risk_score': {'$gte': 0.7}})
        
        # Count users who haven't completed onboarding
        incomplete_onboarding = await users_collection.count_documents({'onboarding_completed': False})
        
        return {
            "success": True,
            "lifecycle_distribution": lifecycle_stats,
            "at_risk_users": at_risk_count,
            "incomplete_onboarding": incomplete_onboarding
        }
    
    except Exception as e:
        logger.error(f"Error fetching lifecycle analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-churn-risk")
async def calculate_churn_risk_scores():
    """
    Calculate churn risk scores for all users based on activity
    This is a simple algorithm - can be enhanced with ML models
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        users = await users_collection.find({}).to_list(length=10000)
        updated_count = 0
        
        for user in users:
            risk_score = 0.0
            
            # Factor 1: Last active date (40% weight)
            last_active = user.get('last_active') or user.get('last_login')
            if last_active:
                days_inactive = (datetime.now(timezone.utc) - last_active).days
                if days_inactive > 30:
                    risk_score += 0.4 * min(days_inactive / 90, 1.0)
            else:
                risk_score += 0.4
            
            # Factor 2: Login frequency (30% weight)
            login_count = user.get('login_count', 0)
            days_since_signup = (datetime.now(timezone.utc) - user.get('created_at')).days
            if days_since_signup > 0:
                logins_per_week = (login_count / days_since_signup) * 7
                if logins_per_week < 1:
                    risk_score += 0.3 * (1 - logins_per_week)
            
            # Factor 3: Usage (30% weight)
            total_spent = user.get('total_spent', 0)
            if total_spent == 0:
                risk_score += 0.3
            
            # Cap at 1.0
            risk_score = min(risk_score, 1.0)
            
            # Determine lifecycle stage
            lifecycle_stage = 'new'
            if days_since_signup > 90:
                if risk_score > 0.7:
                    lifecycle_stage = 'churned'
                elif risk_score > 0.4:
                    lifecycle_stage = 'at_risk'
                elif total_spent > 100 and login_count > 20:
                    lifecycle_stage = 'engaged'
                else:
                    lifecycle_stage = 'active'
            elif days_since_signup > 7:
                lifecycle_stage = 'active'
            
            # Update user
            await users_collection.update_one(
                {'id': user['id']},
                {'$set': {
                    'churn_risk_score': risk_score,
                    'lifecycle_stage': lifecycle_stage
                }}
            )
            updated_count += 1
        
        return {
            "success": True,
            "message": f"Churn risk scores calculated for {updated_count} users"
        }
    
    except Exception as e:
        logger.error(f"Error calculating churn risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER IMPERSONATION
# ============================================================================

@router.post("/impersonate")
async def start_impersonation(request: ImpersonationRequest):
    """
    Start an impersonation session (admin logs in as user for support)
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        impersonation_collection = db_instance['impersonation_sessions']
        
        # Get target user
        target_user = await users_collection.find_one({'id': request.target_user_id})
        if not target_user:
            raise HTTPException(status_code=404, detail="Target user not found")
        
        # Create impersonation session
        session = ImpersonationSession(
            admin_id="admin",
            admin_email="admin@botsmith.co",
            target_user_id=request.target_user_id,
            target_user_email=target_user.get('email'),
            reason=request.reason
        )
        
        await impersonation_collection.insert_one(session.model_dump())
        
        # Log the impersonation start
        activity_log = ActivityLog(
            user_id="admin",
            action="started_impersonation",
            resource_type="user",
            resource_id=request.target_user_id,
            details=f"Reason: {request.reason}"
        )
        await db_instance['activity_logs'].insert_one(activity_log.model_dump())
        
        return {
            "success": True,
            "message": "Impersonation session started",
            "session_id": session.id,
            "target_user": {
                "id": target_user['id'],
                "name": target_user.get('name'),
                "email": target_user.get('email')
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting impersonation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/impersonate/{session_id}/end")
async def end_impersonation(session_id: str):
    """
    End an impersonation session
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        impersonation_collection = db_instance['impersonation_sessions']
        
        # Get the session first to calculate duration
        session = await impersonation_collection.find_one({'id': session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Calculate duration
        now = datetime.now(timezone.utc)
        started_at = session.get('started_at')
        
        # Handle started_at regardless of type
        if isinstance(started_at, str):
            from dateutil import parser
            started_at = parser.parse(started_at)
        elif isinstance(started_at, datetime):
            # Make timezone aware if it isn't
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=timezone.utc)
        
        duration_minutes = (now - started_at).total_seconds() / 60 if started_at else 0
        
        # Update session to mark as ended
        result = await impersonation_collection.update_one(
            {'id': session_id},
            {'$set': {'ended_at': now}}
        )
        
        # Log the impersonation end
        activity_log = ActivityLog(
            user_id="admin",
            action="ended_impersonation",
            resource_type="user",
            resource_id=session['target_user_id'],
            details=f"Session duration: {duration_minutes:.1f} minutes"
        )
        await db_instance['activity_logs'].insert_one(activity_log.model_dump())
        
        return {
            "success": True,
            "message": "Impersonation session ended"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending impersonation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/impersonation-history")
async def get_impersonation_history(
    limit: int = Query(50, ge=1, le=200),
    page: int = Query(1, ge=1)
):
    """
    Get history of all impersonation sessions
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        impersonation_collection = db_instance['impersonation_sessions']
        
        skip = (page - 1) * limit
        sessions = await impersonation_collection.find({}).sort('started_at', -1).skip(skip).limit(limit).to_list(length=limit)
        total = await impersonation_collection.count_documents({})
        
        # Convert ObjectId to string and format dates
        formatted_sessions = []
        for session in sessions:
            session['_id'] = str(session['_id'])
            # Convert datetime to ISO string if present
            if 'started_at' in session and session['started_at']:
                session['started_at'] = session['started_at'].isoformat() if hasattr(session['started_at'], 'isoformat') else str(session['started_at'])
            if 'ended_at' in session and session['ended_at']:
                session['ended_at'] = session['ended_at'].isoformat() if hasattr(session['ended_at'], 'isoformat') else str(session['ended_at'])
            formatted_sessions.append(session)
        
        return {
            "success": True,
            "sessions": formatted_sessions,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching impersonation history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER NOTES
# ============================================================================

@router.post("/users/{user_id}/notes")
async def add_user_note(user_id: str, note_data: dict):
    """
    Add a note to a user's profile
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        note = UserNote(
            note=note_data.get('note'),
            author=note_data.get('author', 'admin'),
            note_type=note_data.get('note_type', 'general')
        )
        
        result = await users_collection.update_one(
            {'id': user_id},
            {'$push': {'internal_notes': note.model_dump()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "message": "Note added successfully",
            "note": note.model_dump()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding user note: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/notes")
async def get_user_notes(user_id: str):
    """
    Get all notes for a user
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        user = await users_collection.find_one({'id': user_id}, {'internal_notes': 1})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "notes": user.get('internal_notes', [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# BULK OPERATIONS WITH ENHANCED FEATURES
# ============================================================================

@router.post("/bulk-operations")
async def execute_bulk_operation(operation: BulkUserOperation, background_tasks: BackgroundTasks):
    """
    Execute bulk operations on multiple users
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        if operation.operation == "add_tag":
            tag = operation.parameters.get('tag')
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$addToSet': {'tags': tag}}
            )
            return {"success": True, "message": f"Tag added to {result.modified_count} users"}
        
        elif operation.operation == "remove_tag":
            tag = operation.parameters.get('tag')
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$pull': {'tags': tag}}
            )
            return {"success": True, "message": f"Tag removed from {result.modified_count} users"}
        
        elif operation.operation == "add_segment":
            segment = operation.parameters.get('segment')
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$addToSet': {'segments': segment}}
            )
            return {"success": True, "message": f"Segment added to {result.modified_count} users"}
        
        elif operation.operation == "send_email":
            template_id = operation.parameters.get('template_id')
            templates_collection = db_instance['email_templates']
            template = await templates_collection.find_one({'id': template_id})
            
            if not template:
                raise HTTPException(status_code=404, detail="Email template not found")
            
            # Send emails in background
            background_tasks.add_task(send_bulk_emails, operation.user_ids, template)
            
            return {"success": True, "message": f"Emails scheduled for {len(operation.user_ids)} users"}
        
        elif operation.operation == "change_role":
            new_role = operation.parameters.get('role')
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$set': {'role': new_role}}
            )
            return {"success": True, "message": f"Role updated for {result.modified_count} users"}
        
        elif operation.operation == "change_status":
            new_status = operation.parameters.get('status')
            result = await users_collection.update_many(
                {'id': {'$in': operation.user_ids}},
                {'$set': {'status': new_status}}
            )
            return {"success": True, "message": f"Status updated for {result.modified_count} users"}
        
        elif operation.operation == "delete":
            # Delete users and all their data
            for user_id in operation.user_ids:
                # This should be done in background for large batches
                await delete_user_data(user_id)
            
            return {"success": True, "message": f"{len(operation.user_ids)} users deleted"}
        
        elif operation.operation == "export":
            # Export user data
            users = await users_collection.find({'id': {'$in': operation.user_ids}}).to_list(length=10000)
            
            # Remove sensitive data
            for user in users:
                user.pop('password_hash', None)
                user.pop('_id', None)
            
            return {
                "success": True,
                "message": f"Exported {len(users)} users",
                "data": users
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: {operation.operation}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing bulk operation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def send_bulk_emails(user_ids: List[str], template: dict):
    """
    Background task to send bulk emails
    """
    try:
        users_collection = db_instance['users']
        
        for user_id in user_ids:
            user = await users_collection.find_one({'id': user_id})
            if user and user.get('email_notifications', True):
                # Mock email sending
                logger.info(f"Sending email to {user['email']}: {template['subject']}")
    
    except Exception as e:
        logger.error(f"Error in send_bulk_emails: {str(e)}")


async def delete_user_data(user_id: str):
    """
    Helper function to delete user and all associated data
    """
    try:
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
        await users_collection.delete_one({'id': user_id})
        
    except Exception as e:
        logger.error(f"Error deleting user data for {user_id}: {str(e)}")


# ============================================================================
# EXPORT & REPORTING
# ============================================================================

@router.get("/export/users")
async def export_users(
    format: str = Query("csv", description="Export format: csv or json"),
    filters: Optional[str] = Query(None, description="JSON string of filters to apply")
):
    """
    Export users with optional filters in CSV or JSON format
    """
    if db_instance is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        users_collection = db_instance['users']
        
        query = {}
        if filters:
            query = json.loads(filters)
        
        users = await users_collection.find(query).to_list(length=100000)
        
        # Remove sensitive data
        for user in users:
            user.pop('password_hash', None)
            user.pop('_id', None)
        
        if format == "json":
            return {
                "success": True,
                "format": "json",
                "count": len(users),
                "data": users
            }
        elif format == "csv":
            # Convert to CSV-friendly format
            csv_data = []
            for user in users:
                csv_data.append({
                    'ID': user.get('id'),
                    'Name': user.get('name'),
                    'Email': user.get('email'),
                    'Role': user.get('role'),
                    'Status': user.get('status'),
                    'Company': user.get('company'),
                    'Country': user.get('country'),
                    'Lifecycle Stage': user.get('lifecycle_stage'),
                    'Churn Risk': user.get('churn_risk_score'),
                    'Total Spent': user.get('total_spent'),
                    'Lifetime Value': user.get('lifetime_value'),
                    'Created At': user.get('created_at'),
                    'Last Login': user.get('last_login'),
                    'Login Count': user.get('login_count')
                })
            
            return {
                "success": True,
                "format": "csv",
                "count": len(csv_data),
                "data": csv_data
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'csv' or 'json'")
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filters JSON")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
