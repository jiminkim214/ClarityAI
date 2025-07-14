#!/usr/bin/env python3
"""
Training script for the mental health therapy assistant ML models.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.ml.training_pipeline import MLTrainingPipeline
from loguru import logger


async def main():
    """Main training function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Train ML models for Mental Health Therapy Assistant")
    parser.add_argument("--dataset-only", action="store_true", help="Load dataset only")
    parser.add_argument("--embeddings-only", action="store_true", help="Generate embeddings only")
    parser.add_argument("--topic-only", action="store_true", help="Train topic model only")
    parser.add_argument("--update", action="store_true", help="Update existing models")
    parser.add_argument("--min-topic-size", type=int, default=10, help="Minimum topic size for clustering")
    parser.add_argument("--skip-dataset", action="store_true", help="Skip dataset loading")
    parser.add_argument("--skip-embeddings", action="store_true", help="Skip embedding generation")
    parser.add_argument("--skip-topics", action="store_true", help="Skip topic modeling")
    
    args = parser.parse_args()
    
    pipeline = MLTrainingPipeline()
    
    try:
        logger.info("Starting ML model training")
        
        if args.dataset_only:
            await pipeline.run_dataset_only()
        elif args.embeddings_only:
            await pipeline.run_embeddings_only()
        elif args.topic_only:
            await pipeline.run_topic_modeling_only(args.min_topic_size)
        elif args.update:
            await pipeline.update_models()
        else:
            # Run complete pipeline
            await pipeline.run_complete_pipeline(
                load_dataset=not args.skip_dataset,
                generate_embeddings=not args.skip_embeddings,
                train_topic_model=not args.skip_topics,
                min_topic_size=args.min_topic_size
            )
        
        logger.info("Training completed successfully!")
    
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())