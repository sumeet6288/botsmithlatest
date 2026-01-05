from celery import Task
from backend.celery_app import celery_app
import asyncio
from typing import Dict, Any, Optional
import logging
import hashlib
import json
import redis
import time

logger = logging.getLogger(__name__)

# Initialize Redis client for task deduplication
redis_client = redis.Redis.from_url(
    celery_app.conf.broker_url,
    decode_responses=True
)


class IdempotentTask(Task):
    """
    Base task class with idempotency support
    Prevents duplicate task execution using Redis locks
    """
    
    def generate_task_id(self, *args, **kwargs):
        """Generate unique task ID based on task name and arguments"""
        task_data = {
            'task': self.name,
            'args': args,
            'kwargs': kwargs
        }
        task_string = json.dumps(task_data, sort_keys=True)
        return hashlib.sha256(task_string.encode()).hexdigest()
    
    def get_lock_key(self, task_id: str) -> str:
        """Get Redis lock key for task"""
        return f"task_lock:{self.name}:{task_id}"
    
    def get_result_key(self, task_id: str) -> str:
        """Get Redis result key for task"""
        return f"task_result:{self.name}:{task_id}"
    
    def acquire_lock(self, task_id: str, timeout: int = 3600) -> bool:
        """
        Acquire distributed lock for task execution
        Returns True if lock acquired, False if task already running
        """
        lock_key = self.get_lock_key(task_id)
        # Use SET NX EX for atomic lock acquisition
        return redis_client.set(lock_key, '1', nx=True, ex=timeout)
    
    def release_lock(self, task_id: str):
        """Release distributed lock"""
        lock_key = self.get_lock_key(task_id)
        redis_client.delete(lock_key)
    
    def get_cached_result(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get cached result if task already completed"""
        result_key = self.get_result_key(task_id)
        cached = redis_client.get(result_key)
        if cached:
            try:
                return json.loads(cached)
            except:
                return None
        return None
    
    def cache_result(self, task_id: str, result: Dict[str, Any], ttl: int = 3600):
        """Cache task result for deduplication"""
        result_key = self.get_result_key(task_id)
        redis_client.setex(result_key, ttl, json.dumps(result))
    
    def __call__(self, *args, **kwargs):
        """Override to add idempotency check"""
        # Generate unique task ID
        task_id = self.generate_task_id(*args, **kwargs)
        
        # Check if result already cached (task completed recently)
        cached_result = self.get_cached_result(task_id)
        if cached_result:
            logger.info(f"Task {self.name} with ID {task_id} already completed, returning cached result")
            return cached_result
        
        # Try to acquire lock
        if not self.acquire_lock(task_id):
            logger.warning(f"Task {self.name} with ID {task_id} already running, skipping duplicate execution")
            # Wait and check for result
            max_wait = 30  # Wait max 30 seconds
            waited = 0
            while waited < max_wait:
                time.sleep(2)
                waited += 2
                cached_result = self.get_cached_result(task_id)
                if cached_result:
                    return cached_result
            
            return {
                'status': 'skipped',
                'reason': 'duplicate_task',
                'message': 'Task already running or completed'
            }
        
        try:
            # Execute task
            result = super().__call__(*args, **kwargs)
            
            # Cache successful result
            if result and isinstance(result, dict) and result.get('status') == 'success':
                self.cache_result(task_id, result)
            
            return result
        finally:
            # Always release lock
            self.release_lock(task_id)


class AsyncTask(Task):
    """Base task class that properly handles async functions"""
    def __call__(self, *args, **kwargs):
        # Create new event loop for this task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self._run_async(*args, **kwargs))
        finally:
            loop.close()
    
    async def _run_async(self, *args, **kwargs):
        return await self.run(*args, **kwargs)


@celery_app.task(name='backend.tasks.process_document', bind=True, base=IdempotentTask, max_retries=3, default_retry_delay=60)
def process_document(self, source_id: str, file_path: str, chatbot_id: str) -> Dict[str, Any]:
    """
    Background task to process uploaded documents
    
    Args:
        source_id: Source document ID
        file_path: Path to uploaded file
        chatbot_id: Associated chatbot ID
    
    Returns:
        Dict with processing results
    """
    try:
        logger.info(f"Processing document: {source_id}")
        
        # Import here to avoid circular imports
        from services.document_processor import DocumentProcessor
        from services.chunking_service import ChunkingService
        from models import get_database
        
        # Get database
        db = get_database()
        
        # Process the document
        processor = DocumentProcessor()
        text_content = processor.process_file(file_path)
        
        # Chunk the content
        chunking_service = ChunkingService()
        chunks = chunking_service.chunk_text(text_content)
        
        # Store chunks in database
        chunk_docs = []
        for i, chunk in enumerate(chunks):
            chunk_doc = {
                'chatbot_id': chatbot_id,
                'source_id': source_id,
                'content': chunk,
                'chunk_index': i,
                'metadata': {'total_chunks': len(chunks)}
            }
            chunk_docs.append(chunk_doc)
        
        if chunk_docs:
            db.chunks.insert_many(chunk_docs)
        
        # Update source status
        db.sources.update_one(
            {'_id': source_id},
            {'$set': {'status': 'completed', 'chunk_count': len(chunks)}}
        )
        
        logger.info(f"Document processed successfully: {source_id} ({len(chunks)} chunks)")
        return {
            'status': 'success',
            'source_id': source_id,
            'chunks_created': len(chunks)
        }
        
    except Exception as e:
        logger.error(f"Error processing document {source_id}: {str(e)}")
        # Update source with error status
        try:
            from models import get_database
            db = get_database()
            db.sources.update_one(
                {'_id': source_id},
                {'$set': {'status': 'failed', 'error': str(e)}}
            )
        except:
            pass
        
        # Retry with exponential backoff
        try:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for document {source_id}")
            return {
                'status': 'failed',
                'source_id': source_id,
                'error': str(e)
            }


@celery_app.task(name='backend.tasks.scrape_website', bind=True, base=IdempotentTask, max_retries=3, default_retry_delay=60)
def scrape_website(self, source_id: str, url: str, chatbot_id: str) -> Dict[str, Any]:
    """
    Background task to scrape website content
    
    Args:
        source_id: Source ID
        url: Website URL to scrape
        chatbot_id: Associated chatbot ID
    
    Returns:
        Dict with scraping results
    """
    try:
        logger.info(f"Scraping website: {url}")
        
        # Import here to avoid circular imports
        from services.website_scraper import WebsiteScraper
        from services.chunking_service import ChunkingService
        from models import get_database
        
        # Get database
        db = get_database()
        
        # Scrape the website
        scraper = WebsiteScraper()
        content = scraper.scrape(url)
        
        # Chunk the content
        chunking_service = ChunkingService()
        chunks = chunking_service.chunk_text(content)
        
        # Store chunks in database
        chunk_docs = []
        for i, chunk in enumerate(chunks):
            chunk_doc = {
                'chatbot_id': chatbot_id,
                'source_id': source_id,
                'content': chunk,
                'chunk_index': i,
                'metadata': {'url': url, 'total_chunks': len(chunks)}
            }
            chunk_docs.append(chunk_doc)
        
        if chunk_docs:
            db.chunks.insert_many(chunk_docs)
        
        # Update source status
        db.sources.update_one(
            {'_id': source_id},
            {'$set': {'status': 'completed', 'chunk_count': len(chunks)}}
        )
        
        logger.info(f"Website scraped successfully: {url} ({len(chunks)} chunks)")
        return {
            'status': 'success',
            'source_id': source_id,
            'url': url,
            'chunks_created': len(chunks)
        }
        
    except Exception as e:
        logger.error(f"Error scraping website {url}: {str(e)}")
        # Update source with error status
        try:
            from models import get_database
            db = get_database()
            db.sources.update_one(
                {'_id': source_id},
                {'$set': {'status': 'failed', 'error': str(e)}}
            )
        except:
            pass
        
        # Retry with exponential backoff
        try:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for website {url}")
            return {
                'status': 'failed',
                'source_id': source_id,
                'url': url,
                'error': str(e)
            }


@celery_app.task(name='backend.tasks.send_notification', base=IdempotentTask, max_retries=3, default_retry_delay=30)
def send_notification(user_id: str, title: str, message: str, notification_type: str = 'info') -> Dict[str, Any]:
    """
    Background task to send notifications
    
    Args:
        user_id: Target user ID
        title: Notification title
        message: Notification message
        notification_type: Type of notification
    
    Returns:
        Dict with notification results
    """
    try:
        logger.info(f"Sending notification to user: {user_id}")
        
        from models import get_database
        from datetime import datetime
        
        db = get_database()
        
        # Create notification document
        notification = {
            'user_id': user_id,
            'title': title,
            'message': message,
            'type': notification_type,
            'read': False,
            'created_at': datetime.utcnow(),
        }
        
        # Insert into database
        result = db.notifications.insert_one(notification)
        
        logger.info(f"Notification sent successfully to user: {user_id}")
        return {
            'status': 'success',
            'notification_id': str(result.inserted_id),
            'user_id': user_id
        }
        
    except Exception as e:
        logger.error(f"Error sending notification to {user_id}: {str(e)}")
        # Retry with shorter delay for notifications
        try:
            raise self.retry(exc=e, countdown=30 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for notification to {user_id}")
            return {
                'status': 'failed',
                'user_id': user_id,
                'error': str(e)
            }


@celery_app.task(name='backend.tasks.cleanup_old_data', base=IdempotentTask, max_retries=2)
def cleanup_old_data(days: int = 90) -> Dict[str, Any]:
    """
    Background task to cleanup old data
    
    Args:
        days: Number of days to keep data
    
    Returns:
        Dict with cleanup results
    """
    try:
        logger.info(f"Cleaning up data older than {days} days")
        
        from models import get_database
        from datetime import datetime, timedelta
        
        db = get_database()
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Cleanup old messages
        messages_result = db.messages.delete_many(
            {'created_at': {'$lt': cutoff_date}}
        )
        
        # Cleanup old conversations without messages
        conversations_result = db.conversations.delete_many({
            'updated_at': {'$lt': cutoff_date},
            'message_count': 0
        })
        
        logger.info(f"Cleanup completed: {messages_result.deleted_count} messages, {conversations_result.deleted_count} conversations")
        return {
            'status': 'success',
            'messages_deleted': messages_result.deleted_count,
            'conversations_deleted': conversations_result.deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        return {
            'status': 'failed',
            'error': str(e)
        }


@celery_app.task(name='backend.tasks.generate_analytics_report', base=IdempotentTask, max_retries=2)
def generate_analytics_report(chatbot_id: str, period: str = '30d') -> Dict[str, Any]:
    """
    Background task to generate comprehensive analytics reports
    
    Args:
        chatbot_id: Chatbot ID
        period: Time period for report
    
    Returns:
        Dict with report data
    """
    try:
        logger.info(f"Generating analytics report for chatbot: {chatbot_id}")
        
        from models import get_database
        from datetime import datetime, timedelta
        
        db = get_database()
        
        # Calculate date range
        days = int(period.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Aggregate data
        total_conversations = db.conversations.count_documents({
            'chatbot_id': chatbot_id,
            'created_at': {'$gte': start_date}
        })
        
        total_messages = db.messages.count_documents({
            'chatbot_id': chatbot_id,
            'created_at': {'$gte': start_date}
        })
        
        # Average response time
        avg_response_pipeline = [
            {'$match': {
                'chatbot_id': chatbot_id,
                'created_at': {'$gte': start_date},
                'response_time': {'$exists': True}
            }},
            {'$group': {
                '_id': None,
                'avg_response_time': {'$avg': '$response_time'}
            }}
        ]
        
        avg_response = list(db.messages.aggregate(avg_response_pipeline))
        avg_response_time = avg_response[0]['avg_response_time'] if avg_response else 0
        
        report = {
            'chatbot_id': chatbot_id,
            'period': period,
            'total_conversations': total_conversations,
            'total_messages': total_messages,
            'avg_response_time': round(avg_response_time, 2),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Analytics report generated for chatbot: {chatbot_id}")
        return {
            'status': 'success',
            'report': report
        }
        
    except Exception as e:
        logger.error(f"Error generating analytics report for {chatbot_id}: {str(e)}")
        return {
            'status': 'failed',
            'chatbot_id': chatbot_id,
            'error': str(e)
        }
