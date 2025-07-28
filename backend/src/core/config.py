from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/therapy_ai"
    redis_url: str = "redis://localhost:6379"
    
    # Supabase Configuration
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_jwt_secret: str
    
    # Vector Database
    chroma_persist_directory: str = "./data/chroma_db"
    
    # Models
    sentence_transformer_model: str = "all-MiniLM-L6-v2"
    bertopic_model_path: str = "./models/bertopic_model"
    llama_model_path: Optional[str] = None
    
    # API Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External APIs
    openai_api_key: Optional[str] = None
    huggingface_token: Optional[str] = None
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/app.log"
    
    # Processing
    max_context_length: int = 4000
    max_retrieved_documents: int = 10
    top_k_responses: int = 3
    
    class Config:
        env_file = ".env"


settings = Settings()