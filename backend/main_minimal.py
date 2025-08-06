from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from loguru import logger
import os
from typing import List

# Basic settings without pydantic for minimal deployment
class BasicSettings:
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://clarity-r2f5o6m8k-jiminkim214-3886s-projects.vercel.app"
    ]

settings = BasicSettings()

# Try to import from src modules, but don't fail if they're not available
ML_AVAILABLE = False
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
    from core.config import settings as real_settings
    from core.database import create_tables
    from api.routes import router
    from ml.pattern_detection import MLPatternDetection
    ML_AVAILABLE = True
    settings = real_settings
    logger.info("Full ML modules loaded successfully")
except Exception as e:
    logger.warning(f"ML dependencies not available, using minimal mode: {e}")
    # Create minimal router for basic functionality
    router = APIRouter()
    
    @router.get("/health")
    def health_check():
        return {"status": "healthy", "ml_available": False}
    
    @router.get("/")
    def read_root():
        return {"message": "ClarityAI Backend is running in minimal mode!", "ml_available": False}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Clarity AI Therapy Assistant Backend")
    
    if ML_AVAILABLE:
        try:
            # Create database tables
            create_tables()
            logger.info("Database tables created")
            
            # Initialize pattern detection service
            pattern_service = MLPatternDetection()
            logger.info("Pattern detection service initialized")
        except Exception as e:
            logger.error(f"Error initializing ML services: {e}")
    
    logger.info(f"Backend started successfully (ML Available: {ML_AVAILABLE})")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Clarity AI Backend")


# Create FastAPI app
app = FastAPI(
    title="Clarity AI Therapy Assistant",
    description="AI-powered therapy assistant with psychological insights and RAG-based responses",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure this properly in production
)

# Include API routes
app.include_router(router, prefix="/api/v1")

# Root endpoint for health check
@app.get("/")
def read_root():
    return {
        "message": "Clarity AI Therapy Assistant Backend", 
        "status": "running",
        "ml_available": ML_AVAILABLE,
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "ml_available": ML_AVAILABLE,
        "port": os.getenv("PORT", "8000")
    }

# Set environment variables for ML libraries
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["ANONYMIZED_TELEMETRY"] = "false"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
