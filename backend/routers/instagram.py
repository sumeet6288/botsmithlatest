from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Query
from typing import Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import hashlib
import hmac
from services.instagram_service import InstagramService
from services.chat_service import ChatService
from models import InstagramWebhookSetup, InstagramMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/instagram", tags=["instagram"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'chatbase_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Store active Instagram services per chatbot
instagram_services = {}


def get_instagram_service(page_access_token: str) -> InstagramService:
    """Get or create InstagramService instance"""
    if page_access_token not in instagram_services:
        instagram_services[page_access_token] = InstagramService(page_access_token)
    return instagram_services[page_access_token]


async def get_integration_by_chatbot(chatbot_id: str) -> Optional[dict]:
    """Get Instagram integration for a chatbot"""
    integration = await db.integrations.find_one({
        "chatbot_id": chatbot_id,
        "integration_type": "instagram",
        "enabled": True
    })
    return integration


async def process_instagram_message(
    chatbot_id: str,
    sender_id: str,
    message_text: str,
    sender_name: str = "Instagram User"
):
    """Process incoming Instagram message and generate AI response"""
    try:
        # Get chatbot configuration
        chatbot = await db.chatbots.find_one({"id": chatbot_id})
        if not chatbot:
            logger.error(f"Chatbot not found: {chatbot_id}")
            return
        
        # Get Instagram integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            logger.error(f"Instagram integration not found for chatbot: {chatbot_id}")
            return
        
        page_access_token = integration['credentials'].get('page_access_token')
        if not page_access_token:
            logger.error(f"Page access token not found for chatbot: {chatbot_id}")
            return
        
        instagram_service = get_instagram_service(page_access_token)
        
        # ✅ CHECK IF CHATBOT IS ACTIVE
        if chatbot.get("status") != "active":
            inactive_message = (
                f"⚠️ Chatbot Inactive\n\n"
                f"This chatbot is currently inactive and cannot process messages.\n"
                f"Please contact the chatbot owner to activate it.\n\n"
                f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://login-whitespace.preview.emergentagent.com')}"
            )
            await instagram_service.send_message(sender_id, inactive_message)
            logger.info(f"Chatbot {chatbot_id} is inactive. Skipping message processing.")
            return
        
        # ✅ CHECK MESSAGE LIMIT BEFORE PROCESSING
        owner_user_id = chatbot.get('user_id')
        if owner_user_id:
            from services.plan_service import plan_service
            limit_check = await plan_service.check_limit(owner_user_id, "messages")
            
            if limit_check.get("reached"):
                # Send limit exceeded message to user
                limit_message = (
                    f"⚠️ Message Limit Reached\n\n"
                    f"This chatbot has used {limit_check['current']}/{limit_check['max']} messages this month.\n"
                    f"The owner needs to upgrade their plan to continue using this bot.\n\n"
                    f"Dashboard: {os.environ.get('FRONTEND_URL', 'https://login-whitespace.preview.emergentagent.com')}"
                )
                await instagram_service.send_message(sender_id, limit_message)
                logger.warning(f"Message limit reached for user {owner_user_id}. Current: {limit_check['current']}, Max: {limit_check['max']}")
                return
        
        # Generate session ID based on sender
        session_id = f"instagram_{sender_id}"
        
        # Get or create conversation
        conversation = await db.conversations.find_one({
            "chatbot_id": chatbot_id,
            "session_id": session_id
        })
        
        if not conversation:
            conversation_id = str(uuid.uuid4())
            conversation = {
                "id": conversation_id,
                "chatbot_id": chatbot_id,
                "session_id": session_id,
                "user_name": sender_name,
                "user_email": f"instagram_{sender_id}",
                "status": "active",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "message_count": 0,
                "platform": "instagram"
            }
            await db.conversations.insert_one(conversation)
        else:
            conversation_id = conversation['id']
        
        # Save user message
        user_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "role": "user",
            "content": message_text,
            "timestamp": datetime.now(timezone.utc)
        }
        await db.messages.insert_one(user_message)
        
        # Get knowledge base context
        sources = await db.sources.find({
            "chatbot_id": chatbot_id,
            "status": "completed"
        }).to_list(length=None)
        
        context = ""
        if sources:
            from services.vector_store import VectorStore
            vector_store = VectorStore()
            relevant_chunks = await vector_store.search(
                chatbot_id=chatbot_id,
                query=message_text,
                top_k=2
            )
            if relevant_chunks:
                context = "\n\n".join([chunk['text'] for chunk in relevant_chunks])
        
        # Initialize chat service
        chat_service = ChatService()
        
        # Generate AI response
        system_message = chatbot.get('system_message', 'You are a helpful AI assistant.')
        
        # Pass context to generate_response
        ai_response_tuple = await chat_service.generate_response(
            message=message_text,
            session_id=session_id,
            system_message=system_message,
            model=chatbot.get('model', 'gpt-4o-mini'),
            provider=chatbot.get('provider', 'openai'),
            context=context
        )
        
        # Unpack the response tuple (message, citation_footer)
        ai_response = ai_response_tuple[0] if isinstance(ai_response_tuple, tuple) else ai_response_tuple
        
        # Save assistant message
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc)
        }
        await db.messages.insert_one(assistant_message)
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"message_count": 2}
            }
        )
        
        # Update subscription usage
        user = await db.users.find_one({"id": chatbot.get('user_id')})
        if user:
            await db.subscriptions.update_one(
                {"user_id": user['id']},
                {"$inc": {"messages_this_month": 2}}
            )
        
        # Send response back to Instagram
        send_result = await instagram_service.send_message(sender_id, ai_response)
        
        if send_result['success']:
            logger.info(f"Instagram message sent successfully to {sender_id}")
            
            # Log integration activity
            await db.integration_logs.insert_one({
                "id": str(uuid.uuid4()),
                "integration_id": integration['id'],
                "chatbot_id": chatbot_id,
                "event_type": "message_sent",
                "status": "success",
                "message": f"Message sent to {sender_id}",
                "metadata": {"sender_id": sender_id},
                "timestamp": datetime.now(timezone.utc)
            })
        else:
            logger.error(f"Failed to send Instagram message: {send_result.get('error')}")
            
            # Log error
            await db.integration_logs.insert_one({
                "id": str(uuid.uuid4()),
                "integration_id": integration['id'],
                "chatbot_id": chatbot_id,
                "event_type": "error",
                "status": "failure",
                "message": f"Failed to send message: {send_result.get('error')}",
                "metadata": {"sender_id": sender_id},
                "timestamp": datetime.now(timezone.utc)
            })
    
    except Exception as e:
        logger.error(f"Error processing Instagram message: {str(e)}")


