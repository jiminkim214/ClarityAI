#!/usr/bin/env bash
# Start script for Render.com
uvicorn simple_app:app --host 0.0.0.0 --port $PORT
