"""STT 2.0 — Conversational Copilot Picker built on LangGraph StateGraph.

Topology:
extract_needs -> check_missing_constraints -> search_verified_candidates -> synthesize_tradeoffs -> verify_facts_gate
"""
import json
import re
from typing import Any, Dict, List, Optional, TypedDict

from langgraph.graph import END, START, StateGraph

from backend.schemas import (
    CatalogModel,
    CopilotRequest,
    CopilotResponse,
    CopilotShortlistItem,
    ListingModel,
    RequirementsModel,
)
from backend.services.advice_service import (
    compute_listing_evidence,
    format_vnd,
    generate_allowed_facts,
)
from backend.services.ai_gateway import (
    call_chatgpt_json,
    is_online_ai_available,
    wrap_user_query,
)
from backend.services.catalog_service import assess_listing, build_catalog_snapshot

CANONICAL_TASKS = {
    "Lập trình",
    "Văn phòng & học tập",
    "Thiết kế",
    "Máy ảo",
    "Chơi game",
}

TASK_PATTERNS: List[tuple[str, str]] = [
    (r"\b(máy ảo|docker|kubernetes|k8s|virtualbox|vmware|vm)\b", "Máy ảo"),
    (r"\b(lập trình|code|coding|dev|cntt|backend|frontend|fullstack|python|java)\b", "Lập trình"),
    (r"(đồ họa\s*2d|đồ họa|thiết kế|photoshop|illustrator|figma|canva|premiere|dựng phim|chỉnh ảnh)", "Thiết kế"),
    (r"\b(chơi game|gaming|game|valorant|lol|cs2|esport|aaa)\b", "Chơi game"),
    (r"(sinh viên|văn phòng|học tập|word|excel|powerpoint|kế toán|học online)", "Văn phòng & học tập"),
]


class CopilotState(TypedDict, total=False):
    request: CopilotRequest
    extracted: Dict[str, Any]
    proposed_requirements: Optional[RequirementsModel]
    effective_requirements: RequirementsModel
    clarifying_questions: List[str]
    catalog: CatalogModel
    candidates: List[ListingModel]
    draft_summaries: Dict[str, str]
    assistant_reply: str
    shortlist: List[CopilotShortlistItem]
    mode: str


def _parse_weight_kg(weight_str: Optional[str]) -> Optional[float]:
    if not weight_str:
        return None
    m = re.search(r"(\d+(?:[.,]\d+)?)\s*kg", weight_str, re.IGNORECASE)
    if m:
        val = float(m.group(1).replace(",", "."))
        return val if 0.3 <= val <= 10.0 else None
    m_g = re.search(r"(\d{3,4})\s*g\b", weight_str, re.IGNORECASE)
    if m_g:
        val = float(m_g.group(1)) / 1000.0
        return val if 0.3 <= val <= 10.0 else None
    return None


