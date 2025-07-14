"""
Embedding generation and management for mental health conversations.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
from loguru import logger
from sqlalchemy.orm import Session
from ..core.database import get_database_session
from ..models.database_models import ConversationData, MessageEmbedding
from ..core.config import settings


class EmbeddingService:
    """Service for generating and managing embeddings."""
    
    def __init__(self):
        self.model = SentenceTransformer(settings.sentence_transformer_model)
        logger.info(f"Initialized embedding model: {settings.sentence_transformer_model}")
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def generate_batch_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a batch of texts."""
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True, batch_size=32)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
    
    async def generate_conversation_embeddings(self, conversation_id: str) -> None:
        """Generate embeddings for a specific conversation."""
        db = next(get_database_session())
        
        try:
            # Get conversation
            conversation = db.query(ConversationData).filter(
                ConversationData.conversation_id == conversation_id
            ).first()
            
            if not conversation:
                logger.warning(f"Conversation {conversation_id} not found")
                return
            
            # Generate embeddings
            user_embedding = self.generate_embedding(conversation.user_message)
            therapist_embedding = self.generate_embedding(conversation.therapist_response)
            
            # Save embeddings
            user_emb = MessageEmbedding(
                conversation_id=conversation_id,
                message_type='user',
                embedding_vector=user_embedding.tolist()
            )
            
            therapist_emb = MessageEmbedding(
                conversation_id=conversation_id,
                message_type='therapist',
                embedding_vector=therapist_embedding.tolist()
            )
            
            db.add(user_emb)
            db.add(therapist_emb)
            db.commit()
            
            logger.debug(f"Generated embeddings for conversation {conversation_id}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error generating conversation embeddings: {e}")
            raise
        finally:
            db.close()
    
    async def generate_all_embeddings(self) -> None:
        """Generate embeddings for all conversations in the database."""
        db = next(get_database_session())
        
        try:
            # Get all conversations without embeddings
            conversations = db.query(ConversationData).outerjoin(MessageEmbedding).filter(
                MessageEmbedding.id.is_(None)
            ).all()
            
            logger.info(f"Generating embeddings for {len(conversations)} conversations")
            
            batch_size = 50
            for i in range(0, len(conversations), batch_size):
                batch = conversations[i:i + batch_size]
                
                # Prepare texts for batch processing
                user_texts = [conv.user_message for conv in batch]
                therapist_texts = [conv.therapist_response for conv in batch]
                
                # Generate batch embeddings
                user_embeddings = self.generate_batch_embeddings(user_texts)
                therapist_embeddings = self.generate_batch_embeddings(therapist_texts)
                
                # Save embeddings
                for j, conv in enumerate(batch):
                    user_emb = MessageEmbedding(
                        conversation_id=conv.conversation_id,
                        message_type='user',
                        embedding_vector=user_embeddings[j].tolist()
                    )
                    
                    therapist_emb = MessageEmbedding(
                        conversation_id=conv.conversation_id,
                        message_type='therapist',
                        embedding_vector=therapist_embeddings[j].tolist()
                    )
                    
                    db.add(user_emb)
                    db.add(therapist_emb)
                
                db.commit()
                logger.info(f"Generated embeddings for batch {i//batch_size + 1}")
            
            logger.info("Completed generating all embeddings")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error generating all embeddings: {e}")
            raise
        finally:
            db.close()
    
    def find_similar_conversations(
        self, 
        query_text: str, 
        top_k: int = 5,
        message_type: str = 'therapist'
    ) -> List[Dict[str, Any]]:
        """Find similar conversations using embedding similarity."""
        db = next(get_database_session())
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query_text)
            
            # Get all embeddings of specified type
            embeddings = db.query(MessageEmbedding).filter(
                MessageEmbedding.message_type == message_type
            ).all()
            
            if not embeddings:
                return []
            
            # Calculate similarities
            similarities = []
            for emb in embeddings:
                emb_vector = np.array(emb.embedding_vector)
                similarity = np.dot(query_embedding, emb_vector) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(emb_vector)
                )
                similarities.append({
                    'conversation_id': emb.conversation_id,
                    'similarity': float(similarity),
                    'message_type': emb.message_type
                })
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            
            # Get conversation details for top results
            results = []
            for sim in similarities[:top_k]:
                conversation = db.query(ConversationData).filter(
                    ConversationData.conversation_id == sim['conversation_id']
                ).first()
                
                if conversation:
                    results.append({
                        'conversation_id': sim['conversation_id'],
                        'user_message': conversation.user_message,
                        'therapist_response': conversation.therapist_response,
                        'similarity_score': sim['similarity'],
                        'emotional_tone': conversation.emotional_tone,
                        'topic_cluster': conversation.topic_cluster
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Error finding similar conversations: {e}")
            return []
        finally:
            db.close()