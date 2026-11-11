# Module Embedder & Qdrant Ingestion (`/embedder`)

Module Python chịu trách nhiệm đọc dữ liệu Laptop đã chuẩn hoá từ thư mục `../data/`, tạo biểu diễn vector (Vector Embeddings) và lưu trữ cùng toàn bộ thông tin chi tiết vào Cơ sở dữ liệu Vector **Qdrant**.

---

## 1. Tính năng nổi bật

- **Tự động đồng bộ từ JSON**: Đọc file tổng hợp `../data/all_laptops_normalized.json` hoặc từng file bán lẻ (`cellphones.json`, `dienmayxanh.json`, `thegioididong.json`, `fptshop.json`).
- **Khử trùng lặp thông minh**: Tạo UUID định danh xác thực (`UUIDv5`) theo mã sản phẩm và URL, hỗ trợ chạy ingest nhiều lần (upsert) mà không bị nhân bản dữ liệu.
- **Hỗ trợ đa dạng Embedding Provider**:
  - `local` *(mặc định)*: Bộ vector hoá offline không phụ thuộc mạng hay API key (sử dụng n-gram feature hashing + chuẩn hoá Cosine, 384 dimensions), chạy ngay lập tức.
  - `gemini`: Sử dụng `text-embedding-004` (768 dimensions) qua SDK `google-genai`.
  - `openai`: Sử dụng `text-embedding-3-small` (1536 dimensions) qua SDK `openai`.
  - `ollama`: Kết nối mô hình local (`nomic-embed-text`, `bge-m3`,...) qua API Ollama.
- **Đánh chỉ mục Payload (Payload Indexing)**: Tự động đánh index trên Qdrant cho các trường thường lọc: `brand`, `source`, `condition`, `price_current`.
- **Hỗ trợ tìm kiếm ngữ nghĩa & lọc kết hợp**: Script `search.py` tìm kiếm theo câu hỏi tự nhiên kèm bộ lọc giá, hãng, nơi bán.

---

## 2. Cấu trúc thư mục

```text
embedder/
├── config.py           # Quản lý cấu hình Qdrant, đường dẫn data, API keys
├── embeddings.py       # Lớp trừu tượng sinh vector (Local, Gemini, OpenAI, Ollama)
├── qdrant_storage.py   # Kết nối Qdrant, tạo collection, đánh index, upsert & query
├── ingest.py           # Script nạp dữ liệu từ data/*.json vào Qdrant
├── search.py           # Tiện ích tìm kiếm ngữ nghĩa và lọc dữ liệu qua CLI
├── requirements.txt    # Các thư viện phụ thuộc
├── .env.example        # File mẫu cấu hình biến môi trường
└── README.md
```

---

## 3. Cài đặt môi trường

Cài đặt các thư viện cần thiết:

```bash
cd embedder
pip install -r requirements.txt
```

Đảm bảo container Qdrant đang chạy với port mapping `6333:6333`:
```bash
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest
```

---

## 4. Hướng dẫn sử dụng

### 4.1. Chạy Ingest nạp dữ liệu vào Qdrant

Mặc định (sử dụng model offline `local` và đọc từ `../data/all_laptops_normalized.json`):
```bash
python -m embedder.ingest
```
Hoặc khi đứng tại thư mục `embedder/`:
```bash
python ingest.py
```

Tuỳ chọn nâng cao:
```bash
# Nạp và tạo mới hoàn toàn collection (xoá dữ liệu cũ nếu có):
python ingest.py --recreate

# Chỉ định file JSON cụ thể:
python ingest.py --data-path ../data/cellphones.json

# Sử dụng Google Gemini:
python ingest.py --provider gemini --recreate

# Sử dụng OpenAI:
python ingest.py --provider openai --recreate
```

### 4.2. Tìm kiếm ngữ nghĩa (Semantic Search)

Thử nghiệm tìm kiếm trực tiếp trong terminal với `search.py`:

```bash
# Tìm kiếm ngữ nghĩa đơn giản:
python search.py "laptop gaming cấu hình mạnh rtx 3050"

# Tìm kiếm kết hợp bộ lọc hãng và giá:
python search.py "laptop văn phòng mỏng nhẹ" --brand Asus --max-price 25000000

# Lọc theo nguồn bán lẻ và tình trạng máy đổi trả:
python search.py "laptop sinh viên học tập" --source dienmayxanh --condition used
```