def _extract_deterministic_vietnamese(message: str) -> Dict[str, Any]:
    text = message.lower()
    out: Dict[str, Any] = {
        "budget": None,
        "minRam": None,
        "minStorage": None,
        "os": None,
        "tasks": [],
        "maxWeightKg": None,
        "softPriorities": [],
    }

    # Budget patterns: "25tr5", "20.5 triệu", "20 triệu", "25tr", "18 củ"
    m_split = re.search(r"(\d{1,3})\s*(?:triệu|tr)\s*(\d{1,2})\b", text)
    if m_split:
        major = int(m_split.group(1))
        minor_digits = m_split.group(2)
        minor_vnd = int(minor_digits) * (100_000 if len(minor_digits) == 1 else 10_000)
        val = major * 1_000_000 + minor_vnd
        if 1_000_000 <= val <= 1_000_000_000:
            out["budget"] = val
    else:
        m_budget = re.search(r"(\d{1,3}(?:[.,]\d+)?)\s*(?:triệu|tr|củ)\b", text)
        if m_budget:
            val = int(round(float(m_budget.group(1).replace(",", ".")) * 1_000_000))
            if 1_000_000 <= val <= 1_000_000_000:
                out["budget"] = val

    # Weight / portability: "dưới 1.5kg", "1,4 kg", "mỏng nhẹ"
    m_weight = re.search(r"(?:dưới|nhẹ hơn|tối đa|<=|<|khoảng|tầm)?\s*(\d(?:[.,]\d+)?)\s*kg\b", text)
    if m_weight:
        w = float(m_weight.group(1).replace(",", "."))
        if 0.5 <= w <= 5.0:
            out["maxWeightKg"] = w
            out["softPriorities"].append("portability")
    if any(kw in text for kw in ("mỏng nhẹ", "gọn nhẹ", "hay mang đi", "di chuyển nhiều", "nhẹ")):
        if out["maxWeightKg"] is None:
            out["maxWeightKg"] = 1.5
        if "portability" not in out["softPriorities"]:
            out["softPriorities"].append("portability")

    if any(kw in text for kw in ("pin trâu", "pin lâu", "thời lượng pin")):
        out["softPriorities"].append("battery")
    if any(kw in text for kw in ("bền", "tản nhiệt", "mát")):
        out["softPriorities"].append("thermals")

    # RAM: "RAM 16GB", "16 GB RAM", "ram 32"
    m_ram = re.search(r"(?:ram\s*(\d{1,3})\s*(?:gb)?|(\d{1,3})\s*gb\s*ram)", text)
    if m_ram:
        ram_val = int(m_ram.group(1) or m_ram.group(2))
        if ram_val in (4, 8, 12, 16, 24, 32, 48, 64, 128):
            out["minRam"] = ram_val

    # Storage: "SSD 512GB", "ổ 1TB", "512GB SSD", "1TB SSD"
    for pat in (
        r"\b(?:ssd|ổ\s*cứng|ổ|lưu\s*trữ)\s*(\d{1,4})\s*(gb|tb)?\b",
        r"(?<!ram\s)\b(\d{3,4})\s*(gb)\s*ssd\b",
        r"(?<!ram\s)\b([1-8])\s*(tb)\s*(?:ssd)?\b",
    ):
        for m_ssd in re.finditer(pat, text):
            raw_num = int(m_ssd.group(1))
            unit = (m_ssd.group(2) or ("tb" if raw_num <= 8 else "gb")).lower()
            gb_val = raw_num * 1024 if unit == "tb" else raw_num
            if gb_val in (128, 256, 512, 1024, 2048, 4096):
                out["minStorage"] = gb_val
                break
        if out["minStorage"] is not None:
            break

    # OS
    if any(kw in text for kw in ("macos", "macbook", "mac os")):
        out["os"] = "macOS"
    elif any(kw in text for kw in ("windows", "win 11", "win11")):
        out["os"] = "Windows"
    elif any(kw in text for kw in ("linux", "ubuntu")):
        out["os"] = "Linux"

    # Tasks
    tasks: List[str] = []
    for pattern, canonical in TASK_PATTERNS:
        if re.search(pattern, text) and canonical not in tasks and len(tasks) < 5:
            tasks.append(canonical)
    out["tasks"] = tasks

    return out


