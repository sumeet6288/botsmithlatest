"""
Microsoft Teams Integration Router
Handles MS Teams webhook messages and bot operations
"""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from typing import Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

from models import MSTeamsMessage, MSTeamsWebhookSetup
from services.msteams_service import MSTeamsService
from services.chat_service import ChatService
from services.vector_store import VectorStore
from auth import get_current_user

router = APIRouter(prefix="/msteams", tags=["msteams"])
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


async def process_msteams_message(
    chatbot_id: str,
    message_text: str,
    activity: Dict[str, Any],
    service_url: str,
    conversation_id: str
):
    """Process MS Teams message and generate response"""
    try:
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot {chatbot_id} not found")
            return
        
        # Get integration config
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "msteams",
            "enabled": True
        })
        
        if not integration:
            logger.error(f"MS Teams integration not found or disabled for chatbot {chatbot_id}")
            return
        
        credentials = integration.get("credentials", {})
        app_id = credentials.get("app_id")
        app_password = credentials.get("app_password")
        
        if not app_id or not app_password:
            logger.error("MS Teams credentials missing")
            return
        
        # Create MS Teams service
        teams_service = MSTeamsService(app_id, app_password)
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                f"⚠️ **Chatbot Inactive**\n\n"
                f"This chatbot is currently inactive and cannot process messages.\n"
                f"Please contact the chatbot owner to activate it."
            )
            await teams_service.send_message(service_url, conversation_id, inactive_message)
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
                    f"⚠️ **Message Limit Reached**\n\n"
                    f"This chatbot has used {limit_check['current']}/{limit_check['max']} messages this month.\n"
                    f"The owner needs to upgrade their plan to continue using this bot.\n\n"
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://google-auth-flow-6.preview.emergentagent.com')}"
                )
                await teams_service.send_message(service_url, conversation_id, limit_message)
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Extract user info
        from_user = activity.get("from", {})
        user_id = from_user.get("id", "unknown")
        user_name = from_user.get("name", "User")
        
        # Generate session ID
        session_id = f"msteams_{conversation_id}_{user_id}"
        
        # Check if conversation exists
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            # Create new conversation
            conversation = {
                "id": session_id,
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": user_name,
                "user_email": f"{user_id}@msteams.com",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0
            }
            await db.conversations.insert_one(conversation)
        
        # Get knowledge base context
        vector_store = VectorStore()
        context = await vector_store.search(chatbot_id, message_text, limit=3)
        context_text = "\n\n".join([doc.get("content", "") for doc in context])
        
        # Generate AI response
        chat_service = ChatService()
        ai_response = await chat_service.generate_response(
            chatbot_id=chatbot_id,
            user_message=message_text,
            session_id=session_id,
            context=context_text,
            user_name=user_name
        )
        
        # Save messages to database
        user_message = {
            "conversation_id": session_id,
            "role": "user",
            "content": message_text,
            "timestamp": datetime.now(timezone.utc)
        }
        
        assistant_message = {
            "conversation_id": session_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc)
        }
        
        await db.messages.insert_many([user_message, assistant_message])
        
        # Update conversation
        await db.conversations.update_one(
            {"session_id": session_id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"message_count": 2}
            }
        )
        
        # Update chatbot message count
        await db.chatbots.update_one(
            {"id": chatbot_id},
            {"$inc": {"messages_count": 2}}
        )
        
        # Update subscription usage (2 messages: user + assistant)
        from services.plan_service import increment_usage
        user = await db.users.find_one({"id": chatbot.get("user_id")})
        if user:
            await increment_usage(user["id"], "messages", 2)
        
        # Send response back to MS Teams
        activity_id = activity.get("id")
        result = await teams_service.send_message(
            service_url=service_url,
            conversation_id=conversation_id,
            message=ai_response,
            activity_id=activity_id
        )
        
        if result.get("success"):
            logger.info(f"MS Teams response sent successfully for chatbot {chatbot_id}")
            
            # Update integration last_used timestamp
            await db.integrations.update_one(
                {"chatbot_id": chatbot_id, "integration_type": "msteams"},
                {"$set": {"last_used": datetime.now(timezone.utc)}}
            )
        else:
            logger.error(f"Failed to send MS Teams response: {result.get('error')}")
        
    except Exception as e:
        logger.error(f"Error processing MS Teams message: {str(e)}", exc_info=True)


