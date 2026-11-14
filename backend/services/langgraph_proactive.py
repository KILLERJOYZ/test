"""STT 3.0 — Proactive Browsing Copilot built on LangGraph StateGraph.

Topology:
detect_signals -> ground_evidence -> format_nudge
"""
from collections import Counter
import json
import re
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import END, START, StateGraph

from backend.schemas import (
    CatalogModel,
    ListingModel,
    ProactiveRequest,
    ProactiveResponse,
)
from backend.services.advice_service import compute_listing_evidence, format_vnd
from backend.services.ai_gateway import call_chatgpt_json, is_online_ai_available
from backend.services.catalog_service import assess_listing, build_catalog_snapshot


class ProactiveState(TypedDict, total=False):
    request: ProactiveRequest
    catalog: CatalogModel
    by_id: Dict[str, ListingModel]
    triggered: bool
    signal_type: Optional[str]
    suggested_action: Optional[str]
    cited_ids: List[str]
    raw_reason: Dict[str, Any]
    grounded_facts: List[Dict[str, Any]]
    headline: str
    detail: str
    mode: str


def _cpu_tier_signature(cpu: Optional[str]) -> str:
    if not cpu:
        return "unknown"
    s = cpu.lower()
    for pat in (
        r"core\s*ultra\s*[579]",
        r"core\s*i[3579]",
        r"core\s*[3579]",
        r"ryzen\s*[3579]",
        r"apple\s*m[1234](?:\s*(?:pro|max))?",
        r"\bm[1234]\b",
        r"snapdragon\s*x",
    ):
        m = re.search(pat, s)
        if m:
            return re.sub(r"\s+", "-", m.group(0).strip())
    return s[:20].strip()


def _resolve_listing(by_id: Dict[str, ListingModel], raw_id: Optional[str]) -> Optional[ListingModel]:
    if not raw_id:
        return None
    if raw_id in by_id:
        return by_id[raw_id]
    clean = raw_id.split(":", 1)[-1]
    for k, v in by_id.items():
        if k.split(":", 1)[-1] == clean:
            return v
    return None


def _find_cheaper_same_spec_sibling(
    target: ListingModel,
    listings: List[ListingModel],
) -> Optional[ListingModel]:
    if target.advertisedPrice is None or target.ram is None or target.storage is None:
        return None
    target_cpu = _cpu_tier_signature(target.cpu)
    candidates: List[ListingModel] = []
    for item in listings:
        if item.id == target.id or item.advertisedPrice is None or item.advertisedPrice <= 0:
            continue
        if item.ram == target.ram and item.storage == target.storage:
            if target_cpu != "unknown" and _cpu_tier_signature(item.cpu) == target_cpu:
                if target.advertisedPrice > item.advertisedPrice * 1.15:
                    candidates.append(item)
    candidates.sort(key=lambda x: (x.advertisedPrice or 999_999_999, x.id))
    return candidates[0] if candidates else None


