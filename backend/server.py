from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from routers import auth_router, user_router, chatbots, sources, chat, analytics, plans, advanced_analytics, public_chat, razorpay, admin, admin_users, admin_users_enhanced, admin_chatbots, notifications, integrations, password_reset, telegram, slack, discord, msteams, instagram, admin_leads, leads, tech_management, whatsapp, messenger, payment_settings, admin_settings, admin_direct_login, admin_subscriptions, zapier, supabase_auth
import auth
from services.plan_service import plan_service
from typing import Dict
import json

# Import security middleware
from middleware.security import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    InputValidationMiddleware,
    APIKeyProtectionMiddleware
)

# Import performance middleware for high scalability
from middleware.performance import (
    RequestTimeoutMiddleware,
    PerformanceMonitoringMiddleware,
    ConnectionPoolMiddleware
)

# Import scalability configuration
from config.scalability import ScalabilityConfig, initialize_pool_monitor


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with optimized connection pooling for 1000+ concurrent users
mongo_url = os.environ['MONGO_URL']
client = ScalabilityConfig.get_optimized_mongo_client(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize connection pool monitoring
initialize_pool_monitor(client)

# Log scalability configuration
ScalabilityConfig.log_configuration()

# Initialize auth module with database
auth.init_auth(db)

# Initialize routers with database
auth_router.init_router(db)
user_router.init_router(db)
chatbots.init_router(db)
sources.init_router(db)
chat.init_router(db)
analytics.init_router(db)
advanced_analytics.init_router(db)
public_chat.init_router(db)
razorpay.init_router(db)
admin.init_router(db)
admin_users.init_router(db)
admin_users_enhanced.init_router(db)
admin_chatbots.init_router(db)
notifications.init_router(db)
supabase_auth.init_router(db)

# WebSocket connection manager for real-time notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected for user: {user_id}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user: {user_id}")
    
    async def send_notification(self, user_id: str, notification: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(notification))
            except Exception as e:
                logger.error(f"Error sending notification to {user_id}: {e}")
                self.disconnect(user_id)

manager = ConnectionManager()

# Create the main app without a prefix
# Set max upload size to 100MB
# Disable docs in production for security
enable_docs = os.environ.get('ENVIRONMENT', 'development') != 'production'

app = FastAPI(
    title="BotSmith API",
    description="AI-powered chatbot builder with multi-provider support",
    version="1.0.0",
    docs_url="/api/docs" if enable_docs else None,
    redoc_url="/api/redoc" if enable_docs else None,
    openapi_url="/api/openapi.json" if enable_docs else None
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add health check route
@api_router.get("/")
async def root():
    return {"message": "BotSmith API", "status": "running"}

# Enhanced health check with connection pool status
@api_router.get("/health")
async def health_check():
    """Health check endpoint with database and connection pool status"""
    from config.scalability import get_pool_health
    
    try:
        # Check database connectivity
        await db.command('ping')
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    # Get connection pool health
    pool_health = await get_pool_health()
    
    return {
        "status": "running",
        "database": db_status,
        "connection_pool": pool_health,
        "scalability": {
            "max_pool_size": ScalabilityConfig.MONGO_MAX_POOL_SIZE,
            "min_pool_size": ScalabilityConfig.MONGO_MIN_POOL_SIZE,
            "concurrent_tasks_limit": ScalabilityConfig.ASYNC_CONCURRENCY_LIMIT,
            "rate_limit_per_minute": ScalabilityConfig.RATE_LIMIT_PER_MINUTE
        }
    }

# Include all routers
api_router.include_router(auth_router.router)
api_router.include_router(user_router.router)
api_router.include_router(chatbots.router)
api_router.include_router(sources.router)
api_router.include_router(chat.router)
api_router.include_router(analytics.router)
api_router.include_router(plans.router)
api_router.include_router(advanced_analytics.router)
api_router.include_router(public_chat.router)
api_router.include_router(razorpay.router, prefix="/razorpay", tags=["Razorpay"])
api_router.include_router(admin.router)
api_router.include_router(admin_users.router)
api_router.include_router(admin_users_enhanced.router)
api_router.include_router(admin_chatbots.router)
api_router.include_router(admin_leads.router, prefix="/admin", tags=["Admin Leads"])
api_router.include_router(leads.router, tags=["Leads"])
api_router.include_router(notifications.router)
api_router.include_router(integrations.router)
api_router.include_router(password_reset.router)
api_router.include_router(telegram.router)
api_router.include_router(slack.router)
api_router.include_router(discord.router)
api_router.include_router(msteams.router)
api_router.include_router(instagram.router)
api_router.include_router(whatsapp.router)
api_router.include_router(messenger.router)
api_router.include_router(zapier.router)
api_router.include_router(tech_management.router, prefix="/tech", tags=["Tech Management"])
api_router.include_router(payment_settings.router)
api_router.include_router(admin_settings.router, prefix="/admin/settings", tags=["Admin Settings"])
api_router.include_router(admin_direct_login.router, tags=["Admin Direct Login"])
api_router.include_router(admin_subscriptions.router, tags=["Admin Subscriptions"])
api_router.include_router(supabase_auth.router, tags=["Supabase Auth"])

# Include the router in the main app
app.include_router(api_router)

# Add middleware (order matters - last added runs first)
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Performance monitoring middleware - tracks slow requests
app.add_middleware(PerformanceMonitoringMiddleware, slow_request_threshold=5.0)

# Request timeout middleware - prevents hanging requests (30s timeout)
app.add_middleware(RequestTimeoutMiddleware, timeout=ScalabilityConfig.REQUEST_TIMEOUT)

# Connection pool middleware for efficient DB connection management
app.add_middleware(ConnectionPoolMiddleware)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Rate limiting middleware - configurable from ScalabilityConfig
app.add_middleware(
    RateLimitMiddleware, 
    requests_per_minute=ScalabilityConfig.RATE_LIMIT_PER_MINUTE,
    requests_per_hour=ScalabilityConfig.RATE_LIMIT_PER_HOUR
)

# Input validation middleware
app.add_middleware(InputValidationMiddleware)

# API key protection middleware
app.add_middleware(APIKeyProtectionMiddleware)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize plans, database indexes, and Discord bots on startup"""
    logger.info("Initializing plans...")
    await plan_service.initialize_plans()
    logger.info("Plans initialized successfully")
    
    # Create database indexes for optimal performance
    try:
        from utils.database_indexes import create_performance_indexes
        await create_performance_indexes(db)
    except Exception as e:
        logger.warning(f"Note: Some indexes may already exist: {e}")
    
    # Create default admin user if no users exist
    try:
        logger.info("Checking for existing users...")
        from datetime import datetime, timezone
        from auth import get_password_hash
        from models import User
        
        users_collection = db.users
        user_count = await users_collection.count_documents({})
        
        if user_count == 0:
            logger.info("No users found. Creating default admin user...")
            default_admin = User(
                id="admin-001",
                name="Admin User",
                email="sumeetemail26@gmail.com",
                password_hash=get_password_hash("admin123"),
                role="admin",
                status="active",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            
            user_doc = default_admin.model_dump()
            user_doc['created_at'] = user_doc['created_at'].isoformat()
            user_doc['updated_at'] = user_doc['updated_at'].isoformat()
            if user_doc.get('last_login'):
                user_doc['last_login'] = user_doc['last_login'].isoformat()
            if user_doc.get('suspension_until'):
                user_doc['suspension_until'] = user_doc['suspension_until'].isoformat()
            
            await users_collection.insert_one(user_doc)
            logger.info("✅ Default admin user created successfully!")
            logger.info("   Email: sumeetemail26@gmail.com")
            logger.info("   Password: admin123")
            logger.info("   ⚠️  IMPORTANT: Please change the password after first login!")
        else:
            logger.info(f"Found {user_count} existing users. Skipping default user creation.")
    except Exception as e:
        logger.error(f"Failed to create default admin user: {str(e)}")
    
    # Start Discord bots for enabled integrations
    try:
        logger.info("Starting Discord bots...")
        from services.discord_bot_manager import discord_bot_manager
        result = await discord_bot_manager.restart_all_bots()
        if result.get("success"):
            logger.info(f"Discord bots started: {result.get('count', 0)} bots")
        else:
            logger.warning(f"Discord bot startup issue: {result.get('error')}")
    except Exception as e:
        logger.warning(f"Failed to start Discord bots: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    # Stop all Discord bots
    try:
        from services.discord_bot_manager import discord_bot_manager
        for chatbot_id in list(discord_bot_manager.bots.keys()):
            await discord_bot_manager.stop_bot(chatbot_id)
    except Exception as e:
        logger.warning(f"Error stopping Discord bots: {str(e)}")
    
    client.close()


# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive and listen for any messages
            data = await websocket.receive_text()
            # Echo back to confirm connection is alive
            await websocket.send_text(json.dumps({"type": "ping", "message": "Connection alive"}))
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(user_id)