@router.post("/webhook/{chatbot_id}")
async def msteams_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    MS Teams webhook endpoint to receive bot messages
    
    Flow:
    1. Verify the request is from MS Teams (JWT validation)
    2. Process message activity
    3. Generate AI response in background
    4. Send response back to Teams
    """
    try:
        # Get request body
        body = await request.json()
        activity_type = body.get("type")
        
        logger.info(f"Received MS Teams activity: {activity_type} for chatbot {chatbot_id}")
        
        # Handle different activity types
        if activity_type == "message":
            # Ignore bot's own messages
            from_user = body.get("from", {})
            if from_user.get("id", "").endswith("[bot]") or from_user.get("name") == "Bot":
                return {"status": "ignored", "reason": "bot message"}
            
            message_text = body.get("text", "").strip()
            if not message_text:
                return {"status": "ignored", "reason": "empty message"}
            
            # Extract conversation and service info
            conversation = body.get("conversation", {})
            conversation_id = conversation.get("id")
            service_url = body.get("serviceUrl")
            
            if not conversation_id or not service_url:
                raise HTTPException(status_code=400, detail="Missing conversation ID or service URL")
            
            # Process message in background
            background_tasks.add_task(
                process_msteams_message,
                chatbot_id,
                message_text,
                body,
                service_url,
                conversation_id
            )
            
            return {"status": "processing"}
        
        elif activity_type == "conversationUpdate":
            # Handle bot added to conversation
            members_added = body.get("membersAdded", [])
            for member in members_added:
                if member.get("id", "").endswith("[bot]"):
                    logger.info(f"Bot added to MS Teams conversation for chatbot {chatbot_id}")
            
            return {"status": "acknowledged"}
        
        elif activity_type == "invoke":
            # Handle adaptive card actions or other invokes
            logger.info(f"Received invoke activity for chatbot {chatbot_id}")
            return {"status": "acknowledged"}
        
        else:
            # Unknown activity type
            logger.warning(f"Unknown MS Teams activity type: {activity_type}")
            return {"status": "unknown_activity"}
        
    except Exception as e:
        logger.error(f"MS Teams webhook error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/setup-webhook")
async def setup_msteams_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate MS Teams webhook URL and return setup instructions
    """
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Generate webhook URL
        backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        webhook_url = f"{backend_url}/api/msteams/webhook/{chatbot_id}"
        
        # Store webhook configuration
        webhook_config = MSTeamsWebhookSetup(
            chatbot_id=chatbot_id,
            webhook_url=webhook_url,
            status="pending"
        )
        
        # Update or create webhook config
        await db.msteams_webhooks.update_one(
            {"chatbot_id": chatbot_id},
            {"$set": webhook_config.model_dump()},
            upsert=True
        )
        
        instructions = f"""
MS Teams Bot Setup Instructions:

1. Webhook URL (Messaging Endpoint):
   {webhook_url}

2. Configure your MS Teams Bot:
   - Go to Azure Portal: https://portal.azure.com
   - Navigate to your Bot Channels Registration
   - Under 'Settings', set the Messaging endpoint to the webhook URL above
   - Save the changes

3. Add Bot to Teams:
   - In Azure Portal, go to 'Channels' section
   - Enable 'Microsoft Teams' channel
   - Click 'Microsoft Teams' to open in Teams
   - Add the bot to your team or chat

4. Test the Integration:
   - Send a message to your bot in Teams
   - The bot should respond with AI-generated messages

Note: Make sure your Bot App ID and App Password are correctly configured in the integration settings.
"""
        
        return {
            "webhook_url": webhook_url,
            "instructions": instructions,
            "status": "configured"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up MS Teams webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_msteams_webhook_info(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get MS Teams webhook configuration and setup status"""
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get webhook config
        webhook_config = await db.msteams_webhooks.find_one({"chatbot_id": chatbot_id})
        
        if not webhook_config:
            return {
                "configured": False,
                "message": "Webhook not configured. Click 'Setup Webhook' to configure."
            }
        
        return {
            "configured": True,
            "webhook_url": webhook_config.get("webhook_url"),
            "status": webhook_config.get("status", "pending"),
            "created_at": webhook_config.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def delete_msteams_webhook(
    chatbot_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove MS Teams webhook configuration"""
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Delete webhook config
        await db.msteams_webhooks.delete_one({"chatbot_id": chatbot_id})
        
        return {"success": True, "message": "MS Teams webhook configuration removed"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_message(
    chatbot_id: str,
    service_url: str,
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Send a test message to MS Teams (for testing purposes)"""
    try:
        # Verify chatbot belongs to user
        chatbot = await db.chatbots.find_one({"id": chatbot_id, "user_id": current_user.id})
        if not chatbot:
            raise HTTPException(status_code=404, detail="Chatbot not found")
        
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "msteams"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="MS Teams integration not found")
        
        credentials = integration.get("credentials", {})
        app_id = credentials.get("app_id")
        app_password = credentials.get("app_password")
        
        if not app_id or not app_password:
            raise HTTPException(status_code=400, detail="MS Teams credentials not configured")
        
        # Create service and send test message
        teams_service = MSTeamsService(app_id, app_password)
        result = await teams_service.send_message(
            service_url=service_url,
            conversation_id=conversation_id,
            message="Hello! This is a test message from your chatbot. 🤖"
        )
        
        if result.get("success"):
            return {"success": True, "message": "Test message sent successfully"}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to send message"))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
