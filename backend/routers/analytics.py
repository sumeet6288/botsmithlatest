from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import DashboardAnalytics, ChatbotAnalytics
from auth import get_current_user, get_current_user, User
from datetime import datetime, timedelta, date
from collections import defaultdict
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])
db_instance = None


def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance
    db_instance = db


@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    """Get dashboard analytics for the current user"""
    try:
        # Get all user's chatbots
        chatbots = await db_instance.chatbots.find(
            {"user_id": current_user.id}
        ).to_list(length=None)
        
        chatbot_ids = [chatbot["id"] for chatbot in chatbots]
        
        # Count active chatbots
        active_chatbots = sum(1 for chatbot in chatbots if chatbot.get("status") == "active")
        
        # Count total conversations
        total_conversations = await db_instance.conversations.count_documents(
            {"chatbot_id": {"$in": chatbot_ids}}
        )
        
        # Count total messages
        total_messages = await db_instance.messages.count_documents(
            {"chatbot_id": {"$in": chatbot_ids}}
        )
        
        # Count total leads
        total_leads = await db_instance.leads.count_documents(
            {"user_id": current_user.id}
        )
        
        return DashboardAnalytics(
            total_conversations=total_conversations,
            total_messages=total_messages,
            active_chatbots=active_chatbots,
            total_chatbots=len(chatbots),
            total_leads=total_leads
        )
    except Exception as e:
        logger.error(f"Error fetching dashboard analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics"
        )


@router.get("/chatbot/{chatbot_id}", response_model=ChatbotAnalytics)
async def get_chatbot_analytics(
    chatbot_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get analytics for a specific chatbot"""
    try:
        # Verify ownership
        chatbot = await db_instance.chatbots.find_one({
            "id": chatbot_id,
            "user_id": current_user.id
        })
        
        if not chatbot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chatbot not found"
            )
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get conversations
        conversations = await db_instance.conversations.find({
            "chatbot_id": chatbot_id,
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        # Get messages
        messages = await db_instance.messages.find({
            "chatbot_id": chatbot_id,
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        # Group by date
        conversations_by_date = defaultdict(int)
        messages_by_date = defaultdict(int)
        
        for conv in conversations:
            conv_date = conv["created_at"].date().isoformat()
            conversations_by_date[conv_date] += 1
        
        for msg in messages:
            msg_date = msg["timestamp"].date().isoformat()
            messages_by_date[msg_date] += 1
        
        # Generate date range
        date_range = []
        current_date = start_date.date()
        while current_date <= end_date.date():
            date_range.append(current_date)
            current_date += timedelta(days=1)
        
        # Fill in missing dates with 0
        for d in date_range:
            d_str = d.isoformat()
            if d_str not in conversations_by_date:
                conversations_by_date[d_str] = 0
            if d_str not in messages_by_date:
                messages_by_date[d_str] = 0
        
        return ChatbotAnalytics(
            chatbot_id=chatbot_id,
            total_conversations=len(conversations),
            total_messages=len(messages),
            date_range=date_range,
            conversations_by_date=dict(conversations_by_date),
            messages_by_date=dict(messages_by_date)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chatbot analytics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chatbot analytics"
        )


@router.get("/trends")
async def get_user_trends(
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(get_current_user)
):
    """Get aggregated trend analytics across all user's chatbots"""
    try:
        # Get all user's chatbots
        chatbots = await db_instance.chatbots.find(
            {"user_id": current_user.id}
        ).to_list(length=None)
        
        chatbot_ids = [chatbot["id"] for chatbot in chatbots]
        
        if not chatbot_ids:
            # Return empty data if no chatbots
            return {
                "conversations": [],
                "messages": [],
                "avg_response_time": "0s"
            }
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all conversations for user's chatbots
        conversations = await db_instance.conversations.find({
            "chatbot_id": {"$in": chatbot_ids},
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        # Get all messages for user's chatbots
        messages = await db_instance.messages.find({
            "chatbot_id": {"$in": chatbot_ids},
            "timestamp": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        # Group by date
        conversations_by_date = defaultdict(int)
        messages_by_date = defaultdict(int)
        
        for conv in conversations:
            conv_date = conv["created_at"].date()
            date_str = conv_date.strftime("%b %d")  # Format: "Jan 15"
            conversations_by_date[date_str] += 1
        
        for msg in messages:
            msg_date = msg["timestamp"].date()
            date_str = msg_date.strftime("%b %d")  # Format: "Jan 15"
            messages_by_date[msg_date] += 1
        
        # Generate complete date range
        conversations_data = []
        messages_data = []
        current_date = start_date.date()
        
        while current_date <= end_date.date():
            date_str = current_date.strftime("%b %d")
            conversations_data.append({
                "date": date_str,
                "count": conversations_by_date.get(date_str, 0)
            })
            messages_data.append({
                "date": date_str,
                "count": messages_by_date.get(current_date, 0)
            })
            current_date += timedelta(days=1)
        
        # Calculate average response time
        avg_response_time = await calculate_avg_response_time(
            db_instance, chatbot_ids, start_date, end_date
        )
        
        return {
            "conversations": conversations_data,
            "messages": messages_data,
            "avg_response_time": avg_response_time
        }
    except Exception as e:
        logger.error(f"Error fetching user trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trend analytics"
        )


async def calculate_avg_response_time(
    db: AsyncIOMotorDatabase,
    chatbot_ids: List[str],
    start_date: datetime,
    end_date: datetime
) -> str:
    """Calculate average response time from actual message timestamps"""
    try:
        # Get conversations with at least 2 messages (1 user, 1 bot)
        conversations = await db.conversations.find({
            "chatbot_id": {"$in": chatbot_ids},
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(length=None)
        
        if not conversations:
            return "0s"
        
        total_response_time = 0
        response_count = 0
        
        for conv in conversations:
            # Get messages for this conversation, sorted by timestamp
            messages = await db.messages.find({
                "conversation_id": conv["id"],
                "timestamp": {"$gte": start_date, "$lte": end_date}
            }).sort("timestamp", 1).to_list(length=None)
            
            # Calculate response time between user message and bot response
            for i in range(len(messages) - 1):
                current_msg = messages[i]
                next_msg = messages[i + 1]
                
                # If current is user message and next is assistant/bot message
                if (current_msg.get("sender") == "user" and 
                    next_msg.get("sender") in ["assistant", "bot"]):
                    
                    response_time = (next_msg["timestamp"] - current_msg["timestamp"]).total_seconds()
                    total_response_time += response_time
                    response_count += 1
        
        if response_count == 0:
            return "0s"
        
        avg_seconds = total_response_time / response_count
        
        # Format response time nicely
        if avg_seconds < 1:
            return f"{int(avg_seconds * 1000)}ms"
        elif avg_seconds < 60:
            return f"{int(avg_seconds)}s"
        else:
            minutes = int(avg_seconds / 60)
            seconds = int(avg_seconds % 60)
            return f"{minutes}m {seconds}s"
            
    except Exception as e:
        logger.error(f"Error calculating avg response time: {str(e)}")
        return "N/A"
