from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import secrets
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
import os
from bson import ObjectId

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['chatbase_db']

# Models
class APIKeyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    expires_in_days: Optional[int] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    key: str
    key_prefix: str
    created_at: str
    last_used: Optional[str] = None
    expires_at: Optional[str] = None
    usage_count: int = 0
    status: str = "active"

class WebhookCreate(BaseModel):
    url: str
    events: List[str]
    description: Optional[str] = None
    secret: Optional[str] = None
    headers: Optional[Dict[str, str]] = None

class WebhookUpdate(BaseModel):
    url: Optional[str] = None
    events: Optional[List[str]] = None
    description: Optional[str] = None
    status: Optional[str] = None
    headers: Optional[Dict[str, str]] = None

class WebhookResponse(BaseModel):
    id: str
    url: str
    events: List[str]
    description: Optional[str] = None
    status: str
    created_at: str
    last_triggered: Optional[str] = None
    success_count: int = 0
    failure_count: int = 0
    success_rate: float = 0.0

class SystemLogResponse(BaseModel):
    id: str
    timestamp: str
    level: str
    message: str
    details: Optional[str] = None
    user: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None

class ErrorTrackingResponse(BaseModel):
    id: str
    timestamp: str
    error_type: str
    message: str
    stack_trace: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    user_id: Optional[str] = None
    count: int = 1
    resolved: bool = False
    last_occurrence: str

class ErrorUpdate(BaseModel):
    resolved: bool

# Helper Functions
def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key with prefix and hash"""
    prefix = "bsm_" + secrets.token_hex(4)
    key_suffix = secrets.token_hex(20)
    full_key = f"{prefix}_{key_suffix}"
    key_hash = hashlib.sha256(full_key.encode()).hexdigest()
    return full_key, prefix, key_hash

async def log_system_event(level: str, message: str, details: Optional[str] = None, 
                           user: Optional[str] = None, endpoint: Optional[str] = None,
                           method: Optional[str] = None, ip_address: Optional[str] = None):
    """Log a system event"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        "details": details,
        "user": user,
        "ip_address": ip_address,
        "endpoint": endpoint,
        "method": method
    }
    await db.system_logs.insert_one(log_entry)

async def track_error(error_type: str, message: str, stack_trace: Optional[str] = None,
                     endpoint: Optional[str] = None, method: Optional[str] = None,
                     user_id: Optional[str] = None):
    """Track an error occurrence"""
    # Check if error already exists
    existing_error = await db.error_tracking.find_one({
        "error_type": error_type,
        "message": message,
        "resolved": False
    })
    
    if existing_error:
        # Increment count and update last occurrence
        await db.error_tracking.update_one(
            {"_id": existing_error["_id"]},
            {
                "$inc": {"count": 1},
                "$set": {"last_occurrence": datetime.utcnow().isoformat()}
            }
        )
    else:
        # Create new error entry
        error_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": error_type,
            "message": message,
            "stack_trace": stack_trace,
            "endpoint": endpoint,
            "method": method,
            "user_id": user_id,
            "count": 1,
            "resolved": False,
            "last_occurrence": datetime.utcnow().isoformat()
        }
        await db.error_tracking.insert_one(error_entry)

# API Key Endpoints
@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(key_data: APIKeyCreate):
    """Create a new API key"""
    try:
        full_key, prefix, key_hash = generate_api_key()
        
        expires_at = None
        if key_data.expires_in_days:
            expires_at = (datetime.utcnow() + timedelta(days=key_data.expires_in_days)).isoformat()
        
        api_key_doc = {
            "name": key_data.name,
            "description": key_data.description,
            "key_hash": key_hash,
            "key_prefix": prefix,
            "created_at": datetime.utcnow().isoformat(),
            "last_used": None,
            "expires_at": expires_at,
            "usage_count": 0,
            "status": "active"
        }
        
        result = await db.api_keys.insert_one(api_key_doc)
        
        # Log the event
        await log_system_event(
            level="info",
            message=f"API key created: {key_data.name}",
            details=f"Key prefix: {prefix}"
        )
        
        return APIKeyResponse(
            id=str(result.inserted_id),
            name=key_data.name,
            description=key_data.description,
            key=full_key,  # Only return full key on creation
            key_prefix=prefix,
            created_at=api_key_doc["created_at"],
            last_used=None,
            expires_at=expires_at,
            usage_count=0,
            status="active"
        )
    except Exception as e:
        await track_error("API_KEY_CREATION_ERROR", str(e), endpoint="/api-keys", method="POST")
        raise HTTPException(status_code=500, detail=f"Failed to create API key: {str(e)}")

