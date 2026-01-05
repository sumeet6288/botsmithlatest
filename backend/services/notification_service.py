from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from models_notifications import Notification, NotificationCreate, NotificationPreferences
import json

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.notifications = db.notifications
        self.preferences = db.notification_preferences
        self.push_subscriptions = db.push_subscriptions
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        priority: str = "medium",
        metadata: Dict[str, Any] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        """Create a new notification and trigger all enabled notification channels"""
        
        notification_data = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "priority": priority,
            "metadata": metadata or {},
            "action_url": action_url,
            "read": False,
            "created_at": datetime.now(timezone.utc),
            "read_at": None
        }
        
        # Insert notification into database
        result = await self.notifications.insert_one(notification_data)
        notification_data["id"] = str(result.inserted_id)
        
        notification = Notification(**notification_data)
        
        # Get user preferences
        prefs = await self.get_user_preferences(user_id)
        
        # Send email notification if enabled
        if prefs and prefs.get("email_enabled") and self._should_send_email(notification_type, prefs):
            await self.send_email_notification(user_id, notification)
        
        # Send push notification if enabled
        if prefs and prefs.get("push_enabled") and self._should_send_push(notification_type, prefs):
            await self.send_push_notification(user_id, notification)
        
        logger.info(f"Created notification: {title} for user {user_id}")
        return notification
    
    def _should_send_email(self, notification_type: str, prefs: Dict) -> bool:
        """Check if email should be sent for this notification type"""
        type_mapping = {
            "new_conversation": "email_new_conversation",
            "high_priority_message": "email_high_priority",
            "performance_alert": "email_performance_alert",
            "usage_warning": "email_usage_warning",
        }
        pref_key = type_mapping.get(notification_type)
        return prefs.get(pref_key, True) if pref_key else False
    
    def _should_send_push(self, notification_type: str, prefs: Dict) -> bool:
        """Check if push should be sent for this notification type"""
        type_mapping = {
            "new_conversation": "push_new_conversation",
            "high_priority_message": "push_high_priority",
            "performance_alert": "push_performance_alert",
            "usage_warning": "push_usage_warning",
        }
        pref_key = type_mapping.get(notification_type)
        return prefs.get(pref_key, True) if pref_key else False
    
    async def send_email_notification(self, user_id: str, notification: Notification):
        """Send email notification (TEST MODE - Just log)"""
        # Get user email
        user = await self.db.users.find_one({"id": user_id})
        if not user:
            return
        
        email_content = {
            "to": user.get("email"),
            "subject": f"[BotSmith] {notification.title}",
            "body": notification.message,
            "priority": notification.priority
        }
        
        # TEST MODE: Just log the email instead of sending
        logger.info(f"📧 EMAIL NOTIFICATION (TEST MODE):")
        logger.info(f"   To: {email_content['to']}")
        logger.info(f"   Subject: {email_content['subject']}")
        logger.info(f"   Body: {email_content['body']}")
        logger.info(f"   Priority: {email_content['priority']}")
    
    async def send_push_notification(self, user_id: str, notification: Notification):
        """Send browser push notification"""
        # Get all push subscriptions for this user
        subscriptions = await self.push_subscriptions.find({"user_id": user_id}).to_list(None)
        
        if not subscriptions:
            logger.info(f"No push subscriptions found for user {user_id}")
            return
        
        # In production, you would use web-push library here
        # For now, we'll log it
        logger.info(f"🔔 PUSH NOTIFICATION:")
        logger.info(f"   User: {user_id}")
        logger.info(f"   Title: {notification.title}")
        logger.info(f"   Message: {notification.message}")
        logger.info(f"   Subscriptions: {len(subscriptions)}")
    
    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        skip: int = 0,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for a user"""
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        notifications = await self.notifications.find(query).sort(
            "created_at", -1
        ).skip(skip).limit(limit).to_list(None)
        
        # Convert MongoDB _id to id for each notification
        for notif in notifications:
            if "_id" in notif:
                notif["id"] = str(notif["_id"])
                del notif["_id"]
        
        return notifications
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        count = await self.notifications.count_documents({
            "user_id": user_id,
            "read": False
        })
        return count
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        from bson import ObjectId
        
        # Try updating by _id (MongoDB's native field)
        try:
            result = await self.notifications.update_one(
                {"_id": ObjectId(notification_id), "user_id": user_id},
                {
                    "$set": {
                        "read": True,
                        "read_at": datetime.now(timezone.utc)
                    }
                }
            )
            return result.modified_count > 0
        except Exception:
            # Fallback to id field if ObjectId conversion fails
            result = await self.notifications.update_one(
                {"id": notification_id, "user_id": user_id},
                {
                    "$set": {
                        "read": True,
                        "read_at": datetime.now(timezone.utc)
                    }
                }
            )
            return result.modified_count > 0
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        result = await self.notifications.update_many(
            {"user_id": user_id, "read": False},
            {
                "$set": {
                    "read": True,
                    "read_at": datetime.now(timezone.utc)
                }
            }
        )
        return result.modified_count
    
    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        from bson import ObjectId
        
        # Try deleting by _id (MongoDB's native field)
        try:
            result = await self.notifications.delete_one({
                "_id": ObjectId(notification_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception:
            # Fallback to id field if ObjectId conversion fails
            result = await self.notifications.delete_one({
                "id": notification_id,
                "user_id": user_id
            })
            return result.deleted_count > 0
    
    async def get_user_preferences(self, user_id: str) -> Optional[Dict]:
        """Get notification preferences for a user"""
        prefs = await self.preferences.find_one({"user_id": user_id})
        if prefs and "_id" in prefs:
            prefs["id"] = str(prefs["_id"])
            del prefs["_id"]
        return prefs
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict:
        """Update notification preferences for a user"""
        # Check if preferences exist
        existing = await self.preferences.find_one({"user_id": user_id})
        
        preferences["updated_at"] = datetime.now(timezone.utc)
        
        if existing:
            # Update existing preferences
            await self.preferences.update_one(
                {"user_id": user_id},
                {"$set": preferences}
            )
        else:
            # Create new preferences
            preferences["user_id"] = user_id
            preferences["created_at"] = datetime.now(timezone.utc)
            await self.preferences.insert_one(preferences)
        
        return await self.get_user_preferences(user_id)
    
    async def save_push_subscription(
        self,
        user_id: str,
        endpoint: str,
        keys: Dict[str, str],
        browser: Optional[str] = None
    ) -> Dict:
        """Save browser push notification subscription"""
        # Check if subscription already exists
        existing = await self.push_subscriptions.find_one({
            "user_id": user_id,
            "endpoint": endpoint
        })
        
        if existing:
            # Convert _id to id for JSON serialization
            if "_id" in existing:
                existing["id"] = str(existing["_id"])
                del existing["_id"]
            return existing
        
        subscription = {
            "user_id": user_id,
            "endpoint": endpoint,
            "keys": keys,
            "browser": browser,
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await self.push_subscriptions.insert_one(subscription)
        subscription["id"] = str(result.inserted_id)
        
        # Remove _id if it exists (shouldn't be there but just in case)
        if "_id" in subscription:
            del subscription["_id"]
        
        logger.info(f"Saved push subscription for user {user_id}")
        return subscription
    
    async def check_usage_limits(self, user_id: str):
        """Check usage limits and send warnings if approaching limits"""
        # Get user's current usage
        chatbots_count = await self.db.chatbots.count_documents({"user_id": user_id})
        messages_count = await self.db.messages.count_documents({"user_id": user_id})
        files_count = await self.db.sources.count_documents({
            "user_id": user_id,
            "type": "file"
        })
        
        # Define limits (from Free plan)
        max_chatbots = 1
        max_messages = 100
        max_files = 5
        
        # Check chatbot limit
        if chatbots_count >= max_chatbots * 0.8:
            percentage = int((chatbots_count / max_chatbots) * 100)
            await self.create_notification(
                user_id=user_id,
                notification_type="usage_warning",
                title="Chatbot Limit Warning",
                message=f"You've used {chatbots_count}/{max_chatbots} chatbots ({percentage}%). Consider upgrading your plan.",
                priority="medium" if percentage < 100 else "high",
                action_url="/subscription"
            )
        
        # Check message limit
        if messages_count >= max_messages * 0.8:
            percentage = int((messages_count / max_messages) * 100)
            await self.create_notification(
                user_id=user_id,
                notification_type="usage_warning",
                title="Message Limit Warning",
                message=f"You've used {messages_count}/{max_messages} messages ({percentage}%). Consider upgrading your plan.",
                priority="medium" if percentage < 100 else "high",
                action_url="/subscription"
            )
