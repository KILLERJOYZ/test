"""
Lập lịch tự động chạy Data Pipeline duy nhất (Crawler -> PostgreSQL -> dbt -> Qdrant).
Mặc định: Chạy hàng giờ (Hourly).
Có chú thích chi tiết bên dưới để chuyển sang chạy hàng ngày (Daily) nếu cần.
"""

import argparse
import datetime
import logging
import sys
import time
from pathlib import Path
import schedule

# Setup paths
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from storer.pipeline import run_single_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Scheduler] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("Scheduler")


def job():
    """Hàm tác vụ được gọi theo lịch trình định kỳ."""
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logger.info("==================================================")
    logger.info(" BẮT ĐẦU CHU KỲ PIPELINE MỚI: %s", now_str)
    logger.info("==================================================")
    try:
        result = run_single_pipeline()
        logger.info("Chu kỳ hoàn thành thành công: %s", result)
    except Exception as e:
        logger.error("Chu kỳ pipeline thất bại với lỗi: %s", e)


def setup_schedule(mode: str = "hourly", daily_time: str = "02:00"):
    """
    Cấu hình tần suất thực thi pipeline.
    """
    schedule.clear()

    if mode == "hourly":
        # =====================================================================
        # 1. CẤU HÌNH CÀO DỮ LIỆU HÀNG GIỜ (HOURLY - MẶC ĐỊNH)
        # =====================================================================
        # Chạy đều đặn mỗi 1 giờ một lần:
        schedule.every(1).hours.do(job)

        # Bạn cũng có thể chỉ định phút cụ thể trong mỗi giờ (ví dụ phút thứ 00):
        # schedule.every().hour.at(":00").do(job)

        logger.info("Đã lên lịch chạy Data Pipeline: HÀNG GIỜ (Every 1 hour).")

    elif mode == "daily":
        # =====================================================================
        # 2. CẤU HÌNH CÀO DỮ LIỆU HÀNG NGÀY (DAILY)
        # =====================================================================
        # Để chuyển sang chạy hàng ngày, bỏ comment đoạn dưới và comment đoạn hourly:
        schedule.every().day.at(daily_time).do(job)

        # Ví dụ thêm nếu muốn chạy 2 lần mỗi ngày (sáng 06:00 và tối 18:00):
        # schedule.every().day.at("06:00").do(job)
        # schedule.every().day.at("18:00").do(job)

        logger.info("Đã lên lịch chạy Data Pipeline: HÀNG NGÀY vào lúc %s.", daily_time)

    else:
        raise ValueError(f"Chế độ không hợp lệ: {mode}. Chỉ hỗ trợ 'hourly' hoặc 'daily'.")


def main():
    parser = argparse.ArgumentParser(
        description="Lập lịch tự động chạy Data Pipeline Laptop (Crawler -> PostgreSQL -> dbt -> Qdrant)"
    )
    parser.add_argument(
        "--mode",
        type=str,
        default="hourly",
        choices=["hourly", "daily"],
        help="Tần suất chạy: 'hourly' (hàng giờ) hoặc 'daily' (hàng ngày). Mặc định: hourly.",
    )
    parser.add_argument(
        "--daily-time",
        type=str,
        default="02:00",
        help="Giờ chạy nếu chọn chế độ daily (định dạng HH:MM, ví dụ: 02:00). Mặc định: 02:00 sáng.",
    )
    parser.add_argument(
        "--run-now",
        action="store_true",
        help="Kích hoạt chạy ngay một lần trước khi bắt đầu lắng nghe theo lịch trình.",
    )

    args = parser.parse_args()

    # Nếu người dùng muốn chạy ngay lập tức lần đầu
    if args.run_now:
        logger.info("Tùy chọn --run-now được bật: Đang chạy pipeline lần đầu ngay bây giờ...")
        job()

    # Thiết lập lịch trình
    setup_schedule(mode=args.mode, daily_time=args.daily_time)

    logger.info("Scheduler đang chạy... Nhấn Ctrl+C để dừng.")
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Đã dừng Scheduler an toàn.")


if __name__ == "__main__":
    main()
