import httpx
import logging
from typing import Dict, Optional, Any
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class ZapierService:
    """Service for handling Zapier Webhook interactions"""
    
    def __init__(self, webhook_url: str, api_key: Optional[str] = None):
        self.webhook_url = webhook_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def verify_webhook(self) -> Dict:
        """Verify webhook URL is valid and accessible"""
        try:
            # Test with a ping payload
            test_payload = {
                "test": True,
                "message": "BotSmith webhook verification",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            
            response = await self.client.post(
                self.webhook_url,
                json=test_payload,
                headers=headers
            )
            
            if response.status_code in [200, 201, 202, 204]:
                return {
                    "success": True,
                    "message": f"Webhook verified successfully (Status: {response.status_code})"
                }
            else:
                return {
                    "success": False,
                    "error": f"Webhook returned status {response.status_code}"
                }
        except httpx.TimeoutException:
            return {"success": False, "error": "Webhook request timed out"}
        except httpx.ConnectError:
            return {"success": False, "error": "Could not connect to webhook URL"}
        except Exception as e:
            logger.error(f"Error verifying webhook: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_chat_event(self, event_data: Dict[str, Any]) -> Dict:
        """Send chat event to Zapier webhook"""
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            
            # Format payload for Zapier
            payload = {
                "event_type": "chat_message",
                "timestamp": datetime.utcnow().isoformat(),
                "chatbot_id": event_data.get("chatbot_id"),
                "chatbot_name": event_data.get("chatbot_name"),
                "conversation_id": event_data.get("conversation_id"),
                "user_message": event_data.get("user_message"),
                "bot_response": event_data.get("bot_response"),
                "user_id": event_data.get("user_id"),
                "user_name": event_data.get("user_name"),
                "metadata": event_data.get("metadata", {})
            }
            
            response = await self.client.post(
                self.webhook_url,
                json=payload,
                headers=headers
            )
            
            if response.status_code in [200, 201, 202, 204]:
                return {
                    "success": True,
                    "message": "Event sent to Zapier successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Zapier webhook returned status {response.status_code}",
                    "response_text": response.text[:200]
                }
        except Exception as e:
            logger.error(f"Error sending event to Zapier: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_custom_event(self, event_type: str, data: Dict[str, Any]) -> Dict:
        """Send custom event to Zapier webhook"""
        try:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            
            payload = {
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                **data
            }
            
            response = await self.client.post(
                self.webhook_url,
                json=payload,
                headers=headers
            )
            
            if response.status_code in [200, 201, 202, 204]:
                return {
                    "success": True,
                    "message": "Custom event sent successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Webhook returned status {response.status_code}"
                }
        except Exception as e:
            logger.error(f"Error sending custom event: {str(e)}")
            return {"success": False, "error": str(e)}
