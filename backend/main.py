from contextlib import closing
from datetime import datetime, timezone
import json
import logging
import secrets
import sqlite3
from threading import Lock
import time
from typing import Dict, List, Optional, Tuple
import uuid

from fastapi import FastAPI, Header, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from backend.config import API_HOST, API_PORT, API_TOKEN, DEMO_INSECURE_NO_AUTH
from backend.db import fetch_laptop_count
from backend.schemas import (
    AdviceRequest,
    AdviceResponse,
    CatalogResponse,
    CompareRequest,
    CompareResponse,
    CopilotRequest,
    CopilotResponse,
    EntityQaRequest,
    EntityQaResponse,
    HealthResponse,
    ListingModel,
    ProactiveRequest,
    ProactiveResponse,
    ReportRecord,
    ReportRequest,
    ReportResponse,
    ReviewSynthesisResponse,
    ReviewSynthesizeRequest,
)
from backend.services import device_catalog
from backend.services.advice_service import generate_advice_response
from backend.services.ai_gateway import is_online_ai_available
from backend.services.catalog_service import (
    assess_listing,
    build_catalog_snapshot,
    get_listing_by_id,
    search_catalog_laptops,
)
from backend.services.langgraph_copilot import run_copilot_picker
from backend.services.langgraph_entity_qa import run_entity_qa
from backend.services.langgraph_proactive import run_proactive_copilot
from backend.services.langgraph_reviews import (
    get_review_for_listing,
    synthesize_and_store_review,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [FastAPI] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("backend.main")

app = FastAPI(
    title="Lựa Device Adviser API",
    description="Backend API cung cấp danh mục kiểm chứng, so sánh và trợ lý AI LangGraph cho Lựa Adviser.",
    version="0.6.0",
)

# F-02: Strict localhost/loopback CORS without credentialed wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def structured_http_exception_handler(_request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content={**exc.detail, "detail": exc.detail},
        )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


def verify_token(authorization: Optional[str] = Header(None)) -> None:
    """F-01: Xác thực Bearer token hằng thời gian (timing-safe) khi ADVISER_TOKEN được cấu hình."""
    if API_TOKEN:
        expected = f"Bearer {API_TOKEN}".encode("utf-8")
        provided = (authorization or "").encode("utf-8")
        matched = secrets.compare_digest(provided, expected)
        if not authorization or not matched:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "UNAUTHORIZED"},
            )


def enforce_cli_auth_policy(
    token: Optional[str] = None,
    demo_no_auth: Optional[bool] = None,
) -> None:
    """F-01: Fail-closed khi khởi chạy máy chủ CLI mà không cấu hình ADVISER_TOKEN."""
    effective_token = API_TOKEN if token is None else token
    effective_demo = DEMO_INSECURE_NO_AUTH if demo_no_auth is None else demo_no_auth
    if not effective_token and not effective_demo:
        raise RuntimeError("ADVISER_TOKEN is required unless DEMO_INSECURE_NO_AUTH=1 is set")


# --- F-20: Report Rate Limit & Duplicate Suppression ---
REPORT_MAX_BODY_BYTES = 4000
REPORT_RATE_LIMIT_MAX = 10
REPORT_RATE_LIMIT_WINDOW_SEC = 60.0
REPORT_DEDUP_WINDOW_SEC = 300.0

_report_guard_lock = Lock()
_report_ip_hits: Dict[str, List[float]] = {}
_report_recent_fingerprints: Dict[Tuple[str, str, str], float] = {}