def _extract_needs_node(state: CopilotState) -> Dict[str, Any]:
    req = state["request"]
    det = _extract_deterministic_vietnamese(req.message)
    mode = "offline_rules_nano"

    # Merge Nano on-device draft if present (deterministic explicit numbers in message win if present)
    if req.nanoDraft is not None:
        nd = req.nanoDraft
        if det["budget"] is None and nd.budget is not None:
            det["budget"] = nd.budget
        if det["minRam"] is None and nd.minRam is not None and nd.minRam > 0:
            det["minRam"] = nd.minRam
        if det["minStorage"] is None and nd.minStorage is not None and nd.minStorage > 0:
            det["minStorage"] = nd.minStorage
        if det["os"] is None and nd.os:
            det["os"] = nd.os
        if det["maxWeightKg"] is None and nd.maxWeightKg is not None:
            det["maxWeightKg"] = nd.maxWeightKg
            if "portability" not in det["softPriorities"]:
                det["softPriorities"].append("portability")
        if nd.tasks:
            for t in nd.tasks:
                if t in CANONICAL_TASKS and t not in det["tasks"] and len(det["tasks"]) < 5:
                    det["tasks"].append(t)

    # Online ChatGPT refinement when configured and not preferOffline
    if is_online_ai_available(req.preferOffline):
        llm_res = call_chatgpt_json(
            system_prompt=(
                "Bạn là bộ trích xuất nhu cầu chọn mua laptop cho thị trường Việt Nam. "
                "Trả về JSON: {\"budget\": int|null, \"minRam\": int|null, \"minStorage\": int|null, "
                "\"os\": str|null, \"tasks\": [\"Lập trình\"|\"Văn phòng & học tập\"|\"Thiết kế\"|\"Máy ảo\"|\"Chơi game\"], "
                "\"maxWeightKg\": float|null, \"softPriorities\": [str]}."
            ),
            user_payload=(
                f"Nhu cầu hiện tại: {req.requirements.model_dump_json()}\n"
                f"Câu hỏi người dùng: {wrap_user_query(req.message)}"
            ),
        )
        if llm_res is not None:
            mode = "online_langgraph_chatgpt"
            if det["budget"] is None and isinstance(llm_res.get("budget"), int):
                if 1_000_000 <= llm_res["budget"] <= 1_000_000_000:
                    det["budget"] = llm_res["budget"]
            if det["minRam"] is None and isinstance(llm_res.get("minRam"), int):
                if 0 < llm_res["minRam"] <= 1024:
                    det["minRam"] = llm_res["minRam"]
            if det["minStorage"] is None and isinstance(llm_res.get("minStorage"), int):
                if 0 < llm_res["minStorage"] <= 100000:
                    det["minStorage"] = llm_res["minStorage"]
            if det["os"] is None and isinstance(llm_res.get("os"), str) and llm_res["os"].strip():
                det["os"] = llm_res["os"].strip()[:100]
            if det["maxWeightKg"] is None and isinstance(llm_res.get("maxWeightKg"), (int, float)):
                if 0.4 <= float(llm_res["maxWeightKg"]) <= 10.0:
                    det["maxWeightKg"] = float(llm_res["maxWeightKg"])
            for t in llm_res.get("tasks") or []:
                if isinstance(t, str) and t in CANONICAL_TASKS and t not in det["tasks"] and len(det["tasks"]) < 5:
                    det["tasks"].append(t)
            for sp in llm_res.get("softPriorities") or []:
                if isinstance(sp, str) and sp and sp not in det["softPriorities"]:
                    det["softPriorities"].append(sp[:40])

    # Build proposed requirements without mutating confirmed requirements
    cur = req.requirements
    merged_budget = det["budget"] if det["budget"] is not None else cur.budget
    merged_ram = det["minRam"] if det["minRam"] is not None else cur.minRam
    merged_storage = det["minStorage"] if det["minStorage"] is not None else cur.minStorage
    merged_os = det["os"] if det["os"] is not None else cur.os
    merged_tasks = list(cur.tasks)
    for t in det["tasks"]:
        if t not in merged_tasks and len(merged_tasks) < 5:
            merged_tasks.append(t)

    # Smart task-based RAM floor suggestion if user named heavy tasks without explicit RAM
    if det["minRam"] is None and cur.minRam == 0:
        if "Máy ảo" in merged_tasks and merged_budget >= 18_000_000:
            merged_ram = 16
        elif any(t in merged_tasks for t in ("Lập trình", "Thiết kế", "Chơi game")) and merged_budget >= 18_000_000:
            merged_ram = 16

    effective = RequirementsModel(
        budget=merged_budget,
        minRam=merged_ram,
        minStorage=merged_storage,
        os=merged_os,
        tasks=merged_tasks,
    )
    proposed = effective if effective.model_dump() != cur.model_dump() else None

    return {
        "extracted": det,
        "proposed_requirements": proposed,
        "effective_requirements": effective,
        "mode": mode,
    }


