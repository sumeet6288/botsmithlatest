from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timedelta
import os
import razorpay
import hmac
import hashlib
import logging

from auth import get_current_user
from models import User
from motor.motor_asyncio import AsyncIOMotorClient
from services.subscription_service import SubscriptionService

router = APIRouter(prefix="/razorpay", tags=["Razorpay Payment"])

logger = logging.getLogger(__name__)

# MongoDB setup
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]
subscriptions_collection = db.subscriptions
users_collection = db.users
plans_collection = db.plans

# Initialize SubscriptionService
subscription_service = SubscriptionService(db)

# Razorpay Configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
RAZORPAY_STARTER_PLAN_ID = os.environ.get('RAZORPAY_STARTER_PLAN_ID', '')
RAZORPAY_PROFESSIONAL_PLAN_ID = os.environ.get('RAZORPAY_PROFESSIONAL_PLAN_ID', '')

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# Models
class CreateSubscriptionRequest(BaseModel):
    plan_id: str = Field(description="Plan ID (starter or professional)")
    customer_name: str = Field(description="Customer name")
    customer_email: str = Field(description="Customer email")
    customer_phone: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    razorpay_subscription_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[str] = None
    data: Optional[Dict] = None


# Helper Functions
def get_razorpay_plan_id(plan_id: str) -> str:
    """Map internal plan ID to Razorpay plan ID"""
    plan_mapping = {
        "starter": RAZORPAY_STARTER_PLAN_ID,
        "professional": RAZORPAY_PROFESSIONAL_PLAN_ID
    }
    return plan_mapping.get(plan_id.lower(), "")


def verify_payment_signature(subscription_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature"""
    try:
        message = f"{subscription_id}|{payment_id}"
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(generated_signature, signature)
    except Exception as e:
        logger.error(f"Error verifying signature: {str(e)}")
        return False


# Endpoints
@router.get("/config")
async def get_razorpay_config():
    """Get Razorpay public configuration"""
    return {
        "key_id": RAZORPAY_KEY_ID,
        "plans": {
            "starter": RAZORPAY_STARTER_PLAN_ID,
            "professional": RAZORPAY_PROFESSIONAL_PLAN_ID
        }
    }


@router.post("/create-subscription", response_model=PaymentResponse)
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Create a Razorpay subscription
    """
    try:
        # Get Razorpay plan ID
        razorpay_plan_id = get_razorpay_plan_id(request.plan_id)
        if not razorpay_plan_id:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid plan ID: {request.plan_id}"
            )

        # Create subscription in Razorpay
        subscription_data = {
            "plan_id": razorpay_plan_id,
            "customer_notify": 1,
            "quantity": 1,
            "total_count": 12,  # 12 monthly payments
            "notes": {
                "user_id": current_user.id,
                "user_email": current_user.email,
                "plan_id": request.plan_id
            }
        }

        razorpay_subscription = razorpay_client.subscription.create(subscription_data)

        logger.info(f"Razorpay subscription created: {razorpay_subscription['id']} for user {current_user.id}")

        return PaymentResponse(
            success=True,
            message="Subscription created successfully",
            subscription_id=razorpay_subscription['id'],
            data={
                "subscription_id": razorpay_subscription['id'],
                "status": razorpay_subscription['status'],
                "short_url": razorpay_subscription.get('short_url'),
                "plan_id": request.plan_id
            }
        )

    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay BadRequest: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")


