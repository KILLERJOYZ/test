"""PostgreSQL catalog plus Qdrant evidence lookup for the Lựa BRD spike."""

from __future__ import annotations

import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointIdsList, PointStruct, VectorParams

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from embedder.embeddings import LocalHashEmbedder

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
DATA_PATH = ROOT / "data" / "all_laptops_normalized.json"
COLLECTION = "lua_evidence"
NAMESPACE = uuid.UUID("6f0c1a2e-4b7d-4e5a-9c1f-8a2b3c4d5e6f")
DATASET_KIND = "crawled_draft"
PUBLICATION_STATE = "draft"
PERMITTED_USE = "demo_flow_only"
CLAIM_FIELDS = ("cpu", "ram", "storage", "gpu", "screen")


def point_id(evidence_id: str) -> str:
    return str(uuid.uuid5(NAMESPACE, evidence_id))


def load_products(limit: int | None = 3) -> list[dict[str, Any]]:
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    products = payload.get("products") or []
    if limit is None:
        if not products:
            raise RuntimeError(f"No products in {DATA_PATH}")
        return products
    if len(products) < limit:
        raise RuntimeError(f"Need at least {limit} products in {DATA_PATH}")
    return products[:limit]


def apply_schema(conn: psycopg.Connection) -> None:
    script = SCHEMA_PATH.read_text(encoding="utf-8")
    statements = [part.strip() for part in script.split(";") if part.strip()]
    with conn.cursor() as cur:
        for statement in statements:
            cur.execute(statement)
    conn.commit()


