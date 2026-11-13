import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Header, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import API_HOST, API_PORT, API_TOKEN
from backend.db import fetch_laptop_by_id, fetch_laptop_count, fetch_latest_crawled_at, query_laptops
from backend.schemas import (
    AdviceRequest,
    AdviceResponse,
    CatalogResponse,
    CompareRequest,
    CompareResponse,
    HealthResponse,
    ListingModel,
)
from backend.services.advice_service import generate_advice_response
from backend.services.catalog_service import (
    assess_listing,
    build_catalog_snapshot,
    row_to_listing,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [FastAPI] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("backend.main")

app = FastAPI(
    title="Laptop Adviser API",
    description="Backend API kết nối PostgreSQL local và cung cấp dữ liệu cho ứng dụng Lựa Adviser.",
    version="1.0.0",
)

# Cấu hình CORS mở cho Expo Android, React Native Web và Localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_token(authorization: Optional[str] = Header(None)):
    """Xác thực Bearer token nếu hệ thống có cấu hình ADVISER_TOKEN."""
    if API_TOKEN:
        if not authorization or authorization != f"Bearer {API_TOKEN}":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "UNAUTHORIZED"},
            )

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Kiểm tra tình trạng sống của API, PostgreSQL và số lượng laptop."""
    count = fetch_laptop_count()
    return HealthResponse(
        status="ok",
        db="connected" if count > 0 else "empty",
        laptopCount=count,
        ai="rules_fallback",
        refresh="postgresql",
        checkedAt=datetime.now(timezone.utc).isoformat(),
    )

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
    except Exception as e:
        logger.exception("Lỗi khi xây dựng catalog: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "SOURCE_UNAVAILABLE"},
        )

@app.get("/v1/laptops")
def search_laptops(
    q: str = Query("", description="Từ khóa tìm kiếm"),
    source: str = Query("", description="Nguồn bán lẻ (cellphones, fptshop, ...)"),
    brand: str = Query("", description="Hãng sản xuất (Lenovo, ASUS, ...)"),
    max_price: Optional[int] = Query(None, description="Trần giá tối đa"),
    min_ram: Optional[int] = Query(None, description="RAM tối thiểu (GB)"),
    min_storage: Optional[int] = Query(None, description="Ổ cứng tối thiểu (GB)"),
    sort: str = Query("price", description="Sắp xếp: price, name, price_desc"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Truy vấn tìm kiếm, lọc và phân trang danh sách laptop từ PostgreSQL."""
    data = query_laptops(
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
    items = [row_to_listing(r).model_dump() for r in data["items"]]
    return {"total": data["total"], "items": items}

@app.get("/v1/laptops/{laptop_id}", response_model=ListingModel)
def get_laptop_detail(laptop_id: str):
    """Lấy thông tin chi tiết một laptop theo ID."""
    row = fetch_laptop_by_id(laptop_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND"},
        )
    return row_to_listing(row)

@app.post("/v1/compare", response_model=CompareResponse)
def compare_laptops(req: CompareRequest):
    """Đối chiếu 2 cấu hình laptop dựa trên bộ Requirements."""
    items: list[ListingModel] = []
    assessments: list[dict] = []

    for lid in req.ids:
        row = fetch_laptop_by_id(lid)
        if row:
            listing = row_to_listing(row)
            items.append(listing)
            assessments.append(assess_listing(listing, req.requirements))

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
    catalog = build_catalog_snapshot()

    # Kiểm tra catalogRevision
    if req.context.catalogRevision != catalog.revision:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": "STALE_CATALOG"},
        )

    # Tìm laptop theo focusId
    row = fetch_laptop_by_id(req.context.focusId)
    if not row:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"code": "INVALID_INPUT"},
        )

    listing = row_to_listing(row)
    advice = generate_advice_response(
        listing=listing,
        requirements=req.requirements,
        message=req.message,
        context=req.context,
    )
    return advice

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=API_HOST, port=API_PORT, reload=True)
