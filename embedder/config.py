import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present in embedder/ or root
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent

load_dotenv(current_dir / ".env")
load_dotenv(root_dir / ".env")

# Qdrant configuration
QDRANT_HOST = os.getenv("QDRANT_HOST", "127.0.0.1")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
QDRANT_GRPC_PORT = int(os.getenv("QDRANT_GRPC_PORT", "6334"))
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", None)
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "laptops")

# Data directory path (defaults to root / data)
DEFAULT_DATA_DIR = Path(os.getenv("DATA_DIR", str(root_dir / "data")))
DEFAULT_INPUT_FILE = DEFAULT_DATA_DIR / "all_laptops_normalized.json"

# Embedding configuration
# Available providers: 'local' (offline hash/tfidf), 'gemini', 'openai', 'ollama'
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local").lower()

# Provider specific models
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "text-embedding-004")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "nomic-embed-text")

# Vector dimensions
VECTOR_DIMENSIONS = {
    "local": 384,
    "gemini": 768,
    "openai": 1536,
    "ollama": 768,
}
