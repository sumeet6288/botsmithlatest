"""Setup Razorpay credentials in database."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime

async def setup_razorpay():
    """Initialize Razorpay payment settings in database."""
    
    # MongoDB connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Get credentials from environment
    key_id = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_Rwf50ghf8cXnW5')
    key_secret = os.environ.get('RAZORPAY_KEY_SECRET', 'A5nHNsJHZuB2rWxVJA6Gv9d8')
    starter_plan_id = os.environ.get('RAZORPAY_STARTER_PLAN_ID', 'plan_RwegzTbSqW9EJW')
    professional_plan_id = os.environ.get('RAZORPAY_PROFESSIONAL_PLAN_ID', 'plan_RwejGOM3SfBKgE')
    
    # Payment settings document
    payment_settings = {
        "razorpay": {
            "enabled": True,
            "test_mode": True,
            "key_id": key_id,
            "key_secret": key_secret,
            "webhook_url": "",
            "webhook_secret": "",
            "plans": {
                "free": "",
                "starter": starter_plan_id,
                "professional": professional_plan_id,
                "enterprise": ""
            }
        },
        "updated_at": datetime.utcnow(),
        "updated_by": "system"
    }
    
    try:
        # Delete existing settings and insert new ones
        await db.payment_settings.delete_many({})
        await db.payment_settings.insert_one(payment_settings)
        print("✅ Razorpay payment settings configured successfully!")
        print(f"   - Enabled: True (Test Mode)")
        print(f"   - Key ID: {key_id}")
        print(f"   - Starter Plan: {starter_plan_id}")
        print(f"   - Professional Plan: {professional_plan_id}")
        
    except Exception as e:
        print(f"❌ Error setting up Razorpay: {str(e)}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(setup_razorpay())
