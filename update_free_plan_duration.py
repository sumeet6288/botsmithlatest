#!/usr/bin/env python3
"""
Script to update existing free plan subscriptions from 30 days to 6 days
This recalculates the expiration dates for all free plan subscriptions
"""
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def update_free_subscriptions():
    """Update all free plan subscriptions to 6-day duration"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    subscriptions_collection = db.subscriptions
    
    print(f"Connected to MongoDB: {mongo_url}/{db_name}")
    
    # Find all free plan subscriptions
    free_subscriptions = await subscriptions_collection.find({"plan_id": "free"}).to_list(None)
    
    print(f"Found {len(free_subscriptions)} free plan subscriptions")
    
    updated_count = 0
    
    for subscription in free_subscriptions:
        user_id = subscription.get("user_id")
        started_at = subscription.get("started_at")
        current_expires_at = subscription.get("expires_at")
        
        if not started_at:
            print(f"  Skipping subscription for user {user_id}: no started_at date")
            continue
        
        # Calculate new expiration: started_at + 6 days
        if isinstance(started_at, str):
            started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
        
        new_expires_at = started_at + timedelta(days=6)
        
        # Update the subscription
        result = await subscriptions_collection.update_one(
            {"user_id": user_id, "plan_id": "free"},
            {"$set": {"expires_at": new_expires_at}}
        )
        
        if result.modified_count > 0:
            updated_count += 1
            print(f"  ✅ Updated user {user_id}")
            print(f"     Old expires_at: {current_expires_at}")
            print(f"     New expires_at: {new_expires_at}")
        else:
            print(f"  ⚠️  No change for user {user_id}")
    
    print(f"\n✅ Successfully updated {updated_count} free plan subscriptions")
    print(f"All free plan subscriptions now have 6-day duration instead of 30 days")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_free_subscriptions())
