"""Hybrid RAG agent and its fallback gates, against the Docker catalog."""

from __future__ import annotations

import sys
import time

import psycopg

from agent_flow import advise
from explorer import DEFAULT_QDRANT, DEFAULT_URL, load_catalog
from flow import open_qdrant_server

KNOWN_ID = "7f2f820acd4a84f3"
KNOWN_PRICE = 26_990_000


def check(name: str, ok: bool, detail: str) -> bool:
    print(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")
    return ok


class Grounded:
    def explain(self, packet: dict) -> dict:
        offer = packet["offers"][0]
        evidence = packet["evidence"][0]
        return {
            "text": (
                f"{offer['name']} đang niêm yết {offer['amount_vnd']} VND. "
                f"Trang bán ghi: {evidence['claim']}"
            ),
            "variant_ids": [offer["variant_id"]],
            "evidence_ids": [evidence["evidence_id"]],
            "amounts_vnd": [offer["amount_vnd"]],
        }


class InventedVariant:
    def explain(self, packet: dict) -> dict:
        return {
            "text": "Một mẫu khác rẻ hơn.",
            "variant_ids": ["not-in-catalog"],
            "evidence_ids": [],
            "amounts_vnd": [],
        }


class InventedPrice:
    def explain(self, packet: dict) -> dict:
        offer = packet["offers"][0]
        return {
            "text": "Giá chốt là 99999999 VND.",
            "variant_ids": [offer["variant_id"]],
            "evidence_ids": [],
            "amounts_vnd": [],
        }


class Broken:
    def explain(self, packet: dict) -> dict:
        raise RuntimeError("provider down")


class Slow:
    def explain(self, packet: dict) -> dict:
        time.sleep(1)
        return {"text": "too late", "variant_ids": [], "evidence_ids": [], "amounts_vnd": []}


class DeadEvidence:
    def query_points(self, **kwargs):
        raise ConnectionError("qdrant down")


def main() -> int:
    loaded = load_catalog(DEFAULT_URL, DEFAULT_QDRANT)
    client = open_qdrant_server(DEFAULT_QDRANT)
    request = "Intel Core 5 205H dưới 30 triệu"
    passed = check("loaded", loaded == 70, f"products={loaded}")
    with psycopg.connect(DEFAULT_URL) as conn:
        hybrid = advise(conn, client, request, explainer=None)
        live = advise(conn, client, request, explainer=Grounded())
        bad_variant = advise(conn, client, request, explainer=InventedVariant())
        bad_price = advise(conn, client, request, explainer=InventedPrice())
        errored = advise(conn, client, request, explainer=Broken())
        timed_out = advise(conn, client, request, explainer=Slow(), timeout_s=0.2)
        evidence_down = advise(conn, DeadEvidence(), request, explainer=None)
        nothing = advise(conn, client, "khong-co-sku-nao-het-zz dưới 30 triệu")
        over_budget = advise(conn, client, "LOQ 83Y9003VVN dưới 20 triệu")

    offer_ids = {row["variant_id"] for row in hybrid["offers"]}
    evidence_ids = {row["variant_id"] for row in hybrid["evidence"]}
    passed = check(
        "hybrid",
        hybrid["mode"] == "fallback"
        and hybrid["reason"] == "provider_unavailable"
        and KNOWN_ID in offer_ids
        and KNOWN_ID in evidence_ids
        and hybrid["max_price_vnd"] == 30_000_000
        and any("205H" in row["claim"] for row in hybrid["evidence"]),
        f"offers={len(hybrid['offers'])} evidence={len(hybrid['evidence'])}",
    ) and passed
    passed = check(
        "live",
        live["mode"] == "live" and str(KNOWN_PRICE) in live["answer"],
        live["mode"],
    ) and passed
    passed = check(
        "reject-variant",
        bad_variant["mode"] == "fallback"
        and bad_variant["reason"] == "invalid_output"
        and KNOWN_ID in {row["variant_id"] for row in bad_variant["offers"]},
        bad_variant["rejected_output"],
    ) and passed
    passed = check(
        "reject-price",
        bad_price["mode"] == "fallback" and "99999999" not in bad_price["answer"],
        bad_price["rejected_output"],
    ) and passed
    passed = check("provider-error", errored["reason"] == "provider_error", errored["reason"]) and passed
    passed = check("timeout", timed_out["reason"] == "provider_timeout", timed_out["reason"]) and passed
    passed = check(
        "evidence-down",
        evidence_down["reason"] == "provider_unavailable"
        and evidence_down["evidence_status"] == "unavailable"
        and evidence_down["offers"]
        and evidence_down["evidence"] == [],
        evidence_down["evidence_status"],
    ) and passed
    passed = check("no-match", nothing["mode"] == "no_match" and nothing["offers"] == [], nothing["mode"]) and passed
    passed = check(
        "ceiling",
        all(row["variant_id"] != KNOWN_ID for row in over_budget["offers"]),
        f"mode={over_budget['mode']} n={len(over_budget['offers'])}",
    ) and passed
    print("RESULT PASS" if passed else "RESULT FAIL")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