def _check_missing_constraints_node(state: CopilotState) -> Dict[str, Any]:
    det = state["extracted"]
    eff = state["effective_requirements"]
    questions: List[str] = []

    if det.get("budget") is None:
        questions.append(
            "Ngân sách tối đa bạn muốn chi là khoảng bao nhiêu triệu đồng (ví dụ: 18 triệu, 25 triệu)?"
        )
    if not eff.tasks:
        questions.append(
            "Bạn dùng máy chủ yếu cho tác vụ nào (văn phòng học tập, lập trình, thiết kế đồ họa hay chơi game)?"
        )
    if det.get("maxWeightKg") is None and "portability" not in (det.get("softPriorities") or []):
        questions.append(
            "Bạn ưu tiên máy mỏng nhẹ dưới 1.5kg để mang đi hằng ngày hay ưu tiên màn hình lớn, tản nhiệt khỏe?"
        )

    return {"clarifying_questions": questions[:3]}


def _score_candidate(
    v: ListingModel,
    req: RequirementsModel,
    max_weight_kg: Optional[float],
    soft_priorities: List[str],
) -> tuple:
    assessment = assess_listing(v, req)
    evidence = compute_listing_evidence(v)
    is_excluded = 1 if assessment["state"] == "excluded" else 0
    conflict_count = len(evidence["conflicts"])

    parsed_w = _parse_weight_kg(v.weight)
    name_lower = (v.name or "").lower()
    gpu_lower = (v.gpu or "").lower()
    screen_lower = (v.screen or "").lower()

    # Overweight penalty when user explicitly requested maxWeightKg
    weight_penalty = 0
    if max_weight_kg is not None:
        if parsed_w is not None and parsed_w > max_weight_kg:
            weight_penalty = 2
        elif any(heavy in name_lower for heavy in ("loq", "legion", "tuf", "nitro", "victus", "katana")):
            weight_penalty = 1

    bonus = 0
    if "portability" in soft_priorities or max_weight_kg is not None:
        if parsed_w is not None and parsed_w <= (max_weight_kg or 1.5):
            bonus += 3
        if any(slim in name_lower for slim in ("swift", "zenbook", "macbook air", "slim", "vivobook s", "gram")):
            bonus += 2
        if "14" in screen_lower or "13" in screen_lower:
            bonus += 1

    if "Chơi game" in req.tasks or "Thiết kế" in req.tasks:
        if any(dgpu in gpu_lower for dgpu in ("rtx", "gtx", "radeon rx")):
            bonus += 3
    if "Lập trình" in req.tasks or "Máy ảo" in req.tasks:
        if (v.ram or 0) >= 32:
            bonus += 4
        elif (v.ram or 0) >= 16:
            bonus += 2
    if (v.storage or 0) >= 512:
        bonus += 1

    price = v.advertisedPrice if v.advertisedPrice is not None else 999_999_999
    return (is_excluded, conflict_count, weight_penalty, -bonus, price, v.id)


def _search_verified_candidates_node(state: CopilotState) -> Dict[str, Any]:
    catalog = build_catalog_snapshot()
    eff = state["effective_requirements"]
    det = state["extracted"]
    max_w = det.get("maxWeightKg")
    soft = det.get("softPriorities") or []

    ranked = sorted(
        catalog.listings,
        key=lambda v: _score_candidate(v, eff, max_w, soft),
    )
    # Prefer non-excluded candidates; only show eligible ones if any exist
    eligible = [v for v in ranked if assess_listing(v, eff)["state"] != "excluded"]
    chosen = (eligible if eligible else ranked)[:3]

    return {
        "catalog": catalog,
        "candidates": chosen,
    }


