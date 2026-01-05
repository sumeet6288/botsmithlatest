from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models import User, Plan, PlanUpgradeRequest
from services.plan_service import plan_service
from auth import get_current_user

router = APIRouter(prefix="/plans", tags=["plans"])

@router.get("/", response_model=List[dict])
async def get_plans():
    """Get all available plans"""
    plans = await plan_service.get_all_plans()
    # Convert ObjectId to string for JSON serialization
    for plan in plans:
        if "_id" in plan:
            plan["_id"] = str(plan["_id"])
    return plans

@router.get("/current")
async def get_current_subscription(current_user: User = Depends(get_current_user)):
    """Get current user's subscription details"""
    subscription = await plan_service.get_user_subscription(current_user.id)
    plan = await plan_service.get_plan_by_id(subscription["plan_id"])
    
    # Convert ObjectId to string
    if "_id" in subscription:
        subscription["_id"] = str(subscription["_id"])
    if "_id" in plan:
        plan["_id"] = str(plan["_id"])
    
    return {
        "subscription": subscription,
        "plan": plan
    }

@router.post("/upgrade")
async def upgrade_plan(
    upgrade_request: PlanUpgradeRequest,
    current_user: User = Depends(get_current_user)
):
    """Upgrade user to a new plan"""
    # Verify plan exists
    new_plan = await plan_service.get_plan_by_id(upgrade_request.plan_id)
    if not new_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Upgrade subscription
    updated_subscription = await plan_service.upgrade_plan(current_user.id, upgrade_request.plan_id)
    
    # Convert ObjectId to string
    if "_id" in updated_subscription:
        updated_subscription["_id"] = str(updated_subscription["_id"])
    
    return {
        "message": f"Successfully upgraded to {new_plan['name']} plan",
        "subscription": updated_subscription
    }

@router.get("/usage")
async def get_usage_stats(current_user: User = Depends(get_current_user)):
    """Get detailed usage statistics"""
    stats = await plan_service.get_usage_stats(current_user.id)
    return stats

@router.get("/check-limit/{limit_type}")
async def check_limit(
    limit_type: str,
    current_user: User = Depends(get_current_user)
):
    """Check if user has reached a specific limit"""
    result = await plan_service.check_limit(current_user.id, limit_type)
    return result

@router.get("/subscription-status")
async def check_subscription_status(current_user: User = Depends(get_current_user)):
    """Check if subscription is expired or expiring soon"""
    status = await plan_service.check_subscription_status(current_user.id)
    return status

@router.post("/renew")
async def renew_subscription(current_user: User = Depends(get_current_user)):
    """Renew current subscription for another period"""
    try:
        updated_subscription = await plan_service.renew_subscription(current_user.id)
        
        # Get plan details to show correct renewal duration
        plan_id = updated_subscription.get("plan_id", "free")
        renewal_days = 6 if plan_id == "free" else 30
        
        # Convert ObjectId to string
        if "_id" in updated_subscription:
            updated_subscription["_id"] = str(updated_subscription["_id"])
        
        return {
            "message": f"Subscription renewed successfully for {renewal_days} days",
            "subscription": updated_subscription
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
