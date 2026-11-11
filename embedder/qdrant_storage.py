import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from qdrant_client import QdrantClient, models
from qdrant_client.http.exceptions import UnexpectedResponse

_pkg_dir = Path(__file__).resolve().parent
if str(_pkg_dir) not in sys.path:
    sys.path.insert(0, str(_pkg_dir))

try:
    from . import config
except ImportError:
    import config

logger = logging.getLogger(__name__)


class QdrantStorage:
    """Manages connections, collections, payload indexes, and vector upserts in Qdrant."""

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        api_key: Optional[str] = None,
    ):
        self.host = host or config.QDRANT_HOST
        self.port = port or config.QDRANT_PORT
        self.api_key = api_key or config.QDRANT_API_KEY

        self.client = QdrantClient(
            host=self.host,
            port=self.port,
            api_key=self.api_key,
            timeout=15.0,
        )

    def is_healthy(self) -> bool:
        """Check if Qdrant server is reachable."""
        try:
            self.client.get_collections()
            return True
        except Exception as e:
            logger.error("Healthcheck failed to connect to Qdrant: %s", e)
            return False

    def ensure_collection(
        self,
        collection_name: str,
        vector_size: int,
        distance: models.Distance = models.Distance.COSINE,
        recreate: bool = False,
    ) -> None:
        """
        Ensures the target collection exists.
        If recreate is True, drops existing collection and creates a fresh one.
        """
        collections = [c.name for c in self.client.get_collections().collections]

        if recreate and collection_name in collections:
            logger.info("Recreating collection '%s'...", collection_name)
            self.client.delete_collection(collection_name=collection_name)
            collections.remove(collection_name)

        if collection_name not in collections:
            logger.info(
                "Creating collection '%s' with vector size=%d, distance=%s",
                collection_name,
                vector_size,
                distance.name,
            )
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=vector_size,
                    distance=distance,
                ),
            )
            self._create_payload_indexes(collection_name)
        else:
            # Check existing vector size
            col_info = self.client.get_collection(collection_name=collection_name)
            existing_size = col_info.config.params.vectors.size
            if existing_size != vector_size:
                raise ValueError(
                    f"Collection '{collection_name}' exists with vector size {existing_size}, "
                    f"but current embedder requires size {vector_size}. "
                    f"Run with --recreate to replace the collection."
                )

    def _create_payload_indexes(self, collection_name: str) -> None:
        """Creates payload indexes to speed up filtered searches."""
        index_fields = [
            ("source", models.PayloadSchemaType.KEYWORD),
            ("brand", models.PayloadSchemaType.KEYWORD),
            ("condition", models.PayloadSchemaType.KEYWORD),
            ("availability", models.PayloadSchemaType.KEYWORD),
            ("price_current", models.PayloadSchemaType.INTEGER),
        ]

        for field_name, field_type in index_fields:
            try:
                self.client.create_payload_index(
                    collection_name=collection_name,
                    field_name=field_name,
                    field_schema=field_type,
                )
            except Exception as e:
                logger.warning("Could not create payload index on %s: %s", field_name, e)

    def upsert_points(
        self,
        collection_name: str,
        points: List[models.PointStruct],
        batch_size: int = 64,
    ) -> int:
        """Upsert a batch of points into Qdrant."""
        total = len(points)
        for i in range(0, total, batch_size):
            chunk = points[i : i + batch_size]
            self.client.upsert(
                collection_name=collection_name,
                points=chunk,
                wait=True,
            )
        return total

    def search_similar(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int = 5,
        filters: Optional[models.Filter] = None,
    ) -> List[Any]:
        """Performs vector similarity search."""
        response = self.client.query_points(
            collection_name=collection_name,
            query=query_vector,
            query_filter=filters,
            limit=limit,
            with_payload=True,
        )
        return response.points

    def get_collection_info(self, collection_name: str) -> Dict[str, Any]:
        """Returns metadata and statistics of the specified collection."""
        info = self.client.get_collection(collection_name=collection_name)
        return {
            "name": collection_name,
            "status": info.status,
            "points_count": info.points_count,
            "vector_size": info.config.params.vectors.size,
            "distance": info.config.params.vectors.distance,
        }
