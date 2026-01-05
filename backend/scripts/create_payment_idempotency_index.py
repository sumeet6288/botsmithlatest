"""
Create database indexes for payment idempotency.

This script creates the processed_payments collection and indexes
to support idempotent payment processing.
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def create_indexes():
    """Create indexes for payment idempotency."""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Creating payment idempotency indexes...")
    
    # Create unique compound index on payment_id and user_id
    # This ensures each payment can only be processed once per user
    await db.processed_payments.create_index(
        [("payment_id", 1), ("user_id", 1)],
        unique=True,
        name="payment_id_user_id_unique"
    )
    print("✅ Created unique index: payment_id + user_id")
    
    # Create index on user_id for fast lookups
    await db.processed_payments.create_index(
        [("user_id", 1)],
        name="user_id_index"
    )
    print("✅ Created index: user_id")
    
    # Create index on processed_at for cleanup/reporting
    await db.processed_payments.create_index(
        [("processed_at", -1)],
        name="processed_at_index"
    )
    print("✅ Created index: processed_at")
    
    # Create index on subscription_id for lookups
    await db.processed_payments.create_index(
        [("subscription_id", 1)],
        name="subscription_id_index"
    )
    print("✅ Created index: subscription_id")
    
    # Also ensure subscriptions collection has index on razorpay_payment_id
    await db.subscriptions.create_index(
        [("razorpay_payment_id", 1)],
        name="razorpay_payment_id_index"
    )
    print("✅ Created index: razorpay_payment_id on subscriptions")
    
    print("\n✅ All payment idempotency indexes created successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())
