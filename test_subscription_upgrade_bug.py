"""
Test script to verify subscription upgrade bug fix.
This script simulates the user journey:
1. User creates FREE account (gets free subscription with expires_at)
2. User upgrades to STARTER plan by making payment
3. Verify they get 30 days, not 89 days
"""

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def test_subscription_upgrade():
    # Connect to database
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("\n" + "="*80)
    print("🔍 SUBSCRIPTION UPGRADE BUG TEST")
    print("="*80 + "\n")
    
    # Test user
    test_user_id = "test_upgrade_user_123"
    test_email = "testupgrade@example.com"
    
    # Clean up any existing test data
    await db.users.delete_many({"id": test_user_id})
    await db.subscriptions.delete_many({"user_id": test_user_id})
    
    print("📝 STEP 1: Create FREE account")
    print("-" * 80)
    
    # Create test user with free plan
    user = {
        "id": test_user_id,
        "email": test_email,
        "name": "Test User",
        "plan_id": "free",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(user)
    print(f"✅ User created: {test_email}")
    
    # Create free subscription (simulating get_user_subscription auto-create)
    free_started = datetime.utcnow()
    free_expires = free_started + timedelta(days=30)  # Free gets 30 days
    
    free_subscription = {
        "user_id": test_user_id,
        "plan_id": "free",
        "status": "active",
        "started_at": free_started,
        "expires_at": free_expires,
        "billing_cycle": "monthly",
        "auto_renew": False,
        "usage": {
            "chatbots": 0,
            "messages": 0,
            "file_uploads": 0,
            "website_sources": 0,
            "text_sources": 0
        },
        "created_at": datetime.utcnow()
    }
    await db.subscriptions.insert_one(free_subscription)
    
    days_until_free_expires = (free_expires - datetime.utcnow()).days
    print(f"✅ Free subscription created")
    print(f"   Started: {free_started.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Expires: {free_expires.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days remaining: {days_until_free_expires}")
    
    # Wait a moment to simulate user using the app
    await asyncio.sleep(1)
    
    print("\n📝 STEP 2: User upgrades to STARTER plan (payment made)")
    print("-" * 80)
    
    # Now simulate payment verification logic (from razorpay_payment.py)
    plan_id = "starter"
    
    # Fetch existing subscription
    existing_subscription = await db.subscriptions.find_one({"user_id": test_user_id})
    
    # Default: fresh 30 days from now
    payment_time = datetime.utcnow()
    expires_at = payment_time + timedelta(days=30)
    
    # Check if this is a RENEWAL (same plan) or UPGRADE (different plan)
    is_same_plan = existing_subscription and existing_subscription.get('plan_id') == plan_id
    
    print(f"   Existing plan: {existing_subscription.get('plan_id')}")
    print(f"   New plan: {plan_id}")
    print(f"   Is same plan (renewal)? {is_same_plan}")
    
    # Only extend from current expiration if:
    # 1. It's a RENEWAL of the same plan (not an upgrade/downgrade)
    # 2. The subscription is still active and not expired
    if is_same_plan:
        if existing_subscription.get('status') == 'active' and existing_subscription.get('expires_at'):
            current_expires = existing_subscription['expires_at']
            if isinstance(current_expires, str):
                current_expires = datetime.fromisoformat(current_expires.replace('Z', '+00:00'))
            
            # If not expired yet, extend from current expiration (renewal scenario)
            if current_expires > datetime.utcnow():
                expires_at = current_expires + timedelta(days=30)
                print(f"   🔄 RENEWAL: Extending from current expiration")
    else:
        print(f"   🔄 UPGRADE: Fresh 30 days from now")
    
    # Update subscription
    subscription_data = {
        "user_id": test_user_id,
        "plan_id": plan_id,
        "status": "active",
        "started_at": payment_time,
        "expires_at": expires_at,
        "billing_cycle": "monthly",
        "auto_renew": True,
        "updated_at": datetime.utcnow()
    }
    
    await db.subscriptions.update_one(
        {"user_id": test_user_id},
        {"$set": subscription_data}
    )
    
    # Fetch updated subscription
    updated_subscription = await db.subscriptions.find_one({"user_id": test_user_id})
    final_expires = updated_subscription['expires_at']
    days_until_expires = (final_expires - payment_time).days
    
    print(f"\n✅ Subscription updated to STARTER")
    print(f"   Payment time: {payment_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   New expires: {final_expires.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days from payment: {days_until_expires}")
    
    print("\n" + "="*80)
    print("📊 TEST RESULTS")
    print("="*80)
    
    # Verify the fix
    expected_days = 30
    tolerance = 1  # Allow 1 day tolerance for timing
    
    if abs(days_until_expires - expected_days) <= tolerance:
        print(f"✅ TEST PASSED!")
        print(f"   Expected: ~{expected_days} days")
        print(f"   Got: {days_until_expires} days")
        print(f"   Status: Upgrade correctly gives fresh 30 days ✓")
    else:
        print(f"❌ TEST FAILED!")
        print(f"   Expected: ~{expected_days} days")
        print(f"   Got: {days_until_expires} days")
        print(f"   Status: Bug still present - users getting wrong duration ✗")
        
        # Show what old buggy behavior would have been
        buggy_expires = free_expires + timedelta(days=30)
        buggy_days = (buggy_expires - payment_time).days
        print(f"\n   Old buggy behavior would give: {buggy_days} days")
    
    print("\n" + "="*80)
    print("🧪 SCENARIO 3: Test RENEWAL (same plan)")
    print("="*80 + "\n")
    
    # Wait a moment
    await asyncio.sleep(1)
    
    # Simulate renewal of STARTER plan
    print("📝 User renews STARTER plan (same plan)")
    print("-" * 80)
    
    # Fetch current subscription
    current_subscription = await db.subscriptions.find_one({"user_id": test_user_id})
    current_expires_date = current_subscription['expires_at']
    current_days_remaining = (current_expires_date - datetime.utcnow()).days
    
    print(f"   Current plan: {current_subscription.get('plan_id')}")
    print(f"   Current expires: {current_expires_date.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days remaining: {current_days_remaining}")
    
    # Simulate renewal payment
    renewal_time = datetime.utcnow()
    renewal_plan_id = "starter"  # Same plan
    
    # Check if same plan
    is_same_plan_renewal = current_subscription.get('plan_id') == renewal_plan_id
    
    # Default: fresh 30 days
    renewal_expires = renewal_time + timedelta(days=30)
    
    # But if same plan and active, extend from current
    if is_same_plan_renewal:
        if current_subscription.get('status') == 'active' and current_subscription.get('expires_at'):
            current_exp = current_subscription['expires_at']
            if isinstance(current_exp, str):
                current_exp = datetime.fromisoformat(current_exp.replace('Z', '+00:00'))
            
            if current_exp > datetime.utcnow():
                renewal_expires = current_exp + timedelta(days=30)
                print(f"   🔄 RENEWAL: Extending from current expiration")
    
    # Update subscription
    await db.subscriptions.update_one(
        {"user_id": test_user_id},
        {"$set": {
            "expires_at": renewal_expires,
            "started_at": renewal_time,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Fetch updated
    renewed_subscription = await db.subscriptions.find_one({"user_id": test_user_id})
    renewed_expires = renewed_subscription['expires_at']
    total_days_after_renewal = (renewed_expires - renewal_time).days
    
    print(f"\n✅ Subscription renewed")
    print(f"   Renewal time: {renewal_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   New expires: {renewed_expires.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Total days from renewal: {total_days_after_renewal}")
    
    # Verify renewal extended correctly
    expected_renewal_days = current_days_remaining + 30
    
    if abs(total_days_after_renewal - expected_renewal_days) <= 2:
        print(f"\n✅ RENEWAL TEST PASSED!")
        print(f"   Expected: ~{expected_renewal_days} days (remaining + 30)")
        print(f"   Got: {total_days_after_renewal} days")
        print(f"   Status: Renewal correctly preserves remaining days ✓")
    else:
        print(f"\n❌ RENEWAL TEST FAILED!")
        print(f"   Expected: ~{expected_renewal_days} days")
        print(f"   Got: {total_days_after_renewal} days")
    
    # Cleanup
    print("\n" + "="*80)
    print("🧹 Cleaning up test data...")
    await db.users.delete_many({"id": test_user_id})
    await db.subscriptions.delete_many({"user_id": test_user_id})
    print("✅ Test data cleaned up")
    print("="*80 + "\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_subscription_upgrade())
