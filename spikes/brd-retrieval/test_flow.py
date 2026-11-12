"""Run the draft PostgreSQL -> Qdrant evidence flow and print PASS/FAIL."""

from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
from pathlib import Path

import psycopg

from flow import (
    apply_schema,
    delete_evidence,
    load_products,
    open_qdrant_local,
    open_qdrant_server,
    point_id,
    search,
    seed,
    sync_evidence,
    update_claim,
)

UPDATED_CLAIM = "brd-spike-token-alpha-7741 RAM lap co dinh khong nang cap"
HERE = Path(__file__).resolve().parent


def check(name: str, ok: bool, detail: str) -> bool:
    print(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    return ok


def run(conn: psycopg.Connection, client, qdrant_label: str) -> int:
    print(f"Qdrant mode: {qdrant_label}")
    products = load_products(3)
    apply_schema(conn)
    first = seed(conn, products)
    synced = sync_evidence(conn, client, recreate=True)
    print(f"Seeded 3 crawled listings, synced {synced} draft claims")

    found = search(client, first["claim"], limit=1)
    top = found[0] if found else {}
    ok_query = (
        top.get("evidence_id") == first["id"]
        and top.get("variant_id") == first["variant_id"]
        and top.get("source_label") == first["source_label"]
    )
    passed = check(
        "query",
        ok_query,
        f"variant={top.get('variant_id')} source={top.get('source_label')} claim={top.get('claim')}",
    )

    update_claim(conn, first["id"], UPDATED_CLAIM)
    sync_evidence(conn, client, recreate=False)
    updated = search(client, UPDATED_CLAIM, limit=1)
    updated_top = updated[0] if updated else {}
    ok_update = (
        updated_top.get("evidence_id") == first["id"]
        and updated_top.get("claim") == UPDATED_CLAIM
        and updated_top.get("variant_id") == first["variant_id"]
    )
    passed = check(
        "update",
        ok_update,
        f"claim={updated_top.get('claim')}",
    ) and passed

    delete_evidence(conn, first["id"])
    sync_evidence(conn, client, recreate=False)
    leftover = client.retrieve(collection_name="lua_evidence", ids=[point_id(first["id"])])
    after_delete = search(client, UPDATED_CLAIM, limit=3)
    still_there = any(hit.get("evidence_id") == first["id"] for hit in after_delete)
    ok_delete = len(leftover) == 0 and not still_there
    passed = check(
        "delete",
        ok_delete,
        f"stored_points={len(leftover)} query_still_has_id={still_there}",
    ) and passed

    print("RESULT PASS" if passed else "RESULT FAIL")
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Test the BRD Postgres + Qdrant spike")
    parser.add_argument(
        "--docker",
        action="store_true",
        help="Use compose services instead of embedded Postgres and local Qdrant",
    )
    parser.add_argument(
        "--database-url",
        default="postgresql://lua:lua@127.0.0.1:54329/lua",
    )
    parser.add_argument("--qdrant-url", default="http://127.0.0.1:6335")
    args = parser.parse_args()

    if args.docker:
        client = open_qdrant_server(args.qdrant_url)
        with psycopg.connect(args.database_url) as conn:
            return run(conn, client, args.qdrant_url)

    import pgserver

    pg_dir = Path(tempfile.mkdtemp(prefix="lua-brd-pg-"))
    qdrant_dir = HERE / ".local" / "qdrant"
    if qdrant_dir.exists():
        shutil.rmtree(qdrant_dir)
    server = pgserver.get_server(str(pg_dir), cleanup_mode="stop")
    try:
        client = open_qdrant_local(qdrant_dir)
        with psycopg.connect(server.get_uri()) as conn:
            return run(conn, client, f"local:{qdrant_dir}")
    finally:
        server.cleanup()
        shutil.rmtree(pg_dir, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
