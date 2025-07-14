from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from loguru import logger

from .core.config import settings
from .core.database import create_tables
from .api.routes import router
from .ml.pattern_detection import MLPatternDetection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting Clarity AI Therapy Assistant Backend")
    
    # Create database tables
    create_tables()
    logger.info("Database tables created")
    
    # Initialize pattern detection service
    pattern_service = MLPatternDetection()
    logger.info("Pattern detection service initialized")
    
    # Note: To load dataset and train models, run:
    # python setup_database.py
    # python train_models.py
    logger.info("To initialize with dataset, run: python setup_database.py && python train_models.py")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Clarity AI Backend")


# Create FastAPI application
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
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)

# Include API routes
app.include_router(router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Clarity AI Therapy Assistant Backend",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.log_level.lower()
    )