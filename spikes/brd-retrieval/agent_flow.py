"""Controlled agent: Postgres filters, Qdrant evidence, then a checked explanation.

Price and eligibility stay in the catalog query. A model may only cite records
the tools returned. Timeout, outage, and invented prices fall back to that list.
"""

from __future__ import annotations

import argparse
import re
from threading import Thread
from typing import Any, Protocol

import psycopg
from qdrant_client import QdrantClient

from flow import (
    open_qdrant_server,
    search_offers,
)
from qdrant_client.models import FieldCondition, Filter, MatchAny

DEFAULT_URL = "postgresql://lua:lua@127.0.0.1:54329/lua"
DEFAULT_QDRANT = "http://127.0.0.1:6335"
EXPLAIN_TIMEOUT_S = 8.0
EVIDENCE_SCORE_FLOOR = 0.25

_PRICE_RE = re.compile(
    r"(?:dưới|duoi|tối đa|toi da|ngân sách|ngan sach|max)\s*"
    r"(\d+(?:[.,]\d+)?)\s*(triệu|trieu|tr|tỷ|ty)?"
    r"|(\d+(?:[.,]\d+)?)\s*(triệu|trieu|tr|tỷ|ty)",
    re.IGNORECASE,
)
_MONEY_RE = re.compile(r"\d{7,}")


class Explainer(Protocol):
    def explain(self, packet: dict[str, Any]) -> dict[str, Any]:
        """Return text plus the variant, evidence, and price ids it used."""


def parse_request(text: str) -> dict[str, Any]:
    match = _PRICE_RE.search(text)
    max_price = None
    keyword = text
    if match:
        number = match.group(1) or match.group(3)
        unit = match.group(2) or match.group(4)
        max_price = _to_vnd(number, unit)
        keyword = (text[: match.start()] + " " + text[match.end() :]).strip()
    return {"text": keyword, "max_price_vnd": max_price}


def _to_vnd(number: str, unit: str | None) -> int:
    value = float(number.replace(",", "."))
    scale = {
        "triệu": 1_000_000,
        "trieu": 1_000_000,
        "tr": 1_000_000,
        "tỷ": 1_000_000_000,
        "ty": 1_000_000_000,
    }.get((unit or "").lower(), 1)
    return int(round(value * scale))


def search_evidence(
    client: QdrantClient,
    text: str,
    variant_ids: list[str],
    limit: int = 5,
) -> list[dict[str, Any]]:
    if not text.strip() or not variant_ids:
        return []
    from embedder.embeddings import LocalHashEmbedder

    embedder = LocalHashEmbedder()
    response = client.query_points(
        collection_name="lua_evidence",
        query=embedder.embed_query(text),
        query_filter=Filter(
            must=[
                FieldCondition(key="variant_id", match=MatchAny(any=variant_ids)),
            ]
        ),
        limit=limit,
        score_threshold=EVIDENCE_SCORE_FLOOR,
    )
    tokens = [token.casefold() for token in re.findall(r"\w{4,}", text)]
    hits = []
    for point in response.points:
        payload = point.payload or {}
        claim = str(payload.get("claim") or "")
        if tokens and not any(token in claim.casefold() for token in tokens):
            continue
        hits.append(
            {
                "evidence_id": payload.get("evidence_id"),
                "variant_id": payload.get("variant_id"),
                "source_label": payload.get("source_label"),
                "claim": claim,
                "score": point.score,
            }
        )
    return hits


def advise(
    conn: psycopg.Connection,
    client: QdrantClient | None,
    request: str,
    explainer: Explainer | None = None,
    timeout_s: float = EXPLAIN_TIMEOUT_S,
    limit: int = 5,
) -> dict[str, Any]:
    parsed = parse_request(request)
    try:
        offers = search_offers(conn, parsed["text"], parsed["max_price_vnd"], limit)
    except Exception as exc:
        return _result(
            mode="unavailable",
            reason="catalog_unavailable",
            request=request,
            parsed=parsed,
            offers=[],
            evidence=[],
            evidence_status="unavailable",
            answer=f"Catalog không trả lời ({type(exc).__name__}). Không bịa sản phẩm thay thế.",
        )
    if not offers:
        return _result(
            mode="no_match",
            reason="no_catalog_match",
            request=request,
            parsed=parsed,
            offers=[],
            evidence=[],
            evidence_status="none",
            answer="Không có biến thể khớp từ khóa và trần giá. Trần giá không coi giá trống là hợp lệ.",
        )

    evidence: list[dict[str, Any]] = []
    evidence_status = "none"
    if client is None:
        evidence_status = "unavailable"
    else:
        try:
            evidence = search_evidence(
                client, parsed["text"] or request, [row["variant_id"] for row in offers]
            )
            evidence_status = "attached" if evidence else "none"
        except Exception:
            evidence_status = "unavailable"

    packet = {"offers": offers, "evidence": evidence, "request": request}
    if explainer is None:
        return _fallback(
            request, parsed, offers, evidence, evidence_status, "provider_unavailable", None
        )
    try:
        output = _call_explainer(explainer, packet, timeout_s)
    except TimeoutError:
        return _fallback(
            request, parsed, offers, evidence, evidence_status, "provider_timeout", None
        )
    except Exception as exc:
        return _fallback(
            request,
            parsed,
            offers,
            evidence,
            evidence_status,
            "provider_error",
            f"{type(exc).__name__}: {exc}",
        )

    rejection = _reject_output(output, offers, evidence)
    if rejection:
        return _fallback(
            request, parsed, offers, evidence, evidence_status, "invalid_output", rejection
        )
    return _result(
        mode="live",
        reason=None,
        request=request,
        parsed=parsed,
        offers=offers,
        evidence=evidence,
        evidence_status=evidence_status,
        answer=str(output.get("text") or "").strip(),
    )


