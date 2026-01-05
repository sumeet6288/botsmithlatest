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
    Verify Razorpay payment and activate subscription
    
    IDEMPOTENCY FIX (2025-01-XX):
    - Checks if payment_id has already been processed
    - Prevents double subscription extensions from duplicate webhook/callback calls
    """
    try:
        # IDEMPOTENCY CHECK: Ensure this payment hasn't been processed before
        existing_payment = await subscriptions_collection.find_one({
            "razorpay_payment_id": request.razorpay_payment_id
        })
        
        if existing_payment:
            logger.warning(f"Payment {request.razorpay_payment_id} already processed for user {current_user.id}. Skipping duplicate processing.")
            plan = await plans_collection.find_one({"id": existing_payment.get('plan_id', 'starter')})
            return PaymentResponse(
                success=True,
                message="Payment already verified (idempotency check)",
                subscription_id=request.razorpay_subscription_id,
                data={
                    "plan_id": existing_payment.get('plan_id'),
                    "plan_name": plan.get('name') if plan else 'Starter',
                    "expires_at": existing_payment.get('expires_at').isoformat() if existing_payment.get('expires_at') else None,
                    "status": "active",
                    "note": "This payment was already processed previously"
                }
            )
        
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

        # Update or create subscription in database
        existing_subscription = await subscriptions_collection.find_one({"user_id": current_user.id})
        
        # NEW SUBSCRIPTION MODEL (2025):
        # - Upgrading from FREE to PAID: Starts fresh with exactly 30 days (no carry-forward)
        # - Plan changes: Always start fresh with 30 days
        # - RENEWALS of SAME paid plan: Extend from current expiration (preserve remaining days)
        
        # Default: Always start fresh with 30 days from now
        expires_at = datetime.utcnow() + timedelta(days=30)
        
        # Check if this is a RENEWAL (same plan) or UPGRADE/NEW (different plan)
        is_renewal = existing_subscription and existing_subscription.get('plan_id') == plan_id
        
        # Only extend from current expiration for RENEWALS of the SAME PAID plan
        # This preserves remaining days when renewing before expiration
        if is_renewal:
            if existing_subscription.get('status') == 'active' and existing_subscription.get('expires_at'):
                current_expires = existing_subscription['expires_at']
                if isinstance(current_expires, str):
                    current_expires = datetime.fromisoformat(current_expires.replace('Z', '+00:00'))
                
                # If not expired yet, extend from current expiration (renewal scenario)
                if current_expires > datetime.utcnow():
                    expires_at = current_expires + timedelta(days=30)
        
        # For plan upgrades/downgrades from FREE to PAID, always start fresh (no carry-forward)
        subscription_data = {
            "user_id": current_user.id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": datetime.utcnow(),
            "expires_at": expires_at,
            "billing_cycle": "monthly",
            "auto_renew": True,
            "razorpay_subscription_id": request.razorpay_subscription_id,
            "razorpay_payment_id": request.razorpay_payment_id,
            "updated_at": datetime.utcnow()
        }

        if existing_subscription:
            await subscriptions_collection.update_one(
                {"user_id": current_user.id},
                {"$set": subscription_data}
            )
        else:
            subscription_data['created_at'] = datetime.utcnow()
            subscription_data['usage'] = {
                "chatbots": 0,
                "messages": 0,
                "file_uploads": 0,
                "website_sources": 0,
                "text_sources": 0
            }
            await subscriptions_collection.insert_one(subscription_data)

        # Update user's plan_id
        await users_collection.update_one(
            {"id": current_user.id},
            {"$set": {"plan_id": plan_id, "updated_at": datetime.utcnow()}}
        )

        logger.info(f"Payment verified and subscription activated for user {current_user.id}, plan: {plan_id}, payment_id: {request.razorpay_payment_id}")

        return PaymentResponse(
            success=True,
            message="Payment verified and subscription activated successfully",
            subscription_id=request.razorpay_subscription_id,
            data={
                "plan_id": plan_id,
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
