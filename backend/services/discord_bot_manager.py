import discord
from discord.ext import commands
import asyncio
import logging
from typing import Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)


class DiscordBotManager:
    """Manages Discord bot instances for different chatbots"""
    
    def __init__(self):
        self.bots: Dict[str, commands.Bot] = {}
        self.bot_tasks: Dict[str, asyncio.Task] = {}
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        self.db_name = os.environ.get('DB_NAME', 'chatbase_db')
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
    
    async def start_bot(self, chatbot_id: str, bot_token: str):
        """Start a Discord bot for a specific chatbot"""
        try:
            # Stop existing bot if running
            if chatbot_id in self.bots:
                await self.stop_bot(chatbot_id)
            
            # Create bot with necessary intents
            intents = discord.Intents.default()
            intents.message_content = True  # Required to read message content
            intents.messages = True
            intents.guilds = True
            
            bot = commands.Bot(command_prefix="!", intents=intents)
            
            # Store chatbot_id in bot instance
            bot.chatbot_id = chatbot_id
            bot.db = self.db
            
            @bot.event
            async def on_ready():
                logger.info(f"Discord bot connected for chatbot {chatbot_id}: {bot.user.name}")
            
            @bot.event
            async def on_message(message):
                # Ignore messages from the bot itself
                if message.author == bot.user:
                    return
                
                # Ignore bot messages to prevent loops
                if message.author.bot:
                    return
                
                # Process the message
                try:
                    await self.process_message(bot, message)
                except Exception as e:
                    logger.error(f"Error processing Discord message: {str(e)}")
            
            # Store bot instance
            self.bots[chatbot_id] = bot
            
            # Start bot in background
            task = asyncio.create_task(bot.start(bot_token))
            self.bot_tasks[chatbot_id] = task
            
            logger.info(f"Started Discord bot for chatbot {chatbot_id}")
            return {"success": True, "message": "Discord bot started"}
            
        except Exception as e:
            logger.error(f"Error starting Discord bot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def stop_bot(self, chatbot_id: str):
        """Stop a Discord bot"""
        try:
            if chatbot_id in self.bots:
                bot = self.bots[chatbot_id]
                await bot.close()
                del self.bots[chatbot_id]
            
            if chatbot_id in self.bot_tasks:
                task = self.bot_tasks[chatbot_id]
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                del self.bot_tasks[chatbot_id]
            
            logger.info(f"Stopped Discord bot for chatbot {chatbot_id}")
            return {"success": True, "message": "Discord bot stopped"}
            
        except Exception as e:
            logger.error(f"Error stopping Discord bot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def process_message(self, bot, message: discord.Message):
        """Process incoming Discord message and generate AI response"""
        try:
            chatbot_id = bot.chatbot_id
            channel_id = str(message.channel.id)
            user_id = str(message.author.id)
            user_name = message.author.name
            message_content = message.content
            message_id = str(message.id)
            guild_id = str(message.guild.id) if message.guild else None
            
            logger.info(f"Processing Discord message from {user_name}: {message_content[:50]}")
            
            # Create session ID
            session_id = f"discord_{channel_id}_{user_id}"
            
            # Get or create conversation
            conversation = await bot.db.conversations.find_one({
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
                await bot.db.conversations.insert_one(conversation)
            
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
            await bot.db.messages.insert_one(user_message)
            
            # Get chatbot configuration
            chatbot = await bot.db.chatbots.find_one({"id": chatbot_id})
            if not chatbot:
                logger.error(f"Chatbot not found: {chatbot_id}")
                return
            
            # Get knowledge base context
            context = ""
            try:
                from services.vector_store import VectorStore
                vector_store = VectorStore(bot.db)
                relevant_chunks = await vector_store.search(chatbot_id, message_content, top_k=2)
                if relevant_chunks:
                    context = "\n\n".join([chunk["content"] for chunk in relevant_chunks])
            except Exception as e:
                logger.warning(f"Error fetching context: {str(e)}")
            
            # Generate AI response
            try:
                from services.chat_service import ChatService
                chat_service = ChatService()
                
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
                
                # Append citation footer if available
                if citation_footer:
                    response_text += f"\n\n{citation_footer}"
                
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
            await bot.db.messages.insert_one(assistant_message)
            
            # Update conversation
            await bot.db.conversations.update_one(
                {"id": conversation["id"]},
                {"$set": {"updated_at": datetime.now()}}
            )
            
            # Update chatbot message count
            await bot.db.chatbots.update_one(
                {"id": chatbot_id},
                {"$inc": {"messages_count": 2}}
            )
            
            # Update subscription usage
            try:
                from services.plan_service import plan_service
                await plan_service.increment_usage(chatbot["user_id"], "messages", 2)
            except Exception as e:
                logger.warning(f"Failed to update subscription usage: {str(e)}")
            
            # Send response back to Discord (reply to original message)
            await message.reply(response_text)
            
            # Log integration activity
            integration = await bot.db.integrations.find_one({
                "chatbot_id": chatbot_id,
                "integration_type": "discord",
                "enabled": True
            })
            
            if integration:
                await bot.db.integration_logs.insert_one({
                    "id": str(uuid.uuid4()),
                    "integration_id": integration["id"],
                    "event_type": "message_processed",
                    "status": "success",
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
            try:
                await message.reply("I apologize, but I encountered an error processing your message. Please try again.")
            except:
                pass
    
    async def restart_all_bots(self):
        """Restart all Discord bots from database"""
        try:
            # Get all enabled Discord integrations
            integrations = await self.db.integrations.find({
                "integration_type": "discord",
                "enabled": True
            }).to_list(length=None)
            
            logger.info(f"Found {len(integrations)} enabled Discord integrations")
            
            for integration in integrations:
                chatbot_id = integration.get("chatbot_id")
                bot_token = integration.get("credentials", {}).get("bot_token")
                
                if chatbot_id and bot_token:
                    logger.info(f"Starting Discord bot for chatbot {chatbot_id}")
                    await self.start_bot(chatbot_id, bot_token)
                    # Small delay between bot starts
                    await asyncio.sleep(2)
            
            return {"success": True, "count": len(integrations)}
            
        except Exception as e:
            logger.error(f"Error restarting bots: {str(e)}")
            return {"success": False, "error": str(e)}


# Global bot manager instance
discord_bot_manager = DiscordBotManager()
