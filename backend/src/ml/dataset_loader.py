"""
Dataset loader for mental health counseling conversations.
Loads and preprocesses the Amod/mental_health_counseling_conversations dataset.
"""

import asyncio
import re
from typing import List, Dict, Any, Tuple, Optional
from datasets import load_dataset
from loguru import logger
import pandas as pd
from sqlalchemy.orm import Session
from ..core.database import get_database_session
from ..models.database_models import ConversationData


class MentalHealthDatasetLoader:
    """Loads and processes the mental health counseling conversations dataset."""
    
    def __init__(self):
        self.dataset_name = "Amod/mental_health_counseling_conversations"
        self.processed_conversations = []
    
    async def load_dataset(self) -> pd.DataFrame:
        """Load the mental health counseling conversations dataset."""
        try:
            logger.info(f"Loading dataset: {self.dataset_name}")
            
            # Load the dataset
            dataset = load_dataset(self.dataset_name)
            
            # Convert to pandas DataFrame for easier processing
            if 'train' in dataset:
                df = dataset['train'].to_pandas()
            else:
                # Use the first available split
                split_name = list(dataset.keys())[0]
                df = dataset[split_name].to_pandas()
            
            logger.info(f"Loaded {len(df)} conversations from dataset")
            return df
            
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            raise
    
    def preprocess_conversations(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Preprocess conversations from the dataset."""
        processed = []
        
        for idx, row in df.iterrows():
            try:
                # Extract conversation pairs based on dataset structure
                user_message, therapist_response = self._extract_conversation_pair(row)
                
                if user_message and therapist_response:
                    # Clean and anonymize
                    clean_user_msg = self._clean_text(user_message)
                    clean_therapist_resp = self._clean_text(therapist_response)
                    
                    if len(clean_user_msg) > 10 and len(clean_therapist_resp) > 10:
                        processed.append({
                            'conversation_id': f"conv_{idx}",
                            'user_message': clean_user_msg,
                            'therapist_response': clean_therapist_resp,
                            'original_index': idx
                        })
                        
            except Exception as e:
                logger.warning(f"Error processing conversation {idx}: {e}")
                continue
        
        logger.info(f"Preprocessed {len(processed)} valid conversations")
        return processed
    
    def _extract_conversation_pair(self, row: pd.Series) -> Tuple[Optional[str], Optional[str]]:
        """Extract user message and therapist response from dataset row."""
        # Try different possible column names based on common dataset structures
        possible_user_cols = ['Context', 'input', 'question', 'user_input', 'client_message']
        possible_therapist_cols = ['Response', 'output', 'answer', 'therapist_response', 'counselor_response']
        
        user_message = None
        therapist_response = None
        
        # Find user message
        for col in possible_user_cols:
            if col in row and pd.notna(row[col]):
                user_message = str(row[col])
                break
        
        # Find therapist response
        for col in possible_therapist_cols:
            if col in row and pd.notna(row[col]):
                therapist_response = str(row[col])
                break
        
        # If standard columns not found, try to use any text columns
        if not user_message or not therapist_response:
            text_cols = [col for col in row.index if isinstance(row[col], str) and len(str(row[col])) > 20]
            if len(text_cols) >= 2:
                user_message = user_message or str(row[text_cols[0]])
                therapist_response = therapist_response or str(row[text_cols[1]])
        
        return user_message, therapist_response
    
    def _clean_text(self, text: str) -> str:
        """Clean and anonymize text while preserving meaning."""
        if not text:
            return ""
        
        # Remove or replace personal identifiers
        text = re.sub(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', '[NAME]', text)  # Names
        text = re.sub(r'\b\d{3}-\d{3}-\d{4}\b', '[PHONE]', text)  # Phone numbers
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)  # Emails
        text = re.sub(r'\b\d{1,5}\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr)\b', '[ADDRESS]', text)  # Addresses
        
        # Clean up formatting
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\'\"]', '', text)
        
        # Remove very short or very long messages
        if len(text) < 10 or len(text) > 2000:
            return ""
        
        return text
    
    async def save_to_database(self, conversations: List[Dict[str, Any]]) -> None:
        """Save processed conversations to database."""
        db = next(get_database_session())
        
        try:
            batch_size = 100
            saved_count = 0
            
            for i in range(0, len(conversations), batch_size):
                batch = conversations[i:i + batch_size]
                
                for conv in batch:
                    # Check if conversation already exists
                    existing = db.query(ConversationData).filter(
                        ConversationData.conversation_id == conv['conversation_id']
                    ).first()
                    
                    if not existing:
                        conversation = ConversationData(
                            conversation_id=conv['conversation_id'],
                            user_message=conv['user_message'],
                            therapist_response=conv['therapist_response'],
                            emotional_tone='neutral',  # Will be updated by ML models
                            psychological_patterns=[]  # Will be updated by pattern detection
                        )
                        db.add(conversation)
                        saved_count += 1
                
                db.commit()
                logger.info(f"Saved batch {i//batch_size + 1}, total saved: {saved_count}")
            
            logger.info(f"Successfully saved {saved_count} conversations to database")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving conversations to database: {e}")
            raise
        finally:
            db.close()
    
    async def load_and_process(self) -> None:
        """Main method to load, process, and save the dataset."""
        try:
            # Load dataset
            df = await self.load_dataset()
            
            # Preprocess conversations
            conversations = self.preprocess_conversations(df)
            
            # Save to database
            await self.save_to_database(conversations)
            
            logger.info("Dataset loading and processing completed successfully")
            
        except Exception as e:
            logger.error(f"Error in dataset loading and processing: {e}")
            raise