def _deterministic_tradeoff(v: ListingModel, req: RequirementsModel, max_w: Optional[float]) -> str:
    evidence = compute_listing_evidence(v)
    ram_txt = f"{evidence['ram']} GB" if evidence["ram"] is not None else "chưa xác minh"
    ssd_txt = f"{evidence['storage']} GB" if evidence["storage"] is not None else "chưa xác minh"
    cpu_txt = v.cpu or "chưa rõ CPU"
    gpu_txt = v.gpu or "đồ họa tích hợp/chưa rõ"
    screen_txt = v.screen or "chưa rõ màn hình"
    weight_txt = v.weight if v.weight else "chưa xác minh trọng lượng"
    price_txt = format_vnd(v.advertisedPrice)

    notes = [
        f"Giá niêm yết lịch sử {price_txt} tại {v.source} (quan sát {v.observedAt}).",
        f"Cấu hình: RAM {ram_txt}, SSD {ssd_txt}, CPU {cpu_txt}, GPU {gpu_txt}, màn {screen_txt}, nặng {weight_txt}.",
    ]
    if max_w is not None and not v.weight:
        notes.append(f"Lưu ý: dữ liệu niêm yết chưa ghi trọng lượng xác thực để đối chiếu mức {max_w} kg.")
    if evidence["conflicts"]:
        notes.append("Cảnh báo mâu thuẫn thông số: " + "; ".join(evidence["conflicts"]) + ".")
    return " ".join(notes)


def _synthesize_tradeoffs_node(state: CopilotState) -> Dict[str, Any]:
    req = state["request"]
    eff = state["effective_requirements"]
    det = state["extracted"]
    candidates = state["candidates"]
    questions = state["clarifying_questions"]
    max_w = det.get("maxWeightKg")
    mode = state["mode"]

    summaries = {v.id: _deterministic_tradeoff(v, eff, max_w) for v in candidates}

    eligible_count = sum(1 for v in candidates if assess_listing(v, eff)["state"] != "excluded")
    if eligible_count > 0:
        names = ", ".join(v.name for v in candidates)
        base_reply = (
            f"Dựa trên ngân sách {format_vnd(eff.budget)}"
            + (f" và tác vụ {', '.join(eff.tasks)}" if eff.tasks else "")
            + f", Lựa tìm thấy {eligible_count} mẫu đáng chú ý từ danh mục kiểm chứng: {names}. "
            "Các đề xuất thay đổi bộ lọc bên dưới cần bạn bấm xác nhận trước khi áp dụng."
        )
    else:
        base_reply = (
            f"Hiện chưa có mẫu nào trong danh mục đạt đồng thời ngân sách {format_vnd(eff.budget)} "
            f"và cấu hình tối thiểu RAM {eff.minRam} GB / SSD {eff.minStorage} GB. "
            "Bạn có thể xem các cấu hình tiệm cận hoặc điều chỉnh ngân sách."
        )
    if questions:
        base_reply += " " + questions[0]

    if is_online_ai_available(req.preferOffline) and candidates:
        verified_facts_payload = [
            {
                "id": v.id,
                "name": v.name,
                "advertisedPrice": v.advertisedPrice,
                "ram": v.ram,
                "storage": v.storage,
                "cpu": v.cpu,
                "gpu": v.gpu,
                "screen": v.screen,
                "weight": v.weight,
                "source": v.source,
            }
            for v in candidates
        ]
        llm_synth = call_chatgpt_json(
            system_prompt=(
                "Bạn là trợ lý tư vấn laptop Lựa Adviser. Chỉ được dùng đúng thông số trong danh sách "
                "verified_candidates. Không được bịa giá hay thông số ngoài dữ liệu. "
                "Trả về JSON: {\"assistantReply\": str, \"tradeoffs\": {\"<id>\": str}} bằng tiếng Việt tự nhiên."
            ),
            user_payload=(
                f"Câu hỏi: {wrap_user_query(req.message)}\n"
                f"verified_candidates: {json.dumps(verified_facts_payload, ensure_ascii=False)}"
            ),
        )
        if llm_synth is not None:
            mode = "online_langgraph_chatgpt"
            reply_cand = llm_synth.get("assistantReply")
            if isinstance(reply_cand, str) and reply_cand.strip():
                base_reply = reply_cand.strip()[:1500]
            llm_tradeoffs = llm_synth.get("tradeoffs")
            if isinstance(llm_tradeoffs, dict):
                for cid, text_val in llm_tradeoffs.items():
                    if cid in summaries and isinstance(text_val, str) and text_val.strip():
                        summaries[cid] = text_val.strip()[:600]

    return {
        "draft_summaries": summaries,
        "assistant_reply": base_reply,
        "mode": mode,
    }


