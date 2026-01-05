import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class InstagramService:
    """Service for interacting with Instagram Graph API (Messenger Platform)"""
    
    def __init__(self, page_access_token: str):
        self.page_access_token = page_access_token
        self.base_url = "https://graph.facebook.com/v18.0"
        self.headers = {
            "Content-Type": "application/json"
        }
    
    async def send_message(self, recipient_id: str, text: str) -> Dict[str, Any]:
        """
        Send a message to an Instagram user via Instagram Messaging API
        
        Args:
            recipient_id: Instagram-scoped user ID (IGSID)
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
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/me/messages",
                    headers=self.headers,
                    json=payload,
                    params={"access_token": self.page_access_token},
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
                    logger.error(f"Instagram send_message error: {error_msg}")
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
        Verify the page access token by fetching account info
        
        Returns:
            Dict with success status and account info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/me",
                    headers=self.headers,
                    params={
                        "fields": "id,name,username",
                        "access_token": self.page_access_token
                    },
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("id"):
                    return {
                        "success": True,
                        "account_id": data.get("id"),
                        "name": data.get("name"),
                        "username": data.get("username")
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
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get Instagram user profile information
        
        Args:
            user_id: Instagram-scoped user ID (IGSID)
        
        Returns:
            Dict with user profile info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/{user_id}",
                    headers=self.headers,
                    params={
                        "fields": "name,profile_pic",
                        "access_token": self.page_access_token
                    },
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("id"):
                    return {
                        "success": True,
                        "name": data.get("name", "Instagram User"),
                        "profile_pic": data.get("profile_pic")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to get user profile")
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_user_profile: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def set_webhook(self, webhook_url: str, verify_token: str) -> Dict[str, Any]:
        """
        Return instructions for Instagram webhook setup
        Instagram webhooks must be configured in the Facebook App Dashboard
        
        Args:
            webhook_url: Your webhook URL
            verify_token: Verification token for webhook
        
        Returns:
            Dict with setup instructions
        """
        return {
            "success": True,
            "message": "Instagram webhooks are configured in Facebook App Dashboard",
            "instructions": [
                "1. Go to https://developers.facebook.com/apps",
                "2. Select your app",
                "3. Go to 'Instagram' > 'Basic Display' or 'Messenger API'",
                "4. Add your Instagram account to the app",
                f"5. Configure Webhooks with Callback URL: {webhook_url}",
                f"6. Set Verify Token to: {verify_token}",
                "7. Subscribe to webhook fields: messages, messaging_postbacks, message_echoes",
                "8. Submit for Instagram review if needed"
            ],
            "webhook_url": webhook_url,
            "verify_token": verify_token
        }
    
    async def get_account_info(self) -> Dict[str, Any]:
        """
        Get Instagram Business Account information
        
        Returns:
            Dict with account info
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/me",
                    headers=self.headers,
                    params={
                        "fields": "id,name,username,profile_picture_url,followers_count",
                        "access_token": self.page_access_token
                    },
                    timeout=10.0
                )
                
                data = response.json()
                
                if response.status_code == 200 and data.get("id"):
                    return {
                        "success": True,
                        "account_id": data.get("id"),
                        "name": data.get("name"),
                        "username": data.get("username"),
                        "profile_picture": data.get("profile_picture_url"),
                        "followers": data.get("followers_count")
                    }
                else:
                    return {
                        "success": False,
                        "error": data.get("error", {}).get("message", "Failed to get account info")
                    }
        
        except Exception as e:
            logger.error(f"Exception in get_account_info: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
