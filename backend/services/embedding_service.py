import os
import logging
from typing import List
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings using OpenAI via Emergent LLM Key"""
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise Exception("EMERGENT_LLM_KEY not found in environment variables")
        
        # Initialize OpenAI client with Emergent LLM key
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "text-embedding-3-small"  # 1536 dimensions, cost-effective
        
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding vector (1536 dimensions)
        """
        try:
            # Clean and truncate text if needed (max 8191 tokens for embedding model)
            text = text.strip()
            if not text:
                logger.warning("Empty text provided for embedding")
                return []
            
            # Generate embedding
            response = await self.client.embeddings.create(
                model=self.model,
                input=text
            )
            
            embedding = response.data[0].embedding
            logger.info(f"Generated embedding with {len(embedding)} dimensions")
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise Exception(f"Failed to generate embedding: {str(e)}")
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            # Filter out empty texts
            valid_texts = [text.strip() for text in texts if text.strip()]
            
            if not valid_texts:
                logger.warning("No valid texts provided for batch embedding")
                return []
            
            # Generate embeddings in batch (OpenAI supports up to 2048 texts)
            batch_size = 100  # Process in smaller batches for safety
            all_embeddings = []
            
            for i in range(0, len(valid_texts), batch_size):
                batch = valid_texts[i:i + batch_size]
                
                response = await self.client.embeddings.create(
                    model=self.model,
                    input=batch
                )
                
                batch_embeddings = [data.embedding for data in response.data]
                all_embeddings.extend(batch_embeddings)
                
                logger.info(f"Generated {len(batch_embeddings)} embeddings (batch {i//batch_size + 1})")
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {str(e)}")
            raise Exception(f"Failed to generate batch embeddings: {str(e)}")
    
    def get_model_info(self) -> dict:
        """Get information about the embedding model"""
        return {
            "model": self.model,
            "dimensions": 1536,
            "max_tokens": 8191,
            "cost_per_1k_tokens": 0.00002  # $0.02 per 1M tokens
        }
