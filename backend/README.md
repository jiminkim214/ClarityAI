# Clarity AI Therapy Assistant Backend

A comprehensive AI-powered therapy assistant backend built with FastAPI, featuring psychological pattern detection, topic modeling, vector-based retrieval, and LLM-powered therapeutic responses.

## Features

- **Psychological Pattern Detection**: Identifies patterns like projection, avoidance, defensiveness, catastrophizing, and self-blame
- **Topic Modeling**: Uses BERTopic to cluster conversations into meaningful topics
- **Vector-Based Retrieval (RAG)**: ChromaDB for semantic search and contextual response retrieval
- **LLM Integration**: OpenAI GPT-4 for generating therapeutic responses
- **Real-time Chat**: WebSocket support for real-time conversations
- **Session Management**: Persistent conversation history and context
- **Privacy-First**: Data anonymization and secure handling

## Architecture

```
├── src/
│   ├── api/                 # FastAPI routes and endpoints
│   ├── core/                # Configuration and database setup
│   ├── data/                # Dataset processing and cleaning
│   ├── models/              # Database models and Pydantic schemas
│   ├── services/            # Business logic services
│   └── utils/               # Utility functions
├── scripts/                 # Setup and training scripts
├── tests/                   # Test suite
└── requirements.txt         # Python dependencies
```

## Quick Start

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/therapy_ai
OPENAI_API_KEY=your_openai_key_here
CHROMA_PERSIST_DIRECTORY=./data/chroma_db
```

### 3. Database Setup

```bash
# Setup database and load initial data
python3 setup_database.py

# Train models (optional - can be done later)
python3 train_models.py
```

### 4. Run the Server

```bash
# Development server
python3 -m src.main

# Or with uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Core Chat API

- `POST /api/v1/chat` - Send a message and get therapeutic response
- `GET /api/v1/session/{session_id}/history` - Get conversation history
- `WS /api/v1/ws/{session_id}` - WebSocket for real-time chat

### Information Endpoints

- `GET /api/v1/topics` - Get available conversation topics
- `GET /api/v1/health` - Health check
- `GET /api/v1/stats` - Processing statistics

### Management Endpoints

- `DELETE /api/v1/session/{session_id}` - Delete session data
- `POST /api/v1/admin/reindex` - Reindex vector store

## Services Overview

### 1. Dataset Processor (`data/dataset_processor.py`)
- Loads mental health conversation datasets
- Cleans and anonymizes data
- Detects psychological patterns
- Stores processed data in database

### 2. Topic Modeling (`services/topic_modeling.py`)
- Uses BERTopic for conversation clustering
- Identifies conversation topics (anxiety, depression, relationships, etc.)
- Provides topic-based filtering for retrieval

### 3. Vector Store (`services/vector_store.py`)
- ChromaDB integration for semantic search
- Stores conversation embeddings
- Enables similarity-based response retrieval
- Maintains session context and memory

### 4. Pattern Detection (`services/pattern_detection.py`)
- Rule-based psychological pattern detection
- Emotional state analysis
- Text complexity analysis
- Therapeutic approach suggestions

### 5. LLM Service (`services/llm_service.py`)
- OpenAI GPT-4 integration
- RAG-powered prompt construction
- Therapeutic response generation
- Session summarization

### 6. Therapy Service (`services/therapy_service.py`)
- Main orchestration service
- Coordinates all components
- Manages conversation pipeline
- Handles session persistence

## Data Pipeline

1. **Input Processing**: User message received via API/WebSocket
2. **Pattern Detection**: Identify psychological patterns and emotional state
3. **Topic Classification**: Classify message topic using BERTopic
4. **Context Retrieval**: Search vector store for similar responses (RAG)
5. **Response Generation**: Use LLM with retrieved context to generate response
6. **Storage**: Store conversation in database and update vector store

## Model Training

### Initial Setup
```bash
# Load and process dataset
python3 scripts/setup_database.py

# Train topic model
python3 scripts/train_models.py --topic-only

# Populate vector store
python3 scripts/train_models.py --vector-only
```

### Retraining
```bash
# Retrain all models
python3 scripts/train_models.py

# Reset database (WARNING: deletes all data)
python3 scripts/setup_database.py --reset
```

## Configuration

Key configuration options in `src/core/config.py`:

- **Database**: PostgreSQL connection settings
- **Models**: Sentence transformer and BERTopic model paths
- **LLM**: OpenAI API configuration
- **Vector Store**: ChromaDB persistence directory
- **Processing**: Context length, retrieval limits, confidence thresholds

## Security & Privacy

- **Data Anonymization**: Personal identifiers removed during processing
- **Encryption**: Database connections use SSL
- **Session Isolation**: Each session is isolated and can be deleted
- **API Security**: CORS and trusted host middleware
- **No Data Retention**: Sessions can be deleted on demand

## Development

### Running Tests
```bash
pytest tests/
```

### Code Quality
```bash
# Format code
black src/

# Sort imports
isort src/

# Type checking
mypy src/
```

### Adding New Patterns

1. Edit `services/pattern_detection.py`
2. Add pattern definition to `_initialize_patterns()`
3. Include keywords, phrases, and therapeutic approaches
4. Test with sample conversations

### Extending Topic Models

1. Modify `services/topic_modeling.py`
2. Adjust BERTopic parameters in `train_topic_model()`
3. Update topic storage and retrieval logic
4. Retrain model with new data

## Deployment

### Docker (Recommended)
```bash
# Build image
docker build -t clarity-ai-backend .

# Run container
docker run -p 8000:8000 --env-file .env clarity-ai-backend
```

### Production Considerations

- Use PostgreSQL for production database
- Set up Redis for session caching
- Configure proper logging and monitoring
- Use environment-specific configuration
- Set up backup and recovery procedures
- Implement rate limiting and authentication

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL and PostgreSQL service
2. **Model Loading**: Ensure model files exist and paths are correct
3. **OpenAI API**: Verify API key and rate limits
4. **Memory Issues**: Adjust batch sizes for large datasets
5. **Vector Store**: Check ChromaDB persistence directory permissions

### Logs

Logs are written to console and optionally to file (configure in settings):
```bash
# View logs
tail -f logs/app.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run code quality checks
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.