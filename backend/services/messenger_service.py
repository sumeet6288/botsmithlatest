import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class MessengerService:
    """Service for interacting with Facebook Messenger API"""
    
    def __init__(self, page_access_token: str):
        self.page_access_token = page_access_token
        self.base_url = "https://graph.facebook.com/v18.0"
    
    async def send_message(self, recipient_id: str, text: str) -> Dict[str, Any]:
        """
        Send a text message to a Messenger user
        
        Args:
            recipient_id: Facebook User ID (PSID)
            text: Message text
        
        Returns:
            Dict with success status and response data
        """
        try:
            payload = {
                "recipient": {
                    "id": recipient_id
                },
                "message": {
                    "text": text
                },
                "messaging_type": "RESPONSE"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/me/messages",
                    params={"access_token": self.page_access_token},
                    json=payload,
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("message_id"):
                    return {
                        "success": True,
                        "message_id": data.get("message_id"),
                        "recipient_id": data.get("recipient_id")
                    }
                else:
                    error_msg = data.get("error", {}).get("message", "Unknown error")
                    logger.error(f"Messenger send_message error: {error_msg}")
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
    
    async def send_typing_indicator(self, recipient_id: str, typing_on: bool = True) -> Dict[str, Any]:
        """
        Send typing indicator to show bot is typing
        
        Args:
            recipient_id: Facebook User ID (PSID)
            typing_on: True to show typing, False to hide
        
        Returns:
            Dict with success status
        """
        try:
            payload = {
                "recipient": {
                    "id": recipient_id
                },
                "sender_action": "typing_on" if typing_on else "typing_off"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/me/messages",
                    params={"access_token": self.page_access_token},
                    json=payload,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return {"success": True}
                else:
                    return {"success": False, "error": "Failed to send typing indicator"}
        
        except Exception as e:
            logger.error(f"Exception in send_typing_indicator: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def mark_message_as_read(self, recipient_id: str) -> Dict[str, Any]:
        """
        Mark message as read
        
        Args:
            recipient_id: Facebook User ID (PSID)
        
        Returns:
            Dict with success status
        """
        try:
            payload = {
                "recipient": {
                    "id": recipient_id
                },
                "sender_action": "mark_seen"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/me/messages",
                    params={"access_token": self.page_access_token},
                    json=payload,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return {"success": True}
                else:
                    return {"success": False, "error": "Failed to mark as read"}
        
        except Exception as e:
            logger.error(f"Exception in mark_message_as_read: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get user profile information
        
        Args:
            user_id: Facebook User ID (PSID)
        
        Returns:
            Dict with user info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{user_id}",
                    params={
                        "fields": "first_name,last_name,profile_pic",
                        "access_token": self.page_access_token
                    },
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200:
                    first_name = data.get("first_name", "")
                    last_name = data.get("last_name", "")
                    name = f"{first_name} {last_name}".strip() or user_id
                    
                    return {
                        "success": True,
                        "id": data.get("id"),
                        "name": name,
                        "first_name": first_name,
                        "last_name": last_name,
                        "profile_pic": data.get("profile_pic")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to get user info"),
                        "name": user_id  # Fallback to user ID
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_user_info: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "name": user_id  # Fallback to user ID
            }
    
    async def verify_token(self) -> Dict[str, Any]:
        """
        Verify the page access token
        
        Returns:
            Dict with success status and page info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/me",
                    params={
                        "fields": "id,name",
                        "access_token": self.page_access_token
                    },
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("id"):
                    return {
                        "success": True,
                        "page_id": data.get("id"),
                        "page_name": data.get("name")
                    }
                else:
                    error_msg = data.get("error", {}).get("message", "Invalid token")
                    return {
                        "success": False,
                        "error": error_msg
                    }
        
        except Exception as e:
            logger.error(f"Exception in verify_token: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def set_webhook(self, webhook_url: str, verify_token: str) -> Dict[str, Any]:
        """
        Return instructions for Messenger webhook setup
        Webhooks must be configured in Facebook Developer Portal
        
        Args:
            webhook_url: Your webhook URL
            verify_token: Verification token for webhook
        
        Returns:
            Dict with setup instructions
        """
        return {
            "success": True,
            "message": "Messenger webhooks are configured in Facebook Developer Portal",
            "instructions": [
                "1. Go to https://developers.facebook.com/apps/",
                "2. Select your Facebook App",
                "3. Go to 'Messenger' > 'Settings'",
                "4. Find 'Webhooks' section",
                "5. Click 'Add Callback URL'",
                f"6. Configure Webhooks with Callback URL: {webhook_url}",
                f"7. Set Verify Token to: {verify_token}",
                "8. Subscribe to webhook fields: messages, messaging_postbacks",
                "9. Click 'Verify and Save'",
                "10. Test by sending a message to your Facebook Page"
            ],
            "webhook_url": webhook_url,
            "verify_token": verify_token
        }
