import argparse
import json
import logging
import sys
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from qdrant_client import models

_pkg_dir = Path(__file__).resolve().parent
if str(_pkg_dir) not in sys.path:
    sys.path.insert(0, str(_pkg_dir))

try:
    from . import config
    from .embeddings import get_embedder
    from .qdrant_storage import QdrantStorage
except ImportError:
    import config
    from embeddings import get_embedder
    from qdrant_storage import QdrantStorage

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ingest")


def build_embedding_text(product: Dict[str, Any]) -> str:
    """Builds a rich, normalized text representation of a laptop for embedding."""
    name = product.get("name") or "Laptop"
    brand = product.get("brand") or ""
    source = product.get("source") or ""
    condition = product.get("condition") or "new"

    pricing = product.get("pricing") or {}
    price_curr = pricing.get("current")
    if isinstance(price_curr, (int, float)):
        price_str = f"{int(price_curr):,} VND"
    else:
        price_str = "Liên hệ"

    specs = product.get("specs") or {}
    cpu = specs.get("cpu") or ""
    ram = specs.get("ram") or ""
    storage = specs.get("storage") or ""
    gpu = specs.get("gpu") or ""
    screen = specs.get("screen") or ""
    os_sys = specs.get("os") or ""

    categories = [
        c.get("name")
        for c in product.get("categories", [])
        if isinstance(c, dict) and c.get("name")
    ]
    category_str = ", ".join(categories)

    lines = [
        f"Laptop: {name}",
        f"Hãng: {brand} | Nguồn: {source} | Tình trạng: {condition}"
        + (f" | Danh mục: {category_str}" if category_str else ""),
        f"Giá hiện tại: {price_str}",
    ]

    spec_items = []
    if cpu:
        spec_items.append(f"CPU: {cpu}")
    if ram:
        spec_items.append(f"RAM: {ram}")
    if storage:
        spec_items.append(f"Ổ cứng: {storage}")
    if gpu:
        spec_items.append(f"GPU: {gpu}")
    if screen:
        spec_items.append(f"Màn hình: {screen}")
    if os_sys:
        spec_items.append(f"HĐH: {os_sys}")

    if spec_items:
        lines.append("Thông số: " + " | ".join(spec_items))

    return "\n".join(lines)


def build_payload(product: Dict[str, Any], embedding_text: str) -> Dict[str, Any]:
    """Flattens and prepares product metadata for Qdrant payload & filtering."""
    pricing = product.get("pricing") or {}
    specs = product.get("specs") or {}
    rating = product.get("rating") or {}
    media = product.get("media") or {}

    thumbnail = media.get("thumbnail")
    images = media.get("images") or []
    if not thumbnail and images:
        thumbnail = images[0]

    return {
        "id": product.get("id"),
        "source": product.get("source"),
        "sku": product.get("sku"),
        "name": product.get("name"),
        "brand": product.get("brand"),
        "model": product.get("model"),
        "url": product.get("url"),
        "condition": product.get("condition", "new"),
        "availability": product.get("availability", "in_stock"),
        "price_current": pricing.get("current"),
        "price_original": pricing.get("original"),
        "discount_percent": pricing.get("discountPercent"),
        "installment": pricing.get("installment"),
        "cpu": specs.get("cpu"),
        "ram": specs.get("ram"),
        "storage": specs.get("storage"),
        "gpu": specs.get("gpu"),
        "screen": specs.get("screen"),
        "os": specs.get("os"),
        "thumbnail": thumbnail,
        "rating_average": rating.get("average"),
        "rating_count": rating.get("count"),
        "embedding_text": embedding_text,
    }


