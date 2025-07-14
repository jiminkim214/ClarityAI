import openai
from typing import List, Dict, Any, Optional
from loguru import logger
from ..core.config import settings
from ..models.schemas import ChatResponse, PsychologicalInsight
from openai import AsyncOpenAI

class LLMService:
    """Handles LLM interactions for generating therapeutic responses."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model_name = "gpt-3.5-turbo"  # Can be changed to gpt-3.5-turbo for cost efficiency
        self.max_tokens = 500
        self.temperature = 0.7
    
    async def generate_therapeutic_response(
        self,
        user_message: str,
        context: Dict[str, Any],
        retrieved_responses: List[Dict[str, Any]],
        session_history: List[Dict[str, Any]] = None
    ) -> ChatResponse:
        """Generate a therapeutic response using RAG and LLM."""
        try:
            # Build the prompt
            prompt = self._build_therapeutic_prompt(
                user_message, context, retrieved_responses, session_history
            )
            
            # Generate response using OpenAI
            response = await self._call_openai(prompt)
            
            # Parse and structure the response
            structured_response = self._parse_llm_response(response, context)
            
            return structured_response
            
        except Exception as e:
            logger.error(f"Error generating therapeutic response: {e}")
            # Return a fallback response
            return self._create_fallback_response(user_message, context)
    
    def _build_therapeutic_prompt(
        self,
        user_message: str,
        context: Dict[str, Any],
        retrieved_responses: List[Dict[str, Any]],
        session_history: List[Dict[str, Any]] = None
    ) -> str:
        """Build a comprehensive therapeutic prompt using RAG."""
        
        # Base therapeutic instructions
        base_instructions = """You are Clarity, an AI-powered therapy assistant. Your role is to provide empathetic, psychologically-informed support while maintaining professional boundaries.

Core Principles:
- Be warm, empathetic, and non-judgmental
- Use evidence-based therapeutic approaches
- Maintain appropriate boundaries (you are not a replacement for professional therapy)
- Focus on the user's emotional well-being and personal growth
- Provide practical, actionable insights when appropriate

Response Structure:
1. Acknowledge the user's feelings and experience
2. Provide gentle insight or reflection
3. Offer 1-2 practical suggestions or coping strategies
4. End with an open-ended question to encourage further exploration"""
        
        # Add context information
        context_info = ""
        if context.get("emotional_state"):
            context_info += f"\nDetected emotional state: {context['emotional_state']}"
        
        if context.get("topic_classification"):
            context_info += f"\nTopic: {context['topic_classification']}"
        
        if context.get("psychological_patterns"):
            patterns = ", ".join([p.get("pattern", "") for p in context["psychological_patterns"]])
            context_info += f"\nDetected patterns: {patterns}"
        
        # Add retrieved similar responses for context
        rag_context = ""
        if retrieved_responses:
            rag_context = "\n\nSimilar therapeutic responses for reference:\n"
            for i, resp in enumerate(retrieved_responses[:3], 1):
                rag_context += f"{i}. {resp['content'][:200]}...\n"
        
        # Add session history for continuity
        history_context = ""
        if session_history:
            history_context = "\n\nRecent conversation context:\n"
            for msg in session_history[-3:]:  # Last 3 messages
                sender = msg.get("sender", "unknown")
                content = msg.get("content", "")[:100]
                history_context += f"{sender}: {content}...\n"
        
        # Combine all parts
        full_prompt = f"""{base_instructions}

{context_info}

{rag_context}

{history_context}

User's current message: "{user_message}"

Please provide a therapeutic response that:
- Acknowledges their feelings
- Offers gentle insight or reflection
- Provides practical suggestions
- Maintains a warm, supportive tone
- Asks a thoughtful follow-up question

Response:"""
        
        return full_prompt
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API to generate response."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are Clarity, a compassionate AI therapy assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    def _parse_llm_response(self, response: str, context: Dict[str, Any]) -> ChatResponse:
        """Parse and structure the LLM response."""
        # Extract psychological insights if patterns were detected
        psychological_insight = None
        if context.get("psychological_patterns"):
            primary_pattern = context["psychological_patterns"][0]
            psychological_insight = PsychologicalInsight(
                pattern=primary_pattern.get("pattern"),
                confidence=primary_pattern.get("confidence", 0.0),
                description=primary_pattern.get("description", ""),
                therapeutic_approach=primary_pattern.get("therapeutic_approach", "")
            )
        
        # Generate suggestions based on the response
        suggestions = self._extract_suggestions(response)
        
        # Calculate confidence score based on context richness
        confidence_score = self._calculate_confidence_score(context)
        
        return ChatResponse(
            content=response,
            psychological_insight=psychological_insight,
            emotional_state=context.get("emotional_state"),
            topic_classification=context.get("topic_classification"),
            suggestions=suggestions,
            session_id=context.get("session_id", ""),
            timestamp=context.get("timestamp"),
            confidence_score=confidence_score
        )
    
    def _extract_suggestions(self, response: str) -> List[str]:
        """Extract actionable suggestions from the response."""
        suggestions = []
        
        # Simple heuristics to identify suggestions
        suggestion_indicators = [
            "try", "consider", "might help", "could", "perhaps",
            "suggestion", "recommend", "practice", "exercise"
        ]
        
        sentences = response.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(indicator in sentence.lower() for indicator in suggestion_indicators):
                if len(sentence) > 20 and len(sentence) < 150:
                    suggestions.append(sentence + ".")
        
        return suggestions[:3]  # Return top 3 suggestions
    
    def _calculate_confidence_score(self, context: Dict[str, Any]) -> float:
        """Calculate confidence score based on available context."""
        score = 0.5  # Base score
        
        # Add points for available context
        if context.get("emotional_state"):
            score += 0.1
        
        if context.get("topic_classification"):
            score += 0.1
        
        if context.get("psychological_patterns"):
            score += 0.2
        
        if context.get("session_history"):
            score += 0.1
        
        return min(score, 1.0)
    
    def _create_fallback_response(self, user_message: str, context: Dict[str, Any]) -> ChatResponse:
        """Create a fallback response when LLM fails."""
        fallback_content = """I hear you, and I want you to know that your feelings are valid. 
        Sometimes it helps to take a moment to breathe and acknowledge what you're experiencing. 
        Would you like to share more about what's on your mind right now?"""
        
        return ChatResponse(
            content=fallback_content,
            session_id=context.get("session_id", ""),
            timestamp=context.get("timestamp"),
            confidence_score=0.3
        )
    
    async def generate_session_summary(self, messages: List[Dict[str, Any]]) -> str:
        """Generate a summary of the therapy session."""
        try:
            # Prepare messages for summarization
            conversation_text = ""
            for msg in messages:
                sender = "User" if msg.get("sender") == "user" else "Clarity"
                conversation_text += f"{sender}: {msg.get('content', '')}\n"
            
            prompt = f"""Please provide a brief, therapeutic summary of this conversation session:

{conversation_text}

Summary should include:
- Key themes discussed
- Emotional patterns observed
- Progress or insights gained
- Areas for continued focus

Keep it professional and supportive, around 100-150 words."""
            
            summary = await self._call_openai(prompt)
            return summary
            
        except Exception as e:
            logger.error(f"Error generating session summary: {e}")
            return "Session completed. Continue exploring your thoughts and feelings."