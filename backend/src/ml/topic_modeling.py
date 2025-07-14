"""
Advanced topic modeling using BERTopic for mental health conversations.
"""

import pickle
import os
from typing import List, Dict, Any, Optional, Tuple
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from umap import UMAP
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer
from loguru import logger
import pandas as pd
from sqlalchemy.orm import Session
from ..core.database import get_database_session
from ..models.database_models import ConversationData, TopicCluster
from ..core.config import settings


class AdvancedTopicModeling:
    """Advanced topic modeling service using BERTopic."""
    
    def __init__(self):
        self.model: Optional[BERTopic] = None
        self.embedding_model = SentenceTransformer(settings.sentence_transformer_model)
        self.model_path = settings.bertopic_model_path
        self.topics_info = None
        
        # Ensure model directory exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
    
    def _create_bertopic_model(self, min_topic_size: int = 10) -> BERTopic:
        """Create a BERTopic model with optimized parameters for mental health conversations."""
        
        # UMAP for dimensionality reduction
        umap_model = UMAP(
            n_neighbors=15,
            n_components=5,
            min_dist=0.0,
            metric='cosine',
            random_state=42
        )
        
        # HDBSCAN for clustering
        hdbscan_model = HDBSCAN(
            min_cluster_size=min_topic_size,
            metric='euclidean',
            cluster_selection_method='eom',
            prediction_data=True
        )
        
        # Vectorizer for topic representation
        vectorizer_model = CountVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            min_df=2,
            max_features=5000
        )
        
        # Create BERTopic model
        topic_model = BERTopic(
            embedding_model=self.embedding_model,
            umap_model=umap_model,
            hdbscan_model=hdbscan_model,
            vectorizer_model=vectorizer_model,
            top_k_words=10,
            language="english",
            calculate_probabilities=True,
            verbose=True
        )
        
        return topic_model
    
    async def train_topic_model(self, min_topic_size: int = 10) -> None:
        """Train BERTopic model on mental health conversations."""
        try:
            # Load conversation data
            documents = await self._load_conversation_documents()
            
            if len(documents) < min_topic_size * 2:
                logger.warning(f"Not enough documents ({len(documents)}) to train topic model")
                return
            
            logger.info(f"Training topic model on {len(documents)} documents")
            
            # Create and train model
            self.model = self._create_bertopic_model(min_topic_size)
            topics, probabilities = self.model.fit_transform(documents)
            
            # Get topic information
            self.topics_info = self.model.get_topic_info()
            
            # Save the model
            await self._save_model()
            
            # Store topic information in database
            await self._store_topic_clusters()
            
            # Update conversation topics
            await self._update_conversation_topics(documents, topics)
            
            logger.info(f"Topic model trained successfully with {len(set(topics))} topics")
            
        except Exception as e:
            logger.error(f"Error training topic model: {e}")
            raise
    
    async def load_model(self) -> bool:
        """Load existing BERTopic model."""
        try:
            if os.path.exists(self.model_path):
                self.model = BERTopic.load(self.model_path)
                self.topics_info = self.model.get_topic_info()
                logger.info("Topic model loaded successfully")
                return True
            else:
                logger.warning(f"Model file not found at {self.model_path}")
                return False
        except Exception as e:
            logger.warning(f"Could not load topic model: {e}")
            return False
    
    async def predict_topic(self, text: str) -> Dict[str, Any]:
        """Predict topic for a given text."""
        if not self.model:
            await self.load_model()
            if not self.model:
                return {"topic_id": -1, "topic_name": "unknown", "confidence": 0.0}
        
        try:
            # Transform text to get topic
            topics, probabilities = self.model.transform([text])
            topic_id = topics[0]
            
            # Get confidence score
            if probabilities is not None and len(probabilities[0]) > 0:
                if topic_id >= 0 and topic_id < len(probabilities[0]):
                    confidence = probabilities[0][topic_id]
                else:
                    confidence = 0.0
            else:
                confidence = 0.0
            
            # Get topic name
            topic_name = self._get_topic_name(topic_id)
            
            return {
                "topic_id": int(topic_id),
                "topic_name": topic_name,
                "confidence": float(confidence)
            }
            
        except Exception as e:
            logger.error(f"Error predicting topic: {e}")
            return {"topic_id": -1, "topic_name": "unknown", "confidence": 0.0}
    
    def _get_topic_name(self, topic_id: int) -> str:
        """Get human-readable topic name."""
        if not self.topics_info is not None or topic_id < 0:
            return "unknown"
        
        try:
            # Get topic keywords
            topic_words = self.model.get_topic(topic_id)
            if topic_words:
                # Create topic name from top keywords
                top_words = [word for word, _ in topic_words[:3]]
                topic_name = "_".join(top_words).lower()
                
                # Map to more meaningful names for mental health topics
                topic_mapping = {
                    "anxiety_worry_stress": "anxiety",
                    "depression_sad_feel": "depression",
                    "relationship_partner_love": "relationships",
                    "work_job_career": "work_stress",
                    "family_parent_child": "family_issues",
                    "therapy_help_support": "therapy_support",
                    "emotion_feeling_mood": "emotional_regulation",
                    "sleep_tired_rest": "sleep_issues",
                    "anger_mad_frustrated": "anger_management",
                    "self_worth_confidence": "self_esteem"
                }
                
                # Check for matches
                for pattern, name in topic_mapping.items():
                    if any(word in topic_name for word in pattern.split("_")):
                        return name
                
                return topic_name
            
            return f"topic_{topic_id}"
            
        except Exception as e:
            logger.error(f"Error getting topic name: {e}")
            return f"topic_{topic_id}"
    
    async def get_topic_keywords(self, topic_id: int, top_k: int = 10) -> List[str]:
        """Get top keywords for a specific topic."""
        if not self.model:
            await self.load_model()
            if not self.model:
                return []
        
        try:
            topic_words = self.model.get_topic(topic_id)
            return [word for word, _ in topic_words[:top_k]]
        except Exception as e:
            logger.error(f"Error getting topic keywords: {e}")
            return []
    
    async def find_similar_topics(self, text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Find similar topics for given text."""
        if not self.model:
            await self.load_model()
            if not self.model:
                return []
        
        try:
            # Get topic similarities
            similar_topics, similarities = self.model.find_topics(text, top_k=top_k)
            
            results = []
            for topic_id, similarity in zip(similar_topics, similarities):
                topic_name = self._get_topic_name(topic_id)
                keywords = await self.get_topic_keywords(topic_id, 5)
                
                results.append({
                    "topic_id": int(topic_id),
                    "topic_name": topic_name,
                    "similarity": float(similarity),
                    "keywords": keywords
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error finding similar topics: {e}")
            return []
    
    async def _load_conversation_documents(self) -> List[str]:
        """Load conversation documents from database."""
        db = next(get_database_session())
        
        try:
            conversations = db.query(ConversationData).all()
            documents = []
            
            for conv in conversations:
                # Combine user message and therapist response for topic modeling
                combined_text = f"{conv.user_message} {conv.therapist_response}"
                documents.append(combined_text)
            
            return documents
            
        except Exception as e:
            logger.error(f"Error loading conversation documents: {e}")
            return []
        finally:
            db.close()
    
    async def _save_model(self) -> None:
        """Save the trained BERTopic model."""
        if self.model:
            try:
                self.model.save(self.model_path)
                logger.info(f"Model saved to {self.model_path}")
            except Exception as e:
                logger.error(f"Error saving model: {e}")
                raise
    
    async def _store_topic_clusters(self) -> None:
        """Store topic cluster information in database."""
        if not self.model or self.topics_info is None:
            return
        
        db = next(get_database_session())
        
        try:
            for _, row in self.topics_info.iterrows():
                topic_id = row['Topic']
                if topic_id == -1:  # Skip outlier topic
                    continue
                
                # Get topic keywords
                topic_words = self.model.get_topic(topic_id)
                keywords = [word for word, _ in topic_words[:10]]
                
                # Get representative documents
                try:
                    representative_docs = self.model.get_representative_docs(topic_id)[:3]
                except:
                    representative_docs = []
                
                # Get topic name
                topic_name = self._get_topic_name(topic_id)
                
                # Check if topic already exists
                existing = db.query(TopicCluster).filter(
                    TopicCluster.cluster_id == topic_id
                ).first()
                
                if existing:
                    # Update existing
                    existing.topic_name = topic_name
                    existing.keywords = keywords
                    existing.representative_docs = representative_docs
                else:
                    # Create new
                    cluster = TopicCluster(
                        cluster_id=topic_id,
                        topic_name=topic_name,
                        keywords=keywords,
                        representative_docs=representative_docs
                    )
                    db.add(cluster)
            
            db.commit()
            logger.info("Topic clusters stored in database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error storing topic clusters: {e}")
            raise
        finally:
            db.close()
    
    async def _update_conversation_topics(self, documents: List[str], topics: List[int]) -> None:
        """Update topic assignments for conversations."""
        db = next(get_database_session())
        
        try:
            conversations = db.query(ConversationData).all()
            
            for i, conv in enumerate(conversations):
                if i < len(topics):
                    conv.topic_cluster = topics[i]
            
            db.commit()
            logger.info(f"Updated topic assignments for {len(conversations)} conversations")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating conversation topics: {e}")
            raise
        finally:
            db.close()