def reset_report_guards() -> None:
    """Xóa bộ đếm giới hạn tốc độ và chống trùng báo cáo (phục vụ kiểm thử đơn vị)."""
    with _report_guard_lock:
        _report_ip_hits.clear()
        _report_recent_fingerprints.clear()


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Kiểm tra tình trạng sống của API, nguồn dữ liệu và số lượng laptop."""
    try:
        source = device_catalog.catalog_source()
        if source == "postgresql":
            count = fetch_laptop_count()
            db_state = "connected" if count > 0 else "empty"
        else:
            count = sum(
                r.get("category", "laptop") == "laptop"
                for r in device_catalog.catalog_rows()
            )
            db_state = "not_required"
    except Exception as exc:
        logger.exception("Health check source failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )

    return HealthResponse(
        status="ok",
        db=db_state,
        laptopCount=count,
        ai="hybrid_langgraph_chatgpt" if is_online_ai_available() else "rules_fallback",
        refresh=source,
        checkedAt=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/advisor/v1/manifest")
def device_manifest(authorization: Optional[str] = Header(None)):
    verify_token(authorization)
    try:
        return device_catalog.signed_snapshot()
    except Exception:
        logger.exception("Device catalog unavailable")
        raise HTTPException(503, detail={"code": "CATALOG_UNAVAILABLE"})


@app.get("/advisor/v1/catalogs/{version}/bundle")
def device_bundle(version: str, authorization: Optional[str] = Header(None)):
    verify_token(authorization)
    payload = device_catalog.get_snapshot(version)
    if payload is None:
        raise HTTPException(409, detail={"code": "STALE_CATALOG"})
    return Response(content=payload, media_type="application/json")


@app.get("/v1/catalog", response_model=CatalogResponse)
def get_catalog(authorization: Optional[str] = Header(None)):
    """Trả về toàn bộ danh mục laptop theo chuẩn CatalogModel của Frontend."""
    verify_token(authorization)
    try:
        catalog = build_catalog_snapshot()
        return CatalogResponse(
            catalog=catalog,
            checkedAt=datetime.now(timezone.utc).isoformat(),
            sourceState="repository_snapshot",
        )
    except Exception as exc:
        logger.exception("Lỗi khi xây dựng catalog: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.get("/v1/laptops")
def search_laptops(
    authorization: Optional[str] = Header(None),
    q: str = Query("", description="Từ khóa tìm kiếm"),
    source: str = Query("", description="Nguồn bán lẻ (cellphones, fptshop, ...)"),
    brand: str = Query("", description="Hãng sản xuất (Lenovo, ASUS, ...)"),
    max_price: Optional[int] = Query(None, description="Trần giá tối đa"),
    min_ram: Optional[int] = Query(None, description="RAM tối thiểu (GB)"),
    min_storage: Optional[int] = Query(None, description="Ổ cứng tối thiểu (GB)"),
    sort: str = Query("price", description="Sắp xếp: price, total, fit, name, price_desc"),
    limit: int = Query(12, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Truy vấn tìm kiếm, lọc và phân trang danh sách laptop từ repository hoặc PostgreSQL."""
    verify_token(authorization)
    if sort not in ("price", "total", "fit", "name", "price_desc"):
        sort = "price"
    try:
        return search_catalog_laptops(
            q=q,
            source=source,
            brand=brand,
            max_price=max_price,
            min_ram=min_ram,
            min_storage=min_storage,
            sort=sort,
            limit=limit,
            offset=offset,
        )
    except Exception as exc:
        logger.exception("Lỗi truy vấn danh sách laptop: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.get("/v1/laptops/{laptop_id}", response_model=ListingModel)
def get_laptop_detail(laptop_id: str, authorization: Optional[str] = Header(None)):
    """Lấy thông tin chi tiết một laptop theo ID."""
    verify_token(authorization)
    try:
        listing = get_listing_by_id(laptop_id)
    except Exception as exc:
        logger.exception("Lỗi truy vấn chi tiết laptop: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND"},
        )
    return listing


@app.post("/v1/compare", response_model=CompareResponse)
def compare_laptops(req: CompareRequest, authorization: Optional[str] = Header(None)):
    """Đối chiếu tối đa 4 cấu hình laptop dựa trên bộ Requirements (UI-04)."""
    verify_token(authorization)
    items: List[ListingModel] = []
    assessments: List[dict] = []

    try:
        for lid in req.ids:
            listing = get_listing_by_id(lid)
            if listing:
                items.append(listing)
                assessments.append(assess_listing(listing, req.requirements))
    except Exception as exc:
        logger.exception("Lỗi đối chiếu laptop: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )

    summary = f"Đối chiếu {len(items)} cấu hình laptop trên ngân sách {req.requirements.budget:,} ₫."
    return CompareResponse(
        items=items,
        assessments=assessments,
        summary=summary,
    )


@app.post("/v1/advice", response_model=AdviceResponse)
def get_advice(req: AdviceRequest, authorization: Optional[str] = Header(None)):
    """Tư vấn về laptop đang xem, kiểm soát tính xác thực của dữ kiện (BR-07)."""
    verify_token(authorization)
    try:
        catalog = build_catalog_snapshot()
    except Exception as exc:
        logger.exception("Lỗi nguồn catalog khi tư vấn: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )

    if req.context.catalogRevision != catalog.revision:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": "STALE_CATALOG"},
        )

    try:
        listing = get_listing_by_id(req.context.focusId)
    except Exception as exc:
        logger.exception("Lỗi truy vấn focusId khi tư vấn: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )

    if not listing:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"code": "INVALID_INPUT"},
        )

    return generate_advice_response(
        listing=listing,
        requirements=req.requirements,
        message=req.message,
        context=req.context,
    )