def _contains_unverified_vnd_claim(text: str, allowed_prices: set[int]) -> bool:
    """Reject LLM text that hallucinates a specific million-VND price not matching verified prices."""
    for m in re.finditer(r"(\d{1,3})\.(\d{3})\.(\d{3})", text):
        claimed = int(m.group(1) + m.group(2) + m.group(3))
        if claimed >= 1_000_000 and claimed not in allowed_prices:
            return True
    return False


def _verify_facts_gate_node(state: CopilotState) -> Dict[str, Any]:
    """BR-02 & BR-07 Fact Gate:
    - Never mutate user requirements automatically (requiresConfirmation=True).
    - Every candidate MUST exist in verified catalog and carry verified allowedFacts.
    - Strip/replace any summary that invents unverified prices.
    """
    catalog = state["catalog"]
    eff = state["effective_requirements"]
    det = state["extracted"]
    max_w = det.get("maxWeightKg")
    by_id = {v.id: v for v in catalog.listings}
    draft_summaries = state["draft_summaries"]

    allowed_prices: set[int] = {eff.budget, state["request"].requirements.budget}
    shortlist: List[CopilotShortlistItem] = []

    for cand in state["candidates"][:3]:
        canonical = by_id.get(cand.id)
        if canonical is None:
            continue
        if canonical.advertisedPrice is not None:
            allowed_prices.add(canonical.advertisedPrice)
        assessment = assess_listing(canonical, eff)
        allowed_facts = generate_allowed_facts(canonical, eff)
        summary = draft_summaries.get(canonical.id) or _deterministic_tradeoff(canonical, eff, max_w)
        if _contains_unverified_vnd_claim(summary, allowed_prices):
            summary = _deterministic_tradeoff(canonical, eff, max_w)

        shortlist.append(
            CopilotShortlistItem(
                listing=canonical,
                assessment=assessment,
                tradeoffSummary=summary,
                allowedFacts=allowed_facts,
            )
        )

    reply = state["assistant_reply"]
    if _contains_unverified_vnd_claim(reply, allowed_prices):
        reply = (
            f"Lựa đã đối chiếu danh mục kiểm chứng theo ngân sách {format_vnd(eff.budget)} "
            f"và chọn ra {len(shortlist)} cấu hình sát nhất."
        )

    return {
        "shortlist": shortlist,
        "assistant_reply": reply,
    }


def _build_copilot_graph():
    workflow = StateGraph(CopilotState)
    workflow.add_node("extract_needs", _extract_needs_node)
    workflow.add_node("check_missing_constraints", _check_missing_constraints_node)
    workflow.add_node("search_verified_candidates", _search_verified_candidates_node)
    workflow.add_node("synthesize_tradeoffs", _synthesize_tradeoffs_node)
    workflow.add_node("verify_facts_gate", _verify_facts_gate_node)

    workflow.add_edge(START, "extract_needs")
    workflow.add_edge("extract_needs", "check_missing_constraints")
    workflow.add_edge("check_missing_constraints", "search_verified_candidates")
    workflow.add_edge("search_verified_candidates", "synthesize_tradeoffs")
    workflow.add_edge("synthesize_tradeoffs", "verify_facts_gate")
    workflow.add_edge("verify_facts_gate", END)
    return workflow.compile()


COPILOT_GRAPH = _build_copilot_graph()


def run_copilot_picker(req: CopilotRequest) -> CopilotResponse:
    result = COPILOT_GRAPH.invoke({"request": req})
    return CopilotResponse(
        sessionId=req.sessionId,
        catalogRevision=result["catalog"].revision,
        mode=result["mode"],
        assistantReply=result["assistant_reply"],
        clarifyingQuestions=result["clarifying_questions"],
        proposedRequirements=result["proposed_requirements"],
        requiresConfirmation=True,
        extractedConstraints=result["extracted"],
        shortlist=result["shortlist"],
    )
