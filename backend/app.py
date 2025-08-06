from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ClarityAI Backend", 
    description="AI-powered therapy assistant",
    version="1.0.0"
)

# CORS configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://clarity-r2f5o6m8k-jiminkim214-3886s-projects.vercel.app",
    "*"  # Allow all origins for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info("ClarityAI Backend starting up...")
    logger.info(f"PORT environment variable: {os.getenv('PORT', 'Not set')}")

@app.get("/")
def root():
    port = os.getenv("PORT", "8000")
    logger.info(f"Root endpoint called, PORT: {port}")
    return {
        "message": "ClarityAI Backend is running!",
        "status": "healthy",
        "version": "1.0.0",
        "port": port,
        "env_port": os.environ.get("PORT", "not_set")
    }

@app.get("/health")
def health():
    logger.info("Health check called")
    return {"status": "healthy", "service": "clarityai-backend"}

@app.get("/api/v1/chat")
def chat_placeholder():
    return {
        "message": "Chat endpoint available",
        "note": "Full ML functionality will be added after basic deployment works"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
