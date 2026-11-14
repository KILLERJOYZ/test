import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
STORER_DIR = ROOT_DIR / "storer"

# Load environment files
load_dotenv(STORER_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_SCHEMA = os.getenv("DB_SCHEMA", "public")

API_HOST = os.getenv("ADVISER_HOST", "127.0.0.1")
API_PORT = int(os.getenv("ADVISER_PORT", "8788"))
API_TOKEN = os.getenv("ADVISER_TOKEN", "")
DEMO_INSECURE_NO_AUTH = os.getenv("DEMO_INSECURE_NO_AUTH", "") == "1"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

AI_MAX_REQUESTS = int(os.getenv("AI_MAX_REQUESTS", "500"))
AI_MAX_VND = int(os.getenv("AI_MAX_VND", "500000"))
AI_RESERVE_PER_REQUEST_VND = int(os.getenv("AI_RESERVE_PER_REQUEST_VND", "500"))
ADVISER_SIGNING_PASSPHRASE = os.getenv("ADVISER_SIGNING_PASSPHRASE", "")
