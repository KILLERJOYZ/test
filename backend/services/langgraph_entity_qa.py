"""STT 23.0 — Admin Entity Resolution & Scraper QA Agent built on LangGraph StateGraph.

Topology:
normalize_sku -> detect_spec_conflicts -> detect_price_anomalies -> stage_verdict
"""
import json
import re
import statistics
from typing import Any, Dict, List, Optional, TypedDict
from urllib.parse import urlparse

from langgraph.graph import END, START, StateGraph

from backend.schemas import (
    EntityQaItemResult,
    EntityQaRequest,
    EntityQaResponse,
    ListingModel,
    ScrapedListingInput,
)
from backend.services.ai_gateway import call_chatgpt_json, is_online_ai_available
from backend.services.catalog_service import build_catalog_snapshot

ALLOWLISTED_RETAILER_HOSTS: Dict[str, str] = {
    "cellphones": "cellphones.com.vn",
    "fptshop": "fptshop.com.vn",
    "thegioididong": "thegioididong.com",
    "dienmayxanh": "dienmayxanh.com",
    "gearvn": "gearvn.com",
    "phongvu": "phongvu.vn",
    "hacom": "hacom.vn",
    "laptopaz": "laptopaz.vn",
    "trungtran": "trungtran.vn",
    "apple": "apple.com",
    "samsung": "samsungmobilepress.com",
}
ALLOWED_HOST_SET = set(ALLOWLISTED_RETAILER_HOSTS.values())

KNOWN_BRANDS = (
    "lenovo",
    "asus",
    "acer",
    "dell",
    "hp",
    "apple",
    "msi",
    "gigabyte",
    "lg",
    "samsung",
    "huawei",
    "microsoft",
)

STOP_WORDS = {"laptop", "máy", "tính", "xách", "tay", "chính", "hãng", "gaming", "mới"}


class EntityQaState(TypedDict, total=False):
    request: EntityQaRequest
    reference_listings: List[ListingModel]
    normalized_items: List[Dict[str, Any]]
    ready: List[EntityQaItemResult]
    flagged: List[EntityQaItemResult]
    mode: str


def _infer_brand(brand: Optional[str], name: str) -> str:
    if brand and brand.strip():
        return brand.strip().lower()
    low = name.lower()
    if "macbook" in low:
        return "apple"
    for b in KNOWN_BRANDS:
        if re.search(rf"\b{re.escape(b)}\b", low):
            return b
    return "unknown"


def _normalize_model_line(brand_slug: str, model: Optional[str], name: str) -> str:
    base = (model or name or "").lower()
    base = re.sub(r"\([^)]*\)", " ", base)
    base = re.sub(r"\b\d+\s*gb\b|\b\d+\s*tb\b", " ", base)
    tokens = [
        t
        for t in re.split(r"[^a-z0-9à-ỹ-]+", base)
        if t and t not in STOP_WORDS and t != brand_slug
    ]
    # Drop trailing long manufacturer part numbers like 83y9003vvn if we already have >=2 model tokens
    if len(tokens) >= 3 and re.match(r"^[a-z0-9]{7,}$", tokens[-1]) and any(c.isdigit() for c in tokens[-1]):
        tokens = tokens[:-1]
    selected = tokens[:3] if tokens else ["generic"]
    return "-".join(selected)


def _normalize_cpu_slug(cpu: Optional[str], name: str = "") -> str:
    s = f"{cpu or ''} {name}".lower()
    for pat in (
        r"core\s*ultra\s*[579]\s*\d{3}[a-z]*",
        r"core\s*i[3579][-\s]*\d{4,5}[a-z]*",
        r"core\s*[3579]\s*\d{3}[a-z]*",
        r"ryzen\s*[3579]\s*\d{4}[a-z]*",
        r"m[1-4](?:\s*(?:pro|max))?",
        r"snapdragon\s*x(?:\s*elite|\s*plus)?",
        r"core\s*i[3579]",
        r"ryzen\s*[3579]",
    ):
        m = re.search(pat, s)
        if m:
            return re.sub(r"[\s_-]+", "-", m.group(0).strip())
    if cpu and cpu.strip():
        cleaned = re.sub(r"[^a-z0-9]+", "-", cpu.lower()).strip("-")
        return cleaned[:24] or "cpu-unknown"
    return "cpu-unknown"


