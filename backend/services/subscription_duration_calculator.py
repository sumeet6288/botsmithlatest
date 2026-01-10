"""
Subscription Duration Calculator - SINGLE SOURCE OF TRUTH
===========================================================

This module provides the ONLY place where subscription duration is calculated.
All subscription updates MUST use this class to ensure consistency.

Business Rules:
1. FREE plan: 6 days duration
2. PAID plans (Starter, Professional, Enterprise): 30 days duration
3. UPGRADE (different plan): Start fresh from NOW + plan_duration (NO carry-forward)
4. RENEWAL (same plan, active): Extend from current_expires + 30 days (preserve remaining)
5. RENEWAL (same plan, expired): Start fresh from NOW + 30 days
6. ADMIN CHANGE: Start fresh from NOW + plan_duration

Created: 2025-01-10
Purpose: Eliminate 59-65 day subscription bug caused by scattered duration logic
"""

from datetime import datetime, timedelta
from typing import Literal, Optional
from pydantic import BaseModel


class SubscriptionDurationCalculator:
    """
    SINGLE SOURCE OF TRUTH for subscription duration calculations.
    All subscription updates must use this class.
    """
    
    # Plan duration constants (in days)
    FREE_PLAN_DURATION = 6
    PAID_PLAN_DURATION = 30
    
    @staticmethod
    def calculate_expiration(
        action_type: Literal["new", "upgrade", "renewal", "admin_change"],
        new_plan_id: str,
        current_subscription: Optional[dict] = None
    ) -> datetime:
        """
        Calculate subscription expiration date based on action type.
        
        Args:
            action_type: Type of subscription action
                - "new": Brand new subscription (first time)
                - "upgrade": Changing to a different plan
                - "renewal": Renewing the same plan
                - "admin_change": Admin manually changing user's plan
            new_plan_id: The plan ID being set (e.g., "free", "starter", "professional")
            current_subscription: Current subscription details (required for renewals)
        
        Returns:
            datetime: The calculated expiration date
            
        Business Logic:
            - NEW subscription: now + plan_duration
            - UPGRADE (different plan): now + plan_duration (no carry-forward)
            - RENEWAL (same plan, active): current_expires + 30 days (preserve remaining)
            - RENEWAL (same plan, expired): now + 30 days
            - ADMIN CHANGE: now + plan_duration (fresh start)
        """
        
        # Determine plan duration
        if new_plan_id.lower() == "free":
            duration_days = SubscriptionDurationCalculator.FREE_PLAN_DURATION
        else:
            duration_days = SubscriptionDurationCalculator.PAID_PLAN_DURATION
        
        now = datetime.utcnow()
        
        # Handle RENEWAL - preserve remaining days if subscription is still active
        if action_type == "renewal" and current_subscription:
            current_expires = current_subscription.get('expires_at')
            
            # If current subscription is still active (not expired)
            if current_expires and current_expires > now:
                # Extend from current expiration (preserve remaining days)
                return current_expires + timedelta(days=SubscriptionDurationCalculator.PAID_PLAN_DURATION)
            else:
                # Subscription expired - start fresh
                return now + timedelta(days=SubscriptionDurationCalculator.PAID_PLAN_DURATION)
        
        # All other cases: Start fresh from now
        # - NEW subscription
        # - UPGRADE to different plan
        # - ADMIN CHANGE
        return now + timedelta(days=duration_days)
    
    @staticmethod
    def get_plan_duration(plan_id: str) -> int:
        """
        Get the duration in days for a given plan.
        
        Args:
            plan_id: Plan identifier (e.g., "free", "starter")
        
        Returns:
            int: Duration in days
        """
        if plan_id.lower() == "free":
            return SubscriptionDurationCalculator.FREE_PLAN_DURATION
        else:
            return SubscriptionDurationCalculator.PAID_PLAN_DURATION
    
    @staticmethod
    def is_plan_upgrade(old_plan_id: str, new_plan_id: str) -> bool:
        """
        Determine if this is a plan upgrade/change or renewal.
        
        Args:
            old_plan_id: Current plan ID
            new_plan_id: New plan ID
        
        Returns:
            bool: True if plans are different (upgrade), False if same (renewal)
        """
        return old_plan_id.lower() != new_plan_id.lower()
    
    @staticmethod
    def calculate_remaining_days(expires_at: datetime) -> int:
        """
        Calculate how many days remain in current subscription.
        
        Args:
            expires_at: Current expiration date
        
        Returns:
            int: Number of days remaining (0 if expired)
        """
        now = datetime.utcnow()
        if expires_at <= now:
            return 0
        
        delta = expires_at - now
        return delta.days


class SubscriptionCalculationResult(BaseModel):
    """Result of subscription duration calculation"""
    expires_at: datetime
    duration_days: int
    action_type: str
    is_fresh_start: bool
    remaining_days_preserved: int = 0
    calculation_reason: str
