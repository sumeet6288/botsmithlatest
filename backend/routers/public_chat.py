from fastapi import APIRouter, HTTPException, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime, timezone
from models import (
    PublicChatbotInfo, PublicChatRequest, ChatResponse,
    EmbedConfig, EmbedCodeResponse, ConversationResponse, MessageResponse
)
from services.chat_service import ChatService
from services.rag_service import RAGService
from services.cache_service import cache_service
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["public-chat"])
db_instance = None
rag_service = None

def init_router(db: AsyncIOMotorDatabase):
    """Initialize router with database instance"""
    global db_instance, rag_service
    db_instance = db
    rag_service = RAGService()

@router.get("/chatbot/{chatbot_id}", response_model=PublicChatbotInfo)
async def get_public_chatbot(chatbot_id: str):
    """Get public chatbot information (no authentication required) - CACHED"""
    # Try cache first
    cache_key = f"public_chatbot:{chatbot_id}"
    cached_info = cache_service.get(cache_key)
    
    if cached_info:
        return cached_info
    
    # Cache miss - fetch from database
    chatbot = await db_instance.chatbots.find_one({"id": chatbot_id})
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Check if public access is enabled
    if not chatbot.get("public_access", False):
        raise HTTPException(status_code=403, detail="This chatbot is not publicly accessible")
    
    info = PublicChatbotInfo(
        id=chatbot["id"],
        name=chatbot["name"],
        welcome_message=chatbot.get("welcome_message", "Hello! How can I help you today?"),
        primary_color=chatbot.get("primary_color", "#7c3aed"),
        secondary_color=chatbot.get("secondary_color", "#a78bfa"),
        accent_color=chatbot.get("accent_color", "#ec4899"),
        logo_url=chatbot.get("logo_url"),
        avatar_url=chatbot.get("avatar_url"),
        font_family=chatbot.get("font_family", "Inter, system-ui, sans-serif"),
        font_size=chatbot.get("font_size", "medium"),
        bubble_style=chatbot.get("bubble_style", "rounded"),
        widget_theme=chatbot.get("widget_theme", "light"),
        widget_position=chatbot.get("widget_position", "bottom-right"),
        widget_size=chatbot.get("widget_size", "medium"),
        auto_expand=chatbot.get("auto_expand", False),
        powered_by_text=chatbot.get("powered_by_text")
    )
    
    # Cache for 5 minutes
    cache_service.set(cache_key, info, ttl_seconds=300)
    
    return info


