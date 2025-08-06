#!/usr/bin/env bash
# Build script for Render.com
set -o errexit  # exit on error

echo "Python version:"
python --version

echo "Pip version:"
pip --version

echo "Upgrading pip..."
python -m pip install --upgrade pip

echo "Installing requirements..."
python -m pip install -r requirements.txt

echo "Build completed successfully!"
