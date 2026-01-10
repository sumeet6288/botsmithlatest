from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import logging
import hmac
import hashlib
from typing import Dict, Any

from services.whatsapp_service import WhatsAppService
from services.chat_service import ChatService
from services.rag_service import RAGService
from auth import get_current_user

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logger = logging.getLogger(__name__)


@router.get("/webhook/{chatbot_id}")
async def whatsapp_webhook_verify(
    chatbot_id: str,
    request: Request
):
    """
    WhatsApp webhook verification endpoint
    Facebook will call this with hub.mode, hub.verify_token, and hub.challenge
    """
    try:
        # Get query parameters
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")
        
        logger.info(f"WhatsApp webhook verification for chatbot {chatbot_id}")
        logger.info(f"Mode: {mode}, Token: {token}, Challenge: {challenge}")
        
        # Get chatbot and integration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot {chatbot_id} not found")
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get WhatsApp integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "whatsapp"
        })
        
        if not integration:
            logger.error(f"WhatsApp integration not found for chatbot {chatbot_id}")
            raise HTTPException(status_code=404, detail="WhatsApp integration not found")
        
        # Get verify token from integration metadata
        verify_token = integration.get("metadata", {}).get("verify_token", "botsmith_verify_token")
        
        # Verify the token
        if mode == "subscribe" and token == verify_token:
            logger.info(f"✅ WhatsApp webhook verified successfully for chatbot {chatbot_id}")
            # Return the challenge to verify the webhook
            return int(challenge)
        else:
            logger.error(f"❌ Invalid verify token for chatbot {chatbot_id}")
            raise HTTPException(status_code=403, detail="Invalid verify token")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in webhook verification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook/{chatbot_id}")
