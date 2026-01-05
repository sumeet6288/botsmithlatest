from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
from models import User, Lead, LeadResponse, LeadCreate, LeadUpdate, LeadStatsResponse
from services.plan_service import plan_service
from auth import get_current_user

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
leads_collection = db.leads


@router.get("/leads", response_model=List[LeadResponse])
async def get_my_leads(current_user: User = Depends(get_current_user)):
    """Get all leads for the current user"""
    try:
        leads = await leads_collection.find({"user_id": current_user.id}).to_list(length=10000)
        
        # Convert to response format
        lead_responses = []
        for lead in leads:
            if '_id' in lead:
                lead.pop('_id')
            lead_responses.append(LeadResponse(**lead))
        
        return lead_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads/stats", response_model=LeadStatsResponse)
async def get_lead_stats(current_user: User = Depends(get_current_user)):
    """Get lead statistics for current user"""
    try:
        # Count current leads
        current_count = await leads_collection.count_documents({"user_id": current_user.id})
        
        # Get plan limits using plan service
        subscription = await plan_service.get_user_subscription(current_user.id)
        plan = await plan_service.get_plan_by_id(subscription["plan_id"])
        
        # Check if custom limits exist
        if hasattr(current_user, 'custom_limits') and current_user.custom_limits and 'max_leads' in current_user.custom_limits:
            max_leads = current_user.custom_limits['max_leads']
        else:
            max_leads = plan["limits"].get("max_leads", 50)
        
        # Calculate percentage
        percentage = (current_count / max_leads * 100) if max_leads > 0 else 0
        
        return LeadStatsResponse(
            current_leads=current_count,
            max_leads=max_leads,
            percentage_used=round(percentage, 2),
            can_add_more=current_count < max_leads,
            plan_name=plan["name"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads", response_model=LeadResponse)
async def create_lead(lead_data: LeadCreate, current_user: User = Depends(get_current_user)):
    """Create a new lead for the current user (with plan limit check)"""
    try:
        # Check current lead count
        current_count = await leads_collection.count_documents({"user_id": current_user.id})
        
        # Get plan limits using plan service
        subscription = await plan_service.get_user_subscription(current_user.id)
        plan = await plan_service.get_plan_by_id(subscription["plan_id"])
        
        # Check if custom limits exist
        if hasattr(current_user, 'custom_limits') and current_user.custom_limits and 'max_leads' in current_user.custom_limits:
            max_leads = current_user.custom_limits['max_leads']
        else:
            max_leads = plan["limits"].get("max_leads", 50)
        
        # Enforce limit
        if current_count >= max_leads:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": f"Lead limit reached. You have {current_count}/{max_leads} leads. Upgrade your plan to add more.",
                    "current": current_count,
                    "max": max_leads,
                    "upgrade_required": True,
                    "plan_name": plan["name"]
                }
            )
        
        # Create new lead
        lead = Lead(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name=lead_data.name,
            contact=lead_data.contact,
            status=lead_data.status or "New",
            notes=lead_data.notes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        lead_dict = lead.model_dump()
        await leads_collection.insert_one(lead_dict)
        
        # Remove MongoDB _id for response
        if '_id' in lead_dict:
            lead_dict.pop('_id')
        
        return LeadResponse(**lead_dict)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(lead_id: str, lead_data: LeadUpdate, current_user: User = Depends(get_current_user)):
    """Update a specific lead (user can only update their own leads)"""
    try:
        # Check if lead belongs to user
        lead = await leads_collection.find_one({"id": lead_id, "user_id": current_user.id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found or access denied")
        
        # Update fields
        update_data = lead_data.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            await leads_collection.update_one(
                {"id": lead_id, "user_id": current_user.id},
                {"$set": update_data}
            )
        
        # Get updated lead
        updated_lead = await leads_collection.find_one({"id": lead_id})
        if '_id' in updated_lead:
            updated_lead.pop('_id')
        
        return LeadResponse(**updated_lead)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    """Delete a specific lead (user can only delete their own leads)"""
    try:
        # Check if lead belongs to user
        lead = await leads_collection.find_one({"id": lead_id, "user_id": current_user.id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found or access denied")
        
        result = await leads_collection.delete_one({"id": lead_id, "user_id": current_user.id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        return {
            "success": True,
            "message": "Lead deleted successfully",
            "lead_id": lead_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
