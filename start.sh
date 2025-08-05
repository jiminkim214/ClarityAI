#!/usr/bin/env bash
# Start script for Render.com
echo "Starting ClarityAI backend on port ${PORT:-8000}..."
python -m uvicorn simple_app:app --host 0.0.0.0 --port ${PORT:-8000}