def _detect_signals_node(state: ProactiveState) -> Dict[str, Any]:
    req = state["request"]
    catalog = build_catalog_snapshot()
    by_id = {v.id: v for v in catalog.listings}
    current = _resolve_listing(by_id, req.currentListingId)
    r = req.requirements

    # 1. Check better_value_alternative when viewing an over-budget SKU
    if current is not None and current.advertisedPrice is not None and current.advertisedPrice > r.budget:
        eff_ram = max(r.minRam, 8)
        eff_storage = max(r.minStorage, 256)
        in_budget = [
            v
            for v in catalog.listings
            if v.id != current.id
            and v.advertisedPrice is not None
            and v.advertisedPrice <= r.budget
            and assess_listing(v, r)["state"] != "excluded"
            and len(compute_listing_evidence(v)["conflicts"]) == 0
            and (v.ram is not None and v.ram >= eff_ram)
            and (v.storage is not None and v.storage >= eff_storage)
        ]
        in_budget.sort(
            key=lambda v: (
                -(v.ram or 0),
                -(v.storage or 0),
                v.advertisedPrice or 999_999_999,
                v.id,
            )
        )
        if in_budget:
            best = in_budget[0]
            saved_vnd = current.advertisedPrice - (best.advertisedPrice or 0)
            return {
                "catalog": catalog,
                "by_id": by_id,
                "triggered": True,
                "signal_type": "better_value_alternative",
                "suggested_action": "open_listing",
                "cited_ids": [current.id, best.id],
                "raw_reason": {
                    "kind": "over_budget_alternative",
                    "currentName": current.name,
                    "currentPrice": current.advertisedPrice,
                    "budget": r.budget,
                    "altName": best.name,
                    "altPrice": best.advertisedPrice,
                    "altRam": best.ram,
                    "altStorage": best.storage,
                    "savedVnd": saved_vnd,
                },
            }

    # 2. Check blind_spot on current listing
    if current is not None:
        screen_lower = (current.screen or "").lower()
        name_lower = (current.name or "").lower()

        # 2a. TN or 45% NTSC display on Thiết kế
        if "Thiết kế" in r.tasks and (
            re.search(r"\btn\b", screen_lower)
            or "45% ntsc" in screen_lower
            or "45%ntsc" in screen_lower
        ):
            return {
                "catalog": catalog,
                "by_id": by_id,
                "triggered": True,
                "signal_type": "blind_spot",
                "suggested_action": "adjust_needs",
                "cited_ids": [current.id],
                "raw_reason": {
                    "kind": "screen_color_blind_spot",
                    "currentName": current.name,
                    "screen": current.screen,
                },
            }

        # 2b. Soldered / 8GB RAM on Lập trình / Máy ảo / Thiết kế
        heavy_tasks = [t for t in r.tasks if t in ("Lập trình", "Máy ảo", "Thiết kế")]
        soldered_low_ram = (
            any(k in name_lower for k in ("onboard", "lpddr", "soldered", "hàn chết"))
            and (current.ram is not None and current.ram <= 8)
        )
        ram_bottleneck = heavy_tasks and (
            (current.ram is not None and current.ram <= 8)
            or ("Máy ảo" in heavy_tasks and current.ram is not None and current.ram < 16)
            or soldered_low_ram
        )
        if ram_bottleneck:
            target_ram = 32 if "Máy ảo" in heavy_tasks else 16
            upgrade_alts = [
                v
                for v in catalog.listings
                if v.id != current.id
                and v.advertisedPrice is not None
                and v.advertisedPrice <= r.budget
                and (v.ram or 0) >= target_ram
                and len(compute_listing_evidence(v)["conflicts"]) == 0
            ]
            upgrade_alts.sort(key=lambda v: (v.advertisedPrice or 999_999_999, v.id))
            cited = [current.id] + ([upgrade_alts[0].id] if upgrade_alts else [])
            return {
                "catalog": catalog,
                "by_id": by_id,
                "triggered": True,
                "signal_type": "blind_spot",
                "suggested_action": "compare" if len(cited) > 1 else "adjust_needs",
                "cited_ids": cited,
                "raw_reason": {
                    "kind": "ram_blind_spot",
                    "currentName": current.name,
                    "currentRam": current.ram,
                    "tasks": heavy_tasks,
                    "altName": upgrade_alts[0].name if upgrade_alts else None,
                    "altPrice": upgrade_alts[0].advertisedPrice if upgrade_alts else None,
                    "altRam": upgrade_alts[0].ram if upgrade_alts else None,
                },
            }

        # 2c. Price > 15% above same-spec sibling in catalog
        cheaper_sib = _find_cheaper_same_spec_sibling(current, catalog.listings)
        if cheaper_sib is not None and cheaper_sib.advertisedPrice and current.advertisedPrice:
            pct = round(((current.advertisedPrice - cheaper_sib.advertisedPrice) / cheaper_sib.advertisedPrice) * 100)
            return {
                "catalog": catalog,
                "by_id": by_id,
                "triggered": True,
                "signal_type": "blind_spot",
                "suggested_action": "compare",
                "cited_ids": [current.id, cheaper_sib.id],
                "raw_reason": {
                    "kind": "sibling_price_premium",
                    "currentName": current.name,
                    "currentPrice": current.advertisedPrice,
                    "siblingName": cheaper_sib.name,
                    "siblingPrice": cheaper_sib.advertisedPrice,
                    "siblingSource": cheaper_sib.source,
                    "premiumPct": pct,
                },
            }

    # 3. Check indecision_compare: repeated views or 2-4 similar candidates
    resolved_recent: List[str] = []
    for rid in req.recentListingIds:
        item = _resolve_listing(by_id, rid)
        if item is not None:
            resolved_recent.append(item.id)
    if current is not None:
        resolved_recent.append(current.id)

    counts = Counter(resolved_recent)
    distinct_ids: List[str] = []
    for cid in resolved_recent:
        if cid not in distinct_ids:
            distinct_ids.append(cid)
    for cid in req.compareIds:
        item = _resolve_listing(by_id, cid)
        if item is not None and item.id not in distinct_ids:
            distinct_ids.append(item.id)

    has_repeat = any(c >= 2 for c in counts.values())
    if len(distinct_ids) >= 2 and (has_repeat or 2 <= len(distinct_ids) <= 4):
        top_compare = distinct_ids[:4]
        return {
            "catalog": catalog,
            "by_id": by_id,
            "triggered": True,
            "signal_type": "indecision_compare",
            "suggested_action": "compare",
            "cited_ids": top_compare,
            "raw_reason": {
                "kind": "indecision_compare",
                "count": len(top_compare),
                "names": [by_id[cid].name for cid in top_compare],
            },
        }

    return {
        "catalog": catalog,
        "by_id": by_id,
        "triggered": False,
        "signal_type": None,
        "suggested_action": None,
        "cited_ids": [],
        "raw_reason": {},
    }


