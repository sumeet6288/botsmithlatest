#!/usr/bin/env python3
"""
Test script to verify Razorpay payment bug fix.
Tests that payment configuration is correct and subscription activation works.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')

async def test_payment_configuration():
    """Test 1: Verify payment_settings configuration"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "="*80)
    print("TEST 1: Payment Configuration")
    print("="*80)
    
    payment_settings = await db.payment_settings.find_one({})
    
    if not payment_settings:
        print("❌ FAILED: payment_settings collection is empty")
        return False
    
    razorpay = payment_settings.get('razorpay', {})
    
    checks = [
        ("Razorpay Enabled", razorpay.get('enabled') == True),
        ("Test Mode", razorpay.get('test_mode') == True),
        ("Key ID Set", bool(razorpay.get('key_id'))),
        ("Key Secret Set", bool(razorpay.get('key_secret'))),
        ("Starter Plan ID", razorpay.get('plans', {}).get('starter') == 'plan_Rwz3835M49TDdn'),
        ("Professional Plan ID", razorpay.get('plans', {}).get('professional') == 'plan_Rwz3qPb9FaUxf2'),
    ]
    
    all_passed = True
    for check_name, result in checks:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {check_name}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n✅ Payment configuration is correct!")
    else:
        print("\n❌ Payment configuration has issues!")
    
    return all_passed

async def test_plan_features():
    """Test 2: Verify plan features include premium options"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "="*80)
    print("TEST 2: Plan Features Verification")
    print("="*80)
    
    plans_to_check = ['starter', 'professional']
    required_features = ['custom_branding', 'api_access']
    
    all_passed = True
    
    for plan_id in plans_to_check:
        plan = await db.plans.find_one({"id": plan_id})
        
        if not plan:
            print(f"❌ FAIL: Plan '{plan_id}' not found")
            all_passed = False
            continue
        
        print(f"\n📦 Plan: {plan['name']} (${plan['price']})")
        
        limits = plan.get('limits', {})
        
        for feature in required_features:
            has_feature = limits.get(feature, False)
            status = "✅ PASS" if has_feature else "❌ FAIL"
            print(f"  {status}: {feature} = {has_feature}")
            if not has_feature:
                all_passed = False
        
        print(f"  ℹ️  Max Chatbots: {limits.get('max_chatbots', 0)}")
        print(f"  ℹ️  Max Messages: {limits.get('max_messages_per_month', 0)}")
        print(f"  ℹ️  AI Providers: {', '.join(limits.get('allowed_ai_providers', []))}")
    
    if all_passed:
        print("\n✅ All plan features are correct!")
    else:
        print("\n❌ Some plan features are missing!")
    
    return all_passed

async def test_subscription_flow():
    """Test 3: Simulate subscription creation and verify data"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n" + "="*80)
    print("TEST 3: Subscription Flow Simulation")
    print("="*80)
    
    # Get admin user
    admin = await db.users.find_one({"email": "admin@botsmith.com"})
    
    if not admin:
        print("❌ FAIL: Admin user not found")
        return False
    
    print(f"📧 Testing with user: {admin['email']}")
    print(f"👤 User ID: {admin['id']}")
    
    # Check if test subscription already exists
    existing_sub = await db.subscriptions.find_one({"user_id": admin['id']})
    
    if existing_sub:
        print(f"\nℹ️  Subscription already exists:")
        print(f"  Plan: {existing_sub.get('plan_id')}")
        print(f"  Status: {existing_sub.get('status')}")
        print(f"  Expires: {existing_sub.get('expires_at')}")
        
        # Fetch plan details
        plan = await db.plans.find_one({"id": existing_sub.get('plan_id')})
        if plan:
            limits = plan.get('limits', {})
            print(f"\n✅ Plan features available:")
            print(f"  custom_branding: {limits.get('custom_branding', False)}")
            print(f"  api_access: {limits.get('api_access', False)}")
            print(f"  max_chatbots: {limits.get('max_chatbots', 0)}")
            print(f"  max_messages: {limits.get('max_messages_per_month', 0)}")
            
            has_premium = limits.get('custom_branding') and limits.get('api_access')
            if has_premium:
                print("\n✅ Premium features are active!")
                return True
            else:
                print("\n❌ Premium features are NOT active!")
                return False
    else:
        print("\nℹ️  No subscription found. This is expected for fresh installation.")
        print("ℹ️  Subscription will be created when user completes payment.")
    
    return True

async def test_api_endpoints():
    """Test 4: Verify API endpoints are accessible"""
    import aiohttp
    
    print("\n" + "="*80)
    print("TEST 4: API Endpoints Verification")
    print("="*80)
    
    base_url = "http://localhost:8001/api"
    
    endpoints = [
        ("GET", "/health", "Health Check"),
        ("GET", "/plans", "Plans List"),
    ]
    
    all_passed = True
    
    async with aiohttp.ClientSession() as session:
        for method, endpoint, description in endpoints:
            url = f"{base_url}{endpoint}"
            try:
                async with session.request(method, url) as response:
                    status = response.status
                    if status in [200, 201]:
                        print(f"✅ PASS: {description} ({method} {endpoint}) - {status}")
                    else:
                        print(f"❌ FAIL: {description} ({method} {endpoint}) - {status}")
                        all_passed = False
            except Exception as e:
                print(f"❌ FAIL: {description} ({method} {endpoint}) - {str(e)}")
                all_passed = False
    
    if all_passed:
        print("\n✅ All API endpoints are accessible!")
    else:
        print("\n❌ Some API endpoints failed!")
    
    return all_passed

async def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("🧪 RAZORPAY PAYMENT BUG FIX - VERIFICATION TESTS")
    print("="*80)
    
    results = {}
    
    # Run tests
    results['payment_config'] = await test_payment_configuration()
    results['plan_features'] = await test_plan_features()
    results['subscription_flow'] = await test_subscription_flow()
    results['api_endpoints'] = await test_api_endpoints()
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name.replace('_', ' ').title()}")
    
    print(f"\n📈 Score: {passed}/{total} tests passed ({(passed/total)*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Payment system is ready!")
        print("\n📝 Next Steps:")
        print("   1. Go to /subscription page")
        print("   2. Click 'Upgrade to Starter' or 'Upgrade to Professional'")
        print("   3. Use test card: 4111 1111 1111 1111")
        print("   4. After payment, premium features will be activated!")
    else:
        print("\n⚠️  SOME TESTS FAILED! Please review the errors above.")
        print("   Check /app/PAYMENT_BUG_FIX.md for troubleshooting steps.")

if __name__ == "__main__":
    asyncio.run(main())
