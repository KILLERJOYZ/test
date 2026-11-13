"""
Sync utility connecting dbt transformed data to Qdrant vector database.
Reuses existing functions from embedder (embeddings, qdrant_storage, ingest).
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Union

# Ensure embedder package is on path
_pkg_dir = Path(__file__).resolve().parent
if str(_pkg_dir) not in sys.path:
    sys.path.insert(0, str(_pkg_dir))
if str(_pkg_dir.parent) not in sys.path:
    sys.path.insert(0, str(_pkg_dir.parent))

from embedder import config
from embedder.ingest import ingest_records

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("sync_dbt")


def normalize_dbt_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a flat or semi-structured row from a dbt model table
    into the format expected by embedder (build_embedding_text & build_payload).
    """
    # If already formatted with nested dicts, return as-is
    if "pricing" in row and isinstance(row["pricing"], dict):
        return row

    # Handle flat columns commonly produced by dbt SQL models
    pricing = {
        "current": row.get("price_current") or row.get("price") or row.get("current_price"),
        "original": row.get("price_original") or row.get("original_price"),
        "discountPercent": row.get("discount_percent") or row.get("discountPercent"),
        "installment": row.get("installment"),
    }

    specs = {
        "cpu": row.get("cpu"),
        "ram": row.get("ram"),
        "storage": row.get("storage"),
        "gpu": row.get("gpu"),
        "screen": row.get("screen"),
        "os": row.get("os"),
    }

    media = {
        "thumbnail": row.get("thumbnail") or row.get("image_url"),
        "images": [row.get("thumbnail")] if row.get("thumbnail") else [],
    }

    categories = []
    if row.get("category"):
        categories.append({"name": str(row.get("category"))})
    elif row.get("categories"):
        cat_val = row.get("categories")
        if isinstance(cat_val, str):
            try:
                categories = json.loads(cat_val)
            except Exception:
                categories = [{"name": cat_val}]
        elif isinstance(cat_val, list):
            categories = cat_val

    return {
        "id": row.get("id"),
        "source": row.get("source"),
        "sku": row.get("sku"),
        "name": row.get("name") or row.get("title") or "Laptop",
        "brand": row.get("brand"),
        "model": row.get("model"),
        "url": row.get("url"),
        "condition": row.get("condition", "new"),
        "availability": row.get("availability", "in_stock"),
        "pricing": pricing,
        "specs": specs,
        "media": media,
        "categories": categories,
    }


def sync_records(
    records: Iterable[Dict[str, Any]],
    collection_name: Optional[str] = None,
    provider: Optional[str] = None,
    recreate: bool = False,
    batch_size: int = 64,
) -> int:
    """
    Entry point to sync any in-memory list or stream of records from dbt to Qdrant.
    Can be imported directly into a dbt Python model or custom python script.
    """
    normalized = [normalize_dbt_row(dict(r)) for r in records]
    return ingest_records(
        products=normalized,
        collection_name=collection_name,
        provider=provider,
        recreate=recreate,
        batch_size=batch_size,
    )


def sync_from_duckdb(
    database_path: str,
    table_name: str,
    collection_name: Optional[str] = None,
    provider: Optional[str] = None,
    recreate: bool = False,
) -> int:
    """Read a dbt model table from a DuckDB database file and sync to Qdrant."""
    try:
        import duckdb
    except ImportError:
        raise ImportError("DuckDB not installed. Run: pip install duckdb")

    logger.info("Connecting to DuckDB: %s (table: %s)", database_path, table_name)
    conn = duckdb.connect(database_path, read_only=True)
    df = conn.execute(f"SELECT * FROM {table_name}").df()
    conn.close()

    records = df.to_dict(orient="records")
    return sync_records(
        records=records,
        collection_name=collection_name,
        provider=provider,
        recreate=recreate,
    )


def sync_from_sql(
    connection_url: str,
    query_or_table: str,
    collection_name: Optional[str] = None,
    provider: Optional[str] = None,
    recreate: bool = False,
) -> int:
    """Read a dbt model table from any SQLAlchemy-supported DB (PostgreSQL, MySQL, etc.)."""
    try:
        from sqlalchemy import create_engine, text
    except ImportError:
        raise ImportError("SQLAlchemy not installed. Run: pip install sqlalchemy")

    engine = create_engine(connection_url)
    sql = query_or_table if "SELECT" in query_or_table.upper() else f"SELECT * FROM {query_or_table}"
    
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        keys = result.keys()
        records = [dict(zip(keys, row)) for row in result.fetchall()]

    return sync_records(
        records=records,
        collection_name=collection_name,
        provider=provider,
        recreate=recreate,
    )


def main():
    parser = argparse.ArgumentParser(
        description="Sync transformed dbt tables/data into Qdrant vector database."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--duckdb", type=str, help="Path to DuckDB database file")
    group.add_argument("--sql-url", type=str, help="SQLAlchemy connection URL (e.g. postgresql://user:pass@host/db)")
    group.add_argument("--json", type=str, help="Path to JSON file exported from dbt")

    parser.add_argument(
        "--table",
        type=str,
        default="mart_laptops",
        help="Table or view name produced by dbt (default: mart_laptops)",
    )
    parser.add_argument(
        "--collection",
        "-c",
        type=str,
        default=None,
        help="Target Qdrant collection name (default from config/env)",
    )
    parser.add_argument(
        "--provider",
        "-p",
        type=str,
        default=None,
        choices=["local", "gemini", "openai", "ollama"],
        help="Embedding provider",
    )
    parser.add_argument(
        "--recreate",
        "-r",
        action="store_true",
        help="Drop and recreate the collection before syncing",
    )

    args = parser.parse_args()

    if args.duckdb:
        sync_from_duckdb(
            database_path=args.duckdb,
            table_name=args.table,
            collection_name=args.collection,
            provider=args.provider,
            recreate=args.recreate,
        )
    elif args.sql_url:
        sync_from_sql(
            connection_url=args.sql_url,
            query_or_table=args.table,
            collection_name=args.collection,
            provider=args.provider,
            recreate=args.recreate,
        )
    elif args.json:
        with open(args.json, "r", encoding="utf-8") as f:
            data = json.load(f)
        records = data if isinstance(data, list) else data.get("products", [data])
        sync_records(
            records=records,
            collection_name=args.collection,
            provider=args.provider,
            recreate=args.recreate,
        )


if __name__ == "__main__":
    main()
