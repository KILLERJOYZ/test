# Spike PostgreSQL + Qdrant theo BRD

Luồng cơ bản để kiểm tra dữ liệu có quan hệ và tìm bằng chứng. Không dùng dbt. Không gọi AI.

Nguồn mẫu là 3 sản phẩm đầu trong `data/all_laptops_normalized.json`. Mỗi SKU là một biến thể riêng, vì crawl chưa chứng minh hai tên gần giống là cùng cấu hình. Giá là giá niêm yết (`listing_price_only`), không phải tổng tiền đã đối soát. Claim lấy từ thông số trên trang người bán, trạng thái `draft`, `dataset_kind=crawled_draft`, `permitted_use=demo_flow_only`. Đây không phải bằng chứng đã review để tư vấn production.

Vector dùng `embedder.embeddings.LocalHashEmbedder` (hash offline, 384 chiều). Cùng một hàm cho lúc ghi và lúc tìm. Đây là bản thay thế để test luồng, không phải model embedding production.

## Chạy bằng Docker

Cần Docker Desktop trên PATH. Postgres lắng nghe `127.0.0.1:54329`, Qdrant `v1.20.0` tại `127.0.0.1:6335`. Collection tên `lua_evidence`. Client Python được khóa `>=1.20,<1.22` vì client chỉ chấp nhận server cùng major và lệch tối đa một minor.

```powershell
cd spikes/brd-retrieval
pip install -r requirements.txt
docker compose up -d
python test_flow.py --docker
```

Kỳ vọng in `PASS query`, `PASS update`, `PASS delete`, rồi `RESULT PASS`.

Ba bước kiểm tra:

1. Tìm đúng câu claim đã seed thì trả về đúng `variant_id` và `source_label`.
2. Sửa claim trong PostgreSQL, sync lại, tìm câu mới thì thấy nội dung mới.
3. Xóa evidence, sync lại, point biến khỏi Qdrant.

Dừng stack:

```powershell
docker compose down
```

`python test_flow.py` không có `--docker` dùng PostgreSQL nhúng (`pgserver`) và Qdrant local, khi không muốn bật container.

## Tìm catalog (U02)

Sau khi stack Docker đang chạy, nạp toàn bộ file crawl rồi tìm theo từ khóa và trần giá. Giá là giá niêm yết. Trần giá không nhận bản ghi chưa có số tiền.

```powershell
python explorer.py load
python explorer.py search "LOQ" --max-price 30000000
python test_explorer.py

## Agent hybrid RAG và fallback

Catalog quan hệ quyết định biến thể và giá. Qdrant chỉ gắn bằng chứng của những biến thể đó. Không có mô hình thì lệnh dưới đây trả chế độ dự phòng.

```powershell
python agent_flow.py "Intel Core 5 205H dưới 30 triệu"
python test_agent.py

## API kiểu OpenAI và trang backend

Explainer dùng OpenAI SDK với Responses API. Mặc định trỏ tới `https://api.x.ai/v1`, model `grok-4.7`. Đổi `XAI_BASE_URL` nếu endpoint khác cùng dạng API. Key chỉ đọc từ `XAI_API_KEY` trên server. Sao chép `.env.example` thành `.env`. Không có key thì trang vẫn trả danh sách dự phòng.

```powershell
python server.py
```

Mở http://127.0.0.1:8787. `POST /api/advise` nhận `{"request":"..."}`. `GET /api/health` cho biết catalog, Qdrant và việc đã cấu hình key hay chưa.

```powershell
python agent_flow.py --live "Intel Core 5 205H dưới 30 triệu"
python test_backend.py
```
```

Một explainer gắn ngoài chỉ được cite `variant_id`, `evidence_id` và số tiền có trong gói tool. Timeout, lỗi provider, id lạ hoặc số tiền bịa bị hủy. Câu hiển thị quay về danh sách catalog. Qdrant lỗi thì danh sách giá vẫn còn và bằng chứng được đánh dấu không trả lời. Catalog lỗi thì không bịa sản phẩm.
```
