"""Load the crawled catalog into Docker Postgres and search offers."""

from __future__ import annotations

import argparse
import sys

import psycopg

from flow import load_products, open_qdrant_server, search_offers, seed, sync_evidence

DEFAULT_URL = "postgresql://lua:lua@127.0.0.1:54329/lua"
DEFAULT_QDRANT = "http://127.0.0.1:6335"


def load_catalog(database_url: str, qdrant_url: str) -> int:
    products = load_products(None)
    client = open_qdrant_server(qdrant_url)
    with psycopg.connect(database_url) as conn:
        seed(conn, products)
        synced = sync_evidence(conn, client, recreate=True)
    print(f"Loaded {len(products)} crawled listings, synced {synced} draft claims")
    return len(products)


def print_offers(rows: list[dict]) -> None:
    if not rows:
        print("NO_MATCH")
        return
    for row in rows:
        amount = row["amount_vnd"]
        price = f"{amount:,} VND" if amount is not None else "chua co gia niem yet"
        print(
            f"{row['variant_id']} | {row['name']} | {price} | {row['seller']} | "
            f"{row['completeness']} | {row['condition']}"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Explorer search on the Docker catalog")
    parser.add_argument("--database-url", default=DEFAULT_URL)
    parser.add_argument("--qdrant-url", default=DEFAULT_QDRANT)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("load", help="Replace the draft catalog with every crawled laptop")

    search = sub.add_parser("search", help="Keyword and optional price ceiling")
    search.add_argument("text", nargs="?", default="")
    search.add_argument("--max-price", type=int, default=None)
    search.add_argument("--limit", type=int, default=20)

    args = parser.parse_args()
    if args.command == "load":
        load_catalog(args.database_url, args.qdrant_url)
        return 0
    with psycopg.connect(args.database_url) as conn:
        rows = search_offers(conn, args.text, args.max_price, args.limit)
    print_offers(rows)
    return 0


if __name__ == "__main__":
    sys.exit(main())
