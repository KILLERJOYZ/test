# Storer: PostgreSQL Storage, dbt Incremental Pipeline & Qdrant Sync

Hệ thống lưu trữ, biến đổi dữ liệu bằng dbt và đồng bộ vector vào Qdrant cho dữ liệu laptop được cào từ các nhà bán lẻ (CellphoneS, FPT Shop, Thế Giới Di Động, Điện Máy Xanh).

---

## 1. Cấu trúc thư mục

```
storer/
├── schema.sql              # Script SQL khởi tạo bảng trong PostgreSQL (raw_crawled_laptops, laptops, pipeline_runs)
├── dbt_project.yml         # File cấu hình dự án dbt (project name: storer_dbt)
├── profiles.yml            # File cấu hình kết nối PostgreSQL cho dbt
├── models/
│   ├── staging/
│   │   ├── schema.yml      # Khai báo source và test staging
│   │   └── stg_laptops.sql # View staging parse JSONB sang các cột có cấu trúc & tạo text embedding
│   └── marts/
│       ├── schema.yml      # Khai báo model marts
│       └── laptops.sql     # Model INCREMENTAL: Chỉ lấy dữ liệu mới hơn mốc crawl lớn nhất trong CSDL
├── pipeline.py             # Data pipeline duy nhất: Crawler -> PostgreSQL Raw -> dbt -> Qdrant
├── scheduler.py            # Bộ lập lịch chạy hàng giờ (hoặc hàng ngày)
├── sync_qdrant.py          # Module đồng bộ bản ghi từ PostgreSQL sang Qdrant bằng hàm có sẵn của embedder
├── .env.example            # Mẫu biến môi trường
└── README.md               # Tài liệu hướng dẫn
```

---

## 2. Quy tắc lọc dữ liệu Incremental (Theo yêu cầu)

Trong [`models/marts/laptops.sql`](models/marts/laptops.sql) và [`pipeline.py`](pipeline.py):
1. **Trường hợp chưa có dữ liệu (Lần đầu chạy):**
   - Bảng `laptops` đang rỗng.
   - Pipeline lấy **tất cả dữ liệu mới** từ crawler nạp vào PostgreSQL và Qdrant.
2. **Trường hợp đã có dữ liệu từ các lần crawl trước:**
   - So sánh thời điểm cào `crawled_at` của dữ liệu với `MAX(crawled_at)` hiện có trong bảng `laptops`.
   - **Chỉ lấy và cập nhật những bản ghi mới hơn mốc này** (`crawled_at > MAX(crawled_at)`).

---

## 3. Khởi tạo Cơ sở dữ liệu PostgreSQL

Chạy file SQL để tạo các bảng và index:

```powershell
# Chạy script schema.sql vào CSDL PostgreSQL
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -f storer/schema.sql
```

Các bảng được tạo:
* `raw_crawled_laptops`: Lưu trữ payload JSON gốc từ crawler.
* `laptops`: Bảng đích chính chứa thông tin laptop đã chuẩn hóa, cờ `synced_to_qdrant`.
* `pipeline_runs`: Bảng log audit theo dõi lịch sử chạy của pipeline.

---

## 4. Chạy Data Pipeline duy nhất

Chạy một chu kỳ pipeline hoàn chỉnh từ đầu đến cuối:

```powershell
# Kích hoạt toàn bộ: Crawler -> PostgreSQL Raw -> dbt Incremental -> Qdrant
python storer/pipeline.py

# Hoặc nếu muốn dùng file dữ liệu cào có sẵn để test nhanh (bỏ qua cào web):
python storer/pipeline.py --skip-crawl
```

Hoặc chạy từng thành phần:

```powershell
# 1. Chỉ chạy dbt model
dbt run --project-dir storer --profiles-dir storer

# 2. Chỉ chạy sync sang Qdrant
python storer/sync_qdrant.py
```

---

## 5. Lập lịch tự động: Hàng giờ / Hàng ngày

Tác vụ lập lịch nằm trong file [`storer/scheduler.py`](scheduler.py):

### Chạy hàng giờ (Mặc định):
```powershell
python storer/scheduler.py --mode hourly
```
*Tác vụ sẽ chạy định kỳ mỗi 1 giờ một lần.*

### Chạy hàng ngày (Daily):
```powershell
# Chạy mỗi ngày vào lúc 02:00 sáng
python storer/scheduler.py --mode daily --daily-time 02:00
```

> **Cách sửa code trực tiếp trong [`storer/scheduler.py`](scheduler.py):**
> 
> ```python
> # 1. Chạy hàng giờ (Mặc định):
> schedule.every(1).hours.do(job)
> 
> # 2. Chuyển sang chạy hàng ngày:
> # schedule.every().day.at("02:00").do(job)
> ```
