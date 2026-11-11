import argparse
import sys
from pathlib import Path
from typing import Optional
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


def format_price(amount: Optional[int]) -> str:
    if amount is None or amount == 0:
        return "N/A"
    return f"{int(amount):,} đ"


def search_laptops(
    query: str,
    limit: int = 5,
    brand: Optional[str] = None,
    source: Optional[str] = None,
    condition: Optional[str] = None,
    max_price: Optional[int] = None,
    min_price: Optional[int] = None,
    provider: Optional[str] = None,
    collection_name: Optional[str] = None,
):
    col_name = collection_name or config.QDRANT_COLLECTION
    embedder = get_embedder(provider)
    storage = QdrantStorage()

    if not storage.is_healthy():
        print(f"[ERROR] Could not connect to Qdrant at {storage.host}:{storage.port}")
        sys.exit(1)

    # Build filter conditions
    filter_conditions = []
    if brand:
        filter_conditions.append(
            models.FieldCondition(
                key="brand",
                match=models.MatchValue(value=brand),
            )
        )
    if source:
        filter_conditions.append(
            models.FieldCondition(
                key="source",
                match=models.MatchValue(value=source),
            )
        )
    if condition:
        filter_conditions.append(
            models.FieldCondition(
                key="condition",
                match=models.MatchValue(value=condition),
            )
        )
    if min_price is not None or max_price is not None:
        range_args = {}
        if min_price is not None:
            range_args["gte"] = min_price
        if max_price is not None:
            range_args["lte"] = max_price
        filter_conditions.append(
            models.FieldCondition(
                key="price_current",
                range=models.Range(**range_args),
            )
        )

    qdrant_filter = (
        models.Filter(must=filter_conditions) if filter_conditions else None
    )

    print(f"\n[QUERY] '{query}'")
    if filter_conditions:
        print(f"[FILTERS] brand={brand}, source={source}, condition={condition}, min_price={min_price}, max_price={max_price}")
    print(f"[SEARCHING] in collection '{col_name}' using provider '{provider or config.EMBEDDING_PROVIDER}'...\n")

    query_vector = embedder.embed_query(query)
    results = storage.search_similar(
        collection_name=col_name,
        query_vector=query_vector,
        limit=limit,
        filters=qdrant_filter,
    )

    if not results:
        print("Không tìm thấy sản phẩm phù hợp.")
        return

    print(f"Top {len(results)} kết quả tương tự nhất:")
    print("=" * 80)
    for idx, hit in enumerate(results, start=1):
        payload = hit.payload or {}
        name = payload.get("name", "N/A")
        brand_val = payload.get("brand", "N/A")
        source_val = payload.get("source", "N/A")
        price = format_price(payload.get("price_current"))
        cond = payload.get("condition", "new")
        cpu = payload.get("cpu") or "N/A"
        ram = payload.get("ram") or "N/A"
        storage_val = payload.get("storage") or "N/A"
        gpu = payload.get("gpu") or "N/A"
        url = payload.get("url") or ""

        print(f"#{idx} [Score: {hit.score:.4f}] {name}")
        print(f"   Hãng: {brand_val} | Nguồn: {source_val} | Tình trạng: {cond} | Giá: {price}")
        print(f"   CPU: {cpu[:80]}")
        print(f"   RAM: {ram} | Ổ cứng: {storage_val}")
        if gpu != "N/A":
            print(f"   GPU: {gpu[:80]}")
        if url:
            print(f"   Link: {url}")
        print("-" * 80)


def main():
    parser = argparse.ArgumentParser(description="Semantic search for laptops in Qdrant.")
    parser.add_argument("query", type=str, help="Search query (e.g. 'laptop gaming rtx 3050 dưới 25 triệu')")
    parser.add_argument("--limit", "-k", type=int, default=5, help="Number of results (default: 5)")
    parser.add_argument("--brand", type=str, default=None, help="Filter by brand (e.g. Asus, Lenovo, Apple)")
    parser.add_argument("--source", type=str, default=None, help="Filter by retailer (e.g. cellphones, fptshop)")
    parser.add_argument("--condition", type=str, default=None, help="Filter by condition (e.g. new, used)")
    parser.add_argument("--min-price", type=int, default=None, help="Minimum price in VND")
    parser.add_argument("--max-price", type=int, default=None, help="Maximum price in VND")
    parser.add_argument("--provider", "-p", type=str, default=None, choices=["local", "gemini", "openai", "ollama"])
    parser.add_argument("--collection", "-c", type=str, default=None, help="Collection name")

    args = parser.parse_args()
    search_laptops(
        query=args.query,
        limit=args.limit,
        brand=args.brand,
        source=args.source,
        condition=args.condition,
        min_price=args.min_price,
        max_price=args.max_price,
        provider=args.provider,
        collection_name=args.collection,
    )


if __name__ == "__main__":
    main()