def _call_explainer(explainer: Explainer, packet: dict[str, Any], timeout_s: float) -> dict[str, Any]:
    box: dict[str, Any] = {}

    def run() -> None:
        try:
            box["value"] = explainer.explain(packet)
        except Exception as exc:
            box["error"] = exc

    worker = Thread(target=run, daemon=True)
    worker.start()
    worker.join(timeout_s)
    if worker.is_alive():
        raise TimeoutError(f"explainer exceeded {timeout_s}s")
    if "error" in box:
        raise box["error"]
    value = box.get("value")
    if not isinstance(value, dict):
        raise TypeError("explainer returned a non-object")
    return value


def _reject_output(
    output: dict[str, Any],
    offers: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
) -> str | None:
    allowed_variants = {row["variant_id"] for row in offers}
    allowed_evidence = {row["evidence_id"] for row in evidence}
    allowed_amounts = {row["amount_vnd"] for row in offers if row["amount_vnd"] is not None}
    cited_variants = set(output.get("variant_ids") or [])
    cited_evidence = set(output.get("evidence_ids") or [])
    cited_amounts = set(output.get("amounts_vnd") or [])
    if not cited_variants <= allowed_variants:
        return "variant id không có trong kết quả catalog"
    if not cited_evidence <= allowed_evidence:
        return "evidence id không có trong kết quả hybrid"
    if not cited_amounts <= allowed_amounts:
        return "số tiền không có trong quan sát giá"
    text = str(output.get("text") or "")
    leaked = {int(item) for item in _MONEY_RE.findall(text)} - allowed_amounts
    if leaked:
        return f"câu trả lời chứa số tiền không có trong catalog: {sorted(leaked)}"
    if not text.strip():
        return "câu trả lời rỗng"
    return None


def _fallback(
    request: str,
    parsed: dict[str, Any],
    offers: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
    evidence_status: str,
    reason: str,
    rejected: str | None,
) -> dict[str, Any]:
    return _result(
        mode="fallback",
        reason=reason,
        request=request,
        parsed=parsed,
        offers=offers,
        evidence=evidence,
        evidence_status=evidence_status,
        answer=_fallback_text(offers, evidence, evidence_status, reason),
        rejected_output=rejected,
    )


def _fallback_text(
    offers: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
    evidence_status: str,
    reason: str,
) -> str:
    lines = [
        f"Chế độ dự phòng ({reason}). Danh sách lấy từ catalog, không phải câu của mô hình.",
        "Giá là giá niêm yết, chưa phải tổng đã đối soát.",
    ]
    for offer in offers:
        amount = offer["amount_vnd"]
        price = f"{amount:,} VND" if amount is not None else "chưa có giá"
        lines.append(
            f"- {offer['variant_id']} | {offer['name']} | {price} | {offer['seller']} | {offer['completeness']}"
        )
    if evidence_status == "unavailable":
        lines.append("Kho bằng chứng không trả lời. Không suy ra ưu nhược điểm.")
    elif not evidence:
        lines.append("Không có bằng chứng vector đủ gần với câu tìm.")
    else:
        lines.append("Bằng chứng gắn với biến thể trong danh sách:")
        for item in evidence:
            lines.append(
                f"- {item['evidence_id']} | {item['variant_id']} | {item['source_label']} | {item['claim']}"
            )
    return "\n".join(lines)


def _result(
    *,
    mode: str,
    reason: str | None,
    request: str,
    parsed: dict[str, Any],
    offers: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
    evidence_status: str,
    answer: str,
    rejected_output: str | None = None,
) -> dict[str, Any]:
    return {
        "mode": mode,
        "reason": reason,
        "request": request,
        "keyword": parsed["text"],
        "max_price_vnd": parsed["max_price_vnd"],
        "offers": offers,
        "evidence": evidence,
        "evidence_status": evidence_status,
        "answer": answer,
        "rejected_output": rejected_output,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run one hybrid RAG advice turn")
    parser.add_argument("request")
    parser.add_argument("--database-url", default=DEFAULT_URL)
    parser.add_argument("--qdrant-url", default=DEFAULT_QDRANT)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--live", action="store_true", help="Call the OpenAI-compatible Responses API when XAI_API_KEY is set")
    args = parser.parse_args()
    explainer = None
    if args.live:
        from openai_explainer import OpenAIResponsesExplainer

        explainer = OpenAIResponsesExplainer.from_env()
        if explainer is None:
            print("XAI_API_KEY is unset. Using the catalog fallback.")
    client = open_qdrant_server(args.qdrant_url)
    with psycopg.connect(args.database_url) as conn:
        result = advise(conn, client, args.request, explainer=explainer, limit=args.limit)
    print(f"mode={result['mode']} reason={result['reason']} evidence={result['evidence_status']}")
    print(result["answer"])
    return 0 if result["mode"] in {"fallback", "no_match", "live"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