@router.post("/verify-payment", response_model=PaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Verify Razorpay payment and activate subscription.
    
    NOW USES SubscriptionService (SINGLE SOURCE OF TRUTH):
    - All payment processing delegated to SubscriptionService
    - Idempotency handled automatically
    - Consistent duration calculation
    - Prevents 59-65 day bug
    """
    try:
        logger.info(f"[VERIFY-PAYMENT] User {current_user.id} verifying payment {request.razorpay_payment_id}")
        
        # Verify payment signature
        is_valid = verify_payment_signature(
            request.razorpay_subscription_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        )

        if not is_valid:
            logger.warning(f"Invalid payment signature for user {current_user.id}")
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        # Fetch subscription details from Razorpay
        razorpay_subscription = razorpay_client.subscription.fetch(request.razorpay_subscription_id)
        
        # Get plan ID from notes
        plan_id = razorpay_subscription.get('notes', {}).get('plan_id', 'starter')
        
        # Get plan details from database
        plan = await plans_collection.find_one({"id": plan_id})
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        # 🎯 DELEGATE TO SUBSCRIPTION SERVICE (SINGLE SOURCE OF TRUTH)
        result = await subscription_service.process_payment_idempotent(
            payment_id=request.razorpay_payment_id,
            user_id=current_user.id,
            plan_id=plan_id,
            payment_source="verify_payment"
        )
        
        # Update razorpay_subscription_id for tracking
        await subscriptions_collection.update_one(
            {"user_id": current_user.id},
            {"$set": {"razorpay_subscription_id": request.razorpay_subscription_id}}
        )
        
        # Handle result
        if result.get('status') == 'already_processed':
            logger.info(f"[VERIFY-PAYMENT] Payment {request.razorpay_payment_id} already processed - idempotency working")
            subscription_data = result.get('subscription', {})
            return PaymentResponse(
                success=True,
                message="Payment already verified (idempotency)",
                subscription_id=request.razorpay_subscription_id,
                data={
                    "plan_id": subscription_data.get('plan_id'),
                    "plan_name": plan.get('name'),
                    "expires_at": subscription_data.get('expires_at').isoformat() if subscription_data.get('expires_at') else None,
                    "status": "active",
                    "note": "This payment was already processed"
                }
            )
        
        # Successfully processed
        subscription_data = result.get('subscription', {})
        logger.info(f"[VERIFY-PAYMENT] Successfully processed payment {request.razorpay_payment_id} for user {current_user.id}")

        return PaymentResponse(
            success=True,
            message="Payment verified and subscription activated successfully",
            subscription_id=request.razorpay_subscription_id,
            data={
                "plan_id": plan_id,
                "plan_name": plan.get('name'),
                "expires_at": subscription_data.get('expires_at').isoformat() if subscription_data.get('expires_at') else None,
                "status": "active",
                "duration_days": result.get('duration_days', 30),
                "action_type": result.get('action_type')
            }
        )
                "plan_name": plan.get('name'),
                "expires_at": subscription_data['expires_at'].isoformat(),
                "status": "active"
            }
        )

    except HTTPException:
        raise
    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay error verifying payment: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")


@router.get("/subscription-status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """
    Get current subscription status from Razorpay
    """
    try:
        subscription = await subscriptions_collection.find_one({"user_id": current_user.id})
        
        if not subscription or not subscription.get('razorpay_subscription_id'):
            return {
                "has_subscription": False,
                "message": "No active Razorpay subscription found"
            }

        razorpay_subscription_id = subscription['razorpay_subscription_id']
        
        # Fetch from Razorpay
        razorpay_subscription = razorpay_client.subscription.fetch(razorpay_subscription_id)

        return {
            "has_subscription": True,
            "subscription_id": razorpay_subscription_id,
            "status": razorpay_subscription['status'],
            "plan_id": subscription.get('plan_id'),
            "current_start": razorpay_subscription.get('current_start'),
            "current_end": razorpay_subscription.get('current_end'),
            "charge_at": razorpay_subscription.get('charge_at'),
            "local_expires_at": subscription.get('expires_at')
        }

    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay error fetching subscription: {str(e)}")
        return {
            "has_subscription": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error fetching subscription status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel-subscription")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """
    Cancel Razorpay subscription
    """
    try:
        subscription = await subscriptions_collection.find_one({"user_id": current_user.id})
        
        if not subscription or not subscription.get('razorpay_subscription_id'):
            raise HTTPException(status_code=404, detail="No active subscription found")

        razorpay_subscription_id = subscription['razorpay_subscription_id']
        
        # Cancel in Razorpay
        razorpay_client.subscription.cancel(razorpay_subscription_id)

        # Update local database
        await subscriptions_collection.update_one(
            {"user_id": current_user.id},
            {
                "$set": {
                    "auto_renew": False,
                    "status": "cancelled",
                    "updated_at": datetime.utcnow()
                }
            }
        )

        logger.info(f"Subscription cancelled for user {current_user.id}")

        return {
            "success": True,
            "message": "Subscription cancelled successfully"
        }

    except razorpay.errors.BadRequestError as e:
        logger.error(f"Razorpay error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def razorpay_webhook(payload: Dict):
    """
    Handle Razorpay webhooks for subscription events
    
    IDEMPOTENCY FIX (2025-01-XX):
    - Tracks processed payment IDs to prevent duplicate subscription extensions
    - Ensures each payment is processed exactly once
    """
    try:
        event = payload.get('event')
        entity = payload.get('payload', {}).get('subscription', {}).get('entity', {})
        payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        payment_id = payment_entity.get('id') if payment_entity else None
        
        logger.info(f"Received Razorpay webhook: {event}, payment_id: {payment_id}")

        if event == 'subscription.charged':
            # Subscription payment successful
            subscription_id = entity.get('id')
            notes = entity.get('notes', {})
            user_id = notes.get('user_id')
            plan_id = notes.get('plan_id')

            if user_id and payment_id:
                # IDEMPOTENCY CHECK: Ensure this payment hasn't been processed
                # Check if payment_id exists in subscriptions collection
                existing_payment = await subscriptions_collection.find_one({
                    "razorpay_payment_id": payment_id
                })
                
                if existing_payment:
                    logger.warning(f"Payment {payment_id} already processed for user {user_id}. Skipping duplicate webhook processing.")
                    return {"status": "success", "message": "Payment already processed"}
                
                # Get existing subscription
                subscription = await subscriptions_collection.find_one({"user_id": user_id})
                if subscription:
                    # Check if this is an upgrade or renewal
                    old_plan_id = subscription.get('plan_id')
                    is_upgrade = (old_plan_id != plan_id) if plan_id else False
                    
                    if is_upgrade:
                        # UPGRADE: Start fresh with 30 days
                        new_expires = datetime.utcnow() + timedelta(days=30)
                        logger.info(f"Plan upgrade detected for user {user_id}: {old_plan_id} → {plan_id}. Starting fresh with 30 days.")
                    else:
                        # RENEWAL: Extend from current expiration
                        current_expires = subscription.get('expires_at', datetime.utcnow())
                        if isinstance(current_expires, str):
                            current_expires = datetime.fromisoformat(current_expires.replace('Z', '+00:00'))
                        
                        if current_expires > datetime.utcnow():
                            new_expires = current_expires + timedelta(days=30)
                            logger.info(f"Renewal detected for user {user_id}. Extending from {current_expires} to {new_expires}")
                        else:
                            new_expires = datetime.utcnow() + timedelta(days=30)
                            logger.info(f"Expired subscription renewal for user {user_id}. Starting fresh with 30 days.")
                    
                    # Update subscription with payment_id to prevent duplicate processing
                    await subscriptions_collection.update_one(
                        {"user_id": user_id},
                        {
                            "$set": {
                                "expires_at": new_expires,
                                "status": "active",
                                "razorpay_payment_id": payment_id,
                                "razorpay_subscription_id": subscription_id,
                                "plan_id": plan_id if plan_id else subscription.get('plan_id'),
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
                    logger.info(f"Subscription updated for user {user_id}, expires_at: {new_expires}, payment_id: {payment_id}")

        elif event == 'subscription.cancelled':
            # Subscription cancelled
            subscription_id = entity.get('id')
            
            # Find and update subscription
            await subscriptions_collection.update_one(
                {"razorpay_subscription_id": subscription_id},
                {
                    "$set": {
                        "status": "cancelled",
                        "auto_renew": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            logger.info(f"Subscription {subscription_id} cancelled via webhook")

        elif event == 'subscription.completed':
            # Subscription completed
            subscription_id = entity.get('id')
            
            await subscriptions_collection.update_one(
                {"razorpay_subscription_id": subscription_id},
                {
                    "$set": {
                        "status": "completed",
                        "auto_renew": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            logger.info(f"Subscription {subscription_id} completed via webhook")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return {"status": "error", "message": str(e)}
