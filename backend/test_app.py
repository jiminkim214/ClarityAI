from fastapi import FastAPI
import os

app = FastAPI(title="ClarityAI Test")

@app.get("/")
def read_root():
    return {"message": "ClarityAI Backend is running!", "port": os.getenv("PORT", "8000")}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