@router.get("/api-keys", response_model=List[APIKeyResponse])
async def get_api_keys(status: Optional[str] = Query(None)):
    """Get all API keys"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.api_keys.find(query).sort("created_at", -1)
        api_keys = await cursor.to_list(length=100)
        
        result = []
        for key in api_keys:
            result.append(APIKeyResponse(
                id=str(key["_id"]),
                name=key["name"],
                description=key.get("description"),
                key="•" * 40,  # Masked key
                key_prefix=key["key_prefix"],
                created_at=key["created_at"],
                last_used=key.get("last_used"),
                expires_at=key.get("expires_at"),
                usage_count=key.get("usage_count", 0),
                status=key.get("status", "active")
            ))
        
        return result
    except Exception as e:
        await track_error("API_KEY_FETCH_ERROR", str(e), endpoint="/api-keys", method="GET")
        raise HTTPException(status_code=500, detail=f"Failed to fetch API keys: {str(e)}")

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: str):
    """Delete an API key"""
    try:
        result = await db.api_keys.delete_one({"_id": ObjectId(key_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="API key not found")
        
        await log_system_event(
            level="warning",
            message=f"API key deleted",
            details=f"Key ID: {key_id}"
        )
        
        return {"message": "API key deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await track_error("API_KEY_DELETION_ERROR", str(e), endpoint=f"/api-keys/{key_id}", method="DELETE")
        raise HTTPException(status_code=500, detail=f"Failed to delete API key: {str(e)}")

@router.post("/api-keys/{key_id}/regenerate", response_model=APIKeyResponse)
async def regenerate_api_key(key_id: str):
    """Regenerate an API key"""
    try:
        existing_key = await db.api_keys.find_one({"_id": ObjectId(key_id)})
        if not existing_key:
            raise HTTPException(status_code=404, detail="API key not found")
        
        full_key, prefix, key_hash = generate_api_key()
        
        update_data = {
            "key_hash": key_hash,
            "key_prefix": prefix,
            "usage_count": 0,
            "last_used": None
        }
        
        await db.api_keys.update_one(
            {"_id": ObjectId(key_id)},
            {"$set": update_data}
        )
        
        await log_system_event(
            level="warning",
            message=f"API key regenerated: {existing_key['name']}",
            details=f"New prefix: {prefix}"
        )
        
        updated_key = await db.api_keys.find_one({"_id": ObjectId(key_id)})
        
        return APIKeyResponse(
            id=str(updated_key["_id"]),
            name=updated_key["name"],
            description=updated_key.get("description"),
            key=full_key,
            key_prefix=prefix,
            created_at=updated_key["created_at"],
            last_used=None,
            expires_at=updated_key.get("expires_at"),
            usage_count=0,
            status=updated_key.get("status", "active")
        )
    except HTTPException:
        raise
    except Exception as e:
        await track_error("API_KEY_REGENERATION_ERROR", str(e), endpoint=f"/api-keys/{key_id}/regenerate", method="POST")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate API key: {str(e)}")

# Webhook Endpoints
@router.post("/webhooks", response_model=WebhookResponse)
async def create_webhook(webhook_data: WebhookCreate):
    """Create a new webhook"""
    try:
        webhook_doc = {
            "url": webhook_data.url,
            "events": webhook_data.events,
            "description": webhook_data.description,
            "secret": webhook_data.secret or secrets.token_hex(32),
            "headers": webhook_data.headers or {},
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "last_triggered": None,
            "success_count": 0,
            "failure_count": 0
        }
        
        result = await db.webhooks.insert_one(webhook_doc)
        
        await log_system_event(
            level="info",
            message="Webhook created",
            details=f"URL: {webhook_data.url}, Events: {', '.join(webhook_data.events)}"
        )
        
        return WebhookResponse(
            id=str(result.inserted_id),
            url=webhook_doc["url"],
            events=webhook_doc["events"],
            description=webhook_doc.get("description"),
            status=webhook_doc["status"],
            created_at=webhook_doc["created_at"],
            last_triggered=None,
            success_count=0,
            failure_count=0,
            success_rate=0.0
        )
    except Exception as e:
        await track_error("WEBHOOK_CREATION_ERROR", str(e), endpoint="/webhooks", method="POST")
        raise HTTPException(status_code=500, detail=f"Failed to create webhook: {str(e)}")

@router.get("/webhooks", response_model=List[WebhookResponse])
async def get_webhooks(status: Optional[str] = Query(None)):
    """Get all webhooks"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        cursor = db.webhooks.find(query).sort("created_at", -1)
        webhooks = await cursor.to_list(length=100)
        
        result = []
        for webhook in webhooks:
            total = webhook.get("success_count", 0) + webhook.get("failure_count", 0)
            success_rate = (webhook.get("success_count", 0) / total * 100) if total > 0 else 0.0
            
            result.append(WebhookResponse(
                id=str(webhook["_id"]),
                url=webhook["url"],
                events=webhook["events"],
                description=webhook.get("description"),
                status=webhook.get("status", "active"),
                created_at=webhook["created_at"],
                last_triggered=webhook.get("last_triggered"),
                success_count=webhook.get("success_count", 0),
                failure_count=webhook.get("failure_count", 0),
                success_rate=round(success_rate, 1)
            ))
        
        return result
    except Exception as e:
        await track_error("WEBHOOK_FETCH_ERROR", str(e), endpoint="/webhooks", method="GET")
        raise HTTPException(status_code=500, detail=f"Failed to fetch webhooks: {str(e)}")

