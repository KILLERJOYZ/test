import re
from typing import Any, Dict, List, Optional, Tuple

from backend.schemas import AdviceContextModel, AdviceResponse, ListingModel, RequirementsModel
from backend.services.catalog_service import assess_listing

def compute_listing_evidence(v: ListingModel) -> Dict[str, Any]:
    """Phát hiện mâu thuẫn giữa tiêu đề và thông số kỹ thuật."""
    name = v.name or ""
    pair_match = re.search(r'(\d+)\s*GB\s*[,/]\s*(\d+)\s*(GB|TB)', name, re.IGNORECASE)
    title_ram = int(pair_match.group(1)) if pair_match else None
    title_storage = None
    if pair_match:
        num = int(pair_match.group(2))
        unit = pair_match.group(3).upper()
        title_storage = num * 1024 if unit == "TB" else num

    conflicts: List[str] = []
    ram_conflict = title_ram is not None and v.ram is not None and title_ram != v.ram
    storage_conflict = title_storage is not None and v.storage is not None and title_storage != v.storage

    if ram_conflict:
        conflicts.append(f"RAM mâu thuẫn: tiêu đề {title_ram} GB, dữ liệu {v.ram} GB")
    if storage_conflict:
        conflicts.append(f"Ổ lưu trữ mâu thuẫn: tiêu đề {title_storage} GB, dữ liệu {v.storage} GB")

    return {
        "ram": None if ram_conflict else v.ram,
        "storage": None if storage_conflict else v.storage,
        "conflicts": conflicts,
    }

def format_vnd(amount: Optional[int]) -> str:
    if amount is None:
        return "chưa rõ"
    # Format dạng 22.990.000 ₫
    formatted = f"{amount:,}".replace(",", ".")
    return f"{formatted} ₫"

def generate_allowed_facts(v: ListingModel, r: RequirementsModel) -> Dict[str, str]:
    """Sinh tập dữ kiện có kiểm chứng bắt buộc theo chuẩn BR-07."""
    a = assess_listing(v, r)
    evidence = compute_listing_evidence(v)

    spec_conflicts = ("; " + "; ".join(evidence["conflicts"])) if evidence["conflicts"] else ""
    ram_text = f"{evidence['ram']} GB" if evidence["ram"] is not None else "chưa xác minh"
    storage_text = f"{evidence['storage']} GB" if evidence["storage"] is not None else "chưa xác minh"
    cpu_text = v.cpu if v.cpu else "chưa rõ"
    spec_line = f"RAM: {ram_text}; ổ: {storage_text}; CPU: {cpu_text}.{spec_conflicts}".strip()

    fit_line = "; ".join(a["failed"]) if a["failed"] else "Chưa đủ bằng chứng kết luận phù hợp tác vụ."

    return {
        "identity": f"{v.name}: định danh cấu hình chưa kiểm duyệt.",
        "price": f"Giá niêm yết lịch sử: {format_vnd(v.advertisedPrice)}; quan sát {v.observedAt}. Chưa xác nhận giá hiện tại.",
        "cost": "Phí giao hàng, phí bắt buộc, tồn kho và khả năng chi trả: chưa xác minh.",
        "spec": spec_line,
        "fit": fit_line,
        "source": f"Nguồn: {v.source} — {v.url}",
    }

def extract_proposal_from_message(message: str, current: RequirementsModel) -> Optional[RequirementsModel]:
    """Phát hiện ý định thay đổi nhu cầu từ câu hỏi của người dùng."""
    text = message.lower()
    changed = False
    budget = current.budget
    min_ram = current.minRam
    min_storage = current.minStorage
    tasks = list(current.tasks)

    # Phát hiện ngân sách: ví dụ 'ngân sách 30 triệu', '30tr', '25 triệu'
    budget_match = re.search(r'(\d+)\s*(triệu|tr)', text)
    if budget_match:
        val = int(budget_match.group(1)) * 1_000_000
        if 1_000_000 <= val <= 1_000_000_000:
            budget = val
            changed = True

    # Phát hiện RAM: ví dụ 'ram 16gb', '16 gb ram', 'ram 32'
    ram_match = re.search(r'(?:ram\s*(\d+)|(\d+)\s*gb\s*ram)', text)
    if ram_match:
        val = int(ram_match.group(1) or ram_match.group(2))
        if val in (8, 16, 32, 64):
            min_ram = val
            changed = True

    # Phát hiện SSD / Ổ cứng: ví dụ 'ssd 512', 'ổ 1tb'
    ssd_match = re.search(r'(?:ssd|ổ|lưu trữ)\s*(\d+)\s*(gb|tb)?', text)
    if ssd_match:
        num = int(ssd_match.group(1))
        unit = (ssd_match.group(2) or "gb").lower()
        val = num * 1024 if unit == "tb" else num
        if val in (256, 512, 1024, 2048):
            min_storage = val
            changed = True

    # Phát hiện tác vụ
    task_keywords = {
        "lập trình": "Lập trình",
        "code": "Lập trình",
        "văn phòng": "Văn phòng & học tập",
        "học tập": "Văn phòng & học tập",
        "thiết kế": "Thiết kế",
        "đồ họa": "Thiết kế",
        "máy ảo": "Máy ảo",
        "vm": "Máy ảo",
        "chơi game": "Chơi game",
        "gaming": "Chơi game",
    }
    for kw, task_name in task_keywords.items():
        if kw in text and task_name not in tasks and len(tasks) < 5:
            tasks.append(task_name)
            changed = True

    if changed:
        return RequirementsModel(
            budget=budget,
            minRam=min_ram,
            minStorage=min_storage,
            os=current.os,
            tasks=tasks,
        )
    return None

def generate_advice_response(
    listing: ListingModel,
    requirements: RequirementsModel,
    message: str,
    context: AdviceContextModel,
) -> AdviceResponse:
    """Tạo phản hồi tư vấn chuẩn chỉ dùng facts có kiểm chứng."""
    allowed = generate_allowed_facts(listing, requirements)
    msg = message.lower()

    selected_keys: List[str] = []

    # Chọn factIds phù hợp dựa trên ngữ cảnh câu hỏi
    if any(k in msg for k in ["giá", "tiền", "chi phí", "rẻ", "đắt", "ngân sách", "bao nhiêu"]):
        selected_keys.extend(["price", "cost"])

    if any(k in msg for k in ["cấu hình", "ram", "cpu", "ổ", "ssd", "chip", "màn hình", "thông số"]):
        if "spec" not in selected_keys:
            selected_keys.append("spec")
        if "identity" not in selected_keys:
            selected_keys.append("identity")

    if any(k in msg for k in ["hợp", "phù hợp", "đủ", "được không", "tác vụ", "dùng", "chơi", "học"]):
        if "fit" not in selected_keys:
            selected_keys.append("fit")
        if "spec" not in selected_keys:
            selected_keys.append("spec")

    if not selected_keys:
        selected_keys = ["fit", "spec", "price"]

    # Đảm bảo không trùng và tối đa 6 facts
    unique_keys = list(dict.fromkeys(selected_keys))[:6]
    text_result = "\n\n".join(allowed[k] for k in unique_keys)

    proposal = extract_proposal_from_message(message, requirements)

    return AdviceResponse(
        context=context,
        text=text_result,
        proposal=proposal,
        mode="provider",
    )
