from fastapi import APIRouter, HTTPException, Request, Header, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import hashlib
from services.telegram_service import TelegramService
from services.chat_service import ChatService
from models import TelegramWebhookSetup, TelegramMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/telegram", tags=["telegram"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Store active Telegram services per chatbot
telegram_services = {}


def get_telegram_service(bot_token: str) -> TelegramService:
    """Get or create TelegramService instance"""
    if bot_token not in telegram_services:
        telegram_services[bot_token] = TelegramService(bot_token)
    return telegram_services[bot_token]


async def get_integration_by_chatbot(chatbot_id: str) -> Optional[dict]:
    """Get Telegram integration for a chatbot"""
    integration = await db.integrations.find_one({
        "chatbot_id": chatbot_id,
        "integration_type": "telegram",
        "enabled": True
    })
    return integration


async def process_telegram_message(
    chatbot_id: str,
    chat_id: int,
    message_text: str,
    user_name: str,
    user_username: Optional[str] = None
):
    """Process incoming Telegram message and generate AI response"""
    try:
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot not found: {chatbot_id}")
            return
        
        # Get Telegram integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            logger.error(f"Telegram integration not found for chatbot: {chatbot_id}")
            return
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            logger.error(f"Bot token not found for chatbot: {chatbot_id}")
            return
        
        telegram_service = get_telegram_service(bot_token)
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                f"⚠️ Chatbot Inactive\n\n"
                f"This chatbot is currently inactive and cannot process messages.\n"
                f"Please contact the chatbot owner to activate it.\n\n"
                f"Visit: {os.environ.get('FRONTEND_URL', 'https://single-auth-method.preview.emergentagent.com')}"
            )
            await telegram_service.send_message(
                chat_id=chat_id,
                text=inactive_message
            )
            logger.info(f"Chatbot {chatbot_id} is inactive. Skipping message processing.")
            return
        
        # ✅ CHECK MESSAGE LIMIT BEFORE PROCESSING
        user_id = chatbot.get('user_id')
        if user_id:
            from services.plan_service import plan_service
            limit_check = await plan_service.check_limit(user_id, "messages")
            
            if limit_check.get("reached"):
                # Send limit exceeded message to user
                limit_message = (
                    f"⚠️ Message limit reached!\n\n"
                    f"You've used {limit_check['current']}/{limit_check['max']} messages this month.\n"
                    f"Please upgrade your plan to continue using this chatbot.\n\n"
                    f"Visit your dashboard to upgrade: {os.environ.get('FRONTEND_URL', 'https://single-auth-method.preview.emergentagent.com')}"
                )
                await telegram_service.send_message(
                    chat_id=chat_id,
                    text=limit_message
                )
                logger.warning(f"Message limit reached for user {user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Send typing indicator
        await telegram_service.send_chat_action(chat_id, "typing")
        
        # Generate session ID based on chat_id
        session_id = f"telegram_{chat_id}"
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            conversation_id = str(uuid.uuid4())
            conversation = {
                "id": conversation_id,
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": user_name,
                "user_email": user_username or f"telegram_{chat_id}",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0,
                "platform": "telegram"
            }
            await db.conversations.insert_one(conversation)
        else:
            conversation_id = conversation['id']
        
        # Save user message
        user_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "role": "user",
            "content": message_text,
            "timestamp": datetime.now(timezone.utc)
        }
        await db.messages.insert_one(user_message)
        
        # Get knowledge base context
        sources = await db.sources.find({
            "chatbot_id": chatbot_id,
            "status": "completed"
        }).to_list(length=None)
        
        context = ""
        if sources:
            from services.vector_store import VectorStore
            vector_store = VectorStore()
            relevant_chunks = await vector_store.search(
                chatbot_id=chatbot_id,
                query=message_text,
                top_k=2
            )
            if relevant_chunks:
                context = "\n\n".join([chunk['text'] for chunk in relevant_chunks])
        
        # Initialize chat service
        chat_service = ChatService()
        
        # Generate AI response
        system_message = chatbot.get('system_message', 'You are a helpful AI assistant.')
        
        # Pass context to generate_response, it will handle adding to system message
        ai_response_tuple = await chat_service.generate_response(
            message=message_text,
            session_id=session_id,
            system_message=system_message,
            model=chatbot.get('model', 'gpt-4o-mini'),
            provider=chatbot.get('provider', 'openai'),
            context=context
        )
        
        # Unpack the response tuple (message, citation_footer)
        ai_response = ai_response_tuple[0] if isinstance(ai_response_tuple, tuple) else ai_response_tuple
        
        # Save assistant message
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc)
        }
        await db.messages.insert_one(assistant_message)
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation_id},
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
        
        # Update subscription usage (increment message count by 2 for user + assistant)
        user_id = chatbot.get('user_id')
        if user_id:
            from services.plan_service import plan_service
            await plan_service.increment_usage(user_id, "messages", 2)
        
        # Send response back to Telegram
        result = await telegram_service.send_message(
            chat_id=chat_id,
            text=ai_response
        )
        
        if not result['success']:
            logger.error(f"Failed to send message to Telegram: {result.get('error')}")
        
        # Log integration event
        await db.integration_logs.insert_one({
            "chatbot_id": chatbot_id,
            "integration_id": integration['id'],
            "integration_type": "telegram",
            "event_type": "message_processed",
            "status": "success" if result['success'] else "failure",
            "message": f"Processed message from {user_name}",
            "metadata": {
                "chat_id": chat_id,
                "user_name": user_name,
                "message_length": len(message_text)
            },
            "timestamp": datetime.now(timezone.utc)
        })
        
    except Exception as e:
        logger.error(f"Error processing Telegram message: {str(e)}")
        # Try to send error message to user
        try:
            integration = await get_integration_by_chatbot(chatbot_id)
            if integration:
                bot_token = integration['credentials'].get('bot_token')
                if bot_token:
                    telegram_service = get_telegram_service(bot_token)
                    await telegram_service.send_message(
                        chat_id=chat_id,
                        text="Sorry, I encountered an error processing your message. Please try again."
                    )
        except Exception as e:
            logger.error(f"Error sending Telegram error message: {e}")
            pass


