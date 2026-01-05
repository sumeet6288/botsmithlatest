"""Database indexes for optimal query performance under high load

This module creates indexes on frequently queried fields to ensure
fast response times even with 1000+ concurrent users.
"""
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, TEXT

logger = logging.getLogger(__name__)


async def create_performance_indexes(db: AsyncIOMotorDatabase):
    """Create database indexes for optimal performance
    
    These indexes are crucial for handling high concurrent load:
    - Speed up frequent queries (user lookup, chatbot queries, message retrieval)
    - Enable efficient sorting and filtering
    - Support text search operations
    """
    
    try:
        logger.info("Creating database indexes for optimal performance...")
        
        # ============ USERS COLLECTION ============
        # Index on email for fast user lookup during authentication
        await db.users.create_index([("email", ASCENDING)], unique=True, name="idx_users_email")
        
        # Index on user ID for fast profile queries
        await db.users.create_index([("id", ASCENDING)], unique=True, name="idx_users_id")
        
        # Index on status and role for admin queries
        await db.users.create_index([("status", ASCENDING)], name="idx_users_status")
        await db.users.create_index([("role", ASCENDING)], name="idx_users_role")
        
        # Compound index for filtering users
        await db.users.create_index(
            [("status", ASCENDING), ("role", ASCENDING), ("created_at", DESCENDING)],
            name="idx_users_status_role_created"
        )
        
        logger.info("✅ Created indexes for users collection")
        
        # ============ CHATBOTS COLLECTION ============
        # Index on chatbot ID
        await db.chatbots.create_index([("id", ASCENDING)], unique=True, name="idx_chatbots_id")
        
        # Index on user_id for retrieving user's chatbots
        await db.chatbots.create_index([("user_id", ASCENDING)], name="idx_chatbots_user_id")
        
        # Compound index for user's active chatbots
        await db.chatbots.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_chatbots_user_created"
        )
        
        # Text index for chatbot name search
        await db.chatbots.create_index([("name", TEXT)], name="idx_chatbots_name_text")
        
        logger.info("✅ Created indexes for chatbots collection")
        
        # ============ MESSAGES COLLECTION ============
        # Index on conversation_id for fast message retrieval
        await db.messages.create_index([("conversation_id", ASCENDING)], name="idx_messages_conversation")
        
        # Compound index for conversation messages ordered by time
        await db.messages.create_index(
            [("conversation_id", ASCENDING), ("timestamp", ASCENDING)],
            name="idx_messages_conversation_timestamp"
        )
        
        # Index on chatbot_id for analytics
        await db.messages.create_index([("chatbot_id", ASCENDING)], name="idx_messages_chatbot")
        
        logger.info("✅ Created indexes for messages collection")
        
        # ============ CONVERSATIONS COLLECTION ============
        # Index on conversation ID
        await db.conversations.create_index([("id", ASCENDING)], unique=True, name="idx_conversations_id")
        
        # Index on chatbot_id for retrieving chatbot conversations
        await db.conversations.create_index([("chatbot_id", ASCENDING)], name="idx_conversations_chatbot")
        
        # Compound index for chatbot conversations ordered by time
        await db.conversations.create_index(
            [("chatbot_id", ASCENDING), ("started_at", DESCENDING)],
            name="idx_conversations_chatbot_started"
        )
        
        # Index on session_id for fast session lookup
        await db.conversations.create_index([("session_id", ASCENDING)], name="idx_conversations_session")
        
        logger.info("✅ Created indexes for conversations collection")
        
        # ============ SOURCES COLLECTION ============
        # Index on source ID
        await db.sources.create_index([("id", ASCENDING)], unique=True, name="idx_sources_id")
        
        # Index on chatbot_id for retrieving chatbot sources
        await db.sources.create_index([("chatbot_id", ASCENDING)], name="idx_sources_chatbot")
        
        # Index on source type
        await db.sources.create_index([("type", ASCENDING)], name="idx_sources_type")
        
        # Compound index for chatbot sources by type
        await db.sources.create_index(
            [("chatbot_id", ASCENDING), ("type", ASCENDING)],
            name="idx_sources_chatbot_type"
        )
        
        logger.info("✅ Created indexes for sources collection")
        
        # ============ CHUNKS COLLECTION (for RAG) ============
        # Index on chatbot_id for RAG queries
        await db.chunks.create_index([("chatbot_id", ASCENDING)], name="idx_chunks_chatbot")
        
        # Index on source_id
        await db.chunks.create_index([("source_id", ASCENDING)], name="idx_chunks_source")
        
        # Text index for content search
        await db.chunks.create_index([("content", TEXT)], name="idx_chunks_content_text")
        
        # Compound index for efficient RAG retrieval
        await db.chunks.create_index(
            [("chatbot_id", ASCENDING), ("source_id", ASCENDING)],
            name="idx_chunks_chatbot_source"
        )
        
        logger.info("✅ Created indexes for chunks collection")
        
        # ============ NOTIFICATIONS COLLECTION ============
        # Index on user_id for fast notification retrieval
        await db.notifications.create_index([("user_id", ASCENDING)], name="idx_notifications_user")
        
        # Compound index for user's unread notifications
        await db.notifications.create_index(
            [("user_id", ASCENDING), ("read", ASCENDING), ("created_at", DESCENDING)],
            name="idx_notifications_user_read_created"
        )
        
        logger.info("✅ Created indexes for notifications collection")
        
        # ============ INTEGRATIONS COLLECTION ============
        # Index on chatbot_id
        await db.integrations.create_index([("chatbot_id", ASCENDING)], name="idx_integrations_chatbot")
        
        # Index on integration type
        await db.integrations.create_index([("type", ASCENDING)], name="idx_integrations_type")
        
        # Index on enabled status
        await db.integrations.create_index([("enabled", ASCENDING)], name="idx_integrations_enabled")
        
        logger.info("✅ Created indexes for integrations collection")
        
        # ============ SUBSCRIPTION PLANS COLLECTION ============
        # Index on plan name
        await db.subscription_plans.create_index([("name", ASCENDING)], unique=True, name="idx_plans_name")
        
        logger.info("✅ Created indexes for subscription_plans collection")
        
        logger.info("="*80)
        logger.info("🚀 ALL DATABASE INDEXES CREATED SUCCESSFULLY")
        logger.info("   Performance optimizations active for high concurrent load")
        logger.info("="*80)
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")
        # Don't raise - indexes might already exist, which is fine
