from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from ..core.database import get_database_session
from ..core.auth import get_current_user, require_auth
from ..models.schemas import (
    ChatMessage, ChatResponse, SessionHistory, 
    HealthCheck, ProcessingStats, TopicInfo
)
from ..services.therapy_service import TherapyService
from ..services.vector_store import VectorStoreService

# Initialize services
therapy_service = TherapyService()
vector_store = VectorStoreService()

# Create router
router = APIRouter()

# Include auth routes
from .auth_routes import router as auth_router
router.include_router(auth_router)


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    message: ChatMessage,
    db: Session = Depends(get_database_session),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """Main chat endpoint for processing user messages."""
    try:
        # Add user context if authenticated
        if current_user:
            message.context = message.context or {}
            message.context["user_id"] = current_user["user_id"]
            message.context["email"] = current_user["email"]
        
        response = await therapy_service.process_message(message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")


@router.get("/session/{session_id}/history")
async def get_session_history(
    session_id: str,
    db: Session = Depends(get_database_session),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """Get conversation history for a session."""
    try:
        # If user is authenticated, verify they own the session
        if current_user:
            user_id = current_user["user_id"]
            has_access = await therapy_service.verify_session_access(session_id, user_id)
            if not has_access:
                raise HTTPException(status_code=403, detail="Access denied to this session")
        
        history = await therapy_service.get_session_history(session_id)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")


@router.get("/topics", response_model=List[TopicInfo])
async def get_available_topics():
    """Get list of available conversation topics."""
    try:
        topics = await therapy_service.get_available_topics()
        return topics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving topics: {str(e)}")


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint."""
    try:
        # Check vector store
        vector_stats = await vector_store.get_collection_stats()
        
        return HealthCheck(
            status="healthy",
            timestamp=datetime.now(),
            services={
                "database": "operational",
                "vector_store": "operational",
                "llm_service": "operational",
                "topic_modeling": "operational"
            }
        )
    except Exception as e:
        return HealthCheck(
            status="unhealthy",
            timestamp=datetime.now(),
            services={
                "database": "error",
                "vector_store": "error",
                "llm_service": "error",
                "topic_modeling": "error"
            }
        )


@router.get("/stats", response_model=ProcessingStats)
async def get_processing_stats(db: Session = Depends(get_database_session)):
    """Get processing statistics."""
    try:
        from ..models.database_models import ConversationData, TopicCluster, PsychologicalPattern
        
        total_conversations = db.query(ConversationData).count()
        total_topics = db.query(TopicCluster).count()
        total_patterns = db.query(PsychologicalPattern).count()
        
        return ProcessingStats(
            total_conversations=total_conversations,
            total_topics=total_topics,
            total_patterns=total_patterns,
            last_updated=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_personal_message(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_text(json.dumps(message))

    async def send_typing_indicator(self, session_id: str, is_typing: bool):
        message = {
            "type": "typing",
            "isTyping": is_typing
        }
        await self.send_personal_message(message, session_id)


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time chat."""
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Send typing indicator
            await manager.send_typing_indicator(session_id, True)
            
            try:
                # Create ChatMessage object
                chat_message = ChatMessage(
                    content=message_data["content"],
                    session_id=session_id,
                    context=message_data.get("context", {})
                )
                
                # Process message
                response = await therapy_service.process_message(chat_message)
                
                # Send response back to client
                response_data = {
                    "type": "chat_response",
                    "data": {
                        "content": response.content,
                        "psychological_insight": response.psychological_insight.dict() if response.psychological_insight else None,
                        "emotional_state": response.emotional_state,
                        "topic_classification": response.topic_classification,
                        "suggestions": response.suggestions,
                        "session_id": response.session_id,
                        "timestamp": response.timestamp.isoformat(),
                        "confidence_score": response.confidence_score
                    }
                }
                
                await manager.send_personal_message(response_data, session_id)
                
            except Exception as e:
                # Send error message
                error_data = {
                    "type": "error",
                    "message": f"Error processing message: {str(e)}"
                }
                await manager.send_personal_message(error_data, session_id)
            
            finally:
                # Stop typing indicator
                await manager.send_typing_indicator(session_id, False)
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(session_id)


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    db: Session = Depends(get_database_session)
):
    """Delete a session and all its data."""
    try:
        from ..models.database_models import UserSession, SessionMessage
        
        # Delete session messages
        db.query(SessionMessage).filter(SessionMessage.session_id == session_id).delete()
        
        # Delete session
        db.query(UserSession).filter(UserSession.session_id == session_id).delete()
        
        # Delete from vector store
        await vector_store.delete_session_data(session_id)
        
        db.commit()
        
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")


@router.post("/admin/reindex")
async def reindex_vector_store(db: Session = Depends(get_database_session)):
    """Admin endpoint to reindex the vector store."""
    try:
        from ..models.database_models import ConversationData
        
        conversations = db.query(ConversationData).all()
        conversation_data = []
        
        for conv in conversations:
            conversation_data.append({
                "conversation_id": conv.conversation_id,
                "user_message": conv.user_message,
                "therapist_response": conv.therapist_response,
                "topic": conv.topic_cluster,
                "emotional_tone": conv.emotional_tone,
                "psychological_patterns": conv.psychological_patterns
            })
        
        await vector_store.reindex_conversations(conversation_data)
        
        return {"message": f"Reindexed {len(conversation_data)} conversations"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reindexing: {str(e)}")