"""
Enhanced psychological pattern detection using ML techniques.
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from textblob import TextBlob
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from loguru import logger


class MLPatternDetection:
    """Enhanced pattern detection using machine learning techniques."""
    
    def __init__(self):
        self.patterns = self._initialize_patterns()
        self.emotional_indicators = self._initialize_emotional_indicators()
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.pattern_vectors = None
        self._initialize_pattern_vectors()
    
    def _initialize_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize comprehensive psychological patterns."""
        return {
            "cognitive_distortions": {
                "all_or_nothing": {
                    "keywords": ["always", "never", "completely", "totally", "absolutely", "entirely"],
                    "phrases": [r"always (?:happens|goes wrong)", r"never (?:works|gets better)"],
                    "description": "Black-and-white thinking without middle ground",
                    "therapeutic_approach": "Cognitive restructuring to find middle ground",
                    "severity": "moderate"
                },
                "catastrophizing": {
                    "keywords": ["disaster", "terrible", "awful", "worst", "ruined", "doomed"],
                    "phrases": [r"worst (?:thing|case|scenario)", r"complete disaster"],
                    "description": "Expecting the worst possible outcome",
                    "therapeutic_approach": "Reality testing and probability assessment",
                    "severity": "high"
                },
                "mind_reading": {
                    "keywords": ["they think", "everyone believes", "people assume", "obviously thinks"],
                    "phrases": [r"they (?:think|believe) I'm", r"everyone (?:thinks|knows)"],
                    "description": "Assuming you know what others are thinking",
                    "therapeutic_approach": "Evidence-based thinking and communication skills",
                    "severity": "moderate"
                },
                "fortune_telling": {
                    "keywords": ["will never", "going to fail", "won't work", "bound to"],
                    "phrases": [r"will never (?:work|happen)", r"going to (?:fail|be terrible)"],
                    "description": "Predicting negative outcomes without evidence",
                    "therapeutic_approach": "Examining evidence and considering alternatives",
                    "severity": "moderate"
                }
            },
            "defense_mechanisms": {
                "denial": {
                    "keywords": ["not true", "didn't happen", "not real", "imagining"],
                    "phrases": [r"that's not (?:true|real)", r"didn't (?:happen|occur)"],
                    "description": "Refusing to accept reality or facts",
                    "therapeutic_approach": "Gentle reality testing and support",
                    "severity": "high"
                },
                "projection": {
                    "keywords": ["everyone else", "they all", "people always", "others do"],
                    "phrases": [r"everyone (?:else|always)", r"they all (?:do|think)"],
                    "description": "Attributing own feelings to others",
                    "therapeutic_approach": "Self-awareness and ownership exercises",
                    "severity": "moderate"
                },
                "rationalization": {
                    "keywords": ["good reason", "makes sense", "logical", "justified"],
                    "phrases": [r"good reason (?:for|to)", r"makes (?:sense|perfect sense)"],
                    "description": "Creating logical explanations for emotional decisions",
                    "therapeutic_approach": "Exploring underlying emotions and motivations",
                    "severity": "low"
                }
            },
            "emotional_patterns": {
                "rumination": {
                    "keywords": ["keep thinking", "can't stop", "over and over", "replaying"],
                    "phrases": [r"keep (?:thinking|going over)", r"can't stop (?:thinking|worrying)"],
                    "description": "Repetitive, unproductive thinking patterns",
                    "therapeutic_approach": "Mindfulness and thought interruption techniques",
                    "severity": "moderate"
                },
                "emotional_suppression": {
                    "keywords": ["don't feel", "shouldn't feel", "push down", "ignore"],
                    "phrases": [r"don't (?:want to|like to) feel", r"shouldn't (?:feel|be)"],
                    "description": "Avoiding or suppressing emotional experiences",
                    "therapeutic_approach": "Emotional acceptance and expression techniques",
                    "severity": "moderate"
                },
                "perfectionism": {
                    "keywords": ["perfect", "flawless", "no mistakes", "exactly right"],
                    "phrases": [r"(?:has to|must|should) be perfect", r"no (?:mistakes|errors)"],
                    "description": "Setting unrealistically high standards",
                    "therapeutic_approach": "Exploring 'good enough' and self-acceptance",
                    "severity": "moderate"
                }
            }
        }
    
    def _initialize_emotional_indicators(self) -> Dict[str, Dict[str, Any]]:
        """Initialize emotional state indicators with intensity levels."""
        return {
            "anxiety": {
                "mild": ["worried", "concerned", "nervous", "uneasy"],
                "moderate": ["anxious", "stressed", "overwhelmed", "tense"],
                "severe": ["panic", "terrified", "paralyzed", "desperate"]
            },
            "depression": {
                "mild": ["sad", "down", "blue", "disappointed"],
                "moderate": ["depressed", "hopeless", "empty", "numb"],
                "severe": ["suicidal", "worthless", "devastated", "destroyed"]
            },
            "anger": {
                "mild": ["annoyed", "frustrated", "irritated", "bothered"],
                "moderate": ["angry", "mad", "furious", "outraged"],
                "severe": ["rage", "livid", "explosive", "violent"]
            },
            "fear": {
                "mild": ["uncertain", "cautious", "hesitant", "wary"],
                "moderate": ["afraid", "scared", "frightened", "alarmed"],
                "severe": ["terrified", "petrified", "horrified", "traumatized"]
            }
        }
    
    def _initialize_pattern_vectors(self):
        """Initialize TF-IDF vectors for pattern matching."""
        try:
            # Collect all pattern text for vectorization
            pattern_texts = []
            pattern_labels = []
            
            for category, patterns in self.patterns.items():
                for pattern_name, pattern_info in patterns.items():
                    # Combine keywords and phrases for each pattern
                    text = " ".join(pattern_info["keywords"])
                    pattern_texts.append(text)
                    pattern_labels.append(f"{category}_{pattern_name}")
            
            # Fit vectorizer
            if pattern_texts:
                self.pattern_vectors = self.vectorizer.fit_transform(pattern_texts)
                self.pattern_labels = pattern_labels
                logger.info("Pattern vectors initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing pattern vectors: {e}")
    
    async def detect_patterns(self, text: str) -> List[Dict[str, Any]]:
        """Detect psychological patterns using ML-enhanced techniques."""
        try:
            detected_patterns = []
            text_lower = text.lower()
            
            # Rule-based detection
            rule_based_patterns = await self._rule_based_detection(text_lower)
            
            # ML-based detection
            ml_based_patterns = await self._ml_based_detection(text)
            
            # Combine and deduplicate results
            all_patterns = rule_based_patterns + ml_based_patterns
            detected_patterns = self._merge_pattern_results(all_patterns)
            
            # Sort by confidence
            detected_patterns.sort(key=lambda x: x["confidence"], reverse=True)
            
            return detected_patterns
            
        except Exception as e:
            logger.error(f"Error detecting patterns: {e}")
            return []
    
    async def _rule_based_detection(self, text_lower: str) -> List[Dict[str, Any]]:
        """Rule-based pattern detection."""
        detected_patterns = []
        
        for category, patterns in self.patterns.items():
            for pattern_name, pattern_info in patterns.items():
                confidence = 0.0
                matched_keywords = []
                matched_phrases = []
                
                # Check for keyword matches
                for keyword in pattern_info["keywords"]:
                    if keyword.lower() in text_lower:
                        matched_keywords.append(keyword)
                        confidence += 0.1
                
                # Check for phrase pattern matches
                for phrase_pattern in pattern_info["phrases"]:
                    matches = re.findall(phrase_pattern, text_lower, re.IGNORECASE)
                    if matches:
                        matched_phrases.extend(matches)
                        confidence += 0.3
                
                # Apply severity weighting
                severity_weights = {"low": 0.7, "moderate": 0.8, "high": 1.0}
                severity = pattern_info.get("severity", "moderate")
                confidence *= severity_weights.get(severity, 0.8)
                
                confidence = min(confidence, 1.0)
                
                # Only include patterns with sufficient confidence
                if confidence >= 0.2:
                    detected_patterns.append({
                        "pattern": f"{category}_{pattern_name}",
                        "category": category,
                        "name": pattern_name,
                        "confidence": round(confidence, 2),
                        "description": pattern_info["description"],
                        "therapeutic_approach": pattern_info["therapeutic_approach"],
                        "severity": severity,
                        "keywords_matched": matched_keywords,
                        "phrases_matched": matched_phrases,
                        "detection_method": "rule_based"
                    })
        
        return detected_patterns
    
    async def _ml_based_detection(self, text: str) -> List[Dict[str, Any]]:
        """ML-based pattern detection using TF-IDF similarity."""
        if self.pattern_vectors is None:
            return []
        
        try:
            # Vectorize input text
            text_vector = self.vectorizer.transform([text])
            
            # Calculate similarities
            similarities = cosine_similarity(text_vector, self.pattern_vectors)[0]
            
            detected_patterns = []
            for i, similarity in enumerate(similarities):
                if similarity > 0.3:  # Threshold for ML detection
                    pattern_label = self.pattern_labels[i]
                    category, pattern_name = pattern_label.split("_", 1)
                    
                    # Get pattern info
                    pattern_info = self.patterns[category][pattern_name]
                    
                    detected_patterns.append({
                        "pattern": pattern_label,
                        "category": category,
                        "name": pattern_name,
                        "confidence": round(similarity, 2),
                        "description": pattern_info["description"],
                        "therapeutic_approach": pattern_info["therapeutic_approach"],
                        "severity": pattern_info.get("severity", "moderate"),
                        "detection_method": "ml_based"
                    })
            
            return detected_patterns
            
        except Exception as e:
            logger.error(f"Error in ML-based detection: {e}")
            return []
    
    def _merge_pattern_results(self, patterns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merge and deduplicate pattern detection results."""
        pattern_dict = {}
        
        for pattern in patterns:
            pattern_key = pattern["pattern"]
            
            if pattern_key in pattern_dict:
                # Merge results - take higher confidence
                existing = pattern_dict[pattern_key]
                if pattern["confidence"] > existing["confidence"]:
                    pattern_dict[pattern_key] = pattern
                    # Add detection methods
                    methods = set([existing.get("detection_method", ""), pattern.get("detection_method", "")])
                    pattern_dict[pattern_key]["detection_method"] = "_".join(filter(None, methods))
            else:
                pattern_dict[pattern_key] = pattern
        
        return list(pattern_dict.values())
    
    async def detect_emotional_state(self, text: str) -> Dict[str, Any]:
        """Enhanced emotional state detection with intensity levels."""
        try:
            text_lower = text.lower()
            emotion_scores = {}
            
            # Score emotions based on keyword presence and intensity
            for emotion, intensity_levels in self.emotional_indicators.items():
                total_score = 0
                intensity_breakdown = {}
                
                for intensity, indicators in intensity_levels.items():
                    score = 0
                    matched_words = []
                    
                    for indicator in indicators:
                        if indicator in text_lower:
                            score += 1
                            matched_words.append(indicator)
                    
                    # Weight by intensity
                    intensity_weights = {"mild": 1, "moderate": 2, "severe": 3}
                    weighted_score = score * intensity_weights[intensity]
                    total_score += weighted_score
                    
                    if score > 0:
                        intensity_breakdown[intensity] = {
                            "score": score,
                            "matched_words": matched_words
                        }
                
                if total_score > 0:
                    emotion_scores[emotion] = {
                        "total_score": total_score,
                        "intensity_breakdown": intensity_breakdown
                    }
            
            # Use TextBlob for sentiment analysis
            blob = TextBlob(text)
            sentiment = blob.sentiment
            
            # Determine primary emotion and intensity
            if emotion_scores:
                primary_emotion = max(emotion_scores, key=lambda x: emotion_scores[x]["total_score"])
                primary_data = emotion_scores[primary_emotion]
                
                # Determine intensity level
                intensity_level = "mild"
                if "severe" in primary_data["intensity_breakdown"]:
                    intensity_level = "severe"
                elif "moderate" in primary_data["intensity_breakdown"]:
                    intensity_level = "moderate"
                
                return {
                    "primary_emotion": primary_emotion,
                    "intensity": intensity_level,
                    "confidence": min(primary_data["total_score"] / 10, 1.0),
                    "sentiment_polarity": round(sentiment.polarity, 2),
                    "sentiment_subjectivity": round(sentiment.subjectivity, 2),
                    "all_emotions": emotion_scores
                }
            
            # Fallback to sentiment-based classification
            if sentiment.polarity < -0.3:
                return {
                    "primary_emotion": "negative",
                    "intensity": "moderate" if sentiment.polarity < -0.6 else "mild",
                    "confidence": abs(sentiment.polarity),
                    "sentiment_polarity": round(sentiment.polarity, 2),
                    "sentiment_subjectivity": round(sentiment.subjectivity, 2)
                }
            elif sentiment.polarity > 0.3:
                return {
                    "primary_emotion": "positive",
                    "intensity": "moderate" if sentiment.polarity > 0.6 else "mild",
                    "confidence": sentiment.polarity,
                    "sentiment_polarity": round(sentiment.polarity, 2),
                    "sentiment_subjectivity": round(sentiment.subjectivity, 2)
                }
            else:
                return {
                    "primary_emotion": "neutral",
                    "intensity": "mild",
                    "confidence": 0.5,
                    "sentiment_polarity": round(sentiment.polarity, 2),
                    "sentiment_subjectivity": round(sentiment.subjectivity, 2)
                }
                
        except Exception as e:
            logger.error(f"Error detecting emotional state: {e}")
            return {
                "primary_emotion": "neutral",
                "intensity": "mild",
                "confidence": 0.0,
                "sentiment_polarity": 0.0,
                "sentiment_subjectivity": 0.0
            }
    
    async def suggest_therapeutic_interventions(
        self, 
        patterns: List[Dict[str, Any]], 
        emotional_state: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Suggest therapeutic interventions based on detected patterns and emotions."""
        try:
            interventions = []
            
            # Interventions based on patterns
            for pattern in patterns:
                intervention = {
                    "type": "pattern_based",
                    "target": pattern["name"],
                    "approach": pattern["therapeutic_approach"],
                    "priority": self._get_intervention_priority(pattern),
                    "techniques": self._get_specific_techniques(pattern)
                }
                interventions.append(intervention)
            
            # Interventions based on emotional state
            emotion_intervention = self._get_emotion_intervention(emotional_state)
            if emotion_intervention:
                interventions.append(emotion_intervention)
            
            # Sort by priority
            interventions.sort(key=lambda x: x["priority"], reverse=True)
            
            return interventions[:5]  # Return top 5 interventions
            
        except Exception as e:
            logger.error(f"Error suggesting therapeutic interventions: {e}")
            return []
    
    def _get_intervention_priority(self, pattern: Dict[str, Any]) -> int:
        """Get intervention priority based on pattern severity and confidence."""
        severity_scores = {"low": 1, "moderate": 2, "high": 3}
        severity_score = severity_scores.get(pattern.get("severity", "moderate"), 2)
        confidence_score = pattern["confidence"]
        
        return int(severity_score * confidence_score * 10)
    
    def _get_specific_techniques(self, pattern: Dict[str, Any]) -> List[str]:
        """Get specific therapeutic techniques for a pattern."""
        technique_mapping = {
            "all_or_nothing": [
                "Identify exceptions to absolute statements",
                "Practice using qualifying words (sometimes, often, rarely)",
                "Create a continuum scale for situations"
            ],
            "catastrophizing": [
                "Examine evidence for and against worst-case scenarios",
                "Practice probability estimation",
                "Develop coping strategies for realistic outcomes"
            ],
            "rumination": [
                "Set specific worry time",
                "Practice mindfulness meditation",
                "Use thought stopping techniques"
            ],
            "perfectionism": [
                "Set realistic, achievable goals",
                "Practice self-compassion exercises",
                "Celebrate progress over perfection"
            ]
        }
        
        return technique_mapping.get(pattern["name"], [pattern["therapeutic_approach"]])
    
    def _get_emotion_intervention(self, emotional_state: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get intervention based on emotional state."""
        emotion = emotional_state["primary_emotion"]
        intensity = emotional_state["intensity"]
        
        emotion_interventions = {
            "anxiety": {
                "approach": "Anxiety management and relaxation techniques",
                "techniques": ["Deep breathing exercises", "Progressive muscle relaxation", "Grounding techniques"]
            },
            "depression": {
                "approach": "Behavioral activation and mood enhancement",
                "techniques": ["Activity scheduling", "Mood monitoring", "Social connection building"]
            },
            "anger": {
                "approach": "Anger management and emotional regulation",
                "techniques": ["Anger logs", "Relaxation training", "Communication skills"]
            }
        }
        
        if emotion in emotion_interventions:
            intervention_info = emotion_interventions[emotion]
            priority = 3 if intensity == "severe" else 2 if intensity == "moderate" else 1
            
            return {
                "type": "emotion_based",
                "target": f"{emotion} ({intensity})",
                "approach": intervention_info["approach"],
                "priority": priority * 10,
                "techniques": intervention_info["techniques"]
            }
        
        return None