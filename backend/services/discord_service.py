import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class DiscordService:
    """Service for interacting with Discord API"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = "https://discord.com/api/v10"
        self.headers = {
            "Authorization": f"Bot {bot_token}",
            "Content-Type": "application/json"
        }
    
    async def send_message(self, channel_id: str, content: str, message_reference: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Send a message to a Discord channel
        
        Args:
            channel_id: Discord channel ID
            content: Message text
            message_reference: Optional reference to reply to a specific message
        
        Returns:
            Dict with success status and response data
        """
        try:
            payload = {
                "content": content
            }
            
            if message_reference:
                payload["message_reference"] = message_reference
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/channels/{channel_id}/messages",
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    return {
                        "success": True,
                        "message_id": data.get("id"),
                        "channel_id": data.get("channel_id")
                    }
                else:
                    error_data = response.json() if response.content else {}
                    error_msg = error_data.get("message", f"HTTP {response.status_code}")
                    logger.error(f"Discord send_message error: {error_msg}")
                    return {
                        "success": False,
                        "error": error_msg
                    }
        
        except Exception as e:
            logger.error(f"Exception in send_message: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_bot_info(self) -> Dict[str, Any]:
        """
        Get bot information
        
        Returns:
            Dict with success status and bot info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/@me",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "id": data.get("id"),
                        "username": data.get("username"),
                        "discriminator": data.get("discriminator"),
                        "bot": data.get("bot", False)
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_bot_info: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get user information
        
        Args:
            user_id: Discord user ID
        
        Returns:
            Dict with success status and user info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/{user_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "id": data.get("id"),
                        "username": data.get("username"),
                        "discriminator": data.get("discriminator"),
                        "avatar": data.get("avatar")
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}"
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_user_info: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_webhook_instructions(self, webhook_url: str) -> Dict[str, Any]:
        """
        Get instructions for setting up Discord webhook
        
        Args:
            webhook_url: The webhook URL to configure
        
        Returns:
            Dict with setup instructions
        """
        return {
            "success": True,
            "webhook_url": webhook_url,
            "instructions": [
                "1. Go to Discord Developer Portal: https://discord.com/developers/applications",
                "2. Select your application (or create a new one)",
                "3. Go to 'Bot' section in the left sidebar",
                "4. Under 'Privileged Gateway Intents', enable:",
                "   - MESSAGE CONTENT INTENT (required to read messages)",
                "   - GUILD MESSAGES (optional, for server messages)",
                "   - DIRECT MESSAGES (optional, for DMs)",
                "5. Go to 'OAuth2' → 'URL Generator'",
                "6. Select scopes: 'bot' and 'applications.commands'",
                "7. Select bot permissions:",
                "   - Send Messages",
                "   - Read Messages/View Channels",
                "   - Read Message History",
                "8. Copy the generated URL and open it in browser",
                "9. Select your Discord server and authorize the bot",
                "10. Your bot will join the server and start responding to messages!",
                "",
                "Note: Discord uses Gateway/WebSocket connections. This integration uses",
                "a polling-based approach for simplicity. For production, consider using",
                "discord.py library with proper Gateway connection."
            ]
        }