def _normalize_gpu_slug(gpu: Optional[str], name: str = "") -> str:
    s = f"{gpu or ''} {name}".lower()
    m = re.search(r"\b((?:rtx|gtx)\s*\d{4}(?:\s*ti)?|rx\s*\d{4}[a-z]*)\b", s)
    if m:
        return re.sub(r"\s+", "", m.group(1))
    if any(k in s for k in ("iris xe", "intel graphics", "intel arc", "radeon", "adreno", "integrated")):
        return "igpu"
    return "igpu"


def _compute_keys(
    brand: Optional[str],
    model: Optional[str],
    name: str,
    cpu: Optional[str],
    ram: Optional[int],
    storage: Optional[int],
    gpu: Optional[str],
) -> tuple[str, str, str]:
    b = _infer_brand(brand, name)
    m_line = _normalize_model_line(b, model, name)
    family_key = f"{b}:{m_line}"
    cpu_slug = _normalize_cpu_slug(cpu, name)
    gpu_slug = _normalize_gpu_slug(gpu, name)
    ram_part = f"{ram}gb" if ram is not None else "ram?"
    ssd_part = f"{storage}gb" if storage is not None else "ssd?"
    variant_sku = f"{cpu_slug}|{ram_part}|{ssd_part}|{gpu_slug}"
    spec_bucket = f"{ram_part}|{ssd_part}|{gpu_slug}"
    return family_key, variant_sku, spec_bucket


def _check_valid_retailer_link(url: str, source: str) -> Optional[str]:
    try:
        parsed = urlparse(url.strip())
    except Exception:
        return "URL không hợp lệ."
    if parsed.scheme != "https":
        return "URL bắt buộc dùng giao thức https://."
    if parsed.username or parsed.password:
        return "URL không được chứa thông tin xác thực."
    host = (parsed.hostname or "").lower()
    if host.startswith("www."):
        host = host[4:]
    if host not in ALLOWED_HOST_SET:
        return f"Tên miền '{host}' không nằm trong danh sách nhà bán lẻ được phép."
    src_key = source.strip().lower()
    if src_key in ALLOWLISTED_RETAILER_HOSTS and ALLOWLISTED_RETAILER_HOSTS[src_key] != host:
        return f"Tên miền '{host}' không khớp nguồn '{source}' ({ALLOWLISTED_RETAILER_HOSTS[src_key]})."
    return None


def _extract_title_specs(title: str) -> Dict[str, Any]:
    out: Dict[str, Any] = {"ram": None, "storage": None, "cpu_tier": None, "gpu": None}
    pair = re.search(r"(\d+)\s*GB\s*[,/]\s*(\d+)\s*(GB|TB)", title, re.IGNORECASE)
    if pair:
        out["ram"] = int(pair.group(1))
        num = int(pair.group(2))
        out["storage"] = num * 1024 if pair.group(3).upper() == "TB" else num
    else:
        m_ram = re.search(r"(?:\bram\s*(\d+)\s*gb\b|\b(\d+)\s*gb\s*ram\b)", title, re.IGNORECASE)
        if m_ram:
            out["ram"] = int(m_ram.group(1) or m_ram.group(2))
        m_ssd = re.search(r"(?:\bssd\s*(\d+)\s*(gb|tb)\b|\b(\d+)\s*(gb|tb)\s*ssd\b)", title, re.IGNORECASE)
        if m_ssd:
            n = int(m_ssd.group(1) or m_ssd.group(3))
            u = (m_ssd.group(2) or m_ssd.group(4)).upper()
            out["storage"] = n * 1024 if u == "TB" else n

    low = title.lower()
    m_cpu = re.search(r"\b(core\s*i[3579]|ryzen\s*[3579]|core\s*ultra\s*[579])\b", low)
    if m_cpu:
        out["cpu_tier"] = re.sub(r"\s+", " ", m_cpu.group(1))
    m_gpu = re.search(r"\b((?:rtx|gtx)\s*\d{4}(?:\s*ti)?)\b", low)
    if m_gpu:
        out["gpu"] = re.sub(r"\s+", "", m_gpu.group(1))
    return out


