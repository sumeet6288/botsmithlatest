"""Razorpay subscription and payment management routes."""
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
import logging
import hmac
import hashlib
import os
from services.razorpay_service import RazorpayService
from services.subscription_service import SubscriptionService
from auth import get_current_user, User

logger = logging.getLogger(__name__)
router = APIRouter(tags=["razorpay"])

# Database instance
_db = None
_subscription_service = None

def init_router(db):
    """Initialize router with database instance."""
    global _db, _subscription_service
    _db = db
    _subscription_service = SubscriptionService(db)


class CreateSubscriptionRequest(BaseModel):
    """Request model for creating a subscription."""
    plan_id: str  # starter, professional, etc.


class SubscriptionActionRequest(BaseModel):
    """Request model for subscription actions."""
    subscription_id: str


@router.post("/create-subscription")
async def create_subscription(
    request: CreateSubscriptionRequest, 
    current_user: User = Depends(get_current_user)
):
    """
    Create a Razorpay subscription for a plan.
    
    Requires authentication. Uses authenticated user's details.
    Returns the subscription details and checkout URL.
    """
    try:
        # Get payment settings from database
        payment_settings = await _db.payment_settings.find_one({})
        
        if not payment_settings or not payment_settings.get('razorpay', {}).get('enabled'):
            raise HTTPException(
                status_code=400,
                detail="Razorpay payment gateway is not enabled. Please contact administrator."
            )
        
        # Get plan ID from payment settings
        plans_mapping = payment_settings.get('razorpay', {}).get('plans', {})
        razorpay_plan_id = plans_mapping.get(request.plan_id.lower())
        
        if not razorpay_plan_id:
            raise HTTPException(
                status_code=400,
                detail=f"Plan {request.plan_id} does not have a Razorpay plan ID configured in Payment Gateway settings. Please contact administrator."
            )
        
        # Create subscription using authenticated user's data
        service = RazorpayService()
        
        customer_data = {
            "user_id": current_user.id,
            "plan_name": request.plan_id,
            "email": current_user.email,
            "name": current_user.name or current_user.email.split('@')[0],
            "contact": getattr(current_user, 'phone', None)
        }
        
        result = await service.create_subscription(
            plan_id=razorpay_plan_id,
            customer_data=customer_data
        )
        
        # Store subscription details in database
        subscription_data = {
            "subscription_id": result.get("id"),
            "user_id": current_user.id,
            "plan_id": request.plan_id,
            "razorpay_plan_id": razorpay_plan_id,
            "status": result.get("status"),
            "created_at": result.get("created_at"),
            "razorpay_data": result
        }
        
        await _db.razorpay_subscriptions.insert_one(subscription_data)
        
        return {
            "success": True,
            "subscription_id": result.get("id"),
            "checkout_url": result.get("short_url"),
            "short_url": result.get("short_url"),
            "status": result.get("status"),
            "data": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create subscription: {str(e)}"
        )


@router.post("/cancel-subscription")
async def cancel_subscription(request: SubscriptionActionRequest):
    """
    Cancel a Razorpay subscription.
    """
    try:
        service = RazorpayService()
        result = await service.cancel_subscription(request.subscription_id)
        
        # Update database
        await _db.razorpay_subscriptions.update_one(
            {"subscription_id": request.subscription_id},
            {"$set": {"status": "cancelled"}}
        )
        
        return {
            "success": True,
            "message": "Subscription cancelled successfully",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel subscription: {str(e)}"
        )


@router.post("/pause-subscription")
async def pause_subscription(request: SubscriptionActionRequest):
    """
    Pause a Razorpay subscription.
    """
    try:
        service = RazorpayService()
        result = await service.pause_subscription(request.subscription_id)
        
        # Update database
        await _db.razorpay_subscriptions.update_one(
            {"subscription_id": request.subscription_id},
            {"$set": {"status": "paused"}}
        )
        
        return {
            "success": True,
            "message": "Subscription paused successfully",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error pausing subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to pause subscription: {str(e)}"
        )


@router.post("/resume-subscription")
async def resume_subscription(request: SubscriptionActionRequest):
    """
    Resume a paused Razorpay subscription.
    """
    try:
        service = RazorpayService()
        result = await service.resume_subscription(request.subscription_id)
        
        # Update database
        await _db.razorpay_subscriptions.update_one(
            {"subscription_id": request.subscription_id},
            {"$set": {"status": "active"}}
        )
        
        return {
            "success": True,
            "message": "Subscription resumed successfully",
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error resuming subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to resume subscription: {str(e)}"
        )


