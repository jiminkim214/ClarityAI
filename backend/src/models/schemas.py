from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChatMessage(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    session_id: str
    context: Optional[Dict[str, Any]] = None


class PsychologicalInsight(BaseModel):
    pattern: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    description: str
    therapeutic_approach: str


class ChatResponse(BaseModel):
    content: str
    psychological_insight: Optional[PsychologicalInsight] = None
    emotional_state: Optional[str] = None
    topic_classification: Optional[str] = None
    suggestions: Optional[List[str]] = None
    session_id: str
    timestamp: datetime
    confidence_score: float = Field(..., ge=0.0, le=1.0)


class SessionHistory(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    message_count: int


class TopicInfo(BaseModel):
    topic_id: int
    topic_name: str
    keywords: List[str]
    confidence: float


class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]


class ProcessingStats(BaseModel):
    total_conversations: int
    total_topics: int
    total_patterns: int
    last_updated: datetime


class RetrievalResult(BaseModel):
    content: str
    similarity_score: float
    topic: Optional[str] = None
    emotional_tone: Optional[str] = None


class PatternDetectionResult(BaseModel):
    pattern_name: str
    confidence: float
    description: str
    therapeutic_approach: str
    keywords_matched: List[str]