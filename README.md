# Mental Health AI Therapy Assistant

A comprehensive AI-powered therapy assistant built with FastAPI backend and React frontend, featuring advanced machine learning capabilities for psychological pattern detection, topic modeling, and personalized therapeutic responses.

## Features

### 🧠 Advanced Machine Learning
- **Dataset Integration**: Uses Amod's "mental_health_counseling_conversations" dataset
- **Psychological Pattern Detection**: ML-enhanced detection of cognitive distortions, defense mechanisms, and emotional patterns
- **Topic Modeling**: BERTopic-based conversation clustering and classification
- **Semantic Search**: Vector-based retrieval using sentence transformers and ChromaDB
- **Embedding Generation**: Automated embedding creation for similarity matching

### 💬 Intelligent Chat Interface
- **Real-time Communication**: WebSocket support for instant responses
- **Contextual Memory**: Session-based conversation history and context retention
- **Psychological Insights**: Real-time pattern analysis and therapeutic suggestions
- **Emotional State Detection**: Multi-level emotional intensity analysis
- **Confidence Scoring**: ML-based confidence metrics for responses

### 🔒 Privacy & Security
- **Data Anonymization**: Automatic removal of personal identifiers
- **Session Isolation**: Individual session management and cleanup
- **Secure Communication**: End-to-end encrypted conversations
- **No Data Retention**: Optional session deletion capabilities

## Architecture

```
├── backend/
│   ├── src/
│   │   ├── api/                 # FastAPI routes and endpoints
│   │   ├── core/                # Configuration and database setup
│   │   ├── ml/                  # Machine learning components
│   │   │   ├── dataset_loader.py    # Amod dataset integration
│   │   │   ├── embeddings.py        # Sentence transformer embeddings
│   │   │   ├── topic_modeling.py    # BERTopic implementation
│   │   │   ├── pattern_detection.py # ML pattern recognition
│   │   │   └── training_pipeline.py # Complete ML pipeline
│   │   ├── models/              # Database and Pydantic models
│   │   ├── services/            # Business logic services
│   │   └── utils/               # Utility functions
│   ├── setup_database.py       # Database initialization
│   ├── train_models.py         # ML model training
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   └── services/           # API communication
│   └── package.json           # Node.js dependencies
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, defaults to SQLite)

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Database Setup**
```bash
python setup_database.py
```

4. **Train ML Models**
```bash
# Complete training pipeline
python train_models.py

# Or train specific components
python train_models.py --dataset-only
python train_models.py --embeddings-only
python train_models.py --topic-only
```

5. **Start Backend Server**
```bash
python -m src.main
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Machine Learning Components

### Dataset Integration
The system uses the Amod "mental_health_counseling_conversations" dataset:
- Automatic loading and preprocessing
- Text cleaning and anonymization
- Conversation pair extraction
- Database storage with metadata

### Pattern Detection
Advanced psychological pattern recognition:
- **Cognitive Distortions**: All-or-nothing thinking, catastrophizing, mind reading
- **Defense Mechanisms**: Denial, projection, rationalization
- **Emotional Patterns**: Rumination, emotional suppression, perfectionism
- **ML Enhancement**: TF-IDF vectorization and similarity matching
- **Severity Assessment**: Automatic severity and confidence scoring

### Topic Modeling
BERTopic-based conversation clustering:
- **UMAP**: Dimensionality reduction for better clustering
- **HDBSCAN**: Hierarchical clustering for topic discovery
- **Custom Vectorization**: Optimized for mental health terminology
- **Topic Prediction**: Real-time topic classification for new messages
- **Semantic Mapping**: Human-readable topic names and descriptions

### Embedding System
Sentence transformer-based embeddings:
- **Batch Processing**: Efficient embedding generation
- **Similarity Search**: Vector-based conversation retrieval
- **Context Matching**: Session-aware similarity scoring
- **ChromaDB Integration**: Persistent vector storage

## API Endpoints

### Core Chat API
- `POST /api/v1/chat` - Send message and get therapeutic response
- `WS /api/v1/ws/{session_id}` - WebSocket for real-time chat
- `GET /api/v1/session/{session_id}/history` - Get conversation history

### ML & Analytics
- `GET /api/v1/topics` - Available conversation topics
- `GET /api/v1/stats` - Processing statistics
- `GET /api/v1/health` - System health check

### Management
- `DELETE /api/v1/session/{session_id}` - Delete session data
- `POST /api/v1/admin/reindex` - Reindex vector store

## Training Pipeline

### Complete Pipeline
```bash
python train_models.py
```

### Individual Components
```bash
# Load and process dataset only
python train_models.py --dataset-only

# Generate embeddings only
python train_models.py --embeddings-only

# Train topic model only
python train_models.py --topic-only

# Update existing models
python train_models.py --update
```

### Configuration Options
- `--min-topic-size`: Minimum cluster size for topic modeling (default: 10)
- `--skip-dataset`: Skip dataset loading
- `--skip-embeddings`: Skip embedding generation
- `--skip-topics`: Skip topic model training

## Configuration

### Backend Configuration (`backend/.env`)
```env
# Database
DATABASE_URL=sqlite:///./therapy_ai.db

# Models
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2
BERTOPIC_MODEL_PATH=./models/bertopic_model

# Vector Database
CHROMA_PERSIST_DIRECTORY=./data/chroma_db

# External APIs
OPENAI_API_KEY=your_openai_key_here

# Processing
MAX_CONTEXT_LENGTH=4000
MAX_RETRIEVED_DOCUMENTS=10
```

### Frontend Configuration
```env
VITE_API_URL=http://localhost:8000
```

## Development

### Running Tests
```bash
cd backend
pytest tests/
```

### Code Quality
```bash
# Format code
black src/

# Type checking
mypy src/
```

### Adding New Patterns
1. Edit `src/ml/pattern_detection.py`
2. Add pattern definition to `_initialize_patterns()`
3. Include keywords, phrases, and therapeutic approaches
4. Retrain models: `python train_models.py --topic-only`

## Deployment

### Production Setup
1. Use PostgreSQL for production database
2. Set up proper environment variables
3. Configure CORS for your domain
4. Set up SSL/TLS certificates
5. Use a process manager (PM2, systemd)

### Docker Deployment
```bash
# Build and run
docker build -t therapy-assistant .
docker run -p 8000:8000 --env-file .env therapy-assistant
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run code quality checks
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Dataset**: Amod's "mental_health_counseling_conversations" from Hugging Face
- **ML Libraries**: BERTopic, sentence-transformers, scikit-learn
- **Inspiration**: Tranquilo project architecture and ML approaches