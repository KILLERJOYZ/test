from contextlib import contextmanager
import logging
from threading import Lock
from typing import Any, Dict, Generator, List, Optional

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

from backend.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER

logger = logging.getLogger("backend.db")

_pool: Optional[pool.ThreadedConnectionPool] = None
_pool_lock = Lock()
_table_ensured = False


def _get_pool() -> pool.ThreadedConnectionPool:
    """Khởi tạo lười (lazy) ThreadedConnectionPool tới PostgreSQL."""
    global _pool
    if _pool is None or _pool.closed:
        with _pool_lock:
            if _pool is None or _pool.closed:
                _pool = pool.ThreadedConnectionPool(
                    minconn=1,
                    maxconn=10,
                    host=DB_HOST,
                    port=DB_PORT,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    dbname=DB_NAME,
                    connect_timeout=5,
                )
    return _pool


def close_pool() -> None:
    """Đóng toàn bộ kết nối trong pool (phục vụ dọn dẹp / kiểm thử)."""
    global _pool, _table_ensured
    with _pool_lock:
        if _pool is not None and not _pool.closed:
            _pool.closeall()
        _pool = None
        _table_ensured = False


@contextmanager
def get_connection() -> Generator[Any, None, None]:
    """Lấy kết nối từ ThreadedConnectionPool và hoàn trả an toàn qua putconn()."""
    conn_pool = _get_pool()
    conn = conn_pool.getconn()
    try:
        yield conn
    except Exception:
        if conn is not None and not getattr(conn, "closed", 1):
            try:
                conn.rollback()
            except Exception:
                pass
        raise
    finally:
        if conn is not None:
            conn_pool.putconn(conn, close=bool(getattr(conn, "closed", 0)))


def ensure_laptops_table() -> int:
    """Đảm bảo bảng public.laptops có dữ liệu từ public_public nếu trống."""
    global _table_ensured
    if _table_ensured:
        return 1
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.laptops;")
            count = cur.fetchone()[0]
            if count > 0:
                _table_ensured = True
                return count

            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public_public' AND table_name = 'laptops'
                );
            """)
            pp_exists = cur.fetchone()[0]
            if pp_exists:
                cur.execute("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'laptops';
                """)
                cols_public = set(r[0] for r in cur.fetchall())

                cur.execute("""
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_schema = 'public_public' AND table_name = 'laptops';
                """)
                cols_pp = set(r[0] for r in cur.fetchall())

                common = [c for c in cols_public if c in cols_pp and c not in ("created_at", "updated_at")]
                if common:
                    cols_sql = ", ".join(f'"{c}"' for c in common)
                    cur.execute(f"""
                        INSERT INTO public.laptops ({cols_sql})
                        SELECT {cols_sql} FROM public_public.laptops
                        ON CONFLICT (id) DO NOTHING;
                    """)
                    conn.commit()
                    cur.execute("SELECT COUNT(*) FROM public.laptops;")
                    new_count = cur.fetchone()[0]
                    logger.info("Đã đồng bộ %d bản ghi từ public_public.laptops sang public.laptops.", new_count)
                    _table_ensured = True
                    return new_count
            _table_ensured = True
            return count


def fetch_laptop_count() -> int:
    """Đếm tổng số laptop hiện có trong bảng public.laptops."""
    ensure_laptops_table()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM public.laptops;")
            return cur.fetchone()[0]


def fetch_latest_crawled_at() -> Optional[str]:
    """Lấy thời điểm crawl mới nhất trong CSDL."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT MAX(crawled_at) FROM public.laptops;")
            res = cur.fetchone()[0]
            return res.isoformat() if res else None


def fetch_all_laptops_raw() -> List[Dict[str, Any]]:
    """Truy vấn toàn bộ danh sách laptop để tạo Catalog."""
    ensure_laptops_table()
    query = """
        SELECT 
            id, source, sku, name, brand, model, url, condition, availability,
            price_current, price_original, discount_percent, installment,
            cpu, ram, storage, gpu, screen, battery, weight, os,
            thumbnail, images, categories, rating_average, rating_count,
            crawled_at, embedding_text
        FROM public.laptops
        ORDER BY price_current ASC NULLS LAST, id ASC;
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return [dict(r) for r in cur.fetchall()]


