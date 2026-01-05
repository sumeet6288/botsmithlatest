import logging
from typing import List, Dict, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import TEXT
import re
from collections import Counter
import math

logger = logging.getLogger(__name__)


class VectorStore:
    """Service for managing document chunks using MongoDB with basic text search"""
    
    def __init__(self):
        """Initialize MongoDB connection for chunk storage"""
        try:
            # Get MongoDB connection string
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('MONGO_DB_NAME', 'botsmith')
            
            # Initialize MongoDB client
            self.client = AsyncIOMotorClient(mongo_url)
            self.db = self.client[db_name]
            self.chunks_collection = self.db['document_chunks']
            
            logger.info(f"MongoDB VectorStore initialized with database: {db_name}")
            
        except Exception as e:
            logger.error(f"Error initializing MongoDB VectorStore: {str(e)}")
            raise Exception(f"Failed to initialize vector store: {str(e)}")
    
    async def ensure_text_index(self, chatbot_id: str):
        """
        Ensure text index exists for efficient text search
        
        Args:
            chatbot_id: Chatbot identifier
        """
        try:
            # Create text index on 'text' field if it doesn't exist
            await self.chunks_collection.create_index([("text", TEXT)])
            await self.chunks_collection.create_index([("chatbot_id", 1)])
            await self.chunks_collection.create_index([("source_id", 1)])
            logger.info(f"Text indexes ensured for chatbot {chatbot_id}")
        except Exception as e:
            logger.warning(f"Index may already exist: {str(e)}")
    
    def get_or_create_collection(self, chatbot_id: str):
        """
        Compatibility method - returns collection info
        
        Args:
            chatbot_id: Unique identifier for the chatbot
            
        Returns:
            Dictionary with collection info
        """
        try:
            return {
                "chatbot_id": chatbot_id,
                "collection_name": f"chatbot_{chatbot_id}"
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {str(e)}")
            raise Exception(f"Failed to get collection: {str(e)}")
    
    async def add_chunks(
        self,
        chatbot_id: str,
        chunks: List[Dict],
        embeddings: List[List[float]] = None,  # Kept for compatibility but not used
        source_id: str = None,
        source_type: str = None,
        filename: str = None
    ) -> Dict:
        """
        Add document chunks to MongoDB (basic RAG - no embeddings)
        
        Args:
            chatbot_id: Chatbot identifier
            chunks: List of chunk dictionaries with text and metadata
            embeddings: Not used in basic RAG (kept for compatibility)
            source_id: Source document identifier
            source_type: Type of source (file, website, text)
            filename: Optional filename for file sources
            
        Returns:
            Dictionary with operation statistics
        """
        try:
            await self.ensure_text_index(chatbot_id)
            
            # Prepare documents for MongoDB
            documents = []
            
            for i, chunk in enumerate(chunks):
                # Create unique ID for chunk
                chunk_id = f"{source_id}_chunk_{i}"
                
                # Prepare document
                doc = {
                    "chunk_id": chunk_id,
                    "chatbot_id": chatbot_id,
                    "source_id": source_id,
                    "source_type": source_type,
                    "text": chunk["text"],
                    "chunk_index": chunk.get("chunk_index", i),
                    "token_count": chunk.get("token_count", 0),
                    # Add keywords for better retrieval
                    "keywords": self._extract_keywords(chunk["text"])
                }
                
                if filename:
                    doc["filename"] = filename
                
                # Add any additional metadata from chunk
                if "page" in chunk:
                    doc["page"] = chunk["page"]
                
                documents.append(doc)
            
            # Insert into MongoDB
            if documents:
                result = await self.chunks_collection.insert_many(documents)
                inserted_count = len(result.inserted_ids)
            else:
                inserted_count = 0
            
            # Get total count for this chatbot
            total_count = await self.chunks_collection.count_documents({"chatbot_id": chatbot_id})
            
            logger.info(f"Added {inserted_count} chunks to MongoDB for chatbot {chatbot_id}")
            
            return {
                "success": True,
                "chunks_added": inserted_count,
                "collection_size": total_count
            }
            
        except Exception as e:
            logger.error(f"Error adding chunks to MongoDB: {str(e)}")
            raise Exception(f"Failed to add chunks: {str(e)}")
    
    def _extract_keywords(self, text: str, max_keywords: int = 20) -> List[str]:
        """
        Extract important keywords from text for indexing
        
        Args:
            text: Text to extract keywords from
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            List of keywords
        """
        # Convert to lowercase and remove special characters
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Split into words
        words = text.split()
        
        # Remove common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
        
        # Filter out stop words and short words
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Get most common keywords
        word_counts = Counter(keywords)
        return [word for word, count in word_counts.most_common(max_keywords)]
    
    def _calculate_bm25_score(self, query_terms: List[str], doc_text: str, 
                             doc_keywords: List[str], avg_doc_length: float,
                             k1: float = 1.5, b: float = 0.75) -> float:
        """
        Calculate BM25 relevance score for document
        
        Args:
            query_terms: List of query terms
            doc_text: Document text
            doc_keywords: Document keywords
            avg_doc_length: Average document length in collection
            k1: BM25 parameter (term frequency saturation)
            b: BM25 parameter (length normalization)
            
        Returns:
            BM25 score
        """
        doc_length = len(doc_text.split())
        score = 0.0
        
        # Convert doc text and keywords to lowercase for matching
        doc_text_lower = doc_text.lower()
        doc_keywords_lower = [kw.lower() for kw in doc_keywords]
        
        for term in query_terms:
            term_lower = term.lower()
            
            # Count term frequency in document
            tf = doc_text_lower.count(term_lower)
            
            # Boost if term is in keywords
            if term_lower in doc_keywords_lower:
                tf += 2
            
            if tf > 0:
                # Simplified BM25 formula (without IDF component for efficiency)
                numerator = tf * (k1 + 1)
                denominator = tf + k1 * (1 - b + b * (doc_length / max(avg_doc_length, 1)))
                score += numerator / denominator
        
        return score
    
    async def search(
        self,
        chatbot_id: str,
        query_embedding: List[float] = None,  # Kept for compatibility but not used
        query: str = None,
        top_k: int = 5,
        min_similarity: float = 0.0
    ) -> List[Dict]:
        """
        Search for relevant chunks using text-based search (BM25-like scoring) - OPTIMIZED
        
        Args:
            chatbot_id: Chatbot identifier
            query_embedding: Not used in basic RAG (kept for compatibility)
            query: Query text (required for basic RAG)
            top_k: Number of results to return
            min_similarity: Minimum similarity threshold (0-1)
            
        Returns:
            List of dictionaries with matched chunks and metadata
        """
        try:
            if not query:
                logger.warning("No query provided for search")
                return []
            
            # Extract query terms first
            query_terms = self._extract_keywords(query, max_keywords=10)
            query_terms_lower = [term.lower() for term in query_terms]
            
            # OPTIMIZATION: Use MongoDB text search with $regex for initial filtering
            # This reduces the number of chunks we need to score in Python
            regex_filters = [{"text": {"$regex": term, "$options": "i"}} for term in query_terms]
            
            # Get only chunks that match at least one query term (much faster than loading all)
            cursor = self.chunks_collection.find({
                "chatbot_id": chatbot_id,
                "$or": regex_filters
            }).limit(top_k * 3)  # Get 3x more for better scoring, but not all chunks
            
            matched_chunks = await cursor.to_list(length=top_k * 3)
            
            if not matched_chunks:
                # Fallback: if no matches with keywords, get most recent chunks
                logger.info(f"No keyword matches for chatbot {chatbot_id}, using recent chunks")
                cursor = self.chunks_collection.find(
                    {"chatbot_id": chatbot_id}
                ).sort("_id", -1).limit(top_k)
                matched_chunks = await cursor.to_list(length=top_k)
                
                if not matched_chunks:
                    return []
            
            # Calculate average document length from matched chunks only
            avg_doc_length = sum(len(chunk["text"].split()) for chunk in matched_chunks) / len(matched_chunks)
            
            # Score matched documents
            scored_chunks = []
            for chunk in matched_chunks:
                score = self._calculate_bm25_score(
                    query_terms=query_terms,
                    doc_text=chunk["text"],
                    doc_keywords=chunk.get("keywords", []),
                    avg_doc_length=avg_doc_length
                )
                
                if score > 0:
                    scored_chunks.append({
                        "chunk": chunk,
                        "score": score
                    })
            
            # Sort by score descending
            scored_chunks.sort(key=lambda x: x["score"], reverse=True)
            
            # Take top k results
            top_chunks = scored_chunks[:top_k]
            
            # Normalize scores to 0-1 range
            max_score = top_chunks[0]["score"] if top_chunks else 1.0
            
            # Format results
            matches = []
            for i, item in enumerate(top_chunks):
                chunk = item["chunk"]
                normalized_score = item["score"] / max_score if max_score > 0 else 0
                
                # Filter by minimum similarity
                if normalized_score >= min_similarity:
                    matches.append({
                        "text": chunk["text"],
                        "metadata": {
                            "source_id": chunk["source_id"],
                            "source_type": chunk["source_type"],
                            "chunk_index": chunk["chunk_index"],
                            "token_count": chunk.get("token_count", 0),
                            "filename": chunk.get("filename")
                        },
                        "similarity": round(normalized_score, 4),
                        "rank": i + 1
                    })
            
            logger.info(f"Found {len(matches)} matches above {min_similarity} similarity for chatbot {chatbot_id}")
            return matches
            
        except Exception as e:
            logger.error(f"Error searching MongoDB: {str(e)}")
            return []
    
    async def delete_source(self, chatbot_id: str, source_id: str) -> Dict:
        """
        Delete all chunks associated with a source
        
        Args:
            chatbot_id: Chatbot identifier
            source_id: Source identifier
            
        Returns:
            Dictionary with deletion statistics
        """
        try:
            # Delete all chunks for this source
            result = await self.chunks_collection.delete_many({
                "chatbot_id": chatbot_id,
                "source_id": source_id
            })
            
            deleted_count = result.deleted_count
            
            # Get remaining count for this chatbot
            total_count = await self.chunks_collection.count_documents({"chatbot_id": chatbot_id})
            
            logger.info(f"Deleted {deleted_count} chunks for source {source_id}")
            
            return {
                "success": True,
                "chunks_deleted": deleted_count,
                "collection_size": total_count
            }
                
        except Exception as e:
            logger.error(f"Error deleting source from MongoDB: {str(e)}")
            raise Exception(f"Failed to delete source: {str(e)}")
    
    async def delete_chatbot_collection(self, chatbot_id: str) -> bool:
        """
        Delete all chunks for a chatbot
        
        Args:
            chatbot_id: Chatbot identifier
            
        Returns:
            True if successful
        """
        try:
            result = await self.chunks_collection.delete_many({"chatbot_id": chatbot_id})
            logger.info(f"Deleted {result.deleted_count} chunks for chatbot {chatbot_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting chatbot collection: {str(e)}")
            return False
    
    async def get_collection_stats(self, chatbot_id: str) -> Dict:
        """Get statistics about a chatbot's chunks"""
        try:
            total_chunks = await self.chunks_collection.count_documents({"chatbot_id": chatbot_id})
            
            return {
                "total_chunks": total_chunks,
                "collection_name": f"chatbot_{chatbot_id}",
                "metadata": {"chatbot_id": chatbot_id}
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {"total_chunks": 0, "error": str(e)}
