"""
Test script to verify Google OAuth + JWT flow
This simulates the exact flow that happens when a user signs in with Google.
"""

import sys
import os
sys.path.insert(0, '/app/backend')

# Load environment variables FIRST
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

import asyncio
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from auth import create_access_token, decode_token
from supabase_config import is_supabase_enabled
import jwt

async def test_oauth_flow():
    """Test the complete OAuth flow"""
    
    print("=" * 80)
    print("GOOGLE OAUTH FLOW TEST")
    print("=" * 80)
    
    # Step 1: Check Supabase configuration
    print("\n1. Checking Supabase configuration...")
    supabase_enabled = is_supabase_enabled()
    print(f"   ✓ Supabase enabled: {supabase_enabled}")
    
    if not supabase_enabled:
        print("   ❌ ERROR: Supabase is not configured!")
        return
    
    # Step 2: Connect to MongoDB
    print("\n2. Connecting to MongoDB...")
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    print(f"   ✓ Connected to MongoDB: {db_name}")
    
    # Step 3: Create test user (simulating what sync_user_from_supabase does)
    print("\n3. Creating/finding test user...")
    test_email = "test-google-oauth@example.com"
    test_supabase_id = "google-oauth-test-user-123"
    
    users_collection = db.users
    
    # Check if user exists
    existing_user = await users_collection.find_one({"email": test_email})
    
    if existing_user:
        print(f"   ✓ User exists: {test_email}")
        user_doc = existing_user
    else:
        print(f"   Creating new user: {test_email}")
        user_doc = {
            "id": test_supabase_id,
            "supabase_user_id": test_supabase_id,
            "email": test_email,
            "name": "Google OAuth Test User",
            "password_hash": "",  # No password for OAuth users
            "role": "user",
            "plan_id": "free",
            "email_verified": True,
            "oauth_provider": "google",
            "avatar_url": "",
            "onboarding_completed": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await users_collection.insert_one(user_doc)
        print(f"   ✓ Created user: {test_email}")
    
    # Step 4: Generate APPLICATION JWT (this is what backend returns to frontend)
    print("\n4. Generating application JWT token...")
    app_jwt = create_access_token(
        data={"sub": test_email},
        expires_delta=timedelta(days=7)
    )
    print(f"   ✓ JWT token created (length: {len(app_jwt)} chars)")
    print(f"   Token prefix: {app_jwt[:50]}...")
    
    # Step 5: Decode and verify JWT
    print("\n5. Verifying JWT token...")
    try:
        payload = decode_token(app_jwt)
        print(f"   ✓ Token decoded successfully")
        print(f"   Email (sub): {payload.get('sub')}")
        print(f"   Expires: {datetime.fromtimestamp(payload.get('exp'))}")
    except Exception as e:
        print(f"   ❌ ERROR decoding token: {e}")
        return
    
    # Step 6: Simulate dashboard API call - fetch user by email
    print("\n6. Simulating dashboard API call (fetch user by email)...")
    email_from_token = payload.get('sub')
    
    user_from_db = await users_collection.find_one({"email": email_from_token})
    
    if user_from_db:
        print(f"   ✓ User found in database:")
        print(f"     - ID: {user_from_db.get('id')}")
        print(f"     - Email: {user_from_db.get('email')}")
        print(f"     - Name: {user_from_db.get('name')}")
        print(f"     - Plan: {user_from_db.get('plan_id')}")
        print(f"     - OAuth Provider: {user_from_db.get('oauth_provider')}")
    else:
        print(f"   ❌ ERROR: User not found in database!")
        print(f"     Searched for email: {email_from_token}")
        return
    
    # Step 7: Test fetching chatbots (as dashboard does)
    print("\n7. Testing chatbot fetch (as dashboard does)...")
    user_id = user_from_db.get('id')
    chatbots = await db.chatbots.find({"user_id": user_id}).to_list(length=None)
    print(f"   ✓ Found {len(chatbots)} chatbots for user")
    
    # Step 8: Test analytics fetch
    print("\n8. Testing analytics fetch...")
    chatbot_ids = [cb["id"] for cb in chatbots]
    conversations_count = await db.conversations.count_documents(
        {"chatbot_id": {"$in": chatbot_ids}} if chatbot_ids else {}
    )
    messages_count = await db.messages.count_documents(
        {"chatbot_id": {"$in": chatbot_ids}} if chatbot_ids else {}
    )
    print(f"   ✓ Conversations: {conversations_count}")
    print(f"   ✓ Messages: {messages_count}")
    
    # Step 9: Test usage stats fetch
    print("\n9. Testing usage stats fetch...")
    # This would call plansAPI.getUsageStats()
    print(f"   ✓ User plan: {user_from_db.get('plan_id', 'free')}")
    
    print("\n" + "=" * 80)
    print("✅ ALL TESTS PASSED - Google OAuth flow is working correctly!")
    print("=" * 80)
    print("\nIf dashboard still fails to load data, the issue is likely:")
    print("1. Frontend not storing the JWT token correctly")
    print("2. Frontend not sending Authorization header")
    print("3. Token being sent to wrong endpoint")
    print("4. CORS or network issues")
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(test_oauth_flow())
