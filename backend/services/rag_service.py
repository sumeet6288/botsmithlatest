import logging
from typing import List, Dict, Optional
from .chunking_service import ChunkingService
from .vector_store import VectorStore

logger = logging.getLogger(__name__)


class RAGService:
    """
    Main RAG (Retrieval Augmented Generation) service - Basic version
    Orchestrates chunking and text-based retrieval (no embeddings)
    """
    
    def __init__(self):
        """Initialize RAG service with sub-services"""
        self.chunking_service = ChunkingService(
            chunk_size=600,        # Reduced from 800 to 600 tokens per chunk for faster processing
            chunk_overlap=100      # Reduced from 150 to 100 token overlap
        )
        self.vector_store = VectorStore()
        
        # Configuration - OPTIMIZED for speed and token usage
        self.top_k_results = 2  # Reduced from 3 to 2 to save 10-20% tokens per message
        self.similarity_threshold = 0.4  # Increased from 0.3 to 0.4 for better quality
        
        logger.info("Basic RAG Service initialized successfully (no embeddings) - OPTIMIZED")
    
    async def process_document(
        self,
        text: str,
        chatbot_id: str,
        source_id: str,
        source_type: str,
        filename: str = None,
        use_paragraph_chunking: bool = True
    ) -> Dict:
        """
        Process a document: chunk and store (no embeddings in basic RAG)
        
        Args:
            text: Document text content
            chatbot_id: Chatbot identifier
            source_id: Source document identifier
            source_type: Type of source (file, website, text)
            filename: Optional filename
            use_paragraph_chunking: Whether to use paragraph-aware chunking
            
        Returns:
            Dictionary with processing statistics
        """
        try:
            logger.info(f"Processing document for chatbot {chatbot_id}, source {source_id}")
            
            # Step 1: Chunk the document
            metadata = {
                "source_id": source_id,
                "source_type": source_type
            }
            if filename:
                metadata["filename"] = filename
            
            if use_paragraph_chunking:
                chunks = self.chunking_service.chunk_by_paragraphs(text, metadata)
            else:
                chunks = self.chunking_service.chunk_text(text, metadata)
            
            if not chunks:
                logger.warning("No chunks created from document")
                return {
                    "success": False,
                    "error": "No chunks created",
                    "chunks_created": 0
                }
            
            chunk_stats = self.chunking_service.get_stats(chunks)
            logger.info(f"Created {len(chunks)} chunks: {chunk_stats}")
            
            # Step 2: Store chunks directly in MongoDB (no embeddings needed)
            store_result = await self.vector_store.add_chunks(
                chatbot_id=chatbot_id,
                chunks=chunks,
                embeddings=None,  # No embeddings in basic RAG
                source_id=source_id,
                source_type=source_type,
                filename=filename
            )
            
            return {
                "success": True,
                "chunks_created": len(chunks),
                "chunks_stored": store_result.get("chunks_added", 0),
                "total_chunks_in_store": store_result.get("collection_size", 0),
                "chunk_stats": chunk_stats,
                "method": "basic_rag_no_embeddings"
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "chunks_created": 0
            }
    
    async def retrieve_relevant_context(
        self,
        query: str,
        chatbot_id: str,
        top_k: int = None,
        min_similarity: float = None
    ) -> Dict:
        """
        Retrieve relevant context for a query using text-based search
        
        Args:
            query: User query
            chatbot_id: Chatbot identifier
            top_k: Number of results to return (default: 5)
            min_similarity: Minimum similarity threshold (default: 0.3)
            
        Returns:
            Dictionary with context, citations, and metadata
        """
        try:
            top_k = top_k or self.top_k_results
            min_similarity = min_similarity or self.similarity_threshold
            
            logger.info(f"Retrieving context for query (chatbot: {chatbot_id}, top_k: {top_k})")
            
            # Search using text-based retrieval (no embeddings needed)
            matches = await self.vector_store.search(
                chatbot_id=chatbot_id,
                query_embedding=None,  # Not used in basic RAG
                query=query,  # Pass the query text instead
                top_k=top_k,
                min_similarity=min_similarity
            )
            
            if not matches:
                logger.info("No relevant context found")
                return self._empty_context()
            
            # Step 3: Format context and citations
            context_parts = []
            citations = []
            
            for i, match in enumerate(matches):
                text = match["text"]
                metadata = match["metadata"]
                similarity = match["similarity"]
                
                # Build citation
                citation = self._build_citation(metadata, similarity, i + 1)
                citations.append(citation)
                
                # Add to context with citation marker
                context_parts.append(f"[Source {i + 1}]: {text}")
            
            # Combine context
            combined_context = "\n\n".join(context_parts)
            
            # Build citation footer
            citation_footer = "\n\n" + "\n".join([
                f"[Source {c['source_number']}]: {c['display_name']} (confidence: {c['confidence']}%)"
                for c in citations
            ])
            
            logger.info(f"Retrieved {len(matches)} relevant chunks")
            
            return {
                "has_context": True,
                "context": combined_context,
                "citations": citations,
                "citation_footer": citation_footer,
                "num_sources": len(matches),
                "avg_similarity": round(sum(m["similarity"] for m in matches) / len(matches), 4),
                "matches": matches  # Full match data for advanced use
            }
            
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            return self._empty_context()
    
    def _build_citation(self, metadata: Dict, similarity: float, source_num: int) -> Dict:
        """Build citation information from metadata"""
        filename = metadata.get("filename", "Unknown source")
        source_type = metadata.get("source_type", "unknown")
        chunk_index = metadata.get("chunk_index", 0)
        
        # Build display name
        if source_type == "file":
            display_name = filename
        elif source_type == "website":
            display_name = "Website content"
        else:
            display_name = "Text content"
        
        return {
            "source_number": source_num,
            "filename": filename,
            "source_type": source_type,
            "chunk_index": chunk_index,
            "similarity": similarity,
            "confidence": round(similarity * 100, 1),
            "display_name": display_name
        }
    
    def _empty_context(self) -> Dict:
        """Return empty context structure"""
        return {
            "has_context": False,
            "context": "",
            "citations": [],
            "citation_footer": "",
            "num_sources": 0,
            "avg_similarity": 0,
            "matches": []
        }
    
    async def delete_source(self, chatbot_id: str, source_id: str) -> Dict:
        """
        Delete all data for a source
        
        Args:
            chatbot_id: Chatbot identifier
            source_id: Source identifier
            
        Returns:
            Deletion result
        """
        try:
            result = await self.vector_store.delete_source(chatbot_id, source_id)
            logger.info(f"Deleted source {source_id} from chatbot {chatbot_id}")
            return result
        except Exception as e:
            logger.error(f"Error deleting source: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def delete_chatbot_data(self, chatbot_id: str) -> bool:
        """
        Delete all RAG data for a chatbot
        
        Args:
            chatbot_id: Chatbot identifier
            
        Returns:
            True if successful
        """
        try:
            success = await self.vector_store.delete_chatbot_collection(chatbot_id)
            if success:
                logger.info(f"Deleted all RAG data for chatbot {chatbot_id}")
            return success
        except Exception as e:
            logger.error(f"Error deleting chatbot data: {str(e)}")
            return False
    
    def get_stats(self, chatbot_id: str) -> Dict:
        """Get RAG statistics for a chatbot"""
        try:
            stats = self.vector_store.get_collection_stats(chatbot_id)
            
            # Add configuration info
            stats.update({
                "config": {
                    "chunk_size": self.chunking_service.chunk_size,
                    "chunk_overlap": self.chunking_service.chunk_overlap,
                    "top_k_results": self.top_k_results,
                    "similarity_threshold": self.similarity_threshold,
                    "method": "basic_rag_no_embeddings"
                }
            })
            
            return stats
        except Exception as e:
            logger.error(f"Error getting RAG stats: {str(e)}")
            return {"error": str(e)}
