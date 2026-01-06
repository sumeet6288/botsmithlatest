from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
import os
import httpx
import logging

router = APIRouter(prefix="/admin/payment-settings", tags=["Admin Payment Settings"])

logger = logging.getLogger(__name__)

# MongoDB collection
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'chatbase_db')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]
payment_settings_collection = db['payment_settings']


# Models
class RazorpayPlans(BaseModel):
    free: str = ""
    starter: str = ""
    professional: str = ""
    enterprise: str = ""


class RazorpaySettings(BaseModel):
    enabled: bool = False
    test_mode: bool = True
    key_id: str = ""
    key_secret: str = ""
    webhook_url: str = ""
    webhook_secret: str = ""
    plans: RazorpayPlans = Field(default_factory=RazorpayPlans)


class PaymentSettings(BaseModel):
    razorpay: RazorpaySettings = Field(default_factory=RazorpaySettings)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None


class TestConnectionRequest(BaseModel):
    api_key: str
    store_id: str
    test_mode: bool = True


class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    store_name: Optional[str] = None


# Helper function to get current user (mock for now)
def get_mock_user():
    return {"id": "admin-001", "email": "sumeetemail26@gmail.com", "role": "admin"}


# Endpoints
@router.get("", response_model=PaymentSettings)
async def get_payment_settings():
    """
    Get current payment gateway settings
    """
    try:
        settings = await payment_settings_collection.find_one({})
        
        if not settings:
            # Return default settings
            default_settings = PaymentSettings()
            return default_settings
        
        # Remove MongoDB _id field
        settings.pop('_id', None)
        
        return PaymentSettings(**settings)
    except Exception as e:
        logger.error(f"Error fetching payment settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch payment settings: {str(e)}")


@router.put("", response_model=PaymentSettings)
async def update_payment_settings(settings: PaymentSettings):
    """
    Update payment gateway settings
    """
    try:
        user = get_mock_user()
        
        # Update timestamp and user
        settings.updated_at = datetime.utcnow()
        settings.updated_by = user['id']
        
        # Convert to dict
        settings_dict = settings.model_dump()
        
        # Upsert settings (update if exists, insert if not)
        await payment_settings_collection.delete_many({})  # Only keep one settings document
        await payment_settings_collection.insert_one(settings_dict)
        
        logger.info(f"Payment settings updated by user {user['id']}")
        
        # Remove MongoDB _id for response
        settings_dict.pop('_id', None)
        
        return PaymentSettings(**settings_dict)
    except Exception as e:
        logger.error(f"Error updating payment settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update payment settings: {str(e)}")


@router.post("/test", response_model=TestConnectionResponse)
async def test_razorpay_connection(request: TestConnectionRequest):
    """
    Test Razorpay API connection
    """
    try:
        if not request.api_key or not request.store_id:
            raise HTTPException(
                status_code=400, 
                detail="Key ID and Key Secret are required"
            )
        
        # Test Razorpay API connection
        # Note: api_key = key_id, store_id = key_secret for Razorpay
        key_id = request.api_key
        key_secret = request.store_id
        
        async with httpx.AsyncClient() as client:
            # Try to fetch payment methods to verify credentials
            response = await client.get(
                "https://api.razorpay.com/v1/methods",
                auth=(key_id, key_secret),
                timeout=10.0
            )
            
            if response.status_code == 200:
                mode_text = " (Test Mode)" if request.test_mode else " (Live Mode)"
                
                return TestConnectionResponse(
                    success=True,
                    message=f"Successfully connected to Razorpay!{mode_text}",
                    store_name="Razorpay Account"
                )
            elif response.status_code == 401:
                return TestConnectionResponse(
                    success=False,
                    message="Invalid API credentials. Please check your Key ID and Key Secret."
                )
            else:
                return TestConnectionResponse(
                    success=False,
                    message=f"Connection failed with status code: {response.status_code}"
                )
                
    except httpx.TimeoutException:
        return TestConnectionResponse(
            success=False,
            message="Connection timeout. Please check your network or try again."
        )
    except httpx.RequestError as e:
        logger.error(f"Network error testing Razorpay connection: {str(e)}")
        return TestConnectionResponse(
            success=False,
            message=f"Network error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error testing Razorpay connection: {str(e)}")
        return TestConnectionResponse(
            success=False,
            message=f"Error: {str(e)}"
        )


@router.post("/fetch-products")
async def fetch_razorpay_plans(request: TestConnectionRequest):
    """
    Fetch all plans from Razorpay account
    """
    try:
        if not request.api_key or not request.store_id:
            raise HTTPException(
                status_code=400, 
                detail="Key ID and Key Secret are required"
            )
        
        # Note: api_key = key_id, store_id = key_secret for Razorpay
        key_id = request.api_key
        key_secret = request.store_id
        
        async with httpx.AsyncClient() as client:
            # Fetch plans
            response = await client.get(
                "https://api.razorpay.com/v1/plans",
                auth=(key_id, key_secret),
                timeout=15.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch plans from Razorpay"
                )
            
            plans_data = response.json()
            plans = []
            
            # Process each plan
            for plan in plans_data.get('items', []):
                plans.append({
                    "id": plan.get('id'),
                    "name": plan.get('item', {}).get('name', 'Unnamed Plan'),
                    "amount": plan.get('item', {}).get('amount', 0) / 100,  # Convert paise to rupees
                    "currency": plan.get('item', {}).get('currency', 'INR'),
                    "period": plan.get('period'),
                    "interval": plan.get('interval')
                })
            
            return {
                "success": True,
                "plans": plans
            }
                
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="Request timeout. Please try again."
        )
    except httpx.RequestError as e:
        logger.error(f"Network error fetching plans: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Network error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error fetching plans: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )


@router.delete("")
async def delete_payment_settings():
    """
    Reset payment gateway settings to default
    """
    try:
        user = get_mock_user()
        
        await payment_settings_collection.delete_many({})
        
        logger.info(f"Payment settings reset by user {user['id']}")
        
        return {"success": True, "message": "Payment settings reset to default"}
    except Exception as e:
        logger.error(f"Error resetting payment settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset payment settings: {str(e)}")
