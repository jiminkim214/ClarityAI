import asyncio
from src.ml.topic_modeling import AdvancedTopicModeling

async def main():
    modeler = AdvancedTopicModeling()
    await modeler.train_topic_model()

if __name__ == "__main__":
    asyncio.run(main())
