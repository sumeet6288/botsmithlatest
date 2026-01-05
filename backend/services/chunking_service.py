import tiktoken
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class ChunkingService:
    """Service for intelligently chunking text documents"""
    
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        """
        Initialize chunking service
        
        Args:
            chunk_size: Target size for each chunk in tokens (default 800)
            chunk_overlap: Number of tokens to overlap between chunks (default 150)
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Initialize tokenizer (using cl100k_base encoding for GPT-3.5/4)
        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.error(f"Error loading tokenizer: {str(e)}")
            raise
    
    def count_tokens(self, text: str) -> int:
        """Count number of tokens in text"""
        return len(self.tokenizer.encode(text))
    
    def chunk_text(
        self, 
        text: str, 
        metadata: Dict = None
    ) -> List[Dict]:
        """
        Split text into overlapping chunks with metadata
        
        Args:
            text: Text to chunk
            metadata: Optional metadata to attach to each chunk (filename, page, etc.)
            
        Returns:
            List of chunk dictionaries with text and metadata
        """
        try:
            if not text or not text.strip():
                logger.warning("Empty text provided for chunking")
                return []
            
            # Encode text to tokens
            tokens = self.tokenizer.encode(text)
            total_tokens = len(tokens)
            
            logger.info(f"Chunking text with {total_tokens} tokens (chunk_size={self.chunk_size}, overlap={self.chunk_overlap})")
            
            chunks = []
            start_idx = 0
            chunk_num = 0
            
            while start_idx < total_tokens:
                # Calculate end index for this chunk
                end_idx = min(start_idx + self.chunk_size, total_tokens)
                
                # Extract chunk tokens
                chunk_tokens = tokens[start_idx:end_idx]
                
                # Decode back to text
                chunk_text = self.tokenizer.decode(chunk_tokens)
                
                # Create chunk with metadata
                chunk = {
                    "text": chunk_text,
                    "chunk_index": chunk_num,
                    "start_token": start_idx,
                    "end_token": end_idx,
                    "token_count": len(chunk_tokens)
                }
                
                # Add provided metadata
                if metadata:
                    chunk.update(metadata)
                
                chunks.append(chunk)
                
                # Move to next chunk with overlap
                start_idx = end_idx - self.chunk_overlap
                chunk_num += 1
                
                # Prevent infinite loop on last chunk
                if end_idx >= total_tokens:
                    break
            
            logger.info(f"Created {len(chunks)} chunks from text")
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking text: {str(e)}")
            raise Exception(f"Failed to chunk text: {str(e)}")
    
    def chunk_by_paragraphs(
        self, 
        text: str, 
        metadata: Dict = None
    ) -> List[Dict]:
        """
        Chunk text by paragraphs while respecting token limits
        Better for preserving document structure
        
        Args:
            text: Text to chunk
            metadata: Optional metadata
            
        Returns:
            List of chunk dictionaries
        """
        try:
            # Split into paragraphs
            paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
            
            chunks = []
            current_chunk = []
            current_tokens = 0
            chunk_num = 0
            
            for para in paragraphs:
                para_tokens = self.count_tokens(para)
                
                # If single paragraph exceeds chunk size, split it
                if para_tokens > self.chunk_size:
                    # Save current chunk if any
                    if current_chunk:
                        chunk_text = '\n\n'.join(current_chunk)
                        chunks.append({
                            "text": chunk_text,
                            "chunk_index": chunk_num,
                            "token_count": current_tokens,
                            **(metadata or {})
                        })
                        chunk_num += 1
                        current_chunk = []
                        current_tokens = 0
                    
                    # Split large paragraph using token-based chunking
                    para_chunks = self.chunk_text(para, metadata)
                    for pc in para_chunks:
                        pc["chunk_index"] = chunk_num
                        chunks.append(pc)
                        chunk_num += 1
                
                # Add paragraph to current chunk
                elif current_tokens + para_tokens <= self.chunk_size:
                    current_chunk.append(para)
                    current_tokens += para_tokens
                
                # Start new chunk
                else:
                    # Save current chunk
                    chunk_text = '\n\n'.join(current_chunk)
                    chunks.append({
                        "text": chunk_text,
                        "chunk_index": chunk_num,
                        "token_count": current_tokens,
                        **(metadata or {})
                    })
                    chunk_num += 1
                    
                    # Start new chunk with current paragraph
                    current_chunk = [para]
                    current_tokens = para_tokens
            
            # Add final chunk
            if current_chunk:
                chunk_text = '\n\n'.join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "chunk_index": chunk_num,
                    "token_count": current_tokens,
                    **(metadata or {})
                })
            
            logger.info(f"Created {len(chunks)} paragraph-based chunks")
            return chunks
            
        except Exception as e:
            logger.error(f"Error in paragraph chunking: {str(e)}")
            # Fallback to regular chunking
            return self.chunk_text(text, metadata)
    
    def get_stats(self, chunks: List[Dict]) -> Dict:
        """Get statistics about chunks"""
        if not chunks:
            return {"total_chunks": 0, "total_tokens": 0}
        
        total_tokens = sum(chunk.get("token_count", 0) for chunk in chunks)
        avg_tokens = total_tokens / len(chunks) if chunks else 0
        
        return {
            "total_chunks": len(chunks),
            "total_tokens": total_tokens,
            "avg_tokens_per_chunk": round(avg_tokens, 2),
            "chunk_size_config": self.chunk_size,
            "overlap_config": self.chunk_overlap
        }
