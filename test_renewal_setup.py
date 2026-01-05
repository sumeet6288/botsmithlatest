#!/usr/bin/env python3
"""
Script to setup test users for renewal model testing
Creates 2 users:
1. user1@test.com - Subscription with 3 days remaining
2. user2@test.com - Expired subscription
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import bcrypt
import os

async def setup_test_users():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Connected to MongoDB")
    
    # Initialize plans first
    plans_collection = db.plans
    existing_plans = await plans_collection.count_documents({})
    
    if existing_plans == 0:
        print("\nInitializing subscription plans...")
        plans_data = [
            {
                "id": "free",
                "name": "Free",
                "price": 0.0,
                "description": "Perfect for trying out BotSmith",
                "limits": {
                    "max_chatbots": 1,
                    "max_messages_per_month": 100,
                    "max_file_uploads": 5,
                    "max_file_size_mb": 10,
                    "max_website_sources": 2,
                    "max_text_sources": 5,
                    "max_leads": 50,
                    "conversation_history_days": 7,
                    "allowed_ai_providers": ["openai"],
                    "api_access": False,
                    "custom_branding": False,
                    "analytics_level": "basic",
                    "support_level": "community"
                },
                "features": ["1 chatbot", "100 messages/month", "Basic analytics"],
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": "starter",
                "name": "Starter",
                "price": 7999.0,
                "description": "For growing businesses",
                "limits": {
                    "max_chatbots": 5,
                    "max_messages_per_month": 15000,
                    "max_file_uploads": 20,
                    "max_file_size_mb": 50,
                    "max_website_sources": 10,
                    "max_text_sources": 20,
                    "max_leads": 100,
                    "conversation_history_days": 30,
                    "allowed_ai_providers": ["openai", "anthropic"],
                    "api_access": True,
                    "custom_branding": True,
                    "analytics_level": "advanced",
                    "support_level": "priority"
                },
                "features": ["5 chatbots", "15,000 messages/month", "Advanced analytics", "Custom branding"],
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        await plans_collection.insert_many(plans_data)
        print(f"✅ Created {len(plans_data)} subscription plans")
    else:
        print(f"✅ Plans already exist ({existing_plans} plans)")
    
    # Create test users
    users_collection = db.users
    subscriptions_collection = db.subscriptions
    
    # Password hash for 'password123'
    password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    now = datetime.utcnow()
    
    # USER 1: Subscription with 3 days remaining
    print("\n" + "="*60)
    print("Creating USER 1: user1@test.com (3 days remaining)")
    print("="*60)
    
    # Delete if exists
    await users_collection.delete_one({"email": "user1@test.com"})
    await subscriptions_collection.delete_one({"user_id": "test-user-1"})
    
    user1 = {
        "id": "test-user-1",
        "name": "Test User 1",
        "email": "user1@test.com",
        "password_hash": password_hash,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "role": "user",
        "status": "active",
        "plan_id": "starter",
        "email_verified": True,
        "onboarding_completed": True
    }
    
    await users_collection.insert_one(user1)
    print(f"✅ Created user: {user1['email']}")
    
    # Create subscription with 3 days remaining
    expires_in_3_days = now + timedelta(days=3)
    started_30_days_ago = now - timedelta(days=27)  # 30 day plan, 27 days used, 3 remaining
    
    subscription1 = {
        "user_id": "test-user-1",
        "plan_id": "starter",
        "status": "active",
        "started_at": started_30_days_ago,
        "expires_at": expires_in_3_days,
        "auto_renew": False,
        "billing_cycle": "monthly",
        "usage": {
            "chatbots_count": 2,
            "messages_this_month": 1500,
            "file_uploads_count": 5,
            "website_sources_count": 3,
            "text_sources_count": 8,
            "last_reset": now
        }
    }
    
    await subscriptions_collection.insert_one(subscription1)
    print(f"✅ Created subscription for user1@test.com")
    print(f"   Plan: Starter (₹7,999)")
    print(f"   Status: active")
    print(f"   Started: {started_30_days_ago.strftime('%Y-%m-%d')}")
    print(f"   Expires: {expires_in_3_days.strftime('%Y-%m-%d')} (3 days remaining)")
    print(f"   Usage: 2/5 chatbots, 1500/15000 messages")
    
    # USER 2: Expired subscription
    print("\n" + "="*60)
    print("Creating USER 2: user2@test.com (EXPIRED)")
    print("="*60)
    
    # Delete if exists
    await users_collection.delete_one({"email": "user2@test.com"})
    await subscriptions_collection.delete_one({"user_id": "test-user-2"})
    
    user2 = {
        "id": "test-user-2",
        "name": "Test User 2",
        "email": "user2@test.com",
        "password_hash": password_hash,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "role": "user",
        "status": "active",
        "plan_id": "starter",
        "email_verified": True,
        "onboarding_completed": True
    }
    
    await users_collection.insert_one(user2)
    print(f"✅ Created user: {user2['email']}")
    
    # Create expired subscription (expired 5 days ago)
    expired_5_days_ago = now - timedelta(days=5)
    started_35_days_ago = now - timedelta(days=35)  # 30 day plan expired 5 days ago
    
    subscription2 = {
        "user_id": "test-user-2",
        "plan_id": "starter",
        "status": "expired",
        "started_at": started_35_days_ago,
        "expires_at": expired_5_days_ago,
        "auto_renew": False,
        "billing_cycle": "monthly",
        "usage": {
            "chatbots_count": 4,
            "messages_this_month": 12000,
            "file_uploads_count": 15,
            "website_sources_count": 7,
            "text_sources_count": 18,
            "last_reset": expired_5_days_ago
        }
    }
    
    await subscriptions_collection.insert_one(subscription2)
    print(f"✅ Created subscription for user2@test.com")
    print(f"   Plan: Starter (₹7,999)")
    print(f"   Status: expired")
    print(f"   Started: {started_35_days_ago.strftime('%Y-%m-%d')}")
    print(f"   Expired: {expired_5_days_ago.strftime('%Y-%m-%d')} (5 days overdue)")
    print(f"   Usage: 4/5 chatbots, 12000/15000 messages")
    
    print("\n" + "="*60)
    print("TEST USERS SETUP COMPLETE!")
    print("="*60)
    print("\nLogin Credentials:")
    print("  User 1 (3 days left):  user1@test.com / password123")
    print("  User 2 (expired):      user2@test.com / password123")
    print("\nYou can now test:")
    print("  1. Dashboard view for user with 3 days remaining")
    print("  2. Dashboard view for user with expired subscription")
    print("  3. Renewal functionality for both users")
    print("  4. Expiration warnings and modals")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_test_users())
