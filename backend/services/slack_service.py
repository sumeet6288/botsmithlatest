import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class SlackService:
    """Service for interacting with Slack API"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = "https://slack.com/api"
        self.headers = {
            "Authorization": f"Bearer {bot_token}",
            "Content-Type": "application/json"
        }
    
    async def send_message(self, channel: str, text: str, thread_ts: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a message to a Slack channel or DM
        
        Args:
            channel: Channel ID or user ID
            text: Message text
            thread_ts: Optional thread timestamp to reply in thread
        
        Returns:
            Dict with success status and response data
        """
        try:
            payload = {
                "channel": channel,
                "text": text
            }
            
            if thread_ts:
                payload["thread_ts"] = thread_ts
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat.postMessage",
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )
                
                data = response.json()
                
                if data.get("ok"):
                    return {
                        "success": True,
                        "message_ts": data.get("ts"),
                        "channel": data.get("channel")
                    }
                else:
                    error_msg = data.get("error", "Unknown error")
                    logger.error(f"Slack send_message error: {error_msg}")
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
    
    async def auth_test(self) -> Dict[str, Any]:
        """
        Test authentication and get bot info
        
        Returns:
            Dict with success status and bot info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/auth.test",
                    headers=self.headers,
                    timeout=10.0
                )
                
                data = response.json()
                
                if data.get("ok"):
                    return {
                        "success": True,
                        "bot_id": data.get("bot_id"),
                        "user": data.get("user"),
                        "team": data.get("team"),
                        "url": data.get("url")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", "Authentication failed")
                    }
        
        except Exception as e:
            logger.error(f"Exception in auth_test: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get user information
        
        Args:
            user_id: Slack user ID
        
        Returns:
            Dict with user info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users.info",
                    headers=self.headers,
                    params={"user": user_id},
                    timeout=10.0
                )
                
                data = response.json()
                
                if data.get("ok"):
                    user = data.get("user", {})
                    return {
                        "success": True,
                        "name": user.get("real_name", user.get("name", "User")),
                        "email": user.get("profile", {}).get("email"),
                        "display_name": user.get("profile", {}).get("display_name")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", "Failed to get user info")
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_user_info: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def set_webhook(self, webhook_url: str) -> Dict[str, Any]:
        """
        Note: Slack uses Events API subscription which must be configured
        in the Slack App settings (https://api.slack.com/apps)
        
        This method returns instructions for manual setup
        """
        return {
            "success": True,
            "message": "Slack webhooks are configured in your Slack App settings",
            "instructions": [
                "1. Go to https://api.slack.com/apps",
                "2. Select your app",
                "3. Go to 'Event Subscriptions'",
                "4. Enable Events",
                f"5. Set Request URL to: {webhook_url}",
                "6. Subscribe to bot events: message.channels, message.im, message.groups",
                "7. Save changes"
            ],
            "webhook_url": webhook_url
        }
    
    async def get_bot_info(self) -> Dict[str, Any]:
        """
        Get bot information
        
        Returns:
            Dict with bot info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/auth.test",
                    headers=self.headers,
                    timeout=10.0
                )
                
                data = response.json()
                
                if data.get("ok"):
                    return {
                        "success": True,
                        "user_id": data.get("user_id"),
                        "bot_id": data.get("bot_id"),
                        "team": data.get("team"),
                        "team_id": data.get("team_id")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", "Failed to get bot info")
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_bot_info: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
