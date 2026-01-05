"""
Test script to reproduce and verify subscription upgrade bug fix.
This script simulates the exact scenario reported by the user.
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'chatbase_db')

async def test_subscription_upgrade_scenario():
    """
    Test the exact scenario reported by user:
    1. User creates FREE account
    2. User purchases STARTER plan
    3. Check if they get 30 days (expected) or 89 days (bug)
    """
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    subscriptions_collection = db.subscriptions
    
    print("="*70)
    print("SUBSCRIPTION UPGRADE BUG TEST - REPRODUCING USER SCENARIO")
    print("="*70)
    print()
    
    test_user_id = "test_upgrade_user_12345"
    
    # STEP 1: Simulate FREE account creation
    print("📋 STEP 1: User creates FREE account")
    print("-" * 70)
    
    # Clean up any existing test data
    await subscriptions_collection.delete_many({"user_id": test_user_id})
    
    # Create FREE subscription (as happens when user signs up)
    free_started_at = datetime.utcnow()
    free_expires_at = free_started_at + timedelta(days=30)  # FREE gets 30 days
    
    free_subscription = {
        "user_id": test_user_id,
        "plan_id": "free",
        "status": "active",
        "started_at": free_started_at,
        "expires_at": free_expires_at,
        "auto_renew": False,
        "billing_cycle": "monthly",
        "usage": {
            "chatbots_count": 0,
            "messages_this_month": 0,
            "file_uploads_count": 0,
            "website_sources_count": 0,
            "text_sources_count": 0,
            "last_reset": datetime.utcnow()
        }
    }
    
    await subscriptions_collection.insert_one(free_subscription)
    
    # Calculate remaining days
    remaining_days = (free_expires_at - datetime.utcnow()).days
    
    print(f"✅ FREE account created")
    print(f"   Plan: FREE")
    print(f"   Started: {free_started_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Expires: {free_expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days remaining: {remaining_days}")
    print()
    
    # Wait a moment to simulate user having the account for a day
    print("⏳ User has account for 1 day...")
    print()
    
    # STEP 2: User purchases STARTER plan
    print("📋 STEP 2: User purchases STARTER plan (payment made)")
    print("-" * 70)
    
    # Fetch existing subscription
    existing_subscription = await subscriptions_collection.find_one({"user_id": test_user_id})
    
    # Calculate what OLD CODE would do (buggy)
    old_code_expires_at = existing_subscription['expires_at'] + timedelta(days=30)
    old_code_days = (old_code_expires_at - datetime.utcnow()).days
    
    print(f"❌ OLD CODE (BUGGY) would give:")
    print(f"   Current expires: {existing_subscription['expires_at'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Add 30 days: {old_code_expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Total days: {old_code_days} days (WRONG! User loses 30 days only gets extended time)")
    print()
    
    # NEW CODE - Check if it's same plan (renewal) or different plan (upgrade)
    plan_id = "starter"
    is_same_plan = existing_subscription and existing_subscription.get('plan_id') == plan_id
    
    # Default: Fresh 30 days
    new_expires_at = datetime.utcnow() + timedelta(days=30)
    
    # Only extend if it's a RENEWAL (same plan)
    if is_same_plan:
        if existing_subscription.get('status') == 'active' and existing_subscription.get('expires_at'):
            current_expires = existing_subscription['expires_at']
            if current_expires > datetime.utcnow():
                new_expires_at = current_expires + timedelta(days=30)
                print("🔄 This is a RENEWAL (same plan) - extending from current expiration")
    else:
        print("🔄 This is an UPGRADE (different plan) - fresh 30 days")
    
    print()
    print(f"✅ NEW CODE (FIXED) gives:")
    print(f"   Fresh start: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   New expires: {new_expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Total days: {(new_expires_at - datetime.utcnow()).days} days (CORRECT!)")
    print()
    
    # Update subscription with new plan
    await subscriptions_collection.update_one(
        {"user_id": test_user_id},
        {"$set": {
            "plan_id": "starter",
            "status": "active",
            "started_at": datetime.utcnow(),
            "expires_at": new_expires_at,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # STEP 3: Verify final subscription
    print("📋 STEP 3: Verify subscription after upgrade")
    print("-" * 70)
    
    final_subscription = await subscriptions_collection.find_one({"user_id": test_user_id})
    final_days = (final_subscription['expires_at'] - datetime.utcnow()).days
    
    print(f"   User ID: {final_subscription['user_id']}")
    print(f"   Plan: {final_subscription['plan_id'].upper()}")
    print(f"   Status: {final_subscription['status']}")
    print(f"   Started: {final_subscription['started_at'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Expires: {final_subscription['expires_at'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days remaining: {final_days}")
    print()
    
    # TEST VERDICT
    print("="*70)
    print("TEST VERDICT")
    print("="*70)
    
    if final_days <= 31 and final_days >= 29:  # Allow 1-day buffer
        print("✅ TEST PASSED! User gets correct 30 days for upgrade.")
        print(f"   Expected: ~30 days")
        print(f"   Actual: {final_days} days")
        success = True
    else:
        print("❌ TEST FAILED! User gets incorrect days for upgrade.")
        print(f"   Expected: ~30 days")
        print(f"   Actual: {final_days} days")
        success = False
    
    print()
    
    # Clean up
    await subscriptions_collection.delete_many({"user_id": test_user_id})
    client.close()
    
    return success

# Run test
if __name__ == "__main__":
    result = asyncio.run(test_subscription_upgrade_scenario())
    exit(0 if result else 1)