@router.post("/webhook/{chatbot_id}")
async def instagram_webhook(
    chatbot_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token")
):
    """
    Instagram webhook endpoint for receiving messages
    Handles both webhook verification and message receiving
    """
    
    # Handle webhook verification (GET request)
    if hub_mode == "subscribe":
        integration = await get_integration_by_chatbot(chatbot_id)
        
        if not integration:
            logger.error(f"No Instagram integration found for chatbot: {chatbot_id}")
            raise HTTPException(status_code=404, detail="Integration not found")
        
        expected_verify_token = integration['credentials'].get('verify_token', 'instagram_verify_token')
        
        if hub_verify_token == expected_verify_token:
            logger.info(f"Instagram webhook verified for chatbot: {chatbot_id}")
            return int(hub_challenge)
        else:
            logger.error(f"Instagram webhook verification failed for chatbot: {chatbot_id}")
            raise HTTPException(status_code=403, detail="Verification failed")
    
    # Handle incoming messages (POST request)
    try:
        data = await request.json()
        logger.info(f"Received Instagram webhook data: {data}")
        
        # Get integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration or not integration.get('enabled'):
            logger.error(f"Instagram integration not enabled for chatbot: {chatbot_id}")
            return {"status": "error", "message": "Integration not enabled"}
        
        # Process each entry
        for entry in data.get('entry', []):
            # Process messaging events
            for messaging_event in entry.get('messaging', []):
                sender_id = messaging_event.get('sender', {}).get('id')
                
                # Skip if no sender ID
                if not sender_id:
                    continue
                
                # Check if this is a message (not postback or other event)
                if 'message' in messaging_event:
                    message = messaging_event['message']
                    message_text = message.get('text', '')
                    
                    # Skip empty messages or messages from the page itself
                    if not message_text or messaging_event.get('recipient', {}).get('id') == sender_id:
                        continue
                    
                    logger.info(f"Processing Instagram message from {sender_id}: {message_text}")
                    
                    # Process message in background
                    background_tasks.add_task(
                        process_instagram_message,
                        chatbot_id,
                        sender_id,
                        message_text
                    )
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Error processing Instagram webhook: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.post("/{chatbot_id}/setup-webhook")
async def setup_instagram_webhook(chatbot_id: str, setup_data: InstagramWebhookSetup):
    """
    Generate Instagram webhook URL and return setup instructions
    """
    try:
        # Get integration
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Instagram integration not found")
        
        # Generate webhook URL
        webhook_url = f"{setup_data.base_url}/api/instagram/webhook/{chatbot_id}"
        verify_token = integration['credentials'].get('verify_token', 'instagram_verify_token')
        
        # Get Instagram service
        page_access_token = integration['credentials'].get('page_access_token')
        instagram_service = get_instagram_service(page_access_token)
        
        # Get setup instructions
        setup_info = await instagram_service.set_webhook(webhook_url, verify_token)
        
        # Log activity
        await db.integration_logs.insert_one({
            "id": str(uuid.uuid4()),
            "integration_id": integration['id'],
            "chatbot_id": chatbot_id,
            "event_type": "configured",
            "status": "success",
            "message": "Webhook URL generated",
            "metadata": {"webhook_url": webhook_url},
            "timestamp": datetime.now(timezone.utc)
        })
        
        return {
            "webhook_url": webhook_url,
            "verify_token": verify_token,
            "instructions": setup_info['instructions']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up Instagram webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{chatbot_id}/webhook-info")
async def get_instagram_webhook_info(chatbot_id: str, base_url: str):
    """
    Get Instagram webhook configuration information
    """
    try:
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Instagram integration not found")
        
        webhook_url = f"{base_url}/api/instagram/webhook/{chatbot_id}"
        verify_token = integration['credentials'].get('verify_token', 'instagram_verify_token')
        
        return {
            "webhook_url": webhook_url,
            "verify_token": verify_token,
            "status": "configured" if integration.get('enabled') else "disabled"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Instagram webhook info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{chatbot_id}/webhook")
async def delete_instagram_webhook(chatbot_id: str):
    """
    Remove Instagram webhook configuration
    """
    try:
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Instagram integration not found")
        
        # Update integration to disable webhook
        await db.integrations.update_one(
            {"id": integration['id']},
            {
                "$set": {
                    "enabled": False,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Log activity
        await db.integration_logs.insert_one({
            "id": str(uuid.uuid4()),
            "integration_id": integration['id'],
            "chatbot_id": chatbot_id,
            "event_type": "disabled",
            "status": "success",
            "message": "Webhook removed",
            "timestamp": datetime.now(timezone.utc)
        })
        
        return {"message": "Instagram webhook removed successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing Instagram webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{chatbot_id}/send-test-message")
async def send_test_instagram_message(chatbot_id: str, message: InstagramMessage):
    """
    Send a test message via Instagram
    """
    try:
        integration = await get_integration_by_chatbot(chatbot_id)
        if not integration:
            raise HTTPException(status_code=404, detail="Instagram integration not found")
        
        page_access_token = integration['credentials'].get('page_access_token')
        if not page_access_token:
            raise HTTPException(status_code=400, detail="Page access token not configured")
        
        instagram_service = get_instagram_service(page_access_token)
        
        result = await instagram_service.send_message(message.recipient_id, message.text)
        
        if result['success']:
            return {"message": "Test message sent successfully", "data": result}
        else:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to send message'))
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test Instagram message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
