from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
import csv
import io
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
from models import Lead, LeadCreate, LeadResponse

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.chatbase_db


@router.get("/leads")
async def get_all_leads():
    """Get all leads across all users (admin only)"""
    try:
        leads = await db.leads.find().to_list(length=None)
        return {"leads": leads, "total": len(leads)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads/user/{user_id}")
async def get_user_leads(user_id: str):
    """Get all leads for a specific user"""
    try:
        leads = await db.leads.find({"user_id": user_id}).to_list(length=None)
        return {"leads": leads, "total": len(leads)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/upload")
async def upload_leads(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Upload leads from CSV file for a specific user"""
    try:
        # Check if file is CSV
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Get user to check plan limits
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's subscription
        subscription = user.get('subscription', {})
        plan_name = subscription.get('plan_name', 'Free')
        
        # Define plan limits
        plan_limits = {
            'Free': 0,
            'Starter': 100,
            'Professional': 1000,
            'Enterprise': 10000
        }
        
        max_leads = plan_limits.get(plan_name, 0)
        
        # Check current leads count
        current_leads_count = await db.leads.count_documents({"user_id": user_id})
        
        # Read CSV file
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        
        leads_to_insert = []
        uploaded_count = 0
        skipped_count = 0
        
        for row in csv_reader:
            # Check if we've reached the limit
            if current_leads_count + uploaded_count >= max_leads:
                skipped_count += 1
                continue
            
            lead_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": row.get('name', '').strip(),
                "email": row.get('email', '').strip(),
                "phone": row.get('phone', '').strip(),
                "company": row.get('company', '').strip(),
                "status": row.get('status', 'active').strip(),
                "notes": row.get('notes', '').strip(),
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "metadata": {}
            }
            
            leads_to_insert.append(lead_data)
            uploaded_count += 1
        
        # Insert leads
        if leads_to_insert:
            await db.leads.insert_many(leads_to_insert)
        
        return {
            "success": True,
            "count": uploaded_count,
            "skipped": skipped_count,
            "message": f"Successfully uploaded {uploaded_count} leads. {skipped_count} skipped due to plan limits.",
            "limit": max_leads,
            "current_total": current_leads_count + uploaded_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    """Delete a specific lead"""
    try:
        result = await db.leads.delete_one({"id": lead_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        return {"success": True, "message": "Lead deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead_data: LeadCreate):
    """Update a specific lead"""
    try:
        update_data = lead_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.leads.update_one(
            {"id": lead_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        updated_lead = await db.leads.find_one({"id": lead_id})
        return updated_lead
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads/stats/{user_id}")
async def get_lead_stats(user_id: str):
    """Get lead statistics for a specific user"""
    try:
        total_leads = await db.leads.count_documents({"user_id": user_id})
        active_leads = await db.leads.count_documents({"user_id": user_id, "status": "active"})
        contacted_leads = await db.leads.count_documents({"user_id": user_id, "status": "contacted"})
        converted_leads = await db.leads.count_documents({"user_id": user_id, "status": "converted"})
        
        # Get user's plan limit
        user = await db.users.find_one({"id": user_id})
        subscription = user.get('subscription', {}) if user else {}
        plan_name = subscription.get('plan_name', 'Free')
        
        plan_limits = {
            'Free': 0,
            'Starter': 100,
            'Professional': 1000,
            'Enterprise': 10000
        }
        
        max_leads = plan_limits.get(plan_name, 0)
        
        return {
            "total_leads": total_leads,
            "active_leads": active_leads,
            "contacted_leads": contacted_leads,
            "converted_leads": converted_leads,
            "max_leads": max_leads,
            "remaining_leads": max(0, max_leads - total_leads)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
