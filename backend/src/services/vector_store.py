import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from loguru import logger
from ..core.config import settings as app_settings
from ..ml.embeddings import EmbeddingService


class VectorStoreService:
    """Handles vector storage and retrieval using ChromaDB."""
    
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=app_settings.chroma_persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        self.embedding_service = EmbeddingService()
        self.collection_name = "therapy_conversations"
        self.collection = None
        self._initialize_collection()
    
    def _initialize_collection(self) -> None:
        """Initialize or get the ChromaDB collection."""
        try:
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Mental health therapy conversations"}
            )
            logger.info(f"Initialized collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error initializing collection: {e}")
            raise
    
    async def add_conversation(
        self, 
        conversation_id: str, 
        user_message: str, 
        therapist_response: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a conversation to the vector store."""
        try:
            # Create embeddings for both messages
            user_embedding = self.embedding_service.generate_embedding(user_message).tolist()
            therapist_embedding = self.embedding_service.generate_embedding(therapist_response).tolist()
            
            # Prepare documents and metadata
            documents = [user_message, therapist_response]
            embeddings = [user_embedding, therapist_embedding]
            ids = [f"{conversation_id}_user", f"{conversation_id}_therapist"]
            
            metadatas = [
                {
                    "conversation_id": conversation_id,
                    "message_type": "user",
                    "content_type": "question",
                    **(metadata or {})
                },
                {
                    "conversation_id": conversation_id,
                    "message_type": "therapist",
                    "content_type": "response",
                    **(metadata or {})
                }
            ]
            
            # Add to collection
            self.collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            
        except Exception as e:
            logger.error(f"Error adding conversation to vector store: {e}")
            raise
    
    async def search_similar_responses(
        self, 
        query: str, 
        n_results: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar therapist responses."""
        try:
            # Create query embedding
            query_embedding = self.embedding_service.generate_embedding(query).tolist()
            
            # Prepare where clause for filtering
            where_clause = {"message_type": "therapist"}
            if filter_metadata:
                where_clause.update(filter_metadata)
            
            # Search in collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_clause,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "content": results["documents"][0][i],
                    "similarity_score": 1 - results["distances"][0][i],  # Convert distance to similarity
                    "metadata": results["metadatas"][0][i]
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching similar responses: {e}")
            return []
    
    async def search_by_topic(
        self, 
        query: str, 
        topic: str, 
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Search for responses filtered by topic."""
        filter_metadata = {"topic": topic}
        return await self.search_similar_responses(query, n_results, filter_metadata)
    
    async def search_by_emotional_tone(
        self, 
        query: str, 
        emotional_tone: str, 
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Search for responses filtered by emotional tone."""
        filter_metadata = {"emotional_tone": emotional_tone}
        return await self.search_similar_responses(query, n_results, filter_metadata)
    
    async def add_user_session_message(
        self, 
        session_id: str, 
        message_id: str, 
        content: str, 
        sender: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a user session message to vector store for memory."""
        try:
            embedding = self.embedding_service.generate_embedding(content).tolist()
            
            message_metadata = {
                "session_id": session_id,
                "sender": sender,
                "message_type": "session_message",
                **(metadata or {})
            }
            
            self.collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[message_metadata],
                ids=[message_id]
            )
            
        except Exception as e:
            logger.error(f"Error adding session message to vector store: {e}")
            raise
    
    async def get_session_context(
        self, 
        session_id: str, 
        current_message: str, 
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Get relevant context from previous session messages."""
        try:
            query_embedding = self.embedding_service.generate_embedding(current_message).tolist()
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where={
                    "session_id": session_id,
                    "message_type": "session_message"
                },
                include=["documents", "metadatas", "distances"]
            )
            
            formatted_results = []
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "content": results["documents"][0][i],
                    "similarity_score": 1 - results["distances"][0][i],
                    "metadata": results["metadatas"][0][i]
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error getting session context: {e}")
            return []
    
    async def delete_session_data(self, session_id: str) -> None:
        """Delete all data for a specific session."""
        try:
            # Get all documents for the session
            results = self.collection.get(
                where={"session_id": session_id},
                include=["metadatas"]
            )
            
            if results["ids"]:
                self.collection.delete(ids=results["ids"])
                logger.info(f"Deleted {len(results['ids'])} documents for session {session_id}")
            
        except Exception as e:
            logger.error(f"Error deleting session data: {e}")
            raise
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store collection."""
        try:
            count = self.collection.count()
            return {
                "total_documents": count,
                "collection_name": self.collection_name
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"total_documents": 0, "collection_name": self.collection_name}
    
    async def reindex_conversations(self, conversations: List[Dict[str, Any]]) -> None:
        """Reindex all conversations in the vector store."""
        try:
            # Clear existing data
            self.collection.delete()
            
            # Re-add all conversations
            for conv in conversations:
                await self.add_conversation(
                    conversation_id=conv["conversation_id"],
                    user_message=conv["user_message"],
                    therapist_response=conv["therapist_response"],
                    metadata={
                        "topic": conv.get("topic"),
                        "emotional_tone": conv.get("emotional_tone"),
                        "psychological_patterns": conv.get("psychological_patterns", [])
                    }
                )
            
            logger.info(f"Reindexed {len(conversations)} conversations")
            
        except Exception as e:
            logger.error(f"Error reindexing conversations: {e}")
            raise