"""
Subscription Service - SINGLE SOURCE OF TRUTH for Subscription Operations
============================================================================

This service is the ONLY place where subscriptions are created, updated, or modified.
All routers MUST use this service, never update subscriptions directly in database.

Purpose: Eliminate multiple code paths processing same payment/subscription changes
Created: 2025-01-10
Risk Level: 🔴 CRITICAL - Revenue-impacting operations
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Literal
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from services.subscription_duration_calculator import SubscriptionDurationCalculator

logger = logging.getLogger(__name__)


class SubscriptionService:
    """
    SINGLE SOURCE OF TRUTH for all subscription operations.
    All routers MUST use this service, never update subscriptions directly.
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.subscriptions_collection = db.subscriptions
        self.users_collection = db.users
        self.plans_collection = db.plans
        self.processed_payments_collection = db.processed_payments
    
    async def process_payment_idempotent(
        self,
        payment_id: str,
        user_id: str,
        plan_id: str,
        payment_source: Literal["verify_payment", "webhook", "callback"] = "webhook"
    ) -> Dict[str, Any]:
        """
        Process a payment with idempotency guarantee.
        
        This is the SINGLE entry point for all payment processing.
        All payment endpoints (verify-payment, webhook, callback) MUST call this.
        
        Args:
            payment_id: Unique Razorpay payment ID
            user_id: User ID
            plan_id: Plan ID being purchased
            payment_source: Which endpoint initiated this (for logging)
        
        Returns:
            dict: Subscription details or cached result if already processed
        
        Business Logic:
            1. Check if payment_id already processed (idempotency)
            2. If yes: Return cached result
            3. If no: Determine action type (upgrade vs renewal)
            4. Calculate expiration using SubscriptionDurationCalculator
            5. Update subscription atomically
            6. Record in processed_payments
            7. Return result
        """
        
        logger.info(f"[PAYMENT PROCESSING] Payment {payment_id} from {payment_source} for user {user_id}, plan {plan_id}")
        
        # STEP 1: Check idempotency - has this payment been processed?
        existing_payment = await self.processed_payments_collection.find_one({
            "payment_id": payment_id
        })
        
        if existing_payment:
            logger.warning(f"[IDEMPOTENCY] Payment {payment_id} already processed on {existing_payment.get('processed_at')}. Returning cached result.")
            return {
                "status": "already_processed",
                "subscription": existing_payment.get("subscription_result"),
                "processed_at": existing_payment.get("processed_at"),
                "message": "This payment was already processed"
            }
        
        # STEP 2: Get current subscription
        current_subscription = await self.subscriptions_collection.find_one({"user_id": user_id})
        
        # STEP 3: Determine action type (upgrade vs renewal)
        if current_subscription:
            old_plan_id = current_subscription.get('plan_id', '')
            is_upgrade = SubscriptionDurationCalculator.is_plan_upgrade(old_plan_id, plan_id)
            action_type = "upgrade" if is_upgrade else "renewal"
        else:
            action_type = "new"
        
        logger.info(f"[PAYMENT PROCESSING] Action type: {action_type}")
        
        # STEP 4: Calculate expiration using SINGLE SOURCE OF TRUTH
        expires_at = SubscriptionDurationCalculator.calculate_expiration(
            action_type=action_type,
            new_plan_id=plan_id,
            current_subscription=current_subscription
        )
        
        started_at = datetime.utcnow()
        duration_days = (expires_at - started_at).days
        
        logger.info(f"[PAYMENT PROCESSING] Calculated duration: {duration_days} days, expires at: {expires_at}")
        
        # STEP 5: Update subscription (atomic)
        subscription_data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "razorpay_payment_id": payment_id,
            "updated_at": datetime.utcnow(),
            "action_type": action_type  # For audit trail
        }
        
        # Preserve usage if renewal, reset if upgrade
        if action_type == "renewal" and current_subscription:
            subscription_data["usage"] = current_subscription.get("usage", {})
        else:
            subscription_data["usage"] = {
                "chatbots_count": 0,
                "messages_this_month": 0,
                "file_uploads": 0,
                "last_reset": datetime.utcnow()
            }
        
        # Atomic update
        await self.subscriptions_collection.update_one(
            {"user_id": user_id},
            {"$set": subscription_data},
            upsert=True
        )
        
        # STEP 6: Update user document
        await self.users_collection.update_one(
            {"id": user_id},
            {"$set": {
                "plan_id": plan_id,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # STEP 7: Record payment as processed (idempotency)
        await self.processed_payments_collection.insert_one({
            "payment_id": payment_id,
            "user_id": user_id,
            "plan_id": plan_id,
            "subscription_id": str(current_subscription.get("_id")) if current_subscription else None,
            "processed_at": datetime.utcnow(),
            "expires_at": expires_at,
            "is_upgrade": action_type == "upgrade",
            "payment_source": payment_source,
            "subscription_result": subscription_data
        })
        
        logger.info(f"[PAYMENT PROCESSING] Successfully processed payment {payment_id}. User {user_id} now has {plan_id} plan until {expires_at}")
        
        return {
            "status": "processed",
            "subscription": subscription_data,
            "action_type": action_type,
            "duration_days": duration_days
        }
    
    async def create_subscription(
        self,
        user_id: str,
        plan_id: str
    ) -> Dict[str, Any]:
        """
        Create a new subscription (for initial signups).
        
        Args:
            user_id: User ID
            plan_id: Plan ID (usually "free" for new users)
        
        Returns:
            dict: Subscription details
        """
        
        logger.info(f"[SUBSCRIPTION] Creating new subscription for user {user_id}, plan {plan_id}")
        
        # Calculate expiration
        expires_at = SubscriptionDurationCalculator.calculate_expiration(
            action_type="new",
            new_plan_id=plan_id
        )
        
        started_at = datetime.utcnow()
        
        subscription_data = {
            "user_id": user_id,
            "plan_id": plan_id,
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "usage": {
                "chatbots_count": 0,
                "messages_this_month": 0,
                "file_uploads": 0,
                "last_reset": datetime.utcnow()
            }
        }
        
        await self.subscriptions_collection.insert_one(subscription_data)
        
        logger.info(f"[SUBSCRIPTION] Created subscription for user {user_id}, expires at {expires_at}")
        
        return subscription_data
    
    async def admin_change_plan(
        self,
        user_id: str,
        new_plan_id: str,
        admin_id: str,
        reason: str = "Admin manual change"
    ) -> Dict[str, Any]:
        """
        Admin changes user's plan.
        
        Args:
            user_id: User ID
            new_plan_id: New plan ID
            admin_id: Admin user ID making the change
            reason: Reason for change (for audit)
        
        Returns:
            dict: Updated subscription details
        """
        
        logger.info(f"[ADMIN CHANGE] Admin {admin_id} changing user {user_id} to plan {new_plan_id}. Reason: {reason}")
        
        current_subscription = await self.subscriptions_collection.find_one({"user_id": user_id})
        
        # Calculate new expiration (fresh start)
        expires_at = SubscriptionDurationCalculator.calculate_expiration(
            action_type="admin_change",
            new_plan_id=new_plan_id
        )
        
        started_at = datetime.utcnow()
        
        subscription_data = {
            "user_id": user_id,
            "plan_id": new_plan_id,
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "updated_at": datetime.utcnow(),
            "admin_changed_by": admin_id,
            "admin_change_reason": reason,
            "usage": current_subscription.get("usage", {}) if current_subscription else {
                "chatbots_count": 0,
                "messages_this_month": 0,
                "file_uploads": 0,
                "last_reset": datetime.utcnow()
            }
        }
        
        await self.subscriptions_collection.update_one(
            {"user_id": user_id},
            {"$set": subscription_data},
            upsert=True
        )
        
        # Update user document
        await self.users_collection.update_one(
            {"id": user_id},
            {"$set": {
                "plan_id": new_plan_id,
                "updated_at": datetime.utcnow()
            }}
        )
        
        duration = SubscriptionDurationCalculator.get_plan_duration(new_plan_id)
        logger.info(f"[ADMIN CHANGE] User {user_id} now has {new_plan_id} plan for {duration} days, expires at {expires_at}")
        
        return subscription_data
    
    async def check_subscription_status(self, user_id: str) -> Dict[str, Any]:
        """
        Check if subscription is active, expired, or expiring soon.
        
        Args:
            user_id: User ID
        
        Returns:
            dict: Status information
        """
        subscription = await self.subscriptions_collection.find_one({"user_id": user_id})
        
        if not subscription:
            return {
                "exists": False,
                "is_expired": True,
                "message": "No subscription found"
            }
        
        now = datetime.utcnow()
        expires_at = subscription.get('expires_at')
        
        if not expires_at:
            return {
                "exists": True,
                "is_expired": True,
                "message": "No expiration date set"
            }
        
        is_expired = expires_at <= now
        days_remaining = SubscriptionDurationCalculator.calculate_remaining_days(expires_at)
        is_expiring_soon = 0 < days_remaining <= 3
        
        return {
            "exists": True,
            "is_expired": is_expired,
            "is_expiring_soon": is_expiring_soon,
            "days_remaining": days_remaining,
            "expires_at": expires_at,
            "plan_id": subscription.get('plan_id'),
            "status": subscription.get('status')
        }
