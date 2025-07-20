from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    session_id: str
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PsychologicalInsight(BaseModel):
    pattern_detected: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    therapeutic_approach: str
    suggested_response: str


class ChatResponse(BaseModel):
    content: str
    session_id: str
    timestamp: Optional[str] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    psychological_insight: Optional[PsychologicalInsight] = None
    emotional_state: Optional[str] = None
    topic_classification: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)


class SessionHistory(BaseModel):
    history: List[Dict[str, Any]]


class HealthCheck(BaseModel):
    status: str
    timestamp: str
    version: str


class ProcessingStats(BaseModel):
    total_conversations: int
    active_sessions: int
    topics_identified: int
    patterns_detected: int


class TopicInfo(BaseModel):
    topic_id: int
    topic_name: str
    keywords: List[str]
    document_count: int


# Authentication Schemas
class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    therapy_goals: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    therapy_goals: Optional[List[str]] = None


class TherapySessionResponse(BaseModel):
    session_id: str
    user_id: str
    session_name: Optional[str] = None
    session_summary: Optional[str] = None
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    topics_discussed: List[str] = Field(default_factory=list)
    insights_generated: List[str] = Field(default_factory=list)
    session_duration: Optional[int] = None
    session_rating: Optional[int] = None
    is_completed: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None