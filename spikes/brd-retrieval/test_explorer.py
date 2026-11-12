"""U02 checks against the Docker Postgres catalog."""

from __future__ import annotations

import sys

import psycopg

from explorer import DEFAULT_QDRANT, DEFAULT_URL, load_catalog
from flow import search_offers

KNOWN_ID = "7f2f820acd4a84f3"
KNOWN_PRICE = 26_990_000


def check(name: str, ok: bool, detail: str) -> bool:
    print(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    return ok


def main() -> int:
    loaded = load_catalog(DEFAULT_URL, DEFAULT_QDRANT)
    with psycopg.connect(DEFAULT_URL) as conn:
        under = search_offers(conn, "LOQ 83Y9003VVN", KNOWN_PRICE, limit=20)
        over_ceiling = search_offers(conn, "LOQ 83Y9003VVN", KNOWN_PRICE - 1, limit=20)
        no_match = search_offers(conn, "khong-co-sku-nao-het-zz", None, limit=20)
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) FROM price_observations
                WHERE amount_vnd IS NULL
                """
            )
            null_prices = cur.fetchone()[0]
            ceiling_nulls = []
            if null_prices:
                ceiling_nulls = search_offers(conn, "", 10**12, limit=500)

    hit = next((row for row in under if row["variant_id"] == KNOWN_ID), None)
    passed = check("loaded", loaded >= 3, f"products={loaded}")
    passed = check(
        "keyword",
        hit is not None and hit["amount_vnd"] == KNOWN_PRICE and hit["seller"] == "cellphones",
        f"hit={hit}",
    ) and passed
    passed = check(
        "ceiling",
        all(row["variant_id"] != KNOWN_ID for row in over_ceiling),
        f"returned={len(over_ceiling)}",
    ) and passed
    passed = check("no-match", no_match == [], f"returned={len(no_match)}") and passed
    if null_prices:
        leaked = [row for row in ceiling_nulls if row["amount_vnd"] is None]
        passed = check("missing-price", not leaked, f"null_prices={null_prices} leaked={len(leaked)}") and passed
    else:
        print("PASS missing-price: catalog has no null listing prices to exclude")
    print("RESULT PASS" if passed else "RESULT FAIL")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
