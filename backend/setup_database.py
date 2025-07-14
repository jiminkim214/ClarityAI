#!/usr/bin/env python3
"""
Database setup script for the mental health therapy assistant.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.core.database import create_tables, drop_tables
from src.ml.dataset_loader import MentalHealthDatasetLoader
from loguru import logger


async def setup_database():
    """Set up the database with initial data."""
    try:
        logger.info("Setting up database for Mental Health Therapy Assistant")
        
        # Create tables
        logger.info("Creating database tables...")
        create_tables()
        
        # Initialize dataset loader
        loader = MentalHealthDatasetLoader()
        
        # Load and process dataset
        logger.info("Loading and processing mental health dataset...")
        await loader.load_and_process()
        
        logger.info("Database setup completed successfully!")
        
    except Exception as e:
        logger.error(f"Error setting up database: {e}")
        raise


async def reset_database():
    """Reset the database (drop and recreate all tables)."""
    try:
        logger.warning("Resetting database - all data will be lost!")
        
        # Drop all tables
        drop_tables()
        logger.info("Dropped all tables")
        
        # Recreate tables
        create_tables()
        logger.info("Recreated tables")
        
        logger.info("Database reset completed!")
        
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        raise


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database setup for Mental Health Therapy Assistant")
    parser.add_argument(
        "--reset", 
        action="store_true", 
        help="Reset the database (WARNING: This will delete all data)"
    )
    
    args = parser.parse_args()
    
    if args.reset:
        asyncio.run(reset_database())
    else:
        asyncio.run(setup_database())