@router.post("/webhook/{chatbot_id}")
async def telegram_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: Optional[str] = Header(None)
):
    """Receive webhook updates from Telegram"""
    try:
        # Get integration to verify secret token
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Verify secret token if configured
        webhook_secret = integration.get('webhook_secret')
        if webhook_secret and x_telegram_bot_api_secret_token != webhook_secret:
            raise HTTPException(status_code=403, detail="Invalid secret token")
        
        # Parse update
        update = await request.json()
        
        # Handle message
        if "message" in update:
            message = update["message"]
            chat_id = message["chat"]["id"]
            
            # Get message text
            message_text = message.get("text", "")
            if not message_text:
                return {"ok": True}
            
            # Get user info
            from_user = message.get("from", {})
            user_name = from_user.get("first_name", "User")
            if from_user.get("last_name"):
                user_name += f" {from_user['last_name']}"
            user_username = from_user.get("username")
            
            # Handle /start command
            if message_text.startswith("/start"):
                chatbot = await db.chatbots.find_one({"id": chatbot_id})
                welcome_message = chatbot.get('welcome_message', 'Hello! How can I help you today?')
                
                bot_token = integration['credentials'].get('bot_token')
                telegram_service = get_telegram_service(bot_token)
                await telegram_service.send_message(
                    chat_id=chat_id,
                    text=welcome_message
                )
                return {"ok": True}
            
            # Process message in background
            background_tasks.add_task(
                process_telegram_message,
                chatbot_id,
                chat_id,
                message_text,
                user_name,
                user_username
            )
        
        return {"ok": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"ok": False, "error": str(e)}


@router.post("/{chatbot_id}/setup-webhook")
async def setup_telegram_webhook(chatbot_id: str, setup: TelegramWebhookSetup):
    """Setup webhook for Telegram bot"""
    try:
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "telegram"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Telegram integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        # Generate secret token
        webhook_secret = hashlib.sha256(f"{chatbot_id}{bot_token}".encode()).hexdigest()[:32]
        
        # Construct webhook URL
        webhook_url = f"{setup.base_url}/api/telegram/webhook/{chatbot_id}"
        
        # Setup webhook
        telegram_service = get_telegram_service(bot_token)
        result = await telegram_service.set_webhook(webhook_url, webhook_secret)
        
        if result['success']:
            # Update integration with webhook info
            await db.integrations.update_one(
                {"id": integration['id']},
                {
                    "$set": {
                        "webhook_url": webhook_url,
                        "webhook_secret": webhook_secret,
                        "webhook_configured": True,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            # Log event
            await db.integration_logs.insert_one({
                "chatbot_id": chatbot_id,
                "integration_id": integration['id'],
                "integration_type": "telegram",
                "event_type": "webhook_configured",
                "status": "success",
                "message": "Webhook setup successfully",
                "metadata": {"webhook_url": webhook_url},
                "timestamp": datetime.now(timezone.utc)
            })
            
            return {
                "success": True,
                "message": "Webhook configured successfully",
                "webhook_url": webhook_url
            }
        else:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to setup webhook'))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_telegram_webhook_info(chatbot_id: str):
    """Get webhook information"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "telegram"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Telegram integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        telegram_service = get_telegram_service(bot_token)
        result = await telegram_service.get_webhook_info()
        
        if result['success']:
            return result['data']
        else:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to get webhook info'))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def delete_telegram_webhook(chatbot_id: str):
    """Delete webhook for Telegram bot"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "telegram"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Telegram integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        telegram_service = get_telegram_service(bot_token)
        result = await telegram_service.delete_webhook()
        
        if result['success']:
            # Update integration
            await db.integrations.update_one(
                {"id": integration['id']},
                {
                    "$set": {
                        "webhook_configured": False,
                        "updated_at": datetime.now(timezone.utc)
                    },
                    "$unset": {"webhook_url": "", "webhook_secret": ""}
                }
            )
            
            return {"success": True, "message": "Webhook deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to delete webhook'))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_message(chatbot_id: str, message: TelegramMessage):
    """Send a test message to verify Telegram integration"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "telegram"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Telegram integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        telegram_service = get_telegram_service(bot_token)
        result = await telegram_service.send_message(
            chat_id=message.chat_id,
            text=message.text
        )
        
        if result['success']:
            return {"success": True, "message": "Test message sent successfully"}
        else:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to send message'))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
