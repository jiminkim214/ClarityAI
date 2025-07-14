from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from loguru import logger

from ..models.schemas import ChatMessage, ChatResponse
from ..models.database_models import UserSession, SessionMessage
from ..core.database import get_database_session
from .vector_store import VectorStoreService
from .llm_service import LLMService
from ..ml.topic_modeling import AdvancedTopicModeling
from ..ml.pattern_detection import MLPatternDetection


class TherapyService:
    """Main service orchestrating the therapy conversation pipeline."""
    
    def __init__(self):
        self.vector_store = VectorStoreService()
        self.topic_service = AdvancedTopicModeling()
        self.llm_service = LLMService()
        self.pattern_service = MLPatternDetection()
    
    async def process_message(self, message: ChatMessage) -> ChatResponse:
        """Process a user message through the complete therapy pipeline."""
        try:
            # 1. Ensure session exists
            await self._ensure_session_exists(message.session_id)
            
            # 2. Detect psychological patterns
            patterns = await self.pattern_service.detect_patterns(message.content)
            
            # 3. Classify topic
            topic_info = await self.topic_service.predict_topic(message.content)
            
            # 4. Determine emotional state
            emotional_state_info = await self.pattern_service.detect_emotional_state(message.content)
            emotional_state = emotional_state_info.get("primary_emotion", "neutral")
            
            # 5. Retrieve similar responses using RAG
            retrieved_responses = await self._retrieve_similar_responses(
                message.content, topic_info, emotional_state
            )
            
            # 6. Get session context for continuity
            session_history = await self._get_session_history(message.session_id)
            
            # 7. Build context for LLM
            context = {
                "session_id": message.session_id,
                "timestamp": datetime.now(),
                "psychological_patterns": patterns,
                "topic_classification": topic_info.get("topic_name"),
                "emotional_state": emotional_state,
                "emotional_state_details": emotional_state_info,
                "user_context": message.context or {}
            }
            
            # 8. Generate therapeutic response
            response = await self.llm_service.generate_therapeutic_response(
                user_message=message.content,
                context=context,
                retrieved_responses=retrieved_responses,
                session_history=session_history
            )
            
            # 9. Store conversation in database
            await self._store_conversation(message, response)
            
            # 10. Update vector store with new message
            await self.vector_store.add_user_session_message(
                session_id=message.session_id,
                message_id=f"{message.session_id}_{datetime.now().timestamp()}",
                content=message.content,
                sender="user",
                metadata={
                    "emotional_state": emotional_state,
                    "topic": topic_info.get("topic_name"),
                    "patterns": ",".join([p.get("pattern") for p in patterns]) if patterns else ""
                }
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise
    
    async def _ensure_session_exists(self, session_id: str) -> None:
        """Ensure user session exists in database."""
        db = next(get_database_session())
        
        try:
            session = db.query(UserSession).filter(
                UserSession.session_id == session_id
            ).first()
            
            if not session:
                new_session = UserSession(
                    session_id=session_id,
                    user_id="anonymous"  # For now, using anonymous users
                )
                db.add(new_session)
                db.commit()
                logger.info(f"Created new session: {session_id}")
                
        except Exception as e:
            db.rollback()
            logger.error(f"Error ensuring session exists: {e}")
            raise
        finally:
            db.close()
    
    async def _retrieve_similar_responses(
        self, 
        user_message: str, 
        topic_info: Dict[str, Any], 
        emotional_state: str
    ) -> List[Dict[str, Any]]:
        """Retrieve similar therapeutic responses using RAG."""
        try:
            # Primary search by content similarity
            similar_responses = await self.vector_store.search_similar_responses(
                query=user_message,
                n_results=5
            )
            
            # Secondary search by topic if available
            if topic_info.get("topic_name") and topic_info["topic_name"] != "unknown":
                topic_responses = await self.vector_store.search_by_topic(
                    query=user_message,
                    topic=topic_info["topic_name"],
                    n_results=3
                )
                similar_responses.extend(topic_responses)
            
            # Tertiary search by emotional tone
            if emotional_state and emotional_state != "neutral":
                emotion_responses = await self.vector_store.search_by_emotional_tone(
                    query=user_message,
                    emotional_tone=emotional_state,
                    n_results=3
                )
                similar_responses.extend(emotion_responses)
            
            # Remove duplicates and sort by similarity
            unique_responses = {}
            for resp in similar_responses:
                content_key = resp["content"][:100]  # Use first 100 chars as key
                if content_key not in unique_responses:
                    unique_responses[content_key] = resp
            
            # Sort by similarity score and return top results
            sorted_responses = sorted(
                unique_responses.values(),
                key=lambda x: x["similarity_score"],
                reverse=True
            )
            
            return sorted_responses[:5]  # Return top 5
            
        except Exception as e:
            logger.error(f"Error retrieving similar responses: {e}")
            return []
    
    async def _get_session_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent session history for context."""
        db = next(get_database_session())
        
        try:
            messages = db.query(SessionMessage).filter(
                SessionMessage.session_id == session_id
            ).order_by(SessionMessage.timestamp.desc()).limit(limit).all()
            
            history = []
            for msg in reversed(messages):  # Reverse to get chronological order
                history.append({
                    "content": msg.content,
                    "sender": msg.sender,
                    "timestamp": msg.timestamp,
                    "emotional_state": msg.emotional_state,
                    "topic": msg.topic_classification
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting session history: {e}")
            return []
        finally:
            db.close()
    
    async def _store_conversation(self, message: ChatMessage, response: ChatResponse) -> None:
        """Store the conversation in database."""
        db = next(get_database_session())
        
        try:
            # Store user message
            user_msg = SessionMessage(
                session_id=message.session_id,
                content=message.content,
                sender="user",
                emotional_state=response.emotional_state,
                topic_classification=response.topic_classification,
                confidence_score=1.0
            )
            db.add(user_msg)
            
            # Store AI response
            ai_msg = SessionMessage(
                session_id=message.session_id,
                content=response.content,
                sender="ai",
                psychological_insight=response.psychological_insight.dict() if response.psychological_insight else None,
                emotional_state=response.emotional_state,
                topic_classification=response.topic_classification,
                confidence_score=response.confidence_score
            )
            db.add(ai_msg)
            
            db.commit()
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing conversation: {e}")
            raise
        finally:
            db.close()
    
    async def get_session_history(self, session_id: str) -> Dict[str, Any]:
        """Get complete session history."""
        db = next(get_database_session())
        
        try:
            session = db.query(UserSession).filter(
                UserSession.session_id == session_id
            ).first()
            
            if not session:
                return {"history": [], "message_count": 0}
            
            messages = db.query(SessionMessage).filter(
                SessionMessage.session_id == session_id
            ).order_by(SessionMessage.timestamp.asc()).all()
            
            history = []
            for msg in messages:
                history.append({
                    "content": msg.content,
                    "sender": msg.sender,
                    "timestamp": msg.timestamp.isoformat(),
                    "psychological_insight": msg.psychological_insight,
                    "emotional_state": msg.emotional_state,
                    "topic_classification": msg.topic_classification,
                    "confidence_score": msg.confidence_score
                })
            
            return {
                "history": history,
                "message_count": len(history),
                "session_created": session.created_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting session history: {e}")
            return {"history": [], "message_count": 0}
        finally:
            db.close()
    
    async def get_available_topics(self) -> List[Dict[str, Any]]:
        """Get list of available conversation topics."""
        try:
            # This could be enhanced to get topics from the topic modeling service
            # For now, return a basic list
            return [
                {"topic": "anxiety", "description": "Anxiety and stress management"},
                {"topic": "depression", "description": "Depression and mood support"},
                {"topic": "relationships", "description": "Relationship challenges"},
                {"topic": "self_esteem", "description": "Self-worth and confidence"},
                {"topic": "work_stress", "description": "Work and career stress"},
                {"topic": "general", "description": "General mental health support"}
            ]
        except Exception as e:
            logger.error(f"Error getting available topics: {e}")
            return []