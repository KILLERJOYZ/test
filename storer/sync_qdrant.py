"""
Module đồng bộ các bản ghi laptop từ PostgreSQL sang Qdrant Vector Database.
Sử dụng các hàm lõi đã có từ package embedder (ingest_records, get_embedder, QdrantStorage).
"""

import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

# Thêm thư mục gốc vào sys.path để import embedder
ROOT_DIR = Path(__file__).resolve().parents[1]
STORER_DIR = Path(__file__).resolve().parent

from dotenv import load_dotenv
load_dotenv(STORER_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from embedder import config as embedder_config
from embedder.ingest import ingest_records

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [sync_qdrant] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sync_qdrant")


def get_db_connection():
    """Tạo kết nối tới PostgreSQL từ biến môi trường."""
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "5432")),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "1"),
        dbname=os.getenv("DB_NAME", "laptop"),
    )


def fetch_unsynced_laptops(conn, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Truy vấn các laptop trong PostgreSQL chưa được đồng bộ sang Qdrant."""
    limit_clause = f"LIMIT {limit}" if limit else ""
    query = f"""
        SELECT 
            id, source, sku, name, brand, model, url, condition, availability,
            price_current, price_original, discount_percent, installment,
            cpu, ram, storage, gpu, screen, battery, weight, os,
            thumbnail, images, categories, rating_average, rating_count,
            crawled_at, embedding_text
        FROM public.laptops
        WHERE synced_to_qdrant = FALSE OR synced_to_qdrant IS NULL
        ORDER BY crawled_at ASC
        {limit_clause};
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query)
        rows = cur.fetchall()

    products = []
    for row in rows:
        # Chuẩn hóa cấu trúc để truyền vào hàm ingest_records của embedder
        p = {
            "id": row["id"],
            "source": row["source"],
            "sku": row["sku"],
            "name": row["name"],
            "brand": row["brand"],
            "model": row["model"],
            "url": row["url"],
            "condition": row["condition"],
            "availability": row["availability"],
            "pricing": {
                "currency": "VND",
                "current": row["price_current"],
                "original": row["price_original"],
                "discountPercent": row["discount_percent"],
                "installment": row["installment"],
            },
            "specs": {
                "cpu": row["cpu"],
                "ram": row["ram"],
                "storage": row["storage"],
                "gpu": row["gpu"],
                "screen": row["screen"],
                "battery": row["battery"],
                "weight": row["weight"],
                "os": row["os"],
            },
            "media": {
                "thumbnail": row["thumbnail"],
                "images": row["images"] if isinstance(row["images"], list) else [],
            },
            "categories": row["categories"] if isinstance(row["categories"], list) else [],
            "rating": {
                "average": row["rating_average"],
                "count": row["rating_count"],
            },
            "metadata": {
                "crawledAt": row["crawled_at"].isoformat() if row["crawled_at"] else None,
            },
        }
        products.append(p)

    return products


def mark_as_synced(conn, product_ids: List[str]):
    """Cập nhật cờ synced_to_qdrant = TRUE cho danh sách ID đã đẩy thành công."""
    if not product_ids:
        return
    query = """
        UPDATE public.laptops
        SET synced_to_qdrant = TRUE,
            qdrant_synced_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ANY(%s);
    """
    with conn.cursor() as cur:
        cur.execute(query, (product_ids,))
    conn.commit()
    logger.info("Đã cập nhật trạng thái synced_to_qdrant cho %d sản phẩm.", len(product_ids))


def sync_postgres_to_qdrant(
    collection_name: Optional[str] = None,
    provider: Optional[str] = None,
    batch_size: int = 64,
    recreate: bool = False,
) -> int:
    """
    Thực hiện lấy các bản ghi chưa sync từ PostgreSQL và đẩy vào Qdrant
    thông qua hàm `ingest_records` của embedder.
    """
    conn = get_db_connection()
    try:
        products = fetch_unsynced_laptops(conn)
        if not products:
            logger.info("Không có bản ghi mới nào cần đồng bộ sang Qdrant.")
            return 0

        logger.info("Tìm thấy %d sản phẩm mới cần sync sang Qdrant...", len(products))

        # Gọi hàm lõi có sẵn trong embedder
        synced_count = ingest_records(
            products=products,
            collection_name=collection_name or embedder_config.QDRANT_COLLECTION,
            provider=provider or embedder_config.EMBEDDING_PROVIDER,
            recreate=recreate,
            batch_size=batch_size,
        )

        if synced_count > 0:
            synced_ids = [p["id"] for p in products[:synced_count]]
            mark_as_synced(conn, synced_ids)

        return synced_count
    finally:
        conn.close()


if __name__ == "__main__":
    count = sync_postgres_to_qdrant()
    print(f"Hoàn thành sync: {count} bản ghi đã đẩy vào Qdrant.")
