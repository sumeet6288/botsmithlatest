import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class WhatsAppService:
    """Service for interacting with WhatsApp Business Cloud API"""
    
    def __init__(self, access_token: str, phone_number_id: str):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.base_url = "https://graph.facebook.com/v18.0"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    
    async def send_message(self, recipient_phone: str, text: str) -> Dict[str, Any]:
        """
        Send a text message to a WhatsApp user
        
        Args:
            recipient_phone: Phone number with country code (e.g., "1234567890")
            text: Message text
        
        Returns:
            Dict with success status and response data
        """
        try:
            payload = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": recipient_phone,
                "type": "text",
                "text": {
                    "preview_url": False,
                    "body": text
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.phone_number_id}/messages",
                    headers=self.headers,
                    json=payload,
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("messages"):
                    return {
                        "success": True,
                        "message_id": data["messages"][0].get("id"),
                        "recipient": recipient_phone
                    }
                else:
                    error_msg = data.get("error", {}).get("message", "Unknown error")
                    logger.error(f"WhatsApp send_message error: {error_msg}")
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
    
    async def verify_token(self) -> Dict[str, Any]:
        """
        Verify the access token and phone number ID
        
        Returns:
            Dict with success status and phone info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{self.phone_number_id}",
                    headers=self.headers,
                    params={"fields": "id,verified_name,display_phone_number"},
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("id"):
                    return {
                        "success": True,
                        "phone_number_id": data.get("id"),
                        "verified_name": data.get("verified_name"),
                        "display_phone_number": data.get("display_phone_number")
                    }
                else:
                    error_msg = data.get("error", {}).get("message", "Invalid credentials")
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
    
    async def get_business_profile(self) -> Dict[str, Any]:
        """
        Get WhatsApp Business profile information
        
        Returns:
            Dict with business profile info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{self.phone_number_id}/whatsapp_business_profile",
                    headers=self.headers,
                    params={"fields": "about,address,description,email,profile_picture_url,websites"},
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("data"):
                    profile = data["data"][0] if data["data"] else {}
                    return {
                        "success": True,
                        "about": profile.get("about"),
                        "description": profile.get("description"),
                        "email": profile.get("email"),
                        "profile_picture": profile.get("profile_picture_url"),
                        "websites": profile.get("websites", [])
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to get profile")
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_business_profile: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def set_webhook(self, webhook_url: str, verify_token: str) -> Dict[str, Any]:
        """
        Return instructions for WhatsApp webhook setup
        Webhooks must be configured in Facebook Business Manager
        
        Args:
            webhook_url: Your webhook URL
            verify_token: Verification token for webhook
        
        Returns:
            Dict with setup instructions
        """
        return {
            "success": True,
            "message": "WhatsApp webhooks are configured in Facebook Business Manager",
            "instructions": [
                "1. Go to https://business.facebook.com/",
                "2. Select your Business Account",
                "3. Go to 'WhatsApp' > 'API Setup'",
                "4. Find 'Webhooks' section",
                f"5. Configure Webhooks with Callback URL: {webhook_url}",
                f"6. Set Verify Token to: {verify_token}",
                "7. Subscribe to webhook fields: messages",
                "8. Save and verify the webhook",
                "9. Test by sending a message to your WhatsApp Business number"
            ],
            "webhook_url": webhook_url,
            "verify_token": verify_token
        }
    
    async def mark_message_as_read(self, message_id: str) -> Dict[str, Any]:
        """
        Mark a message as read
        
        Args:
            message_id: WhatsApp message ID
        
        Returns:
            Dict with success status
        """
        try:
            payload = {
                "messaging_product": "whatsapp",
                "status": "read",
                "message_id": message_id
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.phone_number_id}/messages",
                    headers=self.headers,
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
