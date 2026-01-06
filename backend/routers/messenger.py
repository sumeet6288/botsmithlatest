from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import logging
from typing import Dict, Any

from services.messenger_service import MessengerService
from services.chat_service import ChatService
from services.rag_service import RAGService
from auth import get_current_user

router = APIRouter(prefix="/messenger", tags=["messenger"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logger = logging.getLogger(__name__)


@router.get("/webhook/{chatbot_id}")
async def messenger_webhook_verify(
    chatbot_id: str,
    request: Request
):
    """
    Facebook Messenger webhook verification endpoint
    """
    try:
        # Get query parameters
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")
        
        logger.info(f"Messenger webhook verification for chatbot {chatbot_id}")
        logger.info(f"Mode: {mode}, Token: {token}, Challenge: {challenge}")
        
        # Get chatbot and integration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot {chatbot_id} not found")
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get Messenger integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "messenger"
        })
        
        if not integration:
            logger.error(f"Messenger integration not found for chatbot {chatbot_id}")
            raise HTTPException(status_code=404, detail="Messenger integration not found")
        
        # Get verify token from integration metadata
        verify_token = integration.get("metadata", {}).get("verify_token", "botsmith_messenger_verify")
        
        # Verify the token
        if mode == "subscribe" and token == verify_token:
            logger.info(f"✅ Messenger webhook verified successfully for chatbot {chatbot_id}")
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
async def messenger_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Facebook Messenger webhook endpoint for receiving messages
    """
    try:
        # Get the webhook payload
        body = await request.json()
        logger.info(f"Messenger webhook received for chatbot {chatbot_id}")
        logger.debug(f"Payload: {body}")
        
        # Extract message data from Messenger webhook payload
        if body.get("object") == "page":
            entries = body.get("entry", [])
            
            for entry in entries:
                messaging = entry.get("messaging", [])
                
                for messaging_event in messaging:
                    # Check if this is a message event
                    if messaging_event.get("message"):
                        # Process each message in background
                        background_tasks.add_task(
                            process_messenger_message,
                            chatbot_id,
                            messaging_event
                        )
        
        # Always return 200 to acknowledge receipt
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Error processing Messenger webhook: {str(e)}")
        # Still return 200 to avoid webhook retries
        return {"status": "error", "message": str(e)}


async def process_messenger_message(chatbot_id: str, messaging_event: Dict[str, Any]):
    """
    Process a Facebook Messenger message in the background
    """
    try:
        # Extract sender and message details
        sender_id = messaging_event.get("sender", {}).get("id")
        recipient_id = messaging_event.get("recipient", {}).get("id")
        timestamp = messaging_event.get("timestamp")
        message = messaging_event.get("message", {})
        
        message_id = message.get("mid")
        message_text = message.get("text", "")
        
        # Ignore if no text (could be attachments, etc.)
        if not message_text:
            logger.info("Ignoring message without text")
            return
        
        # Ignore if message is echo (sent by the page itself)
        if message.get("is_echo"):
            logger.info("Ignoring echo message")
            return
        
        logger.info(f"Processing Messenger message from {sender_id}: {message_text}")
        
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot {chatbot_id} not found")
            return
        
        # Check if chatbot is enabled and public_access is true
        if not chatbot.get("public_access", True):
            logger.info(f"Chatbot {chatbot_id} has public access disabled")
            return
        
        # Get Messenger integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "messenger",
            "enabled": True
        })
        
        if not integration:
            logger.error(f"Messenger integration not enabled for chatbot {chatbot_id}")
            return
        
        # Initialize Messenger service
        credentials = integration.get("credentials", {})
        page_access_token = credentials.get("page_access_token")
        
        if not page_access_token:
            logger.error("Missing Messenger page access token")
            return
        
        messenger_service = MessengerService(page_access_token)
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                "⚠️ Chatbot Inactive\n\n"
                "This chatbot is currently inactive and cannot process messages.\n"
                "Please contact the chatbot owner to activate it."
            )
            await messenger_service.send_message(sender_id, inactive_message)
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
                    f"⚠️ Message Limit Reached\n\n"
                    f"This chatbot has used {limit_check['current']}/{limit_check['max']} messages this month.\n"
                    f"The owner needs to upgrade their plan to continue using this bot.\n\n"
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://remove-dash-button.preview.emergentagent.com')}"
                )
                await messenger_service.send_message(sender_id, limit_message)
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Generate session ID from sender ID and chatbot
        session_id = f"messenger_{chatbot_id}_{sender_id}"
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            # Try to get user info from Messenger
            user_info = await messenger_service.get_user_info(sender_id)
            user_name = user_info.get("name", sender_id)
            
            # Create new conversation
            conversation = {
                "id": f"conv_{chatbot_id}_{sender_id}_{int(datetime.now(timezone.utc).timestamp())}",
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": user_name,
                "user_email": f"{sender_id}@messenger.user",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0,
                "platform": "messenger"
            }
            await db.conversations.insert_one(conversation)
            logger.info(f"Created new Messenger conversation: {conversation['id']}")
        
        conversation_id = conversation["id"]
        
        # Save user message
        user_message = {
            "id": f"msg_{message_id}",
            "conversation_id": conversation_id,
            "chatbot_id": chatbot_id,
            "role": "user",
            "content": message_text,
            "timestamp": datetime.now(timezone.utc),
            "platform": "messenger",
            "metadata": {
                "messenger_message_id": message_id,
                "sender_id": sender_id
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
            query=message_text,
            chatbot_id=chatbot_id,
            top_k=2,
            min_similarity=0.5
        )
        
        context = rag_result.get("context") if rag_result.get("has_context") else None
        citation_footer = rag_result.get("citation_footer")
        
        # Generate AI response
        chat_service = ChatService()
        ai_response, citations = await chat_service.generate_response(
            message=message_text,
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
            "platform": "messenger"
        }
        await db.messages.insert_one(assistant_message)
        
        # Send response via Messenger
        send_result = await messenger_service.send_message(sender_id, ai_response)
        
        if send_result.get("success"):
            logger.info(f"✅ Sent Messenger response to {sender_id}")
            
            # Mark message as read
            await messenger_service.mark_message_as_read(sender_id)
            
            # Send typing indicator off
            await messenger_service.send_typing_indicator(sender_id, False)
        else:
            logger.error(f"❌ Failed to send Messenger response: {send_result.get('error')}")
        
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
            integration_type="messenger",
            event_type="message_received",
            status="success",
            message=f"Processed message from {sender_id}",
            metadata={"sender_id": sender_id, "message_id": message_id}
        )
        
    except Exception as e:
        logger.error(f"Error processing Messenger message: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())


@router.post("/{chatbot_id}/setup-webhook")
async def setup_messenger_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Messenger webhook setup instructions
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get Messenger integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "messenger"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Messenger integration not found. Please configure Messenger first.")
        
        # Generate webhook URL
        backend_url = os.environ.get('BACKEND_URL', 'https://remove-dash-button.preview.emergentagent.com')
        webhook_url = f"{backend_url}/api/messenger/webhook/{chatbot_id}"
        verify_token = integration.get("metadata", {}).get("verify_token", "botsmith_messenger_verify")
        
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
                "1. Go to https://developers.facebook.com/apps/",
                "2. Select your Facebook App or create a new one",
                "3. Go to 'Messenger' > 'Settings'",
                "4. Scroll to 'Webhooks' section",
                "5. Click 'Add Callback URL'",
                f"6. Enter Callback URL: {webhook_url}",
                f"7. Enter Verify Token: {verify_token}",
                "8. Click 'Verify and Save'",
                "9. Subscribe to webhook fields:",
                "   - messages",
                "   - messaging_postbacks",
                "   - messaging_optins",
                "10. Click 'Subscribe'",
                "11. Test by sending a message to your Facebook Page",
                "",
                "⚠️ Important:",
                "- Make sure your integration is enabled in the Integrations tab",
                "- The callback URL must be publicly accessible (HTTPS required)",
                "- The verify token must match exactly",
                "- You need to generate a Page Access Token in Facebook App settings"
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up Messenger webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_messenger_webhook_info(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Messenger webhook configuration info
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get Messenger integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "messenger"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Messenger integration not found")
        
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
        logger.error(f"Error getting Messenger webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def remove_messenger_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove Messenger webhook configuration
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
                "integration_type": "messenger"
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
            raise HTTPException(status_code=404, detail="Messenger integration not found")
        
        return {"success": True, "message": "Webhook configuration removed"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing Messenger webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_message(
    chatbot_id: str,
    recipient_id: str,
    message: str = "Hello! This is a test message from your chatbot.",
    current_user: dict = Depends(get_current_user)
):
    """
    Send a test message via Messenger
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get Messenger integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "messenger"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Messenger integration not found")
        
        # Get credentials
        credentials = integration.get("credentials", {})
        page_access_token = credentials.get("page_access_token")
        
        if not page_access_token:
            raise HTTPException(status_code=400, detail="Missing Messenger page access token")
        
        # Send test message
        messenger_service = MessengerService(page_access_token)
        result = await messenger_service.send_message(recipient_id, message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
