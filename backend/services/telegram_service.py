import httpx
import logging
from typing import Dict, Optional, List
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class TelegramService:
    """Service for handling Telegram Bot API interactions"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def get_me(self) -> Dict:
        """Get bot information"""
        try:
            response = await self.client.get(f"{self.base_url}/getMe")
            data = response.json()
            if data.get("ok"):
                return {"success": True, "data": data.get("result")}
            return {"success": False, "error": data.get("description", "Unknown error")}
        except Exception as e:
            logger.error(f"Error getting bot info: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def set_webhook(self, webhook_url: str, secret_token: Optional[str] = None) -> Dict:
        """Set webhook URL for receiving updates"""
        try:
            payload = {
                "url": webhook_url,
                "allowed_updates": ["message", "callback_query"]
            }
            if secret_token:
                payload["secret_token"] = secret_token
            
            response = await self.client.post(
                f"{self.base_url}/setWebhook",
                json=payload
            )
            data = response.json()
            if data.get("ok"):
                return {"success": True, "message": "Webhook set successfully"}
            return {"success": False, "error": data.get("description", "Failed to set webhook")}
        except Exception as e:
            logger.error(f"Error setting webhook: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def delete_webhook(self) -> Dict:
        """Delete webhook"""
        try:
            response = await self.client.post(f"{self.base_url}/deleteWebhook")
            data = response.json()
            if data.get("ok"):
                return {"success": True, "message": "Webhook deleted successfully"}
            return {"success": False, "error": data.get("description", "Failed to delete webhook")}
        except Exception as e:
            logger.error(f"Error deleting webhook: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_webhook_info(self) -> Dict:
        """Get current webhook information"""
        try:
            response = await self.client.get(f"{self.base_url}/getWebhookInfo")
            data = response.json()
            if data.get("ok"):
                return {"success": True, "data": data.get("result")}
            return {"success": False, "error": data.get("description", "Unknown error")}
        except Exception as e:
            logger.error(f"Error getting webhook info: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_message(
        self,
        chat_id: int,
        text: str,
        parse_mode: Optional[str] = None,
        reply_markup: Optional[Dict] = None
    ) -> Dict:
        """Send text message to a chat"""
        try:
            payload = {
                "chat_id": chat_id,
                "text": text[:4096]  # Telegram message limit
            }
            if parse_mode:
                payload["parse_mode"] = parse_mode
            if reply_markup:
                payload["reply_markup"] = reply_markup
            
            response = await self.client.post(
                f"{self.base_url}/sendMessage",
                json=payload
            )
            data = response.json()
            if data.get("ok"):
                return {"success": True, "data": data.get("result")}
            return {"success": False, "error": data.get("description", "Failed to send message")}
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_chat_action(self, chat_id: int, action: str = "typing") -> Dict:
        """Send chat action (typing indicator)"""
        try:
            response = await self.client.post(
                f"{self.base_url}/sendChatAction",
                json={"chat_id": chat_id, "action": action}
            )
            data = response.json()
            return {"success": data.get("ok", False)}
        except Exception as e:
            logger.error(f"Error sending chat action: {str(e)}")
            return {"success": False}
    
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: Optional[str] = None,
        show_alert: bool = False
    ) -> Dict:
        """Answer callback query from inline keyboard"""
        try:
            payload = {"callback_query_id": callback_query_id}
            if text:
                payload["text"] = text
            payload["show_alert"] = show_alert
            
            response = await self.client.post(
                f"{self.base_url}/answerCallbackQuery",
                json=payload
            )
            data = response.json()
            return {"success": data.get("ok", False)}
        except Exception as e:
            logger.error(f"Error answering callback query: {str(e)}")
            return {"success": False}


def escape_markdown_v2(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2"""
    special_chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in special_chars:
        text = text.replace(char, f'\\{char}')
    return text
