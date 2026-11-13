"""
Single Unified Data Pipeline:
Crawler -> PostgreSQL Staging -> dbt Incremental Model -> Qdrant Vector Sync.

Quy tắc lọc dữ liệu:
- Lần đầu chạy (chưa có dữ liệu): Lấy toàn bộ dữ liệu mới.
- Các lần chạy sau (đã có dữ liệu): Chỉ lấy và lưu dữ liệu mới hơn thời điểm crawl gần nhất.
"""

import argparse
import json
import logging
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import psycopg2
from psycopg2.extras import execute_values

# Setup paths
ROOT_DIR = Path(__file__).resolve().parents[1]
STORER_DIR = Path(__file__).resolve().parent
CRAWLER_DIR = ROOT_DIR / "crawler"
DATA_DIR = ROOT_DIR / "data"

from dotenv import load_dotenv
# Load .env từ storer/ hoặc root
load_dotenv(STORER_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from storer.sync_qdrant import get_db_connection, sync_postgres_to_qdrant

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Pipeline] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Pipeline")


def ensure_database_schema(conn):
    """Tự động kiểm tra và khởi tạo các bảng từ schema.sql nếu chưa có."""
    schema_file = STORER_DIR / "schema.sql"
    if schema_file.exists():
        with conn.cursor() as cur:
            cur.execute(schema_file.read_text(encoding="utf-8"))
        conn.commit()
        logger.info("Đã kiểm tra và khởi tạo schema cơ sở dữ liệu từ schema.sql.")


def get_latest_crawled_timestamp(conn) -> Optional[datetime]:
    """Lấy mốc thời gian crawled_at lớn nhất hiện có trong CSDL (bảng laptops hoặc raw)."""
    with conn.cursor() as cur:
        # Kiểm tra bảng laptops
        cur.execute("""
            SELECT MAX(crawled_at) FROM public.laptops;
        """)
        res = cur.fetchone()[0]
        if res is not None:
            return res

        # Nếu laptops rỗng, kiểm tra bảng raw
        cur.execute("""
            SELECT MAX(crawled_at) FROM public.raw_crawled_laptops;
        """)
        return cur.fetchone()[0]


def step_1_run_crawler(
    sources: str = "all",
    max_categories: int = 2,
    max_products: int = 15,
    max_details: int = 15,
    skip_crawl_if_data_exists: bool = False,
) -> Path:
    """
    Kích hoạt crawler Node.js (Puppeteer + Cheerio) để cào dữ liệu từ các trang bán lẻ.
    Ghi dữ liệu vào data/all_laptops_normalized.json (kèm URL thumbnail & gallery images).
    """
    output_file = DATA_DIR / "all_laptops_normalized.json"

    if skip_crawl_if_data_exists and output_file.exists():
        logger.info("[BƯỚC 1] Bỏ qua cào web thực tế, sử dụng file dữ liệu crawler hiện có: %s", output_file)
        return output_file

    logger.info("==================================================")
    logger.info("[BƯỚC 1] Kích hoạt Crawler (Puppeteer + Cheerio)...")
    logger.info("Nguồn: %s | Max Products: %d", sources, max_products)
    logger.info("==================================================")

    crawler_script = CRAWLER_DIR / "index.js"
    cmd = [
        "node",
        str(crawler_script),
        f"--source={sources}",
        f"--max-categories={max_categories}",
        f"--max-products={max_products}",
        f"--max-details={max_details}",
        f"--output={DATA_DIR}",
    ]

    try:
        res = subprocess.run(cmd, cwd=str(CRAWLER_DIR), check=True, capture_output=True, text=True)
        logger.info("Crawler hoàn thành xuất sắc:\n%s", res.stdout[-500:] if len(res.stdout) > 500 else res.stdout)
    except FileNotFoundError:
        logger.warning("Không tìm thấy lệnh 'node' trong hệ thống. Sẽ đọc trực tiếp từ tệp data đã cào sẵn.")
    except subprocess.CalledProcessError as e:
        logger.error("Lỗi khi chạy crawler Node.js: %s\nStderr: %s", e, e.stderr)
        if not output_file.exists():
            raise RuntimeError("Crawler thất bại và không có file data dự phòng.")

    return output_file


