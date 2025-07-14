"""
Complete ML training pipeline for the mental health therapy assistant.
"""

import asyncio
from typing import Optional
from loguru import logger
from .dataset_loader import MentalHealthDatasetLoader
from .embeddings import EmbeddingService
from .topic_modeling import AdvancedTopicModeling
from ..core.database import create_tables


class MLTrainingPipeline:
    """Complete machine learning training pipeline."""
    
    def __init__(self):
        self.dataset_loader = MentalHealthDatasetLoader()
        self.embedding_service = EmbeddingService()
        self.topic_modeling = AdvancedTopicModeling()
    
    async def run_complete_pipeline(
        self, 
        load_dataset: bool = True,
        generate_embeddings: bool = True,
        train_topic_model: bool = True,
        min_topic_size: int = 10
    ) -> None:
        """Run the complete ML training pipeline."""
        try:
            logger.info("Starting complete ML training pipeline")
            
            # Ensure database tables exist
            create_tables()
            logger.info("Database tables ready")
            
            # Step 1: Load and process dataset
            if load_dataset:
                logger.info("Step 1: Loading and processing dataset")
                await self.dataset_loader.load_and_process()
                logger.info("Dataset loading completed")
            
            # Step 2: Generate embeddings
            if generate_embeddings:
                logger.info("Step 2: Generating embeddings")
                await self.embedding_service.generate_all_embeddings()
                logger.info("Embedding generation completed")
            
            # Step 3: Train topic model
            if train_topic_model:
                logger.info("Step 3: Training topic model")
                await self.topic_modeling.train_topic_model(min_topic_size=min_topic_size)
                logger.info("Topic model training completed")
            
            logger.info("Complete ML training pipeline finished successfully")
            
        except Exception as e:
            logger.error(f"Error in ML training pipeline: {e}")
            raise
    
    async def run_dataset_only(self) -> None:
        """Run only dataset loading and processing."""
        try:
            logger.info("Loading and processing dataset only")
            create_tables()
            await self.dataset_loader.load_and_process()
            logger.info("Dataset processing completed")
        except Exception as e:
            logger.error(f"Error in dataset processing: {e}")
            raise
    
    async def run_embeddings_only(self) -> None:
        """Run only embedding generation."""
        try:
            logger.info("Generating embeddings only")
            await self.embedding_service.generate_all_embeddings()
            logger.info("Embedding generation completed")
        except Exception as e:
            logger.error(f"Error in embedding generation: {e}")
            raise
    
    async def run_topic_modeling_only(self, min_topic_size: int = 10) -> None:
        """Run only topic model training."""
        try:
            logger.info("Training topic model only")
            await self.topic_modeling.train_topic_model(min_topic_size=min_topic_size)
            logger.info("Topic model training completed")
        except Exception as e:
            logger.error(f"Error in topic model training: {e}")
            raise
    
    async def update_models(self) -> None:
        """Update existing models with new data."""
        try:
            logger.info("Updating models with new data")
            
            # Generate embeddings for new conversations
            await self.embedding_service.generate_all_embeddings()
            
            # Retrain topic model
            await self.topic_modeling.train_topic_model()
            
            logger.info("Model update completed")
            
        except Exception as e:
            logger.error(f"Error updating models: {e}")
            raise


# CLI interface for running the pipeline
async def main():
    """Main function for CLI usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description="ML Training Pipeline for Mental Health Therapy Assistant")
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
    
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())