def _ground_evidence_node(state: ProactiveState) -> Dict[str, Any]:
    if not state.get("triggered"):
        return {"grounded_facts": []}

    by_id = state["by_id"]
    verified_ids: List[str] = []
    facts_list: List[Dict[str, Any]] = []
    for cid in state.get("cited_ids", [])[:4]:
        item = by_id.get(cid)
        if item is not None:
            verified_ids.append(item.id)
            facts_list.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "advertisedPrice": item.advertisedPrice,
                    "ram": item.ram,
                    "storage": item.storage,
                    "cpu": item.cpu,
                    "screen": item.screen,
                    "source": item.source,
                }
            )

    if not verified_ids:
        return {
            "triggered": False,
            "signal_type": None,
            "suggested_action": None,
            "cited_ids": [],
            "grounded_facts": [],
        }

    return {
        "cited_ids": verified_ids,
        "grounded_facts": facts_list,
    }


def _format_nudge_node(state: ProactiveState) -> Dict[str, Any]:
    req = state["request"]
    mode = "offline_rules_nano"

    if not state.get("triggered"):
        return {
            "headline": "",
            "detail": "",
            "mode": mode,
        }

    reason = state["raw_reason"]
    kind = reason.get("kind")

    if kind == "over_budget_alternative":
        headline = "Có cấu hình đạt chuẩn nằm gọn trong ngân sách"
        detail = (
            f"{reason['currentName']} có giá niêm yết {format_vnd(reason['currentPrice'])} "
            f"(vượt trần {format_vnd(reason['budget'])}). Bạn có thể xem {reason['altName']} "
            f"(RAM {reason['altRam']} GB, SSD {reason['altStorage']} GB) giá {format_vnd(reason['altPrice'])}, "
            f"tiết kiệm {format_vnd(reason['savedVnd'])}."
        )
    elif kind == "screen_color_blind_spot":
        headline = "Lưu ý độ phủ màu màn hình cho Thiết kế"
        detail = (
            f"{reason['currentName']} ghi nhận thông số màn hình '{reason['screen']}', "
            "có thể hạn chế độ chính xác màu cho công việc Thiết kế."
        )
    elif kind == "ram_blind_spot":
        tasks_str = ", ".join(reason.get("tasks") or [])
        headline = f"Điểm mù RAM {reason['currentRam']} GB cho tác vụ {tasks_str}"
        detail = (
            f"{reason['currentName']} hiện có {reason['currentRam']} GB RAM, dễ nghẽn bộ nhớ khi chạy {tasks_str}."
        )
        if reason.get("altName"):
            detail += (
                f" Trong cùng ngân sách có {reason['altName']} ({reason['altRam']} GB RAM) "
                f"giá niêm yết {format_vnd(reason['altPrice'])}."
            )
    elif kind == "sibling_price_premium":
        headline = f"Chênh lệch giá +{reason['premiumPct']}% so với máy cùng cấu hình"
        detail = (
            f"{reason['currentName']} ({format_vnd(reason['currentPrice'])}) đang cao hơn {reason['premiumPct']}% "
            f"so với {reason['siblingName']} ({format_vnd(reason['siblingPrice'])} tại {reason['siblingSource']}) "
            "có cùng mức RAM/SSD và phân khúc CPU."
        )
    else:
        headline = f"So sánh nhanh {reason.get('count', 2)} mẫu bạn đang phân vân"
        names_preview = ", ".join((reason.get("names") or [])[:3])
        detail = (
            f"Bạn đã xem lặp lại các cấu hình ({names_preview}). "
            "Mở bảng đối chiếu 1 chạm để đặt cạnh nhau giá, RAM, SSD và cảnh báo rủi ro."
        )

    if is_online_ai_available(req.preferOffline):
        llm_nudge = call_chatgpt_json(
            system_prompt=(
                "Bạn là trợ lý chủ động Lựa Adviser. Dựa duy nhất vào grounded_facts và reason, "
                "viết lại thông điệp ngắn gọn tiếng Việt. Không bịa giá hay thông số. "
                "Trả về JSON: {\"headline\": str, \"detail\": str}."
            ),
            user_payload=json.dumps(
                {
                    "signalType": state["signal_type"],
                    "reason": reason,
                    "grounded_facts": state["grounded_facts"],
                },
                ensure_ascii=False,
            ),
            max_tokens=300,
        )
        if llm_nudge is not None:
            mode = "online_langgraph_chatgpt"
            h = llm_nudge.get("headline")
            d = llm_nudge.get("detail")
            if isinstance(h, str) and h.strip():
                headline = h.strip()[:160]
            if isinstance(d, str) and d.strip():
                detail = d.strip()[:500]

    return {
        "headline": headline,
        "detail": detail,
        "mode": mode,
    }


def _build_proactive_graph():
    workflow = StateGraph(ProactiveState)
    workflow.add_node("detect_signals", _detect_signals_node)
    workflow.add_node("ground_evidence", _ground_evidence_node)
    workflow.add_node("format_nudge", _format_nudge_node)

    workflow.add_edge(START, "detect_signals")
    workflow.add_edge("detect_signals", "ground_evidence")
    workflow.add_edge("ground_evidence", "format_nudge")
    workflow.add_edge("format_nudge", END)
    return workflow.compile()


PROACTIVE_GRAPH = _build_proactive_graph()


def run_proactive_copilot(req: ProactiveRequest) -> ProactiveResponse:
    res = PROACTIVE_GRAPH.invoke({"request": req})
    return ProactiveResponse(
        triggered=bool(res["triggered"]),
        signalType=res["signal_type"],
        headline=res["headline"],
        detail=res["detail"],
        citedListingIds=res["cited_ids"],
        suggestedAction=res["suggested_action"],
        mode=res["mode"],
    )