def _clear(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM price_observations")
        cur.execute("DELETE FROM evidence")
        cur.execute("DELETE FROM offers")
        cur.execute("DELETE FROM variants")
        cur.execute("DELETE FROM product_families")
        cur.execute("DELETE FROM sellers")
    conn.commit()


def _observed_at(product: dict[str, Any]) -> datetime:
    raw = ((product.get("metadata") or {}).get("crawledAt")) or ""
    if raw:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


def seed(conn: psycopg.Connection, products: list[dict[str, Any]]) -> dict[str, Any]:
    """Load crawled listings as draft families, variants, offers and claims."""
    _clear(conn)
    first_evidence: dict[str, Any] | None = None
    with conn.cursor() as cur:
        for product in products:
            variant_id = str(product["id"])
            brand = (product.get("brand") or "Unknown").strip()
            sku = product.get("sku") or variant_id
            family_id = f"family:{brand.lower()}:{sku}"
            seller_id = str(product.get("source") or "unknown")
            observed = _observed_at(product)
            specs = product.get("specs") or {}
            pricing = product.get("pricing") or {}
            offer_id = f"{variant_id}:{seller_id}"
            cur.execute(
                """
                INSERT INTO product_families (id, brand, name, dataset_kind)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (family_id, brand, product.get("name") or sku, DATASET_KIND),
            )
            cur.execute(
                """
                INSERT INTO sellers (id, name)
                VALUES (%s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (seller_id, seller_id),
            )
            cur.execute(
                """
                INSERT INTO variants (
                    id, family_id, sku, name, source_url, cpu, ram, storage,
                    gpu, screen, os_name, weight, publication_state
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    variant_id,
                    family_id,
                    sku,
                    product.get("name") or sku,
                    product.get("url"),
                    specs.get("cpu"),
                    specs.get("ram"),
                    specs.get("storage"),
                    specs.get("gpu"),
                    specs.get("screen"),
                    specs.get("os"),
                    specs.get("weight"),
                    PUBLICATION_STATE,
                ),
            )
            cur.execute(
                """
                INSERT INTO offers (
                    id, variant_id, seller_id, condition, availability,
                    currency, source_url, dataset_kind
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    offer_id,
                    variant_id,
                    seller_id,
                    product.get("condition") or "unknown",
                    product.get("availability"),
                    pricing.get("currency") or "VND",
                    product.get("url"),
                    DATASET_KIND,
                ),
            )
            cur.execute(
                """
                INSERT INTO price_observations (
                    id, offer_id, amount_vnd, original_vnd, observed_at, completeness
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    f"{offer_id}:{observed.isoformat()}",
                    offer_id,
                    pricing.get("current"),
                    pricing.get("original"),
                    observed,
                    "listing_price_only",
                ),
            )
            for field in CLAIM_FIELDS:
                value = specs.get(field)
                if not value:
                    continue
                evidence_id = f"{variant_id}:{field}"
                claim = f"{field}: {value}"
                source_label = f"{seller_id} listing"
                cur.execute(
                    """
                    INSERT INTO evidence (
                        id, variant_id, source_label, source_url, claim,
                        observed_at, permitted_use, publication_state
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        evidence_id,
                        variant_id,
                        source_label,
                        product.get("url"),
                        claim,
                        observed,
                        PERMITTED_USE,
                        PUBLICATION_STATE,
                    ),
                )
                if first_evidence is None:
                    first_evidence = {
                        "id": evidence_id,
                        "variant_id": variant_id,
                        "source_label": source_label,
                        "claim": claim,
                    }
    conn.commit()
    if first_evidence is None:
        raise RuntimeError("Seed produced no evidence claims")
    return first_evidence


def fetch_evidence(conn: psycopg.Connection) -> list[dict[str, Any]]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT e.id, e.variant_id, v.family_id, e.source_label, e.claim
            FROM evidence e
            JOIN variants v ON v.id = e.variant_id
            ORDER BY e.id
            """
        )
        rows = cur.fetchall()
    return [
        {
            "id": row[0],
            "variant_id": row[1],
            "family_id": row[2],
            "source_label": row[3],
            "claim": row[4],
        }
        for row in rows
    ]


def ensure_collection(client: QdrantClient, recreate: bool) -> None:
    embedder = LocalHashEmbedder()
    names = [item.name for item in client.get_collections().collections]
    if recreate and COLLECTION in names:
        client.delete_collection(COLLECTION)
        names.remove(COLLECTION)
    if COLLECTION not in names:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=embedder.dimension, distance=Distance.COSINE),
        )


def sync_evidence(conn: psycopg.Connection, client: QdrantClient, *, recreate: bool) -> int:
    ensure_collection(client, recreate=recreate)
    embedder = LocalHashEmbedder()
    rows = fetch_evidence(conn)
    live_ids = {point_id(row["id"]) for row in rows}
    if rows:
        vectors = embedder.embed_documents([row["claim"] for row in rows])
        points = [
            PointStruct(
                id=point_id(row["id"]),
                vector=vector,
                payload={
                    "evidence_id": row["id"],
                    "variant_id": row["variant_id"],
                    "product_id": row["family_id"],
                    "source_label": row["source_label"],
                    "claim": row["claim"],
                },
            )
            for row, vector in zip(rows, vectors)
        ]
        client.upsert(collection_name=COLLECTION, points=points)
    existing_ids: list[Any] = []
    offset = None
    while True:
        batch, offset = client.scroll(
            collection_name=COLLECTION,
            limit=256,
            offset=offset,
            with_payload=False,
            with_vectors=False,
        )
        existing_ids.extend(item.id for item in batch)
        if not batch or offset is None:
            break
    stale = [item_id for item_id in existing_ids if str(item_id) not in live_ids]
    if stale:
        client.delete(collection_name=COLLECTION, points_selector=PointIdsList(points=stale))
    return len(rows)


def search(client: QdrantClient, text: str, limit: int = 3) -> list[dict[str, Any]]:
    embedder = LocalHashEmbedder()
    response = client.query_points(
        collection_name=COLLECTION,
        query=embedder.embed_query(text),
        limit=limit,
    )
    hits = []
    for point in response.points:
        payload = point.payload or {}
        hits.append(
            {
                "evidence_id": payload.get("evidence_id"),
                "variant_id": payload.get("variant_id"),
                "source_label": payload.get("source_label"),
                "claim": payload.get("claim"),
                "score": point.score,
            }
        )
    return hits


def update_claim(conn: psycopg.Connection, evidence_id: str, claim: str) -> None:
    with conn.cursor() as cur:
        cur.execute("UPDATE evidence SET claim = %s WHERE id = %s", (claim, evidence_id))
        if cur.rowcount != 1:
            raise RuntimeError(f"Claim update missed {evidence_id}")
    conn.commit()


def delete_evidence(conn: psycopg.Connection, evidence_id: str) -> None:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM evidence WHERE id = %s", (evidence_id,))
        if cur.rowcount != 1:
            raise RuntimeError(f"Evidence delete missed {evidence_id}")
    conn.commit()


def open_qdrant_local(path: Path) -> QdrantClient:
    path.mkdir(parents=True, exist_ok=True)
    return QdrantClient(path=str(path))


def open_qdrant_server(url: str) -> QdrantClient:
    return QdrantClient(url=url, timeout=15)


def _like_token(token: str) -> str:
    escaped = token.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def search_offers(
    conn: psycopg.Connection,
    text: str = "",
    max_price_vnd: int | None = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """U02 catalog search. A ceiling never treats a missing price as a match."""
    conditions: list[str] = []
    params: list[Any] = []
    for token in text.split():
        like = _like_token(token)
        conditions.append(
            """(
                v.name ILIKE %s ESCAPE '\\'
                OR f.brand ILIKE %s ESCAPE '\\'
                OR v.sku ILIKE %s ESCAPE '\\'
                OR COALESCE(v.cpu, '') ILIKE %s ESCAPE '\\'
                OR COALESCE(v.ram, '') ILIKE %s ESCAPE '\\'
                OR COALESCE(v.gpu, '') ILIKE %s ESCAPE '\\'
            )"""
        )
        params.extend([like, like, like, like, like, like])
    if max_price_vnd is not None:
        conditions.append("po.amount_vnd IS NOT NULL AND po.amount_vnd <= %s")
        params.append(max_price_vnd)
    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params.append(limit)
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT v.id, v.name, f.brand, s.name, po.amount_vnd, po.completeness,
                   o.condition, o.availability, o.source_url
            FROM variants v
            JOIN product_families f ON f.id = v.family_id
            JOIN offers o ON o.variant_id = v.id
            JOIN sellers s ON s.id = o.seller_id
            JOIN price_observations po ON po.offer_id = o.id
            {where}
            ORDER BY po.amount_vnd NULLS LAST, v.name
            LIMIT %s
            """,
            params,
        )
        rows = cur.fetchall()
    return [
        {
            "variant_id": row[0],
            "name": row[1],
            "brand": row[2],
            "seller": row[3],
            "amount_vnd": row[4],
            "completeness": row[5],
            "condition": row[6],
            "availability": row[7],
            "source_url": row[8],
        }
        for row in rows
    ]
