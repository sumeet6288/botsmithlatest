"""Razorpay API service for payment and subscription management."""
import os
import httpx
import logging
from typing import Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')

class RazorpayService:
    """Service for interacting with Razorpay API."""
    
    def __init__(self):
        """Initialize Razorpay service with credentials from database."""
        self.base_url = "https://api.razorpay.com/v1"
        self.key_id = None
        self.key_secret = None
        
        # Try to load from database settings
        try:
            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            # Note: This is sync init, actual fetch should be async
            # We'll handle credentials in each method
        except Exception as e:
            logger.warning(f"Failed to connect to database in init: {e}")
            # Fallback to environment variables
            self.key_id = os.environ.get('RAZORPAY_KEY_ID')
            self.key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    async def _get_credentials(self) -> tuple:
        """Get Razorpay credentials from database settings."""
        try:
            client = AsyncIOMotorClient(MONGO_URL)
            db = client[DB_NAME]
            settings = await db.payment_settings.find_one({})
            
            if settings and settings.get('razorpay', {}).get('enabled'):
                self.key_id = settings['razorpay'].get('key_id')
                self.key_secret = settings['razorpay'].get('key_secret')
                logger.info("Using Razorpay credentials from database")
            else:
                # Fallback to environment variables
                self.key_id = os.environ.get('RAZORPAY_KEY_ID')
                self.key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
                logger.warning("Using fallback environment variables for Razorpay")
        except Exception as e:
            logger.error(f"Error loading Razorpay credentials: {e}")
            self.key_id = os.environ.get('RAZORPAY_KEY_ID')
            self.key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
        
        return self.key_id, self.key_secret
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers required for all Razorpay API requests."""
        return {
            "Content-Type": "application/json"
        }
    
    async def create_subscription(self, plan_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a subscription in Razorpay.
        
        Args:
            plan_id: Razorpay plan ID
            customer_data: Customer information (name, email, contact)
        
        Returns:
            Subscription data from Razorpay
        """
        key_id, key_secret = await self._get_credentials()
        
        if not key_id or not key_secret:
            raise ValueError("Razorpay is not configured. Please configure it in Admin Panel > Payment Gateway Settings.")
        
        try:
            # Get backend URL for callback
            backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://secure-pay-17.preview.emergentagent.com')
            
            data = {
                "plan_id": plan_id,
                "total_count": 12,  # 12 billing cycles
                "quantity": 1,
                "customer_notify": 1,
                "notes": {
                    "user_id": customer_data.get("user_id"),
                    "plan_name": customer_data.get("plan_name"),
                    "plan_id": customer_data.get("plan_name")  # Store plan_id for webhook
                },
                "notify_info": {
                    "notify_email": customer_data.get("email")
                }
            }
            
            # Note: callback_url and callback_method are NOT supported in subscription.create API
            # Razorpay subscriptions use webhooks for notifications instead
            # The payment redirect happens automatically through short_url provided in response
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/subscriptions",
                    auth=(key_id, key_secret),
                    headers=self._get_headers(),
                    json=data,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_msg = response.json().get('error', {}).get('description', 'Unknown error')
                    raise Exception(f"Razorpay API error: {error_msg}")
        
        except httpx.TimeoutException:
            raise Exception("Request timeout. Please try again.")
        except Exception as e:
            logger.error(f"Error creating Razorpay subscription: {e}")
            raise
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Cancel a subscription in Razorpay.
        
        Args:
            subscription_id: Razorpay subscription ID
        
        Returns:
            Cancellation response
        """
        key_id, key_secret = await self._get_credentials()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/subscriptions/{subscription_id}/cancel",
                    auth=(key_id, key_secret),
                    headers=self._get_headers(),
                    json={"cancel_at_cycle_end": 0},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_msg = response.json().get('error', {}).get('description', 'Unknown error')
                    raise Exception(f"Razorpay API error: {error_msg}")
        
        except Exception as e:
            logger.error(f"Error canceling Razorpay subscription: {e}")
            raise
    
    async def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Get subscription details from Razorpay.
        
        Args:
            subscription_id: Razorpay subscription ID
        
        Returns:
            Subscription details
        """
        key_id, key_secret = await self._get_credentials()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/subscriptions/{subscription_id}",
                    auth=(key_id, key_secret),
                    headers=self._get_headers(),
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_msg = response.json().get('error', {}).get('description', 'Unknown error')
                    raise Exception(f"Razorpay API error: {error_msg}")
        
        except Exception as e:
            logger.error(f"Error fetching Razorpay subscription: {e}")
            raise
    
    async def pause_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Pause a subscription in Razorpay.
        
        Args:
            subscription_id: Razorpay subscription ID
        
        Returns:
            Pause response
        """
        key_id, key_secret = await self._get_credentials()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/subscriptions/{subscription_id}/pause",
                    auth=(key_id, key_secret),
                    headers=self._get_headers(),
                    json={"pause_at": "now"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_msg = response.json().get('error', {}).get('description', 'Unknown error')
                    raise Exception(f"Razorpay API error: {error_msg}")
        
        except Exception as e:
            logger.error(f"Error pausing Razorpay subscription: {e}")
            raise
    
    async def resume_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Resume a paused subscription in Razorpay.
        
        Args:
            subscription_id: Razorpay subscription ID
        
        Returns:
            Resume response
        """
        key_id, key_secret = await self._get_credentials()
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/subscriptions/{subscription_id}/resume",
                    auth=(key_id, key_secret),
                    headers=self._get_headers(),
                    json={"resume_at": "now"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    error_msg = response.json().get('error', {}).get('description', 'Unknown error')
                    raise Exception(f"Razorpay API error: {error_msg}")
        
        except Exception as e:
            logger.error(f"Error resuming Razorpay subscription: {e}")
            raise
