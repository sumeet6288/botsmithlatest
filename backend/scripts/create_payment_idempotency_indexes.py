"""
Payment Idempotency Database Setup
====================================

Creates necessary indexes for payment idempotency system.
This prevents duplicate payment processing (59-65 day bug).

Run this script once to set up the indexes.

Created: 2025-01-10
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def create_idempotency_indexes():
    """Create indexes for payment idempotency"""
    
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "chatbase_db")
    
    print(f"Connecting to MongoDB: {mongo_url}")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    processed_payments = db.processed_payments
    subscriptions = db.subscriptions
    
    print("\n=== Creating Payment Idempotency Indexes ===\n")
    
    # Index 1: Unique index on payment_id (prevent duplicate processing)
    print("1. Creating unique index on payment_id...")
    await processed_payments.create_index(
        "payment_id",
        unique=True,
        name="payment_id_unique"
    )
    print("✅ Created: payment_id unique index")
    
    # Index 2: Compound index on payment_id + user_id (fast user payment lookups)
    print("\n2. Creating compound index on payment_id + user_id...")
    await processed_payments.create_index(
        [("payment_id", 1), ("user_id", 1)],
        name="payment_user_compound"
    )
    print("✅ Created: payment_id + user_id compound index")
    
    # Index 3: Index on user_id (for user's payment history)
    print("\n3. Creating index on user_id...")
    await processed_payments.create_index(
        "user_id",
        name="user_id_index"
    )
    print("✅ Created: user_id index")
    
    # Index 4: Index on processed_at (for cleanup/audit)
    print("\n4. Creating index on processed_at...")
    await processed_payments.create_index(
        "processed_at",
        name="processed_at_index"
    )
    print("✅ Created: processed_at index")
    
    # Index 5: Index on razorpay_payment_id in subscriptions
    print("\n5. Creating index on razorpay_payment_id in subscriptions...")
    await subscriptions.create_index(
        "razorpay_payment_id",
        name="razorpay_payment_id_index",
        sparse=True  # Not all subscriptions have this field
    )
    print("✅ Created: razorpay_payment_id index in subscriptions")
    
    # Verify indexes
    print("\n=== Verifying Indexes ===\n")
    
    payment_indexes = await processed_payments.index_information()
    print(f"Processed Payments Collection Indexes: {len(payment_indexes)}")
    for idx_name, idx_info in payment_indexes.items():
        print(f"  - {idx_name}: {idx_info.get('key')}")
    
    subscription_indexes = await subscriptions.index_information()
    print(f"\nSubscriptions Collection Indexes: {len(subscription_indexes)}")
    for idx_name, idx_info in subscription_indexes.items():
        if 'razorpay' in idx_name.lower():
            print(f"  - {idx_name}: {idx_info.get('key')}")
    
    print("\n✅ All idempotency indexes created successfully!\n")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_idempotency_indexes())