def fetch_laptop_by_id(laptop_id: str) -> Optional[Dict[str, Any]]:
    """Lấy thông tin 1 laptop theo ID (hoặc id sau dấu hai chấm nếu truyền source:id)."""
    ensure_laptops_table()
    clean_id = laptop_id.split(":")[-1] if ":" in laptop_id else laptop_id
    query = """
        SELECT 
            id, source, sku, name, brand, model, url, condition, availability,
            price_current, price_original, discount_percent, installment,
            cpu, ram, storage, gpu, screen, battery, weight, os,
            thumbnail, images, categories, rating_average, rating_count,
            crawled_at, embedding_text
        FROM public.laptops
        WHERE id = %s OR id = %s
        LIMIT 1;
    """
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (laptop_id, clean_id))
            row = cur.fetchone()
            return dict(row) if row else None


_SQL_RAM_GB_EXPR = """
(CASE
    WHEN COALESCE(ram::text, '') ~* '([0-9]+)\\s*GB'
        THEN substring(UPPER(ram::text) FROM '([0-9]+)\\s*GB')::int
    WHEN trim(COALESCE(ram::text, '')) ~ '^[0-9]+$'
        THEN trim(ram::text)::int
    ELSE NULL
END)
"""

_SQL_STORAGE_GB_EXPR = """
(CASE
    WHEN COALESCE(storage::text, '') ~* '([0-9]+(?:\\.[0-9]+)?)\\s*TB'
        THEN FLOOR(substring(UPPER(storage::text) FROM '([0-9]+(?:\\.[0-9]+)?)\\s*TB')::numeric * 1024)::int
    WHEN COALESCE(storage::text, '') ~* '([0-9]+)\\s*GB'
        THEN substring(UPPER(storage::text) FROM '([0-9]+)\\s*GB')::int
    WHEN trim(COALESCE(storage::text, '')) ~ '^[0-9]+$'
        THEN trim(storage::text)::int
    ELSE NULL
END)
"""


def query_laptops(
    q: str = "",
    source: str = "",
    brand: str = "",
    max_price: Optional[int] = None,
    min_ram: Optional[int] = None,
    min_storage: Optional[int] = None,
    sort: str = "price",
    limit: int = 12,
    offset: int = 0,
) -> Dict[str, Any]:
    """Tìm kiếm và lọc laptop linh hoạt với phân trang."""
    ensure_laptops_table()
    conditions: List[str] = []
    params: List[Any] = []

    if source:
        conditions.append("source = %s")
        params.append(source)

    if brand:
        conditions.append("LOWER(brand) = LOWER(%s)")
        params.append(brand)

    if max_price is not None and max_price > 0:
        conditions.append("price_current <= %s")
        params.append(max_price)

    if min_ram is not None and min_ram > 0:
        conditions.append(f"{_SQL_RAM_GB_EXPR} >= %s")
        params.append(min_ram)

    if min_storage is not None and min_storage > 0:
        conditions.append(f"{_SQL_STORAGE_GB_EXPR} >= %s")
        params.append(min_storage)

    if q.strip():
        term = f"%{q.strip().lower()}%"
        conditions.append("""
            (LOWER(name) LIKE %s OR 
             LOWER(COALESCE(cpu, '')) LIKE %s OR 
             LOWER(COALESCE(brand, '')) LIKE %s OR 
             LOWER(COALESCE(ram::text, '')) LIKE %s OR 
             LOWER(COALESCE(storage::text, '')) LIKE %s OR 
             LOWER(COALESCE(source, '')) LIKE %s)
        """)
        params.extend([term, term, term, term, term, term])

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    order_params: List[Any] = []
    if sort == "name":
        order_clause = "ORDER BY name ASC, id ASC"
    elif sort == "price_desc":
        order_clause = "ORDER BY price_current DESC NULLS LAST, id ASC"
    elif sort == "fit":
        order_clause = (
            "ORDER BY (CASE WHEN price_current IS NOT NULL THEN 0 ELSE 1 END) ASC, "
            f"{_SQL_RAM_GB_EXPR} DESC NULLS LAST, price_current ASC NULLS LAST, id ASC"
        )
    else:
        # "price" and "total"
        order_clause = "ORDER BY price_current ASC NULLS LAST, id ASC"

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(f"SELECT COUNT(*) FROM public.laptops {where_clause};", params)
            total = cur.fetchone()["count"]

            list_query = f"""
                SELECT 
                    id, source, sku, name, brand, model, url, condition, availability,
                    price_current, price_original, discount_percent, installment,
                    cpu, ram, storage, gpu, screen, battery, weight, os,
                    thumbnail, images, categories, rating_average, rating_count,
                    crawled_at, embedding_text
                FROM public.laptops
                {where_clause}
                {order_clause}
                LIMIT %s OFFSET %s;
            """
            cur.execute(list_query, params + order_params + [limit, offset])
            rows = [dict(r) for r in cur.fetchall()]

    return {"total": total, "items": rows}