async def whatsapp_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    WhatsApp webhook endpoint for receiving messages
    """
    try:
        # Get the webhook payload
        body = await request.json()
        logger.info(f"WhatsApp webhook received for chatbot {chatbot_id}")
        logger.debug(f"Payload: {body}")
        
        # Verify the webhook signature (optional but recommended)
        # signature = request.headers.get("X-Hub-Signature-256", "")
        # if not verify_webhook_signature(body, signature):
        #     raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Extract message data from WhatsApp webhook payload
        if body.get("object") == "whatsapp_business_account":
            entries = body.get("entry", [])
            
            for entry in entries:
                changes = entry.get("changes", [])
                
                for change in changes:
                    value = change.get("value", {})
                    
                    # Get messages
                    messages = value.get("messages", [])
                    
                    for message in messages:
                        # Process each message in background
                        background_tasks.add_task(
                            process_whatsapp_message,
                            chatbot_id,
                            message,
                            value
                        )
        
        # Always return 200 to acknowledge receipt
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {str(e)}")
        # Still return 200 to avoid webhook retries
        return {"status": "error", "message": str(e)}


async def process_whatsapp_message(chatbot_id: str, message: Dict[str, Any], value: Dict[str, Any]):
    """
    Process a WhatsApp message in the background
    """
    try:
        # Extract message details
        message_id = message.get("id")
        from_number = message.get("from")  # User's phone number
        timestamp = message.get("timestamp")
        message_type = message.get("type")
        
        # We only handle text messages for now
        if message_type != "text":
            logger.info(f"Ignoring non-text message type: {message_type}")
            return
        
        text_body = message.get("text", {}).get("body", "")
        
        if not text_body:
            logger.info("Empty message body, ignoring")
            return
        
        logger.info(f"Processing WhatsApp message from {from_number}: {text_body}")
        
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot {chatbot_id} not found")
            return
        
        # Check if chatbot is enabled and public_access is true
        if not chatbot.get("public_access", True):
            logger.info(f"Chatbot {chatbot_id} has public access disabled")
            return
        
        # Get WhatsApp integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "whatsapp",
            "enabled": True
        })
        
        if not integration:
            logger.error(f"WhatsApp integration not enabled for chatbot {chatbot_id}")
            return
        
        # Initialize WhatsApp service
        credentials = integration.get("credentials", {})
        access_token = credentials.get("access_token") or credentials.get("api_key")
        phone_number_id = credentials.get("phone_number_id")
        
        if not access_token or not phone_number_id:
            logger.error("Missing WhatsApp credentials")
            return
        
        whatsapp_service = WhatsAppService(access_token, phone_number_id)
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                f"⚠️ *Chatbot Inactive*\n\n"
                f"This chatbot is currently inactive and cannot process messages.\n"
                f"Please contact the chatbot owner to activate it.\n\n"
                f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')}"
            )
            await whatsapp_service.send_message(from_number, inactive_message)
            logger.info(f"Chatbot {chatbot_id} is inactive. Skipping message processing.")
            return
        
        # ✅ CHECK MESSAGE LIMIT BEFORE PROCESSING
        owner_user_id = chatbot.get('user_id')
        if owner_user_id:
            from services.plan_service import plan_service
            limit_check = await plan_service.check_limit(owner_user_id, "messages")
            
            if limit_check.get("reached"):
                # Send limit exceeded message to user
                limit_message = (
                    f"⚠️ *Message Limit Reached*\n\n"
                    f"This chatbot has used {limit_check['current']}/{limit_check['max']} messages this month.\n"
                    f"The owner needs to upgrade their plan to continue using this bot.\n\n"
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')}"
                )
                await whatsapp_service.send_message(from_number, limit_message)
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Generate session ID from phone number and chatbot
        session_id = f"whatsapp_{chatbot_id}_{from_number}"
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            # Create new conversation
            conversation = {
                "id": f"conv_{chatbot_id}_{from_number}_{int(datetime.now(timezone.utc).timestamp())}",
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": from_number,
                "user_email": f"{from_number}@whatsapp.user",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0,
                "platform": "whatsapp"
            }
            await db.conversations.insert_one(conversation)
            logger.info(f"Created new WhatsApp conversation: {conversation['id']}")
        
        conversation_id = conversation["id"]
        
        # Save user message
        user_message = {
            "id": f"msg_{message_id}",
            "conversation_id": conversation_id,
            "chatbot_id": chatbot_id,
            "role": "user",
            "content": text_body,
            "timestamp": datetime.now(timezone.utc),
            "platform": "whatsapp",
            "metadata": {
                "whatsapp_message_id": message_id,
                "from_number": from_number
            }
        }
        await db.messages.insert_one(user_message)
        
        # Get conversation history (last 10 messages)
        history = await db.messages.find({
            "conversation_id": conversation_id
        }).sort("timestamp", -1).limit(10).to_list(10)
        
        # Reverse to get chronological order
        history.reverse()
        
        # Format conversation history for AI
        conversation_history = []
        for msg in history:
            conversation_history.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Get relevant context from knowledge base
        rag_service = RAGService()
        rag_result = await rag_service.retrieve_relevant_context(
            query=text_body,
            chatbot_id=chatbot_id,
            top_k=2,
            min_similarity=0.5
        )
        
        context = rag_result.get("context") if rag_result.get("has_context") else None
        citation_footer = rag_result.get("citation_footer")
        
        # Generate AI response
        chat_service = ChatService()
        ai_response, citations = await chat_service.generate_response(
            message=text_body,
            session_id=session_id,
            system_message=chatbot.get("instructions", "You are a helpful assistant."),
            model=chatbot.get("model", "gpt-4o-mini"),
            provider=chatbot.get("provider", "openai"),
            context=context,
            citation_footer=citation_footer
        )
        
        # Save assistant message
        assistant_message = {
            "id": f"msg_assistant_{int(datetime.now(timezone.utc).timestamp())}_{chatbot_id}",
            "conversation_id": conversation_id,
            "chatbot_id": chatbot_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc),
            "platform": "whatsapp"
        }
        await db.messages.insert_one(assistant_message)
        
        # Send response via WhatsApp
        send_result = await whatsapp_service.send_message(from_number, ai_response)
        
        if send_result.get("success"):
            logger.info(f"✅ Sent WhatsApp response to {from_number}")
            
            # Mark original message as read
            await whatsapp_service.mark_message_as_read(message_id)
        else:
            logger.error(f"❌ Failed to send WhatsApp response: {send_result.get('error')}")
        
        # Update conversation stats
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"message_count": 2}  # User + Assistant
            }
        )
        
        # Update chatbot usage (for subscription tracking)
        user = await db.users.find_one({"id": chatbot["user_id"]})
        if user and user.get("subscription"):
            await db.users.update_one(
                {"id": chatbot["user_id"]},
                {"$inc": {"subscription.messages_this_month": 2}}
            )
        
        # Log integration event
        from routers.integrations import log_integration_event
        await log_integration_event(
            chatbot_id=chatbot_id,
            integration_id=integration["id"],
            integration_type="whatsapp",
            event_type="message_received",
            status="success",
            message=f"Processed message from {from_number}",
            metadata={"from_number": from_number, "message_id": message_id}
        )
        
    except Exception as e:
        logger.error(f"Error processing WhatsApp message: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())


@router.post("/{chatbot_id}/setup-webhook")
async def setup_whatsapp_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get WhatsApp webhook setup instructions
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get WhatsApp integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "whatsapp"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="WhatsApp integration not found. Please configure WhatsApp first.")
        
        # Generate webhook URL
        backend_url = os.environ.get('BACKEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')
        webhook_url = f"{backend_url}/api/whatsapp/webhook/{chatbot_id}"
        verify_token = integration.get("metadata", {}).get("verify_token", "botsmith_verify_token")
        
        # Update integration metadata with webhook URL
        await db.integrations.update_one(
            {"id": integration["id"]},
            {
                "$set": {
                    "metadata.webhook_url": webhook_url,
                    "metadata.verify_token": verify_token,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        return {
            "success": True,
            "webhook_url": webhook_url,
            "verify_token": verify_token,
            "instructions": [
                "1. Go to https://business.facebook.com/",
                "2. Select your Business Account",
                "3. Go to 'WhatsApp' > 'API Setup'",
                "4. Find 'Webhooks' section and click 'Configure'",
                f"5. Enter Callback URL: {webhook_url}",
                f"6. Enter Verify Token: {verify_token}",
                "7. Click 'Verify and Save'",
                "8. Subscribe to webhook field: 'messages'",
                "9. Click 'Subscribe'",
                "10. Test by sending a message to your WhatsApp Business number",
                "",
                "⚠️ Important:",
                "- Make sure your integration is enabled in the Integrations tab",
                "- The callback URL must be publicly accessible (HTTPS required)",
                "- The verify token must match exactly"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up WhatsApp webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_whatsapp_webhook_info(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get WhatsApp webhook configuration info
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get WhatsApp integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "whatsapp"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="WhatsApp integration not found")
        
        metadata = integration.get("metadata", {})
        webhook_url = metadata.get("webhook_url", "Not configured")
        verify_token = metadata.get("verify_token", "Not configured")
        
        return {
            "webhook_url": webhook_url,
            "verify_token": verify_token,
            "enabled": integration.get("enabled", False),
            "status": integration.get("status", "pending")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting WhatsApp webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def remove_whatsapp_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove WhatsApp webhook configuration
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Update integration to remove webhook
        result = await db.integrations.update_one(
            {
                "chatbot_id": chatbot_id,
                "integration_type": "whatsapp"
            },
            {
                "$unset": {
                    "metadata.webhook_url": "",
                    "metadata.verify_token": ""
                },
                "$set": {
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="WhatsApp integration not found")
        
        return {"success": True, "message": "Webhook configuration removed"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing WhatsApp webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_message(
    chatbot_id: str,
    recipient_phone: str,
    message: str = "Hello! This is a test message from your chatbot.",
    current_user: dict = Depends(get_current_user)
):
    """
    Send a test message via WhatsApp
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get WhatsApp integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "whatsapp"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="WhatsApp integration not found")
        
        # Get credentials
        credentials = integration.get("credentials", {})
        access_token = credentials.get("access_token") or credentials.get("api_key")
        phone_number_id = credentials.get("phone_number_id")
        
        if not access_token or not phone_number_id:
            raise HTTPException(status_code=400, detail="Missing WhatsApp credentials")
        
        # Send test message
        whatsapp_service = WhatsAppService(access_token, phone_number_id)
        result = await whatsapp_service.send_message(recipient_phone, message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