@router.put("/webhooks/{webhook_id}", response_model=WebhookResponse)
async def update_webhook(webhook_id: str, webhook_data: WebhookUpdate):
    """Update a webhook"""
    try:
        existing_webhook = await db.webhooks.find_one({"_id": ObjectId(webhook_id)})
        if not existing_webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        update_data = {}
        if webhook_data.url is not None:
            update_data["url"] = webhook_data.url
        if webhook_data.events is not None:
            update_data["events"] = webhook_data.events
        if webhook_data.description is not None:
            update_data["description"] = webhook_data.description
        if webhook_data.status is not None:
            update_data["status"] = webhook_data.status
        if webhook_data.headers is not None:
            update_data["headers"] = webhook_data.headers
        
        await db.webhooks.update_one(
            {"_id": ObjectId(webhook_id)},
            {"$set": update_data}
        )
        
        await log_system_event(
            level="info",
            message="Webhook updated",
            details=f"Webhook ID: {webhook_id}"
        )
        
        updated_webhook = await db.webhooks.find_one({"_id": ObjectId(webhook_id)})
        total = updated_webhook.get("success_count", 0) + updated_webhook.get("failure_count", 0)
        success_rate = (updated_webhook.get("success_count", 0) / total * 100) if total > 0 else 0.0
        
        return WebhookResponse(
            id=str(updated_webhook["_id"]),
            url=updated_webhook["url"],
            events=updated_webhook["events"],
            description=updated_webhook.get("description"),
            status=updated_webhook.get("status", "active"),
            created_at=updated_webhook["created_at"],
            last_triggered=updated_webhook.get("last_triggered"),
            success_count=updated_webhook.get("success_count", 0),
            failure_count=updated_webhook.get("failure_count", 0),
            success_rate=round(success_rate, 1)
        )
    except HTTPException:
        raise
    except Exception as e:
        await track_error("WEBHOOK_UPDATE_ERROR", str(e), endpoint=f"/webhooks/{webhook_id}", method="PUT")
        raise HTTPException(status_code=500, detail=f"Failed to update webhook: {str(e)}")

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str):
    """Delete a webhook"""
    try:
        result = await db.webhooks.delete_one({"_id": ObjectId(webhook_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        await log_system_event(
            level="warning",
            message="Webhook deleted",
            details=f"Webhook ID: {webhook_id}"
        )
        
        return {"message": "Webhook deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await track_error("WEBHOOK_DELETION_ERROR", str(e), endpoint=f"/webhooks/{webhook_id}", method="DELETE")
        raise HTTPException(status_code=500, detail=f"Failed to delete webhook: {str(e)}")

@router.post("/webhooks/{webhook_id}/test")
async def test_webhook(webhook_id: str):
    """Test a webhook by sending a test payload"""
    try:
        import aiohttp
        
        webhook = await db.webhooks.find_one({"_id": ObjectId(webhook_id)})
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        test_payload = {
            "event": "webhook.test",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "message": "This is a test webhook event from BotSmith"
            }
        }
        
        async with aiohttp.ClientSession() as session:
            headers = webhook.get("headers", {})
            headers["Content-Type"] = "application/json"
            if webhook.get("secret"):
                headers["X-Webhook-Secret"] = webhook["secret"]
            
            async with session.post(
                webhook["url"],
                json=test_payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    await db.webhooks.update_one(
                        {"_id": ObjectId(webhook_id)},
                        {
                            "$inc": {"success_count": 1},
                            "$set": {"last_triggered": datetime.utcnow().isoformat()}
                        }
                    )
                    return {"message": "Webhook test successful", "status": response.status}
                else:
                    await db.webhooks.update_one(
                        {"_id": ObjectId(webhook_id)},
                        {"$inc": {"failure_count": 1}}
                    )
                    return {"message": f"Webhook test failed with status {response.status}", "status": response.status}
    except Exception as e:
        await db.webhooks.update_one(
            {"_id": ObjectId(webhook_id)},
            {"$inc": {"failure_count": 1}}
        )
        await track_error("WEBHOOK_TEST_ERROR", str(e), endpoint=f"/webhooks/{webhook_id}/test", method="POST")
        raise HTTPException(status_code=500, detail=f"Failed to test webhook: {str(e)}")

# System Logs Endpoints
@router.get("/system-logs", response_model=List[SystemLogResponse])
async def get_system_logs(
    level: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    skip: int = Query(0)
):
    """Get system logs with optional filtering"""
    try:
        query = {}
        if level:
            query["level"] = level
        
        cursor = db.system_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        logs = await cursor.to_list(length=limit)
        
        result = []
        for log in logs:
            result.append(SystemLogResponse(
                id=str(log["_id"]),
                timestamp=log["timestamp"],
                level=log["level"],
                message=log["message"],
                details=log.get("details"),
                user=log.get("user"),
                ip_address=log.get("ip_address"),
                endpoint=log.get("endpoint"),
                method=log.get("method")
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system logs: {str(e)}")

@router.delete("/system-logs")
async def clear_system_logs(older_than_days: int = Query(30)):
    """Clear system logs older than specified days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=older_than_days)
        result = await db.system_logs.delete_many({
            "timestamp": {"$lt": cutoff_date.isoformat()}
        })
        
        await log_system_event(
            level="info",
            message=f"System logs cleared: {result.deleted_count} entries removed",
            details=f"Older than {older_than_days} days"
        )
        
        return {"message": f"Deleted {result.deleted_count} log entries"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear system logs: {str(e)}")

@router.get("/system-logs/export")
async def export_system_logs(
    level: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Export system logs as JSON"""
    try:
        query = {}
        if level:
            query["level"] = level
        if start_date:
            query["timestamp"] = {"$gte": start_date}
        if end_date:
            if "timestamp" in query:
                query["timestamp"]["$lte"] = end_date
            else:
                query["timestamp"] = {"$lte": end_date}
        
        cursor = db.system_logs.find(query).sort("timestamp", -1)
        logs = await cursor.to_list(length=10000)
        
        # Remove ObjectId for JSON serialization
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return {"logs": logs, "count": len(logs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export system logs: {str(e)}")

# Error Tracking Endpoints
@router.get("/errors", response_model=List[ErrorTrackingResponse])
async def get_errors(
    resolved: Optional[bool] = Query(None),
    limit: int = Query(100, le=1000),
    skip: int = Query(0)
):
    """Get tracked errors with optional filtering"""
    try:
        query = {}
        if resolved is not None:
            query["resolved"] = resolved
        
        cursor = db.error_tracking.find(query).sort("last_occurrence", -1).skip(skip).limit(limit)
        errors = await cursor.to_list(length=limit)
        
        result = []
        for error in errors:
            result.append(ErrorTrackingResponse(
                id=str(error["_id"]),
                timestamp=error["timestamp"],
                error_type=error["error_type"],
                message=error["message"],
                stack_trace=error.get("stack_trace"),
                endpoint=error.get("endpoint"),
                method=error.get("method"),
                user_id=error.get("user_id"),
                count=error.get("count", 1),
                resolved=error.get("resolved", False),
                last_occurrence=error["last_occurrence"]
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch errors: {str(e)}")

@router.put("/errors/{error_id}")
async def update_error(error_id: str, error_update: ErrorUpdate):
    """Update error status (mark as resolved)"""
    try:
        result = await db.error_tracking.update_one(
            {"_id": ObjectId(error_id)},
            {"$set": {"resolved": error_update.resolved}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Error not found")
        
        await log_system_event(
            level="info",
            message=f"Error marked as {'resolved' if error_update.resolved else 'unresolved'}",
            details=f"Error ID: {error_id}"
        )
        
        return {"message": "Error updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update error: {str(e)}")

@router.delete("/errors/{error_id}")
async def delete_error(error_id: str):
    """Delete a tracked error"""
    try:
        result = await db.error_tracking.delete_one({"_id": ObjectId(error_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Error not found")
        
        return {"message": "Error deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete error: {str(e)}")

@router.delete("/errors")
async def clear_all_errors(resolved_only: bool = Query(True)):
    """Clear all errors or only resolved ones"""
    try:
        query = {"resolved": True} if resolved_only else {}
        result = await db.error_tracking.delete_many(query)
        
        await log_system_event(
            level="info",
            message=f"Errors cleared: {result.deleted_count} entries removed",
            details=f"Resolved only: {resolved_only}"
        )
        
        return {"message": f"Deleted {result.deleted_count} error entries"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear errors: {str(e)}")

# Statistics Endpoint
@router.get("/tech-stats")
async def get_tech_stats():
    """Get overall technical statistics"""
    try:
        # API Keys stats
        total_api_keys = await db.api_keys.count_documents({})
        active_api_keys = await db.api_keys.count_documents({"status": "active"})
        
        # Webhooks stats
        total_webhooks = await db.webhooks.count_documents({})
        active_webhooks = await db.webhooks.count_documents({"status": "active"})
        
        # System logs stats
        total_logs = await db.system_logs.count_documents({})
        error_logs = await db.system_logs.count_documents({"level": "error"})
        warning_logs = await db.system_logs.count_documents({"level": "warning"})
        
        # Error tracking stats
        total_errors = await db.error_tracking.count_documents({})
        unresolved_errors = await db.error_tracking.count_documents({"resolved": False})
        
        return {
            "api_keys": {
                "total": total_api_keys,
                "active": active_api_keys
            },
            "webhooks": {
                "total": total_webhooks,
                "active": active_webhooks
            },
            "system_logs": {
                "total": total_logs,
                "errors": error_logs,
                "warnings": warning_logs
            },
            "error_tracking": {
                "total": total_errors,
                "unresolved": unresolved_errors
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tech stats: {str(e)}")