async def sync_subscription_to_main_collection(entity: dict, payment_id: str = None):
    """
    Sync Razorpay subscription data to main subscriptions collection.
    Updates user's plan and creates/updates subscription record.
    
    IDEMPOTENCY FIX (2025-01-XX):
    - Uses payment_id to ensure each payment is processed EXACTLY ONCE
    - Prevents double/triple extensions when webhooks fire multiple times
    - Ensures users get exactly 30 days on upgrade, not 59-65 days
    
    SUBSCRIPTION UPGRADE FIX (2025):
    - When upgrading from FREE to PAID: Start fresh with 30 days (no carry-forward)
    - When renewing SAME plan: Extend from current expiration (preserve remaining days)
    - This prevents the bug where FREE days get added to PAID subscription
    """
    from datetime import datetime, timedelta
    
    try:
        notes = entity.get('notes', {})
        user_id = notes.get('user_id')
        plan_id = notes.get('plan_id', notes.get('plan_name', 'starter'))
        subscription_id = entity.get('id')
        
        if not user_id:
            logger.warning(f"No user_id in subscription notes: {subscription_id}")
            return
        
        # IDEMPOTENCY CHECK: Ensure this payment hasn't been processed before
        # Use payment_id if available, otherwise use subscription_id + timestamp combination
        idempotency_key = payment_id or f"{subscription_id}_{int(datetime.utcnow().timestamp())}"
        
        # Check if this payment has already been processed
        existing_payment = await _db.processed_payments.find_one({
            "payment_id": idempotency_key,
            "user_id": user_id
        })
        
        if existing_payment:
            logger.warning(f"Payment {idempotency_key} already processed for user {user_id} at {existing_payment.get('processed_at')}. Skipping duplicate processing.")
            return
        
        # Get plan details from database
        plan = await _db.plans.find_one({"id": plan_id})
        if not plan:
            logger.warning(f"Plan not found: {plan_id}")
            return
        
        # Check if subscription exists
        existing_subscription = await _db.subscriptions.find_one({"user_id": user_id})
        
        # CRITICAL FIX: Distinguish between UPGRADE and RENEWAL
        # - UPGRADE: Plan changed (e.g., free → starter) → Start fresh with 30 days
        # - RENEWAL: Same plan → Extend from current expiration (preserve remaining days)
        
        is_plan_upgrade = False
        if existing_subscription:
            old_plan_id = existing_subscription.get('plan_id')
            is_plan_upgrade = (old_plan_id != plan_id)
            logger.info(f"User {user_id}: Plan transition from '{old_plan_id}' to '{plan_id}' - {'UPGRADE' if is_plan_upgrade else 'RENEWAL'}")
        
        # Calculate expiration date based on whether this is upgrade or renewal
        if is_plan_upgrade:
            # PLAN UPGRADE: Always start fresh with 30 days from now (no carry-forward from old plan)
            expires_at = datetime.utcnow() + timedelta(days=30)
            logger.info(f"Plan upgrade detected - starting fresh: expires_at = {expires_at}")
        elif existing_subscription and existing_subscription.get('status') == 'active':
            # RENEWAL: Preserve remaining days by extending from current expiration
            current_expires = existing_subscription.get('expires_at')
            if isinstance(current_expires, str):
                current_expires = datetime.fromisoformat(current_expires.replace('Z', '+00:00'))
            elif not isinstance(current_expires, datetime):
                current_expires = datetime.utcnow()
            
            # If not expired yet, extend from current expiration (renewal preserves remaining days)
            if current_expires > datetime.utcnow():
                expires_at = current_expires + timedelta(days=30)
                logger.info(f"Renewal detected - extending from current: {current_expires} → {expires_at}")
            else:
                expires_at = datetime.utcnow() + timedelta(days=30)
                logger.info(f"Expired renewal - starting fresh: expires_at = {expires_at}")
        else:
            # NEW SUBSCRIPTION: Start fresh with 30 days
            expires_at = datetime.utcnow() + timedelta(days=30)
            logger.info(f"New subscription - starting fresh: expires_at = {expires_at}")
        
        subscription_data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "expires_at": expires_at,
            "billing_cycle": "monthly",
            "auto_renew": True,
            "razorpay_subscription_id": subscription_id,
            "updated_at": datetime.utcnow()
        }
        
        if existing_subscription:
            await _db.subscriptions.update_one(
                {"user_id": user_id},
                {"$set": subscription_data}
            )
            logger.info(f"Updated subscription for user {user_id}")
        else:
            subscription_data['created_at'] = datetime.utcnow()
            subscription_data['started_at'] = datetime.utcnow()
            subscription_data['usage'] = {
                "chatbots": 0,
                "messages": 0,
                "file_uploads": 0,
                "website_sources": 0,
                "text_sources": 0
            }
            await _db.subscriptions.insert_one(subscription_data)
            logger.info(f"Created new subscription for user {user_id}")
        
        # Update user's plan_id
        await _db.users.update_one(
            {"id": user_id},
            {"$set": {"plan_id": plan_id, "updated_at": datetime.utcnow()}}
        )
        logger.info(f"Updated user {user_id} plan to {plan_id}")
        
        # MARK PAYMENT AS PROCESSED (Idempotency Record)
        await _db.processed_payments.insert_one({
            "payment_id": idempotency_key,
            "user_id": user_id,
            "subscription_id": subscription_id,
            "plan_id": plan_id,
            "processed_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_upgrade": is_plan_upgrade
        })
        logger.info(f"Marked payment {idempotency_key} as processed for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error syncing subscription to main collection: {str(e)}", exc_info=True)


