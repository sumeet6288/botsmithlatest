from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import hashlib
from services.slack_service import SlackService
from services.chat_service import ChatService
from models import SlackWebhookSetup, SlackMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/slack", tags=["slack"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Store active Slack services per chatbot
slack_services = {}


def get_slack_service(bot_token: str) -> SlackService:
    """Get or create SlackService instance"""
    if bot_token not in slack_services:
        slack_services[bot_token] = SlackService(bot_token)
    return slack_services[bot_token]


async def get_integration_by_chatbot(chatbot_id: str) -> Optional[dict]:
    """Get Slack integration for a chatbot"""
    integration = await db.integrations.find_one({
        "chatbot_id": chatbot_id,
        "integration_type": "slack",
        "enabled": True
    })
    return integration


async def process_slack_message(
    chatbot_id: str,
    channel: str,
    message_text: str,
    user_id: str,
    user_name: str,
    thread_ts: Optional[str] = None,
    event_ts: Optional[str] = None
):
    """Process incoming Slack message and generate AI response"""
    try:
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot not found: {chatbot_id}")
            return
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            logger.warning(f"Chatbot {chatbot_id} is not active (status: {chatbot.get('status')}). Ignoring message.")
            return
        
        # Get Slack integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            logger.error(f"Slack integration not found for chatbot: {chatbot_id}")
            return
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            logger.error(f"Bot token not found for chatbot: {chatbot_id}")
            return
        
        slack_service = get_slack_service(bot_token)
        
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
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://subscription-fix-14.preview.emergentagent.com')}"
                )
                await slack_service.send_message(
                    channel=channel,
                    text=limit_message,
                    thread_ts=thread_ts
                )
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Generate session ID based on channel and user
        session_id = f"slack_{channel}_{user_id}"
        
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
                "user_email": f"slack_{user_id}",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0,
                "platform": "slack"
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
        
        # Pass context to generate_response
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
        user_id_owner = chatbot.get('user_id')
        if user_id_owner:
            from services.plan_service import plan_service
            await plan_service.increment_usage(user_id_owner, "messages", 2)
        
        # Send response back to Slack (in thread if applicable)
        result = await slack_service.send_message(
            channel=channel,
            text=ai_response,
            thread_ts=thread_ts or event_ts
        )
        
        if not result['success']:
            logger.error(f"Failed to send message to Slack: {result.get('error')}")
        
        # Log integration event
        await db.integration_logs.insert_one({
            "chatbot_id": chatbot_id,
            "integration_id": integration['id'],
            "integration_type": "slack",
            "event_type": "message_processed",
            "status": "success" if result['success'] else "failure",
            "message": f"Processed message from {user_name}",
            "metadata": {
                "channel": channel,
                "user_id": user_id,
                "user_name": user_name,
                "message_length": len(message_text)
            },
            "timestamp": datetime.now(timezone.utc)
        })
        
    except Exception as e:
        logger.error(f"Error processing Slack message: {str(e)}")
        # Try to send error message to user
        try:
            integration = await get_integration_by_chatbot(chatbot_id)
            if integration:
                bot_token = integration['credentials'].get('bot_token')
                if bot_token:
                    slack_service = get_slack_service(bot_token)
                    await slack_service.send_message(
                        channel=channel,
                        text="Sorry, I encountered an error processing your message. Please try again.",
                        thread_ts=thread_ts or event_ts
                    )
        except Exception as e:
            logger.error(f"Error sending Slack error message: {e}")
            pass


@router.post("/webhook/{chatbot_id}")
async def slack_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """Receive webhook events from Slack"""
    try:
        # Parse event first
        event_data = await request.json()
        
        # Handle URL verification challenge (Slack's initial webhook setup)
        # This needs to work even if integration is not enabled yet
        if event_data.get("type") == "url_verification":
            return {"challenge": event_data.get("challenge")}
        
        # For actual events, check if integration exists and is enabled
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found or not enabled")
        
        # Handle event callback
        if event_data.get("type") == "event_callback":
            event = event_data.get("event", {})
            
            # Ignore bot messages to prevent loops
            if event.get("bot_id") or event.get("subtype") == "bot_message":
                return {"ok": True}
            
            # Handle message events
            if event.get("type") == "message" and not event.get("subtype"):
                channel = event.get("channel")
                user_id = event.get("user")
                text = event.get("text", "")
                thread_ts = event.get("thread_ts")
                event_ts = event.get("ts")
                
                if not text or not user_id:
                    return {"ok": True}
                
                # Get user info
                bot_token = integration['credentials'].get('bot_token')
                slack_service = get_slack_service(bot_token)
                user_info = await slack_service.get_user_info(user_id)
                user_name = user_info.get("name", "User") if user_info.get("success") else "User"
                
                # Process message in background
                background_tasks.add_task(
                    process_slack_message,
                    chatbot_id,
                    channel,
                    text,
                    user_id,
                    user_name,
                    thread_ts,
                    event_ts
                )
        
        return {"ok": True}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"ok": False, "error": str(e)}


@router.post("/{chatbot_id}/setup-webhook")
async def setup_slack_webhook(chatbot_id: str, setup: SlackWebhookSetup):
    """Setup webhook for Slack bot (returns instructions)"""
    try:
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "slack"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Slack integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        # Construct webhook URL
        webhook_url = f"{setup.base_url}/api/slack/webhook/{chatbot_id}"
        
        # Get setup instructions
        slack_service = get_slack_service(bot_token)
        result = await slack_service.set_webhook(webhook_url)
        
        # Update integration with webhook info
        await db.integrations.update_one(
            {"id": integration['id']},
            {
                "$set": {
                    "webhook_url": webhook_url,
                    "webhook_configured": True,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Log event
        await db.integration_logs.insert_one({
            "chatbot_id": chatbot_id,
            "integration_id": integration['id'],
            "integration_type": "slack",
            "event_type": "webhook_configured",
            "status": "success",
            "message": "Webhook URL generated",
            "metadata": {"webhook_url": webhook_url},
            "timestamp": datetime.now(timezone.utc)
        })
        
        return {
            "success": True,
            "message": "Webhook URL generated. Follow instructions to complete setup.",
            "webhook_url": webhook_url,
            "instructions": result.get("instructions", [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_slack_webhook_info(chatbot_id: str):
    """Get webhook information"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "slack"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Slack integration not found")
        
        return {
            "webhook_url": integration.get("webhook_url"),
            "webhook_configured": integration.get("webhook_configured", False),
            "instructions": [
                "1. Go to https://api.slack.com/apps",
                "2. Select your app",
                "3. Go to 'Event Subscriptions'",
                "4. Enable Events",
                f"5. Set Request URL to: {integration.get('webhook_url', 'Not configured')}",
                "6. Subscribe to bot events: message.channels, message.im, message.groups",
                "7. Save changes",
                "8. Go to 'OAuth & Permissions' and install the app to your workspace"
            ]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def delete_slack_webhook(chatbot_id: str):
    """Delete webhook for Slack bot"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "slack"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Slack integration not found")
        
        # Update integration
        await db.integrations.update_one(
            {"id": integration['id']},
            {
                "$set": {
                    "webhook_configured": False,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$unset": {"webhook_url": ""}
            }
        )
        
        return {
            "success": True,
            "message": "Webhook configuration removed. You may also want to disable Event Subscriptions in your Slack App settings."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_message(chatbot_id: str, message: SlackMessage):
    """Send a test message to verify Slack integration"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "slack"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Slack integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        slack_service = get_slack_service(bot_token)
        result = await slack_service.send_message(
            channel=message.channel,
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