def _normalize_sku_node(state: EntityQaState) -> Dict[str, Any]:
    req = state["request"]
    mode = "offline_rules_nano"
    items: List[Dict[str, Any]] = []

    for src_item in req.listings:
        family_key, variant_sku, spec_bucket = _compute_keys(
            src_item.brand,
            src_item.model,
            src_item.name,
            src_item.cpu,
            src_item.ram,
            src_item.storage,
            src_item.gpu,
        )
        items.append(
            {
                "input": src_item,
                "familyKey": family_key,
                "variantSku": variant_sku,
                "specBucket": spec_bucket,
                "flags": [],
                "reasons": [],
                "siblingMedianPrice": None,
                "deviationRatio": None,
            }
        )

    if is_online_ai_available(req.preferOffline) and items:
        llm_res = call_chatgpt_json(
            system_prompt=(
                "Bạn là trợ lý chuẩn hóa mã dòng máy laptop (STT 23.0). "
                "Với mỗi mục đầu vào, chuẩn hóa familyKey dạng '<brand>:<model-line>'. "
                "Trả về JSON: {\"normalized\": {\"<id>\": {\"familyKey\": str}}}."
            ),
            user_payload=json.dumps(
                [
                    {
                        "id": x["input"].id,
                        "name": x["input"].name,
                        "brand": x["input"].brand,
                        "model": x["input"].model,
                    }
                    for x in items[:30]
                ],
                ensure_ascii=False,
            ),
            max_tokens=500,
        )
        if llm_res is not None and isinstance(llm_res.get("normalized"), dict):
            mode = "online_langgraph_chatgpt"
            norm_map = llm_res["normalized"]
            for x in items:
                cand = norm_map.get(x["input"].id)
                if isinstance(cand, dict):
                    fk = cand.get("familyKey")
                    if isinstance(fk, str) and ":" in fk and 3 <= len(fk) <= 80:
                        x["familyKey"] = fk.strip().lower()

    return {"normalized_items": items, "mode": mode}


