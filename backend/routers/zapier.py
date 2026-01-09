from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import json
from services.zapier_service import ZapierService
from services.chat_service import ChatService
from models import ZapierWebhookPayload
from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/zapier", tags=["zapier"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Store active Zapier services per chatbot
zapier_services = {}


def get_zapier_service(webhook_url: str, api_key: Optional[str] = None) -> ZapierService:
    """Get or create ZapierService instance"""
    service_key = f"{webhook_url}:{api_key or 'no-key'}"
    if service_key not in zapier_services:
        zapier_services[service_key] = ZapierService(webhook_url, api_key)
    return zapier_services[service_key]


async def get_integration_by_chatbot(chatbot_id: str) -> Optional[dict]:
    """Get Zapier integration for a chatbot"""
    integration = await db.integrations.find_one({
        "chatbot_id": chatbot_id,
        "integration_type": "zapier",
        "enabled": True
    })
    return integration


async def notify_zapier_webhook(
    chatbot_id: str,
    conversation_id: str,
    user_message: str,
    bot_response: str,
    user_id: str,
    user_name: str = "Anonymous",
    metadata: Dict = None
):
    """Send chat event to Zapier webhook"""
    try:
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot not found: {chatbot_id}")
            return
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            logger.warning(f"Chatbot {chatbot_id} is not active. Skipping Zapier notification.")
            return
        
        # Get Zapier integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            logger.debug(f"No Zapier integration found for chatbot: {chatbot_id}")
            return
        
        webhook_url = integration['credentials'].get('webhook_url')
        api_key = integration['credentials'].get('api_key')
        
        if not webhook_url:
            logger.error(f"Webhook URL not found for chatbot: {chatbot_id}")
            return
        
        zapier_service = get_zapier_service(webhook_url, api_key)
        
        # Prepare event data
        event_data = {
            "chatbot_id": chatbot_id,
            "chatbot_name": chatbot.get("name", "Unknown"),
            "conversation_id": conversation_id,
            "user_message": user_message,
            "bot_response": bot_response,
            "user_id": user_id,
            "user_name": user_name,
            "metadata": metadata or {}
        }
        
        # Send to Zapier
        result = await zapier_service.send_chat_event(event_data)
        
        if result.get("success"):
            logger.info(f"Chat event sent to Zapier for chatbot {chatbot_id}")
            # Update last_used timestamp
            await db.integrations.update_one(
                {"chatbot_id": chatbot_id, "integration_type": "zapier"},
                {"$set": {"last_used": datetime.now(timezone.utc)}}
            )
        else:
            logger.error(f"Failed to send to Zapier: {result.get('error')}")
            # Update error message
            await db.integrations.update_one(
                {"chatbot_id": chatbot_id, "integration_type": "zapier"},
                {"$set": {
                    "error_message": result.get('error'),
                    "status": "error"
                }}
            )
    
    except Exception as e:
        logger.error(f"Error in notify_zapier_webhook: {str(e)}")


