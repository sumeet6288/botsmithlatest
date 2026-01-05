"""
Test the Supabase callback endpoint directly
This simulates what happens when SupabaseCallback.jsx calls the backend
"""

import requests
import jwt as pyjwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

load_dotenv('/app/backend/.env')

BACKEND_URL = "http://localhost:8001"
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')

def create_mock_supabase_token():
    """Create a mock Supabase JWT token for testing"""
    payload = {
        "sub": "mock-google-user-456",  # Supabase user ID
        "email": "mockgoogle@test.com",
        "email_confirmed_at": datetime.now(timezone.utc).isoformat(),
        "user_metadata": {
            "full_name": "Mock Google User",
            "avatar_url": "https://example.com/avatar.jpg",
            "provider_id": "12345678",
            "provider": "google"
        },
        "app_metadata": {
            "provider": "google",
            "providers": ["google"]
        },
        "role": "authenticated",
        "aud": "authenticated",
        "exp": (datetime.now(timezone.utc) + timedelta(hours=1)).timestamp(),
        "iat": datetime.now(timezone.utc).timestamp()
    }
    
    token = pyjwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")
    return token

def test_supabase_callback():
    """Test the /api/auth/supabase/callback endpoint"""
    
    print("=" * 80)
    print("TESTING SUPABASE CALLBACK ENDPOINT")
    print("=" * 80)
    
    # Step 1: Create mock Supabase token
    print("\n1. Creating mock Supabase token...")
    supabase_token = create_mock_supabase_token()
    print(f"   ✓ Token created (length: {len(supabase_token)} chars)")
    
    # Step 2: Call the callback endpoint
    print("\n2. Calling /api/auth/supabase/callback...")
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/supabase/callback",
            json={"access_token": supabase_token},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ SUCCESS! Response:")
            print(f"     - access_token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"     - token_type: {data.get('token_type', 'N/A')}")
            print(f"     - user.id: {data.get('user', {}).get('id', 'N/A')}")
            print(f"     - user.email: {data.get('user', {}).get('email', 'N/A')}")
            print(f"     - user.name: {data.get('user', {}).get('name', 'N/A')}")
            print(f"     - user.plan_id: {data.get('user', {}).get('plan_id', 'N/A')}")
            
            app_token = data.get('access_token')
            
            # Step 3: Test using the app token to fetch dashboard data
            print("\n3. Testing dashboard APIs with application JWT...")
            
            # Test chatbots endpoint
            print("\n   3a. Testing GET /api/chatbots...")
            chatbots_response = requests.get(
                f"{BACKEND_URL}/api/chatbots",
                headers={"Authorization": f"Bearer {app_token}"}
            )
            print(f"       Status: {chatbots_response.status_code}")
            if chatbots_response.status_code == 200:
                chatbots = chatbots_response.json()
                print(f"       ✓ Found {len(chatbots.get('data', []))} chatbots")
            else:
                print(f"       ❌ ERROR: {chatbots_response.text[:200]}")
            
            # Test analytics endpoint
            print("\n   3b. Testing GET /api/analytics/dashboard...")
            analytics_response = requests.get(
                f"{BACKEND_URL}/api/analytics/dashboard",
                headers={"Authorization": f"Bearer {app_token}"}
            )
            print(f"       Status: {analytics_response.status_code}")
            if analytics_response.status_code == 200:
                analytics = analytics_response.json()
                print(f"       ✓ Analytics data:")
                print(f"         - total_chatbots: {analytics.get('data', {}).get('total_chatbots', 0)}")
                print(f"         - total_conversations: {analytics.get('data', {}).get('total_conversations', 0)}")
                print(f"         - total_messages: {analytics.get('data', {}).get('total_messages', 0)}")
            else:
                print(f"       ❌ ERROR: {analytics_response.text[:200]}")
            
            # Test usage stats endpoint
            print("\n   3c. Testing GET /api/plans/usage...")
            usage_response = requests.get(
                f"{BACKEND_URL}/api/plans/usage",
                headers={"Authorization": f"Bearer {app_token}"}
            )
            print(f"       Status: {usage_response.status_code}")
            if usage_response.status_code == 200:
                usage = usage_response.json()
                print(f"       ✓ Usage stats retrieved")
                print(f"         - plan: {usage.get('data', {}).get('plan', {}).get('name', 'N/A')}")
            else:
                print(f"       ❌ ERROR: {usage_response.text[:200]}")
            
            print("\n" + "=" * 80)
            print("✅ CALLBACK FLOW TEST COMPLETE")
            print("=" * 80)
            
        else:
            print(f"   ❌ ERROR Response:")
            print(f"   {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    test_supabase_callback()
