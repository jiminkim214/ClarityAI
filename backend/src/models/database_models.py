from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class ConversationData(Base):
    __tablename__ = "conversation_data"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, unique=True, index=True)
    user_message = Column(Text, nullable=False)
    therapist_response = Column(Text, nullable=False)
    emotional_tone = Column(String, index=True)
    topic_cluster = Column(Integer, index=True)
    psychological_patterns = Column(JSON)  # List of detected patterns
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    embeddings = relationship("MessageEmbedding", back_populates="conversation")


class MessageEmbedding(Base):
    __tablename__ = "message_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversation_data.conversation_id"))
    message_type = Column(String)  # 'user' or 'therapist'
    embedding_vector = Column(JSON)  # Stored as JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("ConversationData", back_populates="embeddings")


class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    messages = relationship("SessionMessage", back_populates="session")


class SessionMessage(Base):
    __tablename__ = "session_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("user_sessions.session_id"))
    content = Column(Text, nullable=False)
    sender = Column(String, nullable=False)  # 'user' or 'ai'
    psychological_insight = Column(JSON)
    emotional_state = Column(String)
    topic_classification = Column(String)
    confidence_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("UserSession", back_populates="messages")


class PsychologicalPattern(Base):
    __tablename__ = "psychological_patterns"
    
    id = Column(Integer, primary_key=True, index=True)
    pattern_name = Column(String, unique=True, index=True)
    description = Column(Text)
    keywords = Column(JSON)  # List of keywords
    therapeutic_approach = Column(Text)
    confidence_threshold = Column(Float, default=0.7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TopicCluster(Base):
    __tablename__ = "topic_clusters"
    
    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, unique=True, index=True)
    topic_name = Column(String)
    keywords = Column(JSON)  # Top keywords for the topic
    representative_docs = Column(JSON)  # Sample documents
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)  # Supabase user ID
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    avatar_url = Column(String)
    preferences = Column(JSON)  # User preferences for therapy
    therapy_goals = Column(JSON)  # User's therapy goals
    privacy_settings = Column(JSON)  # Privacy preferences
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sessions = relationship("UserSession", foreign_keys="UserSession.user_id", primaryjoin="UserProfile.user_id == UserSession.user_id")


class TherapySession(Base):
    __tablename__ = "therapy_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("user_profiles.user_id"))
    session_name = Column(String)
    session_summary = Column(Text)
    mood_before = Column(String)
    mood_after = Column(String)
    topics_discussed = Column(JSON)
    insights_generated = Column(JSON)
    session_duration = Column(Integer)  # Duration in minutes
    session_rating = Column(Integer)  # User rating 1-5
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("UserProfile", foreign_keys=[user_id])
    messages = relationship("SessionMessage", foreign_keys="SessionMessage.session_id", primaryjoin="TherapySession.session_id == SessionMessage.session_id")