@app.post("/v1/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(request: Request, authorization: Optional[str] = Header(None)):
    """Tiếp nhận báo cáo sai lệch thông tin tin đăng có bảo vệ chống spam & trùng lặp (BR-08 / F-20)."""
    verify_token(authorization)

    raw_body = await request.body()
    if len(raw_body) > REPORT_MAX_BODY_BYTES:
        return JSONResponse(
            status_code=getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413),
            content={"code": "INVALID_REPORT"},
        )

    try:
        parsed_json = json.loads(raw_body.decode("utf-8"))
        req = ReportRequest.model_validate(parsed_json)
    except (UnicodeDecodeError, json.JSONDecodeError, ValidationError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"code": "INVALID_REPORT"},
        )

    client_ip = request.client.host if request.client else "unknown"
    fingerprint = (req.listingId.strip(), req.category, req.note.strip())
    now_mono = time.monotonic()

    with _report_guard_lock:
        # 1. Per-IP sliding-window rate limit (10 requests / 60s)
        recent_hits = [
            ts for ts in _report_ip_hits.get(client_ip, [])
            if (now_mono - ts) < REPORT_RATE_LIMIT_WINDOW_SEC
        ]
        if len(recent_hits) >= REPORT_RATE_LIMIT_MAX:
            _report_ip_hits[client_ip] = recent_hits
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"code": "RATE_LIMITED"},
            )
        recent_hits.append(now_mono)
        _report_ip_hits[client_ip] = recent_hits

        # 2. 5-minute duplicate suppression
        expired_keys = [
            k for k, ts in _report_recent_fingerprints.items()
            if (now_mono - ts) >= REPORT_DEDUP_WINDOW_SEC
        ]
        for k in expired_keys:
            _report_recent_fingerprints.pop(k, None)

        if fingerprint in _report_recent_fingerprints:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"code": "DUPLICATE_REPORT"},
            )
        _report_recent_fingerprints[fingerprint] = now_mono

    report = ReportRecord(
        id=f"rep-{uuid.uuid4().hex[:8]}",
        listingId=req.listingId.strip(),
        category=req.category,
        note=req.note.strip(),
        status="open",
        createdAt=datetime.now(timezone.utc).isoformat(),
    )

    report_db = device_catalog.APP / ".expo/reports.sqlite"
    report_db.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(report_db)) as db, db:
        db.execute("CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY, payload TEXT NOT NULL)")
        db.execute("INSERT INTO reports VALUES (?,?)", (report.id, report.model_dump_json()))

    return ReportResponse(report=report)


# --- Phase 4: Hybrid Online/Offline LangGraph AI Endpoints ---


@app.post("/advisor/v1/copilot", response_model=CopilotResponse)
def copilot_picker_endpoint(req: CopilotRequest, authorization: Optional[str] = Header(None)):
    """STT 2.0: Trợ lý hội thoại chọn mua laptop (LangGraph + ChatGPT/Nano)."""
    verify_token(authorization)
    try:
        return run_copilot_picker(req)
    except Exception as exc:
        logger.exception("Lỗi thực thi Copilot Picker: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.post("/advisor/v1/proactive", response_model=ProactiveResponse)
def proactive_copilot_endpoint(req: ProactiveRequest, authorization: Optional[str] = Header(None)):
    """STT 3.0: Trợ lý chủ động phát hiện điểm mù cấu hình, phân vân & vượt ngân sách."""
    verify_token(authorization)
    try:
        return run_proactive_copilot(req)
    except Exception as exc:
        logger.exception("Lỗi thực thi Proactive Copilot: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.get("/v1/reviews/{listing_id}", response_model=ReviewSynthesisResponse)
def get_listing_review_endpoint(listing_id: str, authorization: Optional[str] = Header(None)):
    """STT 4.0: Truy xuất tổng hợp đánh giá thực tế 4 nhóm hoặc baseline từ thông số niêm yết."""
    verify_token(authorization)
    try:
        return get_review_for_listing(listing_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND"},
        )
    except Exception as exc:
        logger.exception("Lỗi truy vấn đánh giá cho %s: %s", listing_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.post("/v1/admin/reviews/synthesize", response_model=ReviewSynthesisResponse)
def synthesize_review_endpoint(
    req: ReviewSynthesizeRequest,
    authorization: Optional[str] = Header(None),
):
    """STT 4.0: Tổng hợp bài đánh giá độc lập qua cổng chống nhầm SKU (verify_sku_match)."""
    verify_token(authorization)
    try:
        return synthesize_and_store_review(req)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND"},
        )
    except Exception as exc:
        logger.exception("Lỗi tổng hợp bài đánh giá: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


@app.post("/v1/admin/listings/qa-stage", response_model=EntityQaResponse)
def qa_stage_listings_endpoint(
    req: EntityQaRequest,
    authorization: Optional[str] = Header(None),
):
    """STT 23.0: Chuẩn hóa mã SKU, phát hiện xung đột thông số và bất thường giá (>25%)."""
    verify_token(authorization)
    try:
        return run_entity_qa(req)
    except Exception as exc:
        logger.exception("Lỗi kiểm duyệt QA tin cào: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )


if __name__ == "__main__":
    enforce_cli_auth_policy()
    import uvicorn

    uvicorn.run("backend.main:app", host=API_HOST, port=API_PORT, reload=True)
