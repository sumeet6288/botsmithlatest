from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging
import uuid
import os
from typing import Dict, Any

from services.discord_service import DiscordService
from services.chat_service import ChatService
from services.discord_bot_manager import discord_bot_manager
from models import DiscordWebhookSetup

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/discord", tags=["discord"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Chat service
chat_service = ChatService()


# Store active Discord services per chatbot
discord_services = {}


def get_discord_service(bot_token: str) -> DiscordService:
    """Get or create DiscordService instance"""
    if bot_token not in discord_services:
        discord_services[bot_token] = DiscordService(bot_token)
    return discord_services[bot_token]


async def get_discord_integration(chatbot_id: str):
    """Get Discord integration for a chatbot"""
    integration = await db.integrations.find_one({
        "chatbot_id": chatbot_id,
        "integration_type": "discord",
        "enabled": True
    })
    return integration


async def process_discord_message(
    chatbot_id: str,
    channel_id: str,
    message_content: str,
    user_id: str,
    user_name: str,
    message_id: str,
    guild_id: str = None
):
    """Process incoming Discord message and generate AI response"""
    try:
        logger.info(f"Processing Discord message from {user_name} in channel {channel_id}")
        
        # Get Discord integration
        integration = await get_discord_integration(chatbot_id)
        if not integration:
            logger.error(f"Discord integration not found for chatbot: {chatbot_id}")
            return
        
        # Get bot token
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            logger.error(f"Bot token not found in Discord integration for chatbot: {chatbot_id}")
            return
        
        discord_service = get_discord_service(bot_token)
        
        # Get chatbot to check user limits
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot not found: {chatbot_id}")
            return
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                f"⚠️ **Chatbot Inactive**\n\n"
                f"This chatbot is currently inactive and cannot process messages.\n"
                f"Please contact the chatbot owner to activate it.\n\n"
                f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')}"
            )
            await discord_service.send_message(
                channel_id=channel_id,
                content=inactive_message,
                message_reference={"message_id": message_id}
            )
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
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')}"
                )
                await discord_service.send_message(
                    channel_id=channel_id,
                    content=limit_message
                )
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Create session ID based on channel and user
        session_id = f"discord_{channel_id}_{user_id}"
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            conversation = {
                "id": str(uuid.uuid4()),
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": user_name,
                "user_email": f"discord_{user_id}",
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "status": "active",
                "platform": "discord",
                "metadata": {
                    "channel_id": channel_id,
                    "guild_id": guild_id,
                    "user_id": user_id
                }
            }
            await db.conversations.insert_one(conversation)
        
        # Save user message
        user_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation["id"],
            "chatbot_id": chatbot_id,
            "role": "user",
            "content": message_content,
            "timestamp": datetime.now(),
            "metadata": {
                "platform": "discord",
                "message_id": message_id,
                "channel_id": channel_id,
                "user_id": user_id
            }
        }
        await db.messages.insert_one(user_message)
        
        # Get knowledge base context
        context = ""
        try:
            from services.vector_store import VectorStore
            vector_store = VectorStore(db)
            relevant_chunks = await vector_store.search(chatbot_id, message_content, top_k=2)
            if relevant_chunks:
                context = "\n\n".join([chunk["content"] for chunk in relevant_chunks])
        except Exception as e:
            logger.warning(f"Error fetching context: {str(e)}")
        
        # Generate AI response
        try:
            # ChatService.generate_response returns a tuple (response, citation_footer)
            response_tuple = await chat_service.generate_response(
                message=message_content,
                session_id=session_id,
                system_message=chatbot.get("instructions", "You are a helpful assistant."),
                model=chatbot.get("model", "gpt-4o-mini"),
                provider=chatbot.get("provider", "openai"),
                context=context
            )
            
            # Unpack the tuple
            response_text, citation_footer = response_tuple
            
            # Citations removed - users don't need to see source references
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            response_text = "I apologize, but I encountered an error processing your message."
        
        # Save assistant message
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation["id"],
            "chatbot_id": chatbot_id,
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now(),
            "metadata": {
                "platform": "discord",
                "channel_id": channel_id
            }
        }
        await db.messages.insert_one(assistant_message)
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation["id"]},
            {"$set": {"updated_at": datetime.now()}}
        )
        
        # Update chatbot message count
        await db.chatbots.update_one(
            {"id": chatbot_id},
            {"$inc": {"messages_count": 2}}  # User + Assistant
        )
        
        # Update subscription usage (2 messages: user + assistant)
        try:
            from services.plan_service import plan_service
            await plan_service.increment_usage(chatbot["user_id"], "messages", 2)
        except Exception as e:
            logger.warning(f"Failed to update subscription usage: {str(e)}")
        
        # Send response back to Discord
        result = await discord_service.send_message(
            channel_id=channel_id,
            content=response_text,
            message_reference={"message_id": message_id}  # Reply to original message
        )
        
        if not result.get("success"):
            logger.error(f"Failed to send message to Discord: {result.get('error')}")
        
        # Log integration activity
        await db.integration_logs.insert_one({
            "id": str(uuid.uuid4()),
            "integration_id": integration["id"],
            "event_type": "message_processed",
            "status": "success" if result.get("success") else "failure",
            "message": f"Processed message from {user_name}",
            "timestamp": datetime.now(),
            "metadata": {
                "channel_id": channel_id,
                "user_id": user_id,
                "message_id": message_id
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing Discord message: {str(e)}")
        # Try to send error message to Discord
        try:
            integration = await get_discord_integration(chatbot_id)
            if integration:
                bot_token = integration['credentials'].get('bot_token')
                discord_service = get_discord_service(bot_token)
                await discord_service.send_message(
                    channel_id=channel_id,
                    content="I apologize, but I encountered an error processing your message. Please try again.",
                    message_reference={"message_id": message_id}
                )
        except Exception as e:
            logger.error(f"Error sending Discord error message: {e}")
            pass


@router.post("/webhook/{chatbot_id}")
async def discord_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Receive webhook events from Discord via Interactions
    
    Note: Discord primarily uses Gateway/WebSocket for bot events.
    This endpoint is for HTTP-based interactions (slash commands, buttons, etc.)
    For message events, you'll need to use discord.py with Gateway connection.
    """
    try:
        data = await request.json()
        
        # Discord webhook verification (ping)
        if data.get("type") == 1:
            return {"type": 1}  # ACK ping
        
        # Handle interaction (slash command, button, etc.)
        if data.get("type") == 2:  # Application command
            # Get integration
            integration = await get_discord_integration(chatbot_id)
            if not integration:
                return {
                    "type": 4,
                    "data": {
                        "content": "Integration not found or not enabled"
                    }
                }
            
            # Extract interaction data
            interaction_data = data.get("data", {})
            command_name = interaction_data.get("name")
            user = data.get("member", {}).get("user", {})
            channel_id = data.get("channel_id")
            
            # Process command in background
            # For now, return immediate response
            return {
                "type": 4,
                "data": {
                    "content": f"Hello! I received your command: {command_name}"
                }
            }
        
        return {"type": 1}
    
    except Exception as e:
        logger.error(f"Error processing Discord webhook: {str(e)}")
        return {"error": str(e)}


@router.post("/{chatbot_id}/setup-webhook")
async def setup_discord_webhook(chatbot_id: str, setup: DiscordWebhookSetup):
    """Setup webhook for Discord bot (returns instructions)"""
    try:
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        # Construct webhook URL
        webhook_url = f"{setup.base_url}/api/discord/webhook/{chatbot_id}"
        
        # Get setup instructions
        discord_service = get_discord_service(bot_token)
        result = discord_service.get_webhook_instructions(webhook_url)
        
        # Update integration with webhook info
        await db.integrations.update_one(
            {"id": integration['id']},
            {
                "$set": {
                    "webhook_url": webhook_url,
                    "updated_at": datetime.now()
                }
            }
        )
        
        # Log activity
        await db.integration_logs.insert_one({
            "id": str(uuid.uuid4()),
            "integration_id": integration["id"],
            "event_type": "webhook_configured",
            "status": "success",
            "message": "Webhook URL configured",
            "timestamp": datetime.now()
        })
        
        return {
            "success": True,
            "message": "Webhook URL generated. Follow instructions to complete setup.",
            "webhook_url": webhook_url,
            "instructions": result["instructions"],
            "note": "Discord bots require Gateway/WebSocket connection for real-time message events. The webhook URL above is for HTTP-based interactions. For full message support, consider using discord.py library."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up Discord webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_discord_webhook_info(chatbot_id: str):
    """Get Discord webhook configuration"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        return {
            "webhook_url": integration.get("webhook_url"),
            "configured": integration.get("webhook_url") is not None,
            "enabled": integration.get("enabled", False),
            "last_tested": integration.get("last_tested"),
            "note": "Discord bots work best with Gateway/WebSocket connections. This webhook is for HTTP interactions only."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Discord webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def delete_discord_webhook(chatbot_id: str):
    """Remove Discord webhook configuration"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        # Remove webhook URL
        await db.integrations.update_one(
            {"id": integration['id']},
            {
                "$unset": {"webhook_url": ""},
                "$set": {"updated_at": datetime.now()}
            }
        )
        
        # Log activity
        await db.integration_logs.insert_one({
            "id": str(uuid.uuid4()),
            "integration_id": integration["id"],
            "event_type": "webhook_removed",
            "status": "success",
            "message": "Webhook configuration removed",
            "timestamp": datetime.now()
        })
        
        return {
            "success": True,
            "message": "Webhook configuration removed"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Discord webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_discord_test_message(
    chatbot_id: str,
    channel_id: str,
    message: str = "Hello! This is a test message from your chatbot."
):
    """Send a test message to Discord channel"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        discord_service = get_discord_service(bot_token)
        result = await discord_service.send_message(channel_id, message)
        
        if result.get("success"):
            return {
                "success": True,
                "message": "Test message sent successfully",
                "message_id": result.get("message_id")
            }
        else:
            return {
                "success": False,
                "message": f"Failed to send test message: {result.get('error')}"
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending Discord test message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/{chatbot_id}/start-bot")
async def start_discord_bot(chatbot_id: str):
    """Start Discord bot for real-time message handling"""
    try:
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        if not integration.get("enabled"):
            raise HTTPException(status_code=400, detail="Discord integration is not enabled")
        
        bot_token = integration['credentials'].get('bot_token')
        if not bot_token:
            raise HTTPException(status_code=400, detail="Bot token not configured")
        
        # Start the bot
        result = await discord_bot_manager.start_bot(chatbot_id, bot_token)
        
        if result["success"]:
            # Update integration status
            await db.integrations.update_one(
                {"id": integration['id']},
                {
                    "$set": {
                        "bot_status": "running",
                        "updated_at": datetime.now()
                    }
                }
            )
            
            # Log activity
            await db.integration_logs.insert_one({
                "id": str(uuid.uuid4()),
                "integration_id": integration["id"],
                "event_type": "bot_started",
                "status": "success",
                "message": "Discord bot started successfully",
                "timestamp": datetime.now()
            })
            
            return {
                "success": True,
                "message": "Discord bot started successfully. Your bot is now listening for messages!",
                "chatbot_id": chatbot_id
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to start bot"))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting Discord bot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/stop-bot")
async def stop_discord_bot(chatbot_id: str):
    """Stop Discord bot"""
    try:
        # Get integration
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        # Stop the bot
        result = await discord_bot_manager.stop_bot(chatbot_id)
        
        if result["success"]:
            # Update integration status
            await db.integrations.update_one(
                {"id": integration['id']},
                {
                    "$set": {
                        "bot_status": "stopped",
                        "updated_at": datetime.now()
                    }
                }
            )
            
            # Log activity
            await db.integration_logs.insert_one({
                "id": str(uuid.uuid4()),
                "integration_id": integration["id"],
                "event_type": "bot_stopped",
                "status": "success",
                "message": "Discord bot stopped",
                "timestamp": datetime.now()
            })
            
            return {
                "success": True,
                "message": "Discord bot stopped successfully",
                "chatbot_id": chatbot_id
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to stop bot"))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping Discord bot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/bot-status")
async def get_discord_bot_status(chatbot_id: str):
    """Get Discord bot status"""
    try:
        integration = await db.integrations.find_one({
            "chatbot_id": chatbot_id,
            "integration_type": "discord"
        })
        
        if not integration:
            raise HTTPException(status_code=404, detail="Discord integration not found")
        
        # Check if bot is actually running
        is_running = chatbot_id in discord_bot_manager.bots
        bot_status = integration.get("bot_status", "stopped")
        
        # Update status if mismatch
        if is_running and bot_status != "running":
            await db.integrations.update_one(
                {"id": integration['id']},
                {"$set": {"bot_status": "running"}}
            )
            bot_status = "running"
        elif not is_running and bot_status == "running":
            await db.integrations.update_one(
                {"id": integration['id']},
                {"$set": {"bot_status": "stopped"}}
            )
            bot_status = "stopped"
        
        return {
            "success": True,
            "chatbot_id": chatbot_id,
            "bot_status": bot_status,
            "is_running": is_running,
            "enabled": integration.get("enabled", False)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Discord bot status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