@router.post("/webhook/{chatbot_id}")
async def receive_zapier_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Receive incoming webhooks from Zapier
    This allows Zapier to send messages to the chatbot
    """
    try:
        # Parse incoming payload
        payload = await request.json()
        
        # Get chatbot
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Check if chatbot is active
        if chatbot.get("status") != "active":
            raise HTTPException(
                status_code=400,
                detail="This chatbot is currently inactive. Please contact the chatbot owner."
            )
        
        # Verify Zapier integration exists
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Zapier integration not configured")
        
        # Validate API key if present
        api_key_header = request.headers.get("X-API-Key")
        stored_api_key = integration['credentials'].get('api_key')
        if stored_api_key and api_key_header != stored_api_key:
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        # Extract message from payload
        message = payload.get("message") or payload.get("text") or payload.get("content")
        if not message:
            raise HTTPException(status_code=400, detail="No message content found in payload")
        
        user_id = payload.get("user_id", "zapier_user")
        user_name = payload.get("user_name", "Zapier User")
        conversation_id = payload.get("conversation_id") or str(uuid.uuid4())
        
        # Check message limit
        owner_user_id = chatbot.get('user_id')
        if owner_user_id:
            from services.plan_service import plan_service
            limit_check = await plan_service.check_limit(owner_user_id, "messages")
            
            if limit_check.get("reached"):
                raise HTTPException(
                    status_code=429,
                    detail=f"Message limit reached ({limit_check['current']}/{limit_check['max']}). Please upgrade your plan."
                )
        
        # Process message with AI
        chat_service = ChatService()
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "id": conversation_id,
            "chatbot_id": chatbot_id
        })
        
        if not conversation:
            # Create new conversation
            conversation = {
                "id": conversation_id,
                "chatbot_id": chatbot_id,
                "user_id": user_id,
                "user_name": user_name,
                "status": "active",
                "platform": "zapier",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0
            }
            await db.conversations.insert_one(conversation)
        
        # Save user message
        user_message_doc = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "chatbot_id": chatbot_id,
            "role": "user",
            "content": message,
            "created_at": datetime.now(timezone.utc),
            "metadata": {"platform": "zapier", "user_id": user_id}
        }
        await db.messages.insert_one(user_message_doc)
        
        # Generate AI response
        response = await chat_service.generate_response(
            chatbot=chatbot,
            message=message,
            conversation_id=conversation_id
        )
        
        # Save assistant message
        assistant_message_doc = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "chatbot_id": chatbot_id,
            "role": "assistant",
            "content": response["response"],
            "created_at": datetime.now(timezone.utc),
            "metadata": {"platform": "zapier"}
        }
        await db.messages.insert_one(assistant_message_doc)
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"message_count": 2}
            }
        )
        
        # Increment message count for user
        if owner_user_id:
            from services.plan_service import plan_service
            await plan_service.increment_usage(owner_user_id, "messages", 1)
        
        # Update integration last_used
        await db.integrations.update_one(
            {"chatbot_id": chatbot_id, "integration_type": "zapier"},
            {"$set": {"last_used": datetime.now(timezone.utc)}}
        )
        
        return {
            "success": True,
            "response": response["response"],
            "conversation_id": conversation_id,
            "message_id": assistant_message_doc["id"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Zapier webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process webhook: {str(e)}")


@router.post("/test-send/{chatbot_id}")
async def test_zapier_send(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Test sending a sample event to Zapier webhook
    Used for testing the outgoing webhook configuration
    """
    try:
        # Get chatbot
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get Zapier integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Zapier integration not configured")
        
        webhook_url = integration['credentials'].get('webhook_url')
        api_key = integration['credentials'].get('api_key')
        
        if not webhook_url:
            raise HTTPException(status_code=400, detail="Webhook URL not configured")
        
        # Send test event
        zapier_service = get_zapier_service(webhook_url, api_key)
        
        test_event_data = {
            "chatbot_id": chatbot_id,
            "chatbot_name": chatbot.get("name", "Test Bot"),
            "conversation_id": str(uuid.uuid4()),
            "user_message": "This is a test message from BotSmith",
            "bot_response": "This is a test response to verify the Zapier integration is working correctly.",
            "user_id": "test_user",
            "user_name": "Test User",
            "metadata": {"test": True}
        }
        
        result = await zapier_service.send_chat_event(test_event_data)
        
        if result.get("success"):
            return {
                "success": True,
                "message": "Test event sent to Zapier successfully"
            }
        else:
            return {
                "success": False,
                "error": result.get("error")
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing Zapier send: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/webhook-url/{chatbot_id}")
async def get_webhook_url(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the webhook URL that Zapier should use to send messages to this chatbot
    """
    try:
        # Verify chatbot ownership
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get backend URL from environment
        backend_url = os.environ.get(
            'REACT_APP_BACKEND_URL',
            'https://env-config-11.preview.emergentagent.com'
        )
        
        webhook_url = f"{backend_url}/api/zapier/webhook/{chatbot_id}"
        
        return {
            "webhook_url": webhook_url,
            "chatbot_id": chatbot_id,
            "instructions": {
                "setup": "Use this URL in your Zapier webhook action",
                "method": "POST",
                "headers": "Add X-API-Key header if you configured an API key",
                "payload_format": {
                    "message": "Your message text (required)",
                    "user_id": "Unique user identifier (optional)",
                    "user_name": "User display name (optional)",
                    "conversation_id": "Conversation ID for threading (optional)"
                }
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