@router.get("/payment-callback")
async def payment_callback(
    subscription_id: Optional[str] = None,
    payment_id: Optional[str] = None,
    user_id: Optional[str] = None,
    razorpay_subscription_id: Optional[str] = None,
    razorpay_payment_id: Optional[str] = None,
    razorpay_payment_link_status: Optional[str] = None
):
    """
    PUBLIC ENDPOINT - Handle callback after Razorpay payment page.
    No authentication required as Razorpay redirects here after payment.
    Redirects user to subscription page with success/error message, then auto-redirects to dashboard.
    """
    try:
        from fastapi.responses import RedirectResponse
        frontend_url = os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')
        
        # Check if payment was cancelled by user
        if razorpay_payment_link_status == 'cancelled':
            logger.info(f"Payment cancelled by user: {user_id}")
            return RedirectResponse(url=f"{frontend_url}/subscription?error=cancelled")
        
        # Use either subscription_id or razorpay_subscription_id
        sub_id = subscription_id or razorpay_subscription_id
        
        # If subscription_id provided, try to fetch and sync
        if sub_id and user_id:
            try:
                service = RazorpayService()
                razorpay_subscription = await service.get_subscription(sub_id)
                
                # Check subscription status
                subscription_status = razorpay_subscription.get('status')
                
                # Sync the subscription if payment was successful
                if subscription_status in ['active', 'authenticated']:
                    entity = razorpay_subscription
                    # Ensure user_id is in notes for sync function
                    if 'notes' not in entity:
                        entity['notes'] = {}
                    entity['notes']['user_id'] = user_id
                    
                    # Extract payment_id from callback for idempotency
                    callback_payment_id = payment_id or razorpay_payment_id
                    
                    await sync_subscription_to_main_collection(entity, payment_id=callback_payment_id)
                    
                    logger.info(f"Subscription synced successfully for user {user_id}: {sub_id}, payment_id: {callback_payment_id}")
                    # Redirect to subscription page with success (will auto-redirect to dashboard)
                    return RedirectResponse(url=f"{frontend_url}/subscription?success=true&subscription_id={sub_id}")
                
                # Handle failed payment status
                elif subscription_status in ['halted', 'cancelled', 'expired']:
                    logger.warning(f"Payment failed with status {subscription_status} for user {user_id}: {sub_id}")
                    return RedirectResponse(url=f"{frontend_url}/subscription?error=payment_failed")
                    
            except Exception as e:
                logger.error(f"Error syncing subscription on callback: {str(e)}")
                # Redirect with sync error (will auto-redirect to dashboard)
                return RedirectResponse(url=f"{frontend_url}/subscription?error=sync_failed")
        
        # If no subscription_id or user_id, redirect to subscription page
        logger.warning("Payment callback received without subscription_id or user_id")
        return RedirectResponse(url=f"{frontend_url}/subscription?error=payment_failed")
        
    except Exception as e:
        logger.error(f"Error in payment callback: {str(e)}")
        # Redirect to subscription page with error (will auto-redirect to dashboard)
        from fastapi.responses import RedirectResponse
        frontend_url = os.environ.get('FRONTEND_URL', 'https://botsmith-arch-1.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}/subscription?error=payment_failed")


@router.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Razorpay webhook events.
    """
    try:
        # Get webhook signature from headers
        signature = request.headers.get("X-Razorpay-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Get webhook body
        body = await request.body()
        
        # Verify signature
        payment_settings = await _db.payment_settings.find_one({})
        webhook_secret = payment_settings.get('razorpay', {}).get('webhook_secret', '')
        
        expected_signature = hmac.new(
            webhook_secret.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook payload
        import json
        payload = json.loads(body.decode('utf-8'))
        
        event_type = payload.get('event')
        entity = payload.get('payload', {}).get('subscription', {}).get('entity', {})
        
        logger.info(f"Received Razorpay webhook: {event_type}")
        
        # Extract payment_id from webhook payload for idempotency
        payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        payment_id = payment_entity.get('id') if payment_entity else None
        
        # Handle different event types
        if event_type == 'subscription.activated':
            # Update subscription status
            await _db.razorpay_subscriptions.update_one(
                {"subscription_id": entity.get('id')},
                {"$set": {"status": "active"}}
            )
            
            # Sync with main subscriptions collection (with payment_id for idempotency)
            await sync_subscription_to_main_collection(entity, payment_id=payment_id)
            
        elif event_type == 'subscription.charged':
            # Handle successful payment
            logger.info(f"Subscription charged: {entity.get('id')}, payment_id: {payment_id}")
            
            # Sync with main subscriptions collection on first payment (with payment_id for idempotency)
            await sync_subscription_to_main_collection(entity, payment_id=payment_id)
            
        elif event_type == 'subscription.cancelled':
            # Handle cancellation
            await _db.razorpay_subscriptions.update_one(
                {"subscription_id": entity.get('id')},
                {"$set": {"status": "cancelled"}}
            )
            
            # Update main subscriptions collection
            notes = entity.get('notes', {})
            user_id = notes.get('user_id')
            if user_id:
                await _db.subscriptions.update_one(
                    {"user_id": user_id},
                    {"$set": {"status": "cancelled", "auto_renew": False}}
                )
            
        elif event_type == 'subscription.paused':
            # Handle pause
            await _db.razorpay_subscriptions.update_one(
                {"subscription_id": entity.get('id')},
                {"$set": {"status": "paused"}}
            )
            
            # Update main subscriptions collection
            notes = entity.get('notes', {})
            user_id = notes.get('user_id')
            if user_id:
                await _db.subscriptions.update_one(
                    {"user_id": user_id},
                    {"$set": {"status": "paused"}}
                )
        
        return {"success": True, "message": "Webhook processed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process webhook: {str(e)}"
        )


@router.get("/subscription/{subscription_id}")
async def get_subscription(subscription_id: str):
    """
    Get subscription details.
    """
    try:
        service = RazorpayService()
        result = await service.get_subscription(subscription_id)
        
        return {
            "success": True,
            "data": result
        }
    
    except Exception as e:
        logger.error(f"Error fetching subscription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch subscription: {str(e)}"
        )


@router.post("/subscription/sync")
async def sync_subscription(current_user: User = Depends(get_current_user)):
    """
    Sync user's subscription status from Razorpay.
    
    Checks if user has any active subscriptions in Razorpay and updates local database.
    """
    try:
        # Find user's latest subscription in database
        subscription = await _db.razorpay_subscriptions.find_one(
            {"user_id": current_user.id},
            sort=[("created_at", -1)]
        )
        
        if not subscription:
            return {
                "success": True,
                "message": "No subscription found to sync",
                "synced": False
            }
        
        # Fetch latest status from Razorpay
        service = RazorpayService()
        razorpay_subscription = await service.get_subscription(subscription['subscription_id'])
        
        # Update local database with latest status
        await _db.razorpay_subscriptions.update_one(
            {"subscription_id": subscription['subscription_id']},
            {
                "$set": {
                    "status": razorpay_subscription.get("status"),
                    "razorpay_data": razorpay_subscription
                }
            }
        )
        
        return {
            "success": True,
            "message": "Subscription synced successfully",
            "synced": True,
            "status": razorpay_subscription.get("status")
        }
    
    except Exception as e:
        logger.error(f"Error syncing subscription: {str(e)}")
        # Don't raise error, just return unsuccessful sync
        return {
            "success": False,
            "message": f"Failed to sync subscription: {str(e)}",
            "synced": False
        }