def _detect_spec_conflicts_node(state: EntityQaState) -> Dict[str, Any]:
    items = state["normalized_items"]
    ref_by_id = {v.id: v for v in state["reference_listings"]}

    # Track duplicate IDs in incoming batch with conflicting specs
    seen_specs_by_id: Dict[str, tuple] = {}
    for v in state["reference_listings"]:
        seen_specs_by_id[v.id] = (v.ram, v.storage)

    for entry in items:
        inp: ScrapedListingInput = entry["input"]
        flags: List[str] = entry["flags"]
        reasons: List[str] = entry["reasons"]

        # 1. URL / retailer allowlist check
        link_err = _check_valid_retailer_link(inp.url, inp.source)
        if link_err:
            if "invalid_link" not in flags:
                flags.append("invalid_link")
            reasons.append(link_err)

        # 2. Title vs structured specs conflict
        t_specs = _extract_title_specs(inp.name)
        if t_specs["ram"] is not None and inp.ram is not None and t_specs["ram"] != inp.ram:
            if "spec_conflict" not in flags:
                flags.append("spec_conflict")
            reasons.append(f"RAM mâu thuẫn: tiêu đề {t_specs['ram']} GB nhưng trường ram={inp.ram} GB.")

        if t_specs["storage"] is not None and inp.storage is not None and t_specs["storage"] != inp.storage:
            if "spec_conflict" not in flags:
                flags.append("spec_conflict")
            reasons.append(
                f"Ổ cứng mâu thuẫn: tiêu đề {t_specs['storage']} GB nhưng trường storage={inp.storage} GB."
            )

        if t_specs["cpu_tier"] and inp.cpu:
            m_struct = re.search(r"\b(core\s*i[3579]|ryzen\s*[3579]|core\s*ultra\s*[579])\b", inp.cpu.lower())
            if m_struct and re.sub(r"\s+", " ", m_struct.group(1)) != t_specs["cpu_tier"]:
                if "spec_conflict" not in flags:
                    flags.append("spec_conflict")
                reasons.append(
                    f"CPU mâu thuẫn: tiêu đề '{t_specs['cpu_tier']}' khác dữ liệu '{m_struct.group(1)}'."
                )

        if t_specs["gpu"] and inp.gpu:
            m_gpu_struct = re.search(r"\b((?:rtx|gtx)\s*\d{4}(?:\s*ti)?)\b", inp.gpu.lower())
            if m_gpu_struct and re.sub(r"\s+", "", m_gpu_struct.group(1)) != t_specs["gpu"]:
                if "spec_conflict" not in flags:
                    flags.append("spec_conflict")
                reasons.append(
                    f"GPU mâu thuẫn: tiêu đề '{t_specs['gpu']}' khác dữ liệu '{m_gpu_struct.group(1)}'."
                )
            elif not m_gpu_struct and any(k in inp.gpu.lower() for k in ("intel", "iris", "radeon graphics", "integrated")):
                if "spec_conflict" not in flags:
                    flags.append("spec_conflict")
                reasons.append(
                    f"GPU mâu thuẫn: tiêu đề nêu GPU rời '{t_specs['gpu']}' nhưng dữ liệu là GPU tích hợp '{inp.gpu}'."
                )

        # 3. Same ID conflicting with existing catalog or duplicate in batch
        sig = (inp.ram, inp.storage)
        if inp.id in seen_specs_by_id:
            prev_ram, prev_ssd = seen_specs_by_id[inp.id]
            if (prev_ram is not None and inp.ram is not None and prev_ram != inp.ram) or (
                prev_ssd is not None and inp.storage is not None and prev_ssd != inp.storage
            ):
                if "spec_conflict" not in flags:
                    flags.append("spec_conflict")
                reasons.append(
                    f"Xung đột cấu hình cùng mã tin '{inp.id}' so với bản ghi hiện có ({prev_ram}GB/{prev_ssd}GB)."
                )
        else:
            seen_specs_by_id[inp.id] = sig

    return {"normalized_items": items}