@router.post("/chat/{chatbot_id}", response_model=ChatResponse)
async def public_chat(chatbot_id: str, request: PublicChatRequest):
    """Send a message to a public chatbot (no authentication required) - OPTIMIZED"""
    # Try to get chatbot from cache first
    cache_key = f"chatbot:{chatbot_id}"
    chatbot = cache_service.get(cache_key)
    
    if not chatbot:
        # Cache miss - fetch from database
        chatbot = await db_instance.chatbots.find_one({"id": chatbot_id})
        if chatbot:
            cache_service.set(cache_key, chatbot, ttl_seconds=300)
    
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    if not chatbot.get("public_access", False):
        raise HTTPException(status_code=403, detail="This chatbot is not publicly accessible")
    
    # ✅ CHECK IF CHATBOT IS ACTIVE
    if chatbot.get("status") != "active":
        raise HTTPException(
            status_code=400,
            detail="This chatbot is currently inactive. Please contact the chatbot owner."
        )
    
    # ✅ CHECK MESSAGE LIMIT BEFORE PROCESSING
    user_id = chatbot.get("user_id")
    if user_id:
        from services.plan_service import plan_service
        limit_check = await plan_service.check_limit(user_id, "messages")
        
        if limit_check.get("reached"):
            # Return error response with limit information
            raise HTTPException(
                status_code=429,
                detail={
                    "message": f"This chatbot has reached its message limit ({limit_check['current']}/{limit_check['max']} messages used this month). Please contact the chatbot owner to upgrade their plan.",
                    "current": limit_check['current'],
                    "max": limit_check['max'],
                    "limit_reached": True
                }
            )
    
    # Find or create conversation
    conversation = await db_instance.conversations.find_one({
        "chatbot_id": chatbot_id,
        "session_id": request.session_id
    })
    
    if not conversation:
        conversation = {
            "id": str(__import__("uuid").uuid4()),
            "chatbot_id": chatbot_id,
            "session_id": request.session_id,
            "user_name": request.user_name,
            "user_email": request.user_email,
            "status": "active",
            "messages_count": 0,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db_instance.conversations.insert_one(conversation)
    
    conversation_id = conversation["id"]
    
    # OPTIMIZATION: Parallel save user message and RAG retrieval
    user_message = {
        "id": str(__import__("uuid").uuid4()),
        "conversation_id": conversation_id,
        "chatbot_id": chatbot_id,
        "role": "user",
        "content": request.message,
        "created_at": datetime.now(timezone.utc),
        "timestamp": datetime.now(timezone.utc)  # Keep for backwards compatibility
    }
    
    save_message_task = db_instance.messages.insert_one(user_message)
    rag_task = rag_service.retrieve_relevant_context(
        query=request.message,
        chatbot_id=chatbot_id,
        top_k=2,  # Reduced from 3 to 2 to save 10-20% tokens per message
        min_similarity=0.5  # Adjusted for better balance
    )
    
    # Wait for both operations
    _, rag_result = await asyncio.gather(save_message_task, rag_task)
    
    context = rag_result.get("context") if rag_result.get("has_context") else None
    citation_footer = rag_result.get("citation_footer")
    
    # Get AI response
    chat_service = ChatService()
    try:
        ai_response, citations = await chat_service.generate_response(
            message=request.message,
            session_id=request.session_id,
            system_message=chatbot.get("instructions", "You are a helpful assistant."),
            model=chatbot.get("model", "gpt-4o-mini"),
            provider=chatbot.get("provider", "openai"),
            context=context,
            citation_footer=citation_footer
        )
        
        # Citations removed - widget users don't need to see source references
        # The AI still uses the knowledge base context, but citations are hidden
            
    except Exception as e:
        logger.error(f"AI response error in public chat: {str(e)}")
        ai_response = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    
    # OPTIMIZATION: Parallel save AI message and update conversation
    ai_message = {
        "id": str(__import__("uuid").uuid4()),
        "conversation_id": conversation_id,
        "chatbot_id": chatbot_id,
        "role": "assistant",
        "content": ai_response,
        "created_at": datetime.now(timezone.utc),
        "timestamp": datetime.now(timezone.utc)  # Keep for backwards compatibility
    }
    
    save_ai_message_task = db_instance.messages.insert_one(ai_message)
    update_conversation_task = db_instance.conversations.update_one(
        {"id": conversation_id},
        {
            "$set": {"updated_at": datetime.now(timezone.utc)},
            "$inc": {"messages_count": 2}
        }
    )
    
    # Execute both in parallel
    await asyncio.gather(save_ai_message_task, update_conversation_task)
    
    # Update chatbot counts
    await db_instance.chatbots.update_one(
        {"id": chatbot_id},
        {
            "$inc": {"messages_count": 2},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    # Update user's subscription usage for message count tracking
    user_id = chatbot.get("user_id")
    if user_id:
        from services.plan_service import plan_service
        await plan_service.increment_usage(user_id, "messages", 2)
    
    # Send webhook notification if enabled
    if chatbot.get("webhook_enabled") and chatbot.get("webhook_url"):
        await send_webhook_notification(
            webhook_url=chatbot["webhook_url"],
            chatbot_id=chatbot_id,
            conversation_id=conversation_id,
            user_message=request.message,
            ai_response=ai_response
        )
    
    # Send Zapier webhook notification (non-blocking)
    from routers.zapier import notify_zapier_webhook
    asyncio.create_task(
        notify_zapier_webhook(
            chatbot_id=chatbot_id,
            conversation_id=conversation_id,
            user_message=request.message,
            bot_response=ai_response,
            user_id=request.session_id,
            user_name="Anonymous",
            metadata={"platform": "public_chat"}
        )
    )
    
    return ChatResponse(
        message=ai_response,
        conversation_id=conversation_id,
        session_id=request.session_id
    )


@router.get("/embed/{chatbot_id}")
async def get_embed_code(chatbot_id: str, theme: str = "light", position: str = "bottom-right"):
    """Get embed code for integrating chatbot into websites"""
    chatbot = await db_instance.chatbots.find_one({"id": chatbot_id})
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Generate embed code
    embed_html = f"""
<!-- Chatbot Embed Code -->
<div id="chatbot-widget-{chatbot_id}"></div>
<script>
  (function() {{
    var chatbotConfig = {{
      chatbotId: '{chatbot_id}',
      theme: '{theme}',
      position: '{position}',
      apiUrl: '{chatbot.get("webhook_url", "https://api.example.com")}'
    }};
    
    var script = document.createElement('script');
    script.src = 'https://cdn.example.com/chatbot-widget.js';
    script.async = true;
    script.onload = function() {{
      if (window.ChatbotWidget) {{
        window.ChatbotWidget.init(chatbotConfig);
      }}
    }};
    document.head.appendChild(script);
  }})();
</script>
"""
    
    return EmbedCodeResponse(
        html_code=embed_html,
        script_url="https://cdn.example.com/chatbot-widget.js"
    )


@router.get("/conversations/{chatbot_id}/export")
async def export_conversations(chatbot_id: str, format: str = "json"):
    """Export all conversations for a chatbot"""
    chatbot = await db_instance.chatbots.find_one({"id": chatbot_id})
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    
    # Get all conversations
    conversations = await db_instance.conversations.find({"chatbot_id": chatbot_id}).to_list(length=None)
    
    # Get messages for each conversation
    export_data = []
    for conv in conversations:
        messages = await db_instance.messages.find({"conversation_id": conv["id"]}).sort("timestamp", 1).to_list(length=None)
        
        conv_data = {
            "conversation_id": conv["id"],
            "user_name": conv.get("user_name"),
            "user_email": conv.get("user_email"),
            "status": conv.get("status", "active"),
            "rating": conv.get("rating"),
            "created_at": conv["created_at"].isoformat(),
            "updated_at": conv.get("updated_at", conv["created_at"]).isoformat(),
            "message_count": len(messages),
            "messages": [
                {
                    "role": msg["role"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"].isoformat()
                }
                for msg in messages
            ]
        }
        export_data.append(conv_data)
    
    if format == "csv":
        # Convert to CSV format
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["Conversation ID", "User Name", "User Email", "Status", "Rating", "Created At", "Updated At", "Role", "Message", "Timestamp"])
        
        for conv in export_data:
            for msg in conv["messages"]:
                writer.writerow([
                    conv["conversation_id"],
                    conv["user_name"] or "",
                    conv["user_email"] or "",
                    conv["status"],
                    conv["rating"] or "",
                    conv["created_at"],
                    conv["updated_at"],
                    msg["role"],
                    msg["content"],
                    msg["timestamp"]
                ])
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=chatbot_{chatbot_id}_export.csv"}
        )
    else:
        # Return JSON
        return Response(
            content=json.dumps(export_data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=chatbot_{chatbot_id}_export.json"}
        )


async def send_webhook_notification(webhook_url: str, chatbot_id: str, conversation_id: str, 
                                   user_message: str, ai_response: str):
    """Send webhook notification for new conversation"""
    import httpx
    
    payload = {
        "event": "new_message",
        "chatbot_id": chatbot_id,
        "conversation_id": conversation_id,
        "user_message": user_message,
        "ai_response": ai_response,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=payload, timeout=5.0)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Webhook notification failed: {e}")



# ==================== CONTACT SALES ====================

from pydantic import BaseModel, EmailStr
from uuid import uuid4

class ContactSalesRequest(BaseModel):
    name: str
    email: EmailStr
    company: str
    message: str

@router.post("/contact-sales")
async def submit_contact_sales(request: ContactSalesRequest):
    """Submit contact sales form (no authentication required)"""
    try:
        if db_instance is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        contact_sales_collection = db_instance['contact_sales']
        
        # Create submission
        submission = {
            "id": str(uuid4()),
            "name": request.name,
            "email": request.email,
            "company": request.company,
            "message": request.message,
            "status": "new",
            "notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await contact_sales_collection.insert_one(submission)
        
        logger.info(f"Contact sales submission received from {request.email}")
        
        return {
            "success": True,
            "message": "Thank you for your interest! Our team will contact you within 24 hours."
        }
    except Exception as e:
        logger.error(f"Error submitting contact sales: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit contact form. Please try again later."
        )