def step_2_load_raw_to_postgres(json_file_path: Path) -> int:
    """
    Đọc dữ liệu từ crawler và nạp vào bảng `raw_crawled_laptops` trong PostgreSQL.
    Áp dụng kiểm tra so sánh thời gian:
    - Nếu CSDL chưa có dữ liệu: Lấy tất cả dữ liệu mới.
    - Nếu đã có dữ liệu trước đó: Chỉ lấy dữ liệu mới hơn mốc thời gian trong CSDL.
    """
    logger.info("==================================================")
    logger.info("[BƯỚC 2] Nạp dữ liệu vào PostgreSQL (raw_crawled_laptops)...")
    logger.info("==================================================")

    if not json_file_path.exists():
        raise FileNotFoundError(f"Không tìm thấy tệp dữ liệu crawler: {json_file_path}")

    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    raw_items = data.get("products", []) if isinstance(data, dict) else data
    if not raw_items:
        logger.warning("Không có sản phẩm nào trong tệp dữ liệu crawler.")
        return 0

    conn = get_db_connection()
    try:
        ensure_database_schema(conn)
        latest_db_time = get_latest_crawled_timestamp(conn)
        logger.info("Mốc thời gian crawl lớn nhất trong CSDL hiện tại: %s", latest_db_time)

        filtered_items = []
        for item in raw_items:
            crawled_at_str = (item.get("metadata") or {}).get("crawledAt")
            if crawled_at_str:
                item_crawled_at = datetime.fromisoformat(crawled_at_str.replace("Z", "+00:00"))
            else:
                item_crawled_at = datetime.now(timezone.utc)

            # So sánh thời gian cào
            if latest_db_time is None:
                # Trường hợp CSDL chưa có dữ liệu: Lấy toàn bộ dữ liệu mới
                filtered_items.append((item, item_crawled_at))
            else:
                # Trường hợp đã có dữ liệu trước: Chỉ lấy dữ liệu mới hơn
                if item_crawled_at > latest_db_time:
                    filtered_items.append((item, item_crawled_at))

        logger.info(
            "Tổng sản phẩm từ crawler: %d | Bản ghi mới đủ điều kiện nạp: %d",
            len(raw_items),
            len(filtered_items),
        )

        if not filtered_items:
            logger.info("Không có bản ghi nào mới hơn mốc hiện có. Bỏ qua nạp raw.")
            return 0

        insert_values = [
            (
                item["id"],
                item.get("source", "unknown"),
                item.get("sku"),
                crawled_at,
                json.dumps(item, ensure_ascii=False),
            )
            for item, crawled_at in filtered_items
        ]

        query = """
            INSERT INTO public.raw_crawled_laptops (id, source, sku, crawled_at, payload)
            VALUES %s
            ON CONFLICT (id) DO UPDATE 
            SET payload = EXCLUDED.payload,
                crawled_at = EXCLUDED.crawled_at,
                loaded_at = CURRENT_TIMESTAMP
            WHERE EXCLUDED.crawled_at > raw_crawled_laptops.crawled_at;
        """

        with conn.cursor() as cur:
            execute_values(cur, query, insert_values)
        conn.commit()

        logger.info("Đã nạp thành công %d bản ghi vào raw_crawled_laptops.", len(filtered_items))
        return len(filtered_items)
    finally:
        conn.close()