def load_products_from_file(file_path: Path) -> List[Dict[str, Any]]:
    """Loads products from a single JSON file (handles both single source and combined datasets)."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        if "products" in data and isinstance(data["products"], list):
            return data["products"]
        return [data]
    elif isinstance(data, list):
        return data
    return []


def collect_products(target_path: Path) -> List[Dict[str, Any]]:
    """Loads products from a specific JSON file or from all JSON files in a directory."""
    if not target_path.exists():
        raise FileNotFoundError(f"Path does not exist: {target_path}")

    products = []
    seen_ids = set()

    if target_path.is_file():
        candidates = [target_path]
    else:
        # Check if all_laptops_normalized.json exists in directory; if so, prefer it
        combined_file = target_path / "all_laptops_normalized.json"
        if combined_file.exists():
            candidates = [combined_file]
        else:
            candidates = sorted(list(target_path.glob("*.json")))

    for f in candidates:
        logger.info("Reading products from %s ...", f)
        items = load_products_from_file(f)
        for item in items:
            # Generate unique key for deduplication
            uid = item.get("id") or f"{item.get('source')}_{item.get('sku') or item.get('url')}"
            if uid and uid not in seen_ids:
                seen_ids.add(uid)
                products.append(item)

    logger.info("Total unique products loaded: %d", len(products))
    return products


def ingest_to_qdrant(
    data_path: Optional[str] = None,
    collection_name: Optional[str] = None,
    provider: Optional[str] = None,
    recreate: bool = False,
    batch_size: int = 64,
) -> None:
    """Ingests laptops from JSON into Qdrant collection."""
    path = Path(data_path) if data_path else config.DEFAULT_INPUT_FILE
    if not path.exists():
        # Fall back to data directory if single file doesn't exist
        path = config.DEFAULT_DATA_DIR

    col_name = collection_name or config.QDRANT_COLLECTION

    logger.info("==================================================")
    logger.info(" Qdrant Laptop Vector Ingestion")
    logger.info(" Input Data Path  : %s", path)
    logger.info(" Target Collection: %s", col_name)
    logger.info(" Recreate Coll.   : %s", recreate)
    logger.info(" Embedding Model  : %s", provider or config.EMBEDDING_PROVIDER)
    logger.info("==================================================")

    # 1. Initialize embedder
    embedder = get_embedder(provider)
    logger.info("Embedder initialized with vector dimension: %d", embedder.dimension)

    # 2. Initialize Qdrant storage
    storage = QdrantStorage()
    if not storage.is_healthy():
        logger.error(
            "Could not connect to Qdrant at %s:%d. Please check your Qdrant container.",
            storage.host,
            storage.port,
        )
        return

    # 3. Ensure collection exists with matching vector dimension
    storage.ensure_collection(
        collection_name=col_name,
        vector_size=embedder.dimension,
        recreate=recreate,
    )

    # 4. Load products
    products = collect_products(path)
    if not products:
        logger.warning("No products found to ingest.")
        return

    # 5. Build texts & prepare points
    logger.info("Generating embeddings and constructing points...")
    start_time = time.time()

    all_points: List[models.PointStruct] = []
    texts_to_embed = []
    meta_list = []

    for item in products:
        emb_text = build_embedding_text(item)
        payload = build_payload(item, emb_text)

        # Deterministic UUID for Qdrant point
        point_id_str = f"{item.get('source', '')}_{item.get('id') or item.get('sku') or item.get('url') or item.get('name')}"
        point_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, point_id_str))

        texts_to_embed.append(emb_text)
        meta_list.append((point_uuid, payload))

    # Generate embeddings in chunks
    for i in range(0, len(texts_to_embed), batch_size):
        chunk_texts = texts_to_embed[i : i + batch_size]
        chunk_meta = meta_list[i : i + batch_size]

        logger.info(
            "Embedding batch %d-%d of %d products...",
            i + 1,
            min(i + batch_size, len(texts_to_embed)),
            len(texts_to_embed),
        )
        vectors = embedder.embed_documents(chunk_texts)

        for (pt_uuid, payload), vec in zip(chunk_meta, vectors):
            all_points.append(
                models.PointStruct(
                    id=pt_uuid,
                    vector=vec,
                    payload=payload,
                )
            )

    # 6. Upsert points into Qdrant
    logger.info("Upserting %d points into collection '%s'...", len(all_points), col_name)
    storage.upsert_points(col_name, all_points, batch_size=batch_size)

    elapsed = time.time() - start_time
    info = storage.get_collection_info(col_name)

    logger.info("==================================================")
    logger.info(" Ingestion Complete Successfully!")
    logger.info(" Total Points Upserted: %d", len(all_points))
    logger.info(" Collection Points Now: %s", info["points_count"])
    logger.info(" Elapsed Time         : %.2fs", elapsed)
    logger.info("==================================================")


def main():
    parser = argparse.ArgumentParser(description="Ingest laptop JSON data into Qdrant vector database.")
    parser.add_argument(
        "--data-path",
        "-d",
        type=str,
        default=None,
        help="Path to JSON file or folder containing JSON files (default: ../data/all_laptops_normalized.json)",
    )
    parser.add_argument(
        "--collection",
        "-c",
        type=str,
        default=None,
        help="Qdrant collection name (default: laptops)",
    )
    parser.add_argument(
        "--provider",
        "-p",
        type=str,
        default=None,
        choices=["local", "gemini", "openai", "ollama"],
        help="Embedding provider (local, gemini, openai, ollama)",
    )
    parser.add_argument(
        "--recreate",
        "-r",
        action="store_true",
        help="Drop and recreate the collection before ingesting",
    )
    parser.add_argument(
        "--batch-size",
        "-b",
        type=int,
        default=64,
        help="Batch size for embedding and upserting (default: 64)",
    )

    args = parser.parse_args()
    ingest_to_qdrant(
        data_path=args.data_path,
        collection_name=args.collection,
        provider=args.provider,
        recreate=args.recreate,
        batch_size=args.batch_size,
    )


if __name__ == "__main__":
    main()