def _detect_price_anomalies_node(state: EntityQaState) -> Dict[str, Any]:
    items = state["normalized_items"]
    refs = state["reference_listings"]

    # Build trusted sibling price pools from existing catalog first
    ref_by_variant: Dict[str, List[int]] = {}
    ref_by_spec_bucket: Dict[str, List[int]] = {}
    batch_by_variant: Dict[str, List[int]] = {}
    batch_by_spec_bucket: Dict[str, List[int]] = {}

    for r in refs:
        if r.advertisedPrice is not None and r.advertisedPrice > 0:
            _, v_sku, s_bucket = _compute_keys(
                r.brand, r.model, r.name, r.cpu, r.ram, r.storage, r.gpu
            )
            ref_by_variant.setdefault(v_sku, []).append(r.advertisedPrice)
            if r.ram is not None and r.storage is not None:
                ref_by_spec_bucket.setdefault(s_bucket, []).append(r.advertisedPrice)

    for entry in items:
        inp: ScrapedListingInput = entry["input"]
        if inp.advertisedPrice is not None and inp.advertisedPrice > 0:
            batch_by_variant.setdefault(entry["variantSku"], []).append(inp.advertisedPrice)
            if inp.ram is not None and inp.storage is not None:
                batch_by_spec_bucket.setdefault(entry["specBucket"], []).append(inp.advertisedPrice)

    for entry in items:
        inp = entry["input"]
        flags = entry["flags"]
        reasons = entry["reasons"]

        if inp.advertisedPrice is None or inp.advertisedPrice <= 0:
            if "price_anomaly" not in flags:
                flags.append("price_anomaly")
            reasons.append("Giá niêm yết bị thiếu hoặc <= 0.")
            continue

        # Prefer trusted catalog siblings (exact variant, then spec bucket); only fallback to batch if >=3 peers
        if ref_by_variant.get(entry["variantSku"]):
            peer_prices = list(ref_by_variant[entry["variantSku"]])
        elif ref_by_spec_bucket.get(entry["specBucket"]):
            peer_prices = list(ref_by_spec_bucket[entry["specBucket"]])
        else:
            raw_batch = list(
                batch_by_variant.get(entry["variantSku"])
                or batch_by_spec_bucket.get(entry["specBucket"])
                or []
            )
            if inp.advertisedPrice in raw_batch and len(raw_batch) >= 2:
                raw_batch.remove(inp.advertisedPrice)
            peer_prices = raw_batch if len(raw_batch) >= 2 else []

        if peer_prices:
            median_val = float(statistics.median(peer_prices))
            if median_val > 0:
                deviation = abs(inp.advertisedPrice - median_val) / median_val
                entry["siblingMedianPrice"] = int(round(median_val))
                entry["deviationRatio"] = round(deviation, 4)
                if deviation > 0.25:
                    if "price_anomaly" not in flags:
                        flags.append("price_anomaly")
                    pct = round(deviation * 100, 1)
                    reasons.append(
                        f"Giá {inp.advertisedPrice:,} ₫ lệch {pct}% (> 25%) so với trung vị cùng cấu hình ({int(round(median_val)):,} ₫)."
                    )

    return {"normalized_items": items}


def _stage_verdict_node(state: EntityQaState) -> Dict[str, Any]:
    ready: List[EntityQaItemResult] = []
    flagged: List[EntityQaItemResult] = []

    for entry in state["normalized_items"]:
        inp: ScrapedListingInput = entry["input"]
        res = EntityQaItemResult(
            id=inp.id,
            name=inp.name,
            source=inp.source,
            url=inp.url,
            familyKey=entry["familyKey"],
            variantSku=entry["variantSku"],
            flags=entry["flags"],
            reasons=entry["reasons"],
            siblingMedianPrice=entry["siblingMedianPrice"],
            deviationRatio=entry["deviationRatio"],
        )
        if res.flags:
            flagged.append(res)
        else:
            ready.append(res)

    return {"ready": ready, "flagged": flagged}


def _build_entity_qa_graph():
    workflow = StateGraph(EntityQaState)
    workflow.add_node("normalize_sku", _normalize_sku_node)
    workflow.add_node("detect_spec_conflicts", _detect_spec_conflicts_node)
    workflow.add_node("detect_price_anomalies", _detect_price_anomalies_node)
    workflow.add_node("stage_verdict", _stage_verdict_node)

    workflow.add_edge(START, "normalize_sku")
    workflow.add_edge("normalize_sku", "detect_spec_conflicts")
    workflow.add_edge("detect_spec_conflicts", "detect_price_anomalies")
    workflow.add_edge("detect_price_anomalies", "stage_verdict")
    workflow.add_edge("stage_verdict", END)
    return workflow.compile()


ENTITY_QA_GRAPH = _build_entity_qa_graph()


def run_entity_qa(
    req: EntityQaRequest,
    reference_listings: Optional[List[ListingModel]] = None,
) -> EntityQaResponse:
    refs = reference_listings if reference_listings is not None else build_catalog_snapshot().listings
    res = ENTITY_QA_GRAPH.invoke({"request": req, "reference_listings": refs})
    return EntityQaResponse(
        readyForBatchApprove=res["ready"],
        flaggedForReview=res["flagged"],
        mode=res["mode"],
    )
