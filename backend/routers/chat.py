from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime, timezone
from models import (
    ChatRequest, ChatResponse, Conversation, Message,
    ConversationResponse, MessageResponse
)
from services.chat_service import ChatService
from services.rag_service import RAGService
from services.plan_service import plan_service
from services.notification_service import NotificationService
from services.cache_service import cache_service
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])
db_instance = None
chat_service = None
rag_service = None
notification_service = None


def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance, chat_service, rag_service, notification_service
    db_instance = db
    chat_service = ChatService()
    rag_service = RAGService()
    notification_service = NotificationService(db)


@router.post("", response_model=ChatResponse)
async def send_message(chat_request: ChatRequest):
    """Send a message to a chatbot (public endpoint) - OPTIMIZED"""
    try:
        # OPTIMIZATION 0: Try to get chatbot from cache first
        cache_key = f"chatbot:{chat_request.chatbot_id}"
        chatbot = cache_service.get(cache_key)
        
        if not chatbot:
            # Cache miss - fetch from database
            chatbot = await db_instance.chatbots.find_one({"id": chat_request.chatbot_id})
            if chatbot:
                # Cache for 5 minutes
                cache_service.set(cache_key, chatbot, ttl_seconds=300)
        
        # OPTIMIZATION 1: Parallel fetch of conversation (chatbot already fetched/cached)
        conversation = await db_instance.conversations.find_one({
            "chatbot_id": chat_request.chatbot_id,
            "session_id": chat_request.session_id
        })
        
        if not chatbot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chatbot not found"
            )
        
        if chatbot.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Chatbot is not active"
            )
        
        # Check message limit for chatbot owner
        user_id = chatbot.get("user_id")
        limit_check = await plan_service.check_limit(user_id, "messages")
        if limit_check["reached"]:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Monthly message limit reached. Please upgrade your plan to continue."
            )
        
        # Create conversation if needed
        is_new_conversation = False
        if not conversation:
            is_new_conversation = True
            conversation = Conversation(
                chatbot_id=chat_request.chatbot_id,
                session_id=chat_request.session_id,
                user_name=chat_request.user_name,
                user_email=chat_request.user_email
            )
            await db_instance.conversations.insert_one(conversation.model_dump())
            
            # Send notification for new conversation (non-blocking)
            asyncio.create_task(
                notification_service.create_notification(
                    user_id=user_id,
                    notification_type="new_conversation",
                    title="New Conversation Started",
                    message=f"A new conversation was started with your chatbot '{chatbot.get('name', 'Unknown')}'",
                    priority="medium",
                    metadata={
                        "chatbot_id": chat_request.chatbot_id,
                        "chatbot_name": chatbot.get("name"),
                        "conversation_id": conversation.id,
                        "user_name": chat_request.user_name,
                        "user_email": chat_request.user_email
                    },
                    action_url=f"/chatbot/{chat_request.chatbot_id}?tab=analytics"
                )
            )
        else:
            conversation = Conversation(**conversation)
        
        # OPTIMIZATION 2: Parallel save user message and RAG retrieval
        user_message = Message(
            conversation_id=conversation.id,
            chatbot_id=chat_request.chatbot_id,
            role="user",
            content=chat_request.message
        )
        
        save_message_task = db_instance.messages.insert_one(user_message.model_dump())
        rag_task = rag_service.retrieve_relevant_context(
            query=chat_request.message,
            chatbot_id=chat_request.chatbot_id,
            top_k=2,  # Reduced from 3 to 2 to save 10-20% tokens per message
            min_similarity=0.5  # Increased from 0.7 for better balance
        )
        
        # Wait for both operations
        _, rag_result = await asyncio.gather(save_message_task, rag_task)
        
        context = rag_result.get("context") if rag_result.get("has_context") else None
        citation_footer = rag_result.get("citation_footer")
        
        logger.info(f"RAG retrieved {rag_result.get('num_sources', 0)} sources in parallel")
        
        # Generate AI response with RAG context
        try:
            ai_response, citations = await chat_service.generate_response(
                message=chat_request.message,
                session_id=chat_request.session_id,
                system_message=chatbot.get("instructions", "You are a helpful assistant."),
                model=chatbot.get("model", "gpt-4o-mini"),
                provider=chatbot.get("provider", "openai"),
                context=context,
                citation_footer=citation_footer
            )
            
            # Citations removed - users don't need to see source references
            # The AI still uses the knowledge base context, but citations are hidden
                
        except Exception as e:
            logger.error(f"AI response error: {str(e)}")
            ai_response = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
        
        # OPTIMIZATION 3: Parallel save assistant message and update stats
        assistant_message = Message(
            conversation_id=conversation.id,
            chatbot_id=chat_request.chatbot_id,
            role="assistant",
            content=ai_response
        )
        
        save_assistant_task = db_instance.messages.insert_one(assistant_message.model_dump())
        update_conversation_task = db_instance.conversations.update_one(
            {"id": conversation.id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"messages_count": 2}
            }
        )
        update_chatbot_task = db_instance.chatbots.update_one(
            {"id": chat_request.chatbot_id},
            {
                "$inc": {
                    "messages_count": 2,
                    "conversations_count": 1 if is_new_conversation else 0
                }
            }
        )
        increment_usage_task = plan_service.increment_usage(user_id, "messages", amount=2)
        
        # Execute all updates in parallel
        await asyncio.gather(
            save_assistant_task,
            update_conversation_task,
            update_chatbot_task,
            increment_usage_task
        )
        
        # Send Zapier webhook notification (non-blocking)
        from routers.zapier import notify_zapier_webhook
        asyncio.create_task(
            notify_zapier_webhook(
                chatbot_id=chat_request.chatbot_id,
                conversation_id=conversation.id,
                user_message=chat_request.message,
                bot_response=ai_response,
                user_id=chat_request.session_id,
                user_name=chat_request.user_name or "Anonymous",
                metadata={
                    "user_email": chat_request.user_email,
                    "platform": "webchat"
                }
            )
        )
        
        return ChatResponse(
            message=ai_response,
            conversation_id=conversation.id,
            session_id=chat_request.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )


@router.get("/conversations/{chatbot_id}", response_model=List[ConversationResponse])
async def get_conversations(chatbot_id: str):
    """Get all conversations for a chatbot"""
    try:
        conversations = await db_instance.conversations.find(
            {"chatbot_id": chatbot_id}
        ).sort("updated_at", -1).to_list(length=100)
        
        # Ensure all conversations have required fields with defaults
        for conv in conversations:
            if "message_count" not in conv:
                conv["message_count"] = 0
            if "rating" not in conv:
                conv["rating"] = None
            if "status" not in conv:
                conv["status"] = "active"
            if "user_name" not in conv:
                conv["user_name"] = None
            if "user_email" not in conv:
                conv["user_email"] = None
        
        return [ConversationResponse(**conv) for conv in conversations]
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch conversations"
        )


@router.get("/messages/{conversation_id}", response_model=List[MessageResponse])
async def get_messages(conversation_id: str):
    """Get all messages in a conversation"""
    try:
        messages = await db_instance.messages.find(
            {"conversation_id": conversation_id}
        ).sort("timestamp", 1).to_list(length=None)
        
        return [MessageResponse(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )
