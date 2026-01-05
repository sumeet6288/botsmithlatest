"""
Microsoft Teams Bot Service
Handles MS Teams bot operations including message sending and authentication
"""
import httpx
import jwt
import time
from typing import Dict, Optional
from datetime import datetime, timedelta


class MSTeamsService:
    """Service for Microsoft Teams Bot Framework operations"""
    
    def __init__(self, app_id: str, app_password: str):
        self.app_id = app_id
        self.app_password = app_password
        self.base_url = "https://smba.trafficmanager.net/apis"
        self.auth_url = "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token"
        self.access_token = None
        self.token_expiry = None
    
    async def get_access_token(self) -> str:
        """Get or refresh Bot Framework access token"""
        # Return cached token if still valid
        if self.access_token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.access_token
        
        # Request new token
        async with httpx.AsyncClient() as client:
            data = {
                "grant_type": "client_credentials",
                "client_id": self.app_id,
                "client_secret": self.app_password,
                "scope": "https://api.botframework.com/.default"
            }
            
            response = await client.post(self.auth_url, data=data, timeout=10.0)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data["access_token"]
            # Set expiry 5 minutes before actual expiry for safety
            expires_in = token_data.get("expires_in", 3600)
            self.token_expiry = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return self.access_token
    
    async def send_message(self, service_url: str, conversation_id: str, message: str, activity_id: Optional[str] = None) -> Dict:
        """
        Send a message to MS Teams conversation
        
        Args:
            service_url: The service URL from the incoming activity
            conversation_id: The conversation ID
            message: Message text to send
            activity_id: Optional activity ID to reply to
        """
        try:
            token = await self.get_access_token()
            
            # Construct message activity
            activity = {
                "type": "message",
                "text": message,
                "from": {
                    "id": self.app_id,
                    "name": "Bot"
                }
            }
            
            # Add reply context if activity_id provided
            if activity_id:
                activity["replyToId"] = activity_id
            
            # Send message
            url = f"{service_url}/v3/conversations/{conversation_id}/activities"
            if activity_id:
                url = f"{service_url}/v3/conversations/{conversation_id}/activities/{activity_id}"
            
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                response = await client.post(url, json=activity, headers=headers, timeout=30.0)
                response.raise_for_status()
                
                return {"success": True, "data": response.json()}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def validate_credentials(self) -> Dict:
        """Validate MS Teams bot credentials by requesting a token"""
        try:
            await self.get_access_token()
            return {"success": True, "message": "MS Teams credentials validated successfully"}
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 400:
                return {"success": False, "message": "Invalid App ID or App Password"}
            elif e.response.status_code == 401:
                return {"success": False, "message": "Unauthorized - Invalid credentials"}
            else:
                return {"success": False, "message": f"Authentication failed: {e.response.status_code}"}
        except Exception as e:
            return {"success": False, "message": f"Connection test failed: {str(e)}"}
    
    async def get_conversation_members(self, service_url: str, conversation_id: str) -> Dict:
        """Get members of a conversation"""
        try:
            token = await self.get_access_token()
            
            url = f"{service_url}/v3/conversations/{conversation_id}/members"
            
            async with httpx.AsyncClient() as client:
                headers = {"Authorization": f"Bearer {token}"}
                response = await client.get(url, headers=headers, timeout=10.0)
                response.raise_for_status()
                
                return {"success": True, "members": response.json()}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def verify_jwt_token(token: str, app_id: str) -> bool:
        """
        Verify JWT token from MS Teams request
        Note: This is a simplified verification. In production, you should validate against MS public keys
        """
        try:
            # Decode without verification (for development)
            # In production, fetch and validate against MS signing keys
            decoded = jwt.decode(token, options={"verify_signature": False})
            
            # Verify audience (should be your app ID)
            if decoded.get("aud") != app_id:
                return False
            
            # Verify issuer
            if not decoded.get("iss", "").startswith("https://api.botframework.com"):
                return False
            
            # Verify expiration
            exp = decoded.get("exp", 0)
            if exp < time.time():
                return False
            
            return True
            
        except Exception:
            return False
    
    async def create_conversation(self, service_url: str, bot_id: str, user_id: str, tenant_id: Optional[str] = None) -> Dict:
        """Create a new conversation with a user"""
        try:
            token = await self.get_access_token()
            
            conversation_params = {
                "bot": {"id": bot_id},
                "members": [{"id": user_id}],
                "isGroup": False
            }
            
            if tenant_id:
                conversation_params["tenantId"] = tenant_id
            
            url = f"{service_url}/v3/conversations"
            
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                
                response = await client.post(url, json=conversation_params, headers=headers, timeout=10.0)
                response.raise_for_status()
                
                return {"success": True, "conversation": response.json()}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