def step_3_run_dbt() -> bool:
    """
    Thực thi dbt incremental model để làm sạch và ghi vào bảng `laptops` trong PostgreSQL.
    dbt tự động thực thi logic incremental:
    - Lần đầu: Lưu tất cả.
    - Lần sau: Chỉ lưu bản ghi có crawled_at > max(crawled_at trong laptops).
    """
    logger.info("==================================================")
    logger.info("[BƯỚC 3] Chạy dbt Incremental Transformation...")
    logger.info("==================================================")

    # Sử dụng dbt CLI từ venv
    venv_dbt = ROOT_DIR / ".venv" / "Scripts" / "dbt.exe"
    dbt_cmd = str(venv_dbt) if venv_dbt.exists() else "dbt"

    cmd = [
        dbt_cmd,
        "run",
        "--project-dir",
        str(STORER_DIR),
        "--profiles-dir",
        str(STORER_DIR),
    ]

    try:
        res = subprocess.run(cmd, check=True, capture_output=True, text=True, env=os.environ)
        logger.info("dbt run thành công:\n%s", res.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error("dbt run thất bại: %s\nStderr: %s", e, e.stderr)
        raise


def step_4_sync_to_qdrant() -> int:
    """
    Lấy các bản ghi mới từ bảng `laptops` trong PostgreSQL và đồng bộ vào Qdrant
    thông qua hàm `ingest_records` có sẵn trong package embedder.
    """
    logger.info("==================================================")
    logger.info("[BƯỚC 4] Đồng bộ dữ liệu sang Qdrant Vector Database...")
    logger.info("==================================================")

    count = sync_postgres_to_qdrant()
    logger.info("Đã đồng bộ thành công %d sản phẩm vào Qdrant.", count)
    return count


def record_pipeline_run(conn, status: str, crawled_count: int, new_count: int, synced_count: int, error_msg: Optional[str] = None):
    """Ghi log audit vào bảng pipeline_runs."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO public.pipeline_runs 
                    (completed_at, status, crawled_count, new_records_count, qdrant_synced_count, error_message)
                VALUES 
                    (CURRENT_TIMESTAMP, %s, %s, %s, %s, %s);
            """, (status, crawled_count, new_count, synced_count, error_msg))
        conn.commit()
    except Exception as e:
        logger.warning("Không thể ghi log audit pipeline_runs: %s", e)


def run_single_pipeline(
    sources: str = "all",
    max_products: int = 15,
    skip_crawl: bool = False,
) -> Dict[str, Any]:
    """
    Data Pipeline duy nhất hoàn chỉnh kết nối từ Crawler -> PostgreSQL -> dbt -> Qdrant.
    """
    start_time = time.time()
    logger.info(">>> KHỞI ĐỘNG DATA PIPELINE (Crawler -> PostgreSQL -> dbt -> Qdrant) <<<")

    crawled_count = 0
    new_count = 0
    synced_count = 0

    conn = get_db_connection()
    try:
        # Bước 1: Thu thập dữ liệu từ các phương thức crawler (lưu URL ảnh trực tiếp)
        data_file = step_1_run_crawler(
            sources=sources,
            max_products=max_products,
            skip_crawl_if_data_exists=skip_crawl,
        )

        # Bước 2: Lọc dữ liệu mới và nạp vào raw staging PostgreSQL
        new_count = step_2_load_raw_to_postgres(data_file)

        # Bước 3: Chạy dbt incremental model để làm sạch và lưu vào bảng laptops
        step_3_run_dbt()

        # Bước 4: Sync các bản ghi mới vào Qdrant Vector Database
        synced_count = step_4_sync_to_qdrant()

        record_pipeline_run(conn, "SUCCESS", crawled_count, new_count, synced_count)
        elapsed = time.time() - start_time
        logger.info(">>> HOÀN THÀNH TOÀN BỘ PIPELINE TRONG %.2f GIÂY! <<<", elapsed)

        return {
            "status": "SUCCESS",
            "new_records": new_count,
            "qdrant_synced": synced_count,
            "elapsed_seconds": elapsed,
        }
    except Exception as e:
        logger.exception("Data Pipeline gặp lỗi: %s", e)
        record_pipeline_run(conn, "FAILED", crawled_count, new_count, synced_count, str(e))
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the unified laptop crawler -> dbt -> Qdrant pipeline.")
    parser.add_argument("--sources", type=str, default="all", help="Crawler sources (all, cellphones, fptshop, laptopaz, trungtran, ...)")
    parser.add_argument("--max-products", type=int, default=15, help="Max products per retailer")
    parser.add_argument("--skip-crawl", action="store_true", help="Skip web crawler and use existing data file")

    args = parser.parse_args()
    run_single_pipeline(
        sources=args.sources,
        max_products=args.max_products,
        skip_crawl=args.skip_crawl,
    )
