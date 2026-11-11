import abc
import hashlib
import math
import re
import sys
from pathlib import Path
from typing import List, Optional
import numpy as np

# Support both package import and direct script execution
_pkg_dir = Path(__file__).resolve().parent
if str(_pkg_dir) not in sys.path:
    sys.path.insert(0, str(_pkg_dir))

try:
    from . import config
except ImportError:
    import config


class BaseEmbedder(abc.ABC):
    """Abstract base class for all embedding generators."""

    def __init__(self, dimension: int):
        self.dimension = dimension

    @abc.abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of document texts."""
        pass

    def embed_query(self, text: str) -> List[float]:
        """Generate embedding for a single search query."""
        res = self.embed_documents([text])
        return res[0]


class LocalHashEmbedder(BaseEmbedder):
    """
    Fast, completely offline, zero-dependency embedding model.
    Uses subword n-gram feature hashing (Murmur/SHA256 based) with L2 normalization.
    Allows instant vector search and similarity matching without requiring API keys or GPU.
    """

    def __init__(self, dimension: int = 384):
        super().__init__(dimension=dimension)

    def _hash_token(self, token: str) -> tuple[int, int]:
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        idx = h % self.dimension
        sign = 1 if ((h >> 32) & 1) == 0 else -1
        return idx, sign

    def _embed_single(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dimension

        vec = np.zeros(self.dimension, dtype=np.float32)
        clean = re.sub(r"[^\w\s-]", " ", text.lower())
        tokens = clean.split()

        features: dict[str, float] = {}
        # Word unigrams and bigrams
        for i, tok in enumerate(tokens):
            features[tok] = features.get(tok, 0.0) + 1.0
            if i + 1 < len(tokens):
                bigram = f"{tok}_{tokens[i+1]}"
                features[bigram] = features.get(bigram, 0.0) + 1.5

            # Character 3-grams for subword / typo robustness
            if len(tok) >= 3:
                for c in range(len(tok) - 2):
                    tri = tok[c : c + 3]
                    features[tri] = features.get(tri, 0.0) + 0.5

        for feat, count in features.items():
            weight = 1.0 + math.log(count)
            idx, sign = self._hash_token(feat)
            vec[idx] += sign * weight

        norm = np.linalg.norm(vec)
        if norm > 1e-9:
            vec = vec / norm
        return vec.tolist()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_single(t) for t in texts]


class GeminiEmbedder(BaseEmbedder):
    """Google Gemini Embedding model (text-embedding-004)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        key = api_key or config.GEMINI_API_KEY
        if not key:
            raise ValueError(
                "GEMINI_API_KEY is not set. Please set it in .env or pass it explicitly."
            )
        try:
            from google import genai
            self.client = genai.Client(api_key=key)
        except ImportError:
            raise ImportError("Please install google-genai: pip install google-genai")

        self.model = model or config.GEMINI_EMBEDDING_MODEL
        # text-embedding-004 defaults to 768 dimensions
        dim = config.VECTOR_DIMENSIONS.get("gemini", 768)
        super().__init__(dimension=dim)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        results = []
        # Process in batches to avoid API limit
        batch_size = 50
        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            resp = self.client.models.embed_content(
                model=self.model,
                contents=chunk,
            )
            # Support both multiple embeddings and single embedding format
            if hasattr(resp, "embeddings") and resp.embeddings:
                for emb in resp.embeddings:
                    values = getattr(emb, "values", emb)
                    results.append(list(values))
            elif hasattr(resp, "embedding") and resp.embedding:
                results.append(list(resp.embedding.values))
        return results


class OpenAIEmbedder(BaseEmbedder):
    """OpenAI Embedding model (text-embedding-3-small)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        key = api_key or config.OPENAI_API_KEY
        if not key:
            raise ValueError(
                "OPENAI_API_KEY is not set. Please set it in .env or pass it explicitly."
            )
        try:
            from openai import OpenAI
            self.client = OpenAI(api_key=key)
        except ImportError:
            raise ImportError("Please install openai: pip install openai")

        self.model = model or config.OPENAI_EMBEDDING_MODEL
        dim = config.VECTOR_DIMENSIONS.get("openai", 1536)
        super().__init__(dimension=dim)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        results = []
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            resp = self.client.embeddings.create(model=self.model, input=chunk)
            for item in resp.data:
                results.append(item.embedding)
        return results


class OllamaEmbedder(BaseEmbedder):
    """Ollama local embedding endpoint (e.g. nomic-embed-text, bge-m3)."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        import requests
        self.requests = requests
        self.base_url = (base_url or config.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or config.OLLAMA_MODEL
        dim = config.VECTOR_DIMENSIONS.get("ollama", 768)
        super().__init__(dimension=dim)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        results = []
        for text in texts:
            resp = self.requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": text},
                timeout=30,
            )
            resp.raise_for_status()
            results.append(resp.json()["embedding"])
        return results


def get_embedder(provider: Optional[str] = None) -> BaseEmbedder:
    """
    Factory function to retrieve the configured embedder.
    Falls back gracefully to 'local' hash embedder if API keys are missing.
    """
    prov = (provider or config.EMBEDDING_PROVIDER).lower()

    if prov == "gemini":
        if config.GEMINI_API_KEY:
            return GeminiEmbedder()
        print("[WARNING] GEMINI_API_KEY not found. Falling back to local offline embedder.")
        return LocalHashEmbedder()

    if prov == "openai":
        if config.OPENAI_API_KEY:
            return OpenAIEmbedder()
        print("[WARNING] OPENAI_API_KEY not found. Falling back to local offline embedder.")
        return LocalHashEmbedder()

    if prov == "ollama":
        return OllamaEmbedder()

    # Default: local offline hash embedder
    return LocalHashEmbedder()
