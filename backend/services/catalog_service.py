import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.db import fetch_all_laptops_raw, fetch_laptop_by_id
from backend.schemas import CatalogModel, ListingModel, RequirementsModel

def parse_quantity(val: Any, is_storage: bool = False) -> Optional[int]:
    """Trích xuất số lượng GB từ chuỗi (ví dụ: '16GB', '512GB SSD', '1 TB')."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return int(val)
    s = str(val).strip()
    match = re.search(r'(\d+(?:\.\d+)?)\s*(GB|TB)', s, re.IGNORECASE)
    if not match:
        return None
    num = float(match.group(1))
    unit = match.group(2).upper()
    total_gb = int(num * 1024 if (is_storage and unit == "TB") else num)
    return total_gb if total_gb >= 0 else None

def ensure_https_url(url: Optional[str], default_domain: str = "example.com") -> str:
    """Đảm bảo URL hợp lệ theo điều kiện safeLink của Frontend (protocol https)."""
    if not url:
        return f"https://{default_domain}"
    url_str = str(url).strip()
    if url_str.startswith("http://"):
        url_str = "https://" + url_str[7:]
    elif not url_str.startswith("https://"):
        url_str = "https://" + url_str.lstrip("/")
    return url_str

def row_to_listing(row: Dict[str, Any]) -> ListingModel:
    """Chuyển đổi một bản ghi PostgreSQL sang ListingModel."""
    source = row.get("source") or "unknown"
    raw_id = str(row["id"])
    full_id = f"{source}:{raw_id}" if not raw_id.startswith(f"{source}:") else raw_id

    crawled_at = row.get("crawled_at")
    if isinstance(crawled_at, datetime):
        observed_at = crawled_at.isoformat()
    elif crawled_at:
        observed_at = str(crawled_at)
    else:
        observed_at = datetime.now(timezone.utc).isoformat()

    price = row.get("price_current")
    advertised_price = int(price) if (price is not None and int(price) > 0) else None

    cond = row.get("condition") or "new"
    if cond not in ("new", "used", "unknown"):
        cond = "new"

    # Tạo rawHash ổn định
    hash_payload = {
        "id": full_id,
        "name": row.get("name"),
        "source": source,
        "price": advertised_price,
        "sku": row.get("sku"),
    }
    raw_hash = hashlib.sha256(json.dumps(hash_payload, sort_keys=True).encode("utf-8")).hexdigest()

    price_orig = row.get("price_original")
    disc = row.get("discount_percent")
    rating_avg = row.get("rating_average")

    raw_images = row.get("images")
    if isinstance(raw_images, str):
        try:
            raw_images = json.loads(raw_images)
        except Exception:
            raw_images = []
    elif not isinstance(raw_images, list):
        raw_images = []

    media_obj = row.get("media")
    if isinstance(media_obj, str):
        try:
            media_obj = json.loads(media_obj)
        except Exception:
            media_obj = {}
    elif not isinstance(media_obj, dict):
        media_obj = {}

    thumb = row.get("thumbnail") or media_obj.get("thumbnail") or (raw_images[0] if raw_images else None)
    if not raw_images and media_obj.get("images"):
        raw_images = media_obj.get("images")
    if thumb and thumb not in raw_images:
        raw_images.insert(0, thumb)

    full_media = {
        "thumbnail": thumb,
        "images": raw_images,
    }

    return ListingModel(
        id=full_id,
        name=str(row.get("name") or "Laptop"),
        source=source,
        url=ensure_https_url(row.get("url"), f"{source}.vn"),
        condition=cond,
        observedAt=observed_at,
        ram=parse_quantity(row.get("ram"), is_storage=False),
        storage=parse_quantity(row.get("storage"), is_storage=True),
        cpu=row.get("cpu"),
        os=row.get("os"),
        screen=row.get("screen"),
        weight=row.get("weight"),
        advertisedPrice=advertised_price,
        shipping=None,
        fees=None,
        stock="unknown",
        identity="unreviewed",
        rawHash=raw_hash,
        brand=row.get("brand"),
        model=row.get("model"),
        gpu=row.get("gpu"),
        battery=row.get("battery"),
        thumbnail=thumb,
        images=raw_images,
        media=full_media,
        priceOriginal=int(price_orig) if price_orig is not None else None,
        discountPercent=float(disc) if disc is not None else None,
        installment=row.get("installment"),
        ratingAverage=float(rating_avg) if rating_avg is not None else None,
        ratingCount=row.get("rating_count") or 0,
        availability=row.get("availability") or "in_stock",
    )

def build_catalog_snapshot() -> CatalogModel:
    """Tạo toàn bộ đối tượng CatalogModel từ dữ liệu PostgreSQL hiện tại."""
    rows = fetch_all_laptops_raw()
    listings = [row_to_listing(r) for r in rows]

    # Tính revision hash từ toàn bộ danh sách listings
    serialized = json.dumps([l.model_dump() for l in listings], sort_keys=True)
    revision = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
    imported_at = datetime.now(timezone.utc).isoformat()

    return CatalogModel(
        schemaVersion=1,
        revision=revision,
        importedAt=imported_at,
        listings=listings,
    )

def assess_listing(listing: ListingModel, r: RequirementsModel) -> Dict[str, Any]:
    """Đánh giá độ phù hợp của máy đối với bộ Requirements."""
    failed: List[str] = []
    unknown: List[str] = [
        "Chưa kiểm duyệt định danh cấu hình",
        "Chưa xác nhận tồn kho và giá hiện tại",
    ]

    if r.minRam > 0:
        if listing.ram is None:
            unknown.append("Chưa rõ RAM")
        elif listing.ram < r.minRam:
            failed.append(f"RAM {listing.ram}GB dưới yêu cầu tối thiểu {r.minRam}GB")

    if r.minStorage > 0:
        if listing.storage is None:
            unknown.append("Chưa rõ dung lượng ổ")
        elif listing.storage < r.minStorage:
            failed.append(f"Ổ lưu trữ {listing.storage}GB dưới yêu cầu tối thiểu {r.minStorage}GB")

    if r.os and r.os.strip():
        req_os = r.os.strip().lower()
        if not listing.os:
            unknown.append("Chưa rõ hệ điều hành")
        elif req_os not in listing.os.lower():
            failed.append(f"Hệ điều hành ({listing.os}) không khớp yêu cầu ({r.os})")

    if listing.advertisedPrice is not None and listing.advertisedPrice > r.budget:
        failed.append(f"Giá niêm yết ({listing.advertisedPrice:,} ₫) vượt ngân sách trần ({r.budget:,} ₫)")

    if r.tasks:
        unknown.append("Chưa có bằng chứng năng lực thực tế cho tác vụ đã chọn")

    state = "excluded" if failed else "needs_verification"
    return {
        "state": state,
        "failed": failed,
        "unknown": unknown,
        "total": listing.advertisedPrice,
        "affordability": "within_budget" if (listing.advertisedPrice and listing.advertisedPrice <= r.budget) else "unknown",
    }
