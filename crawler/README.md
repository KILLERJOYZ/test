# Laptop Retailer Crawler (`/crawler`)

Bộ thu thập dữ liệu (Web Crawler) các dòng máy tính xách tay (Laptop) từ 4 hệ thống bán lẻ lớn tại Việt Nam sử dụng **Puppeteer** kết hợp **Cheerio**, tự động định vị danh mục (Category Discovery), bóc tách thông tin sản phẩm, cấu hình phần cứng, các tuỳ chọn phiên bản và chuẩn hoá đầu ra JSON phục vụ thiết kế Cơ sở dữ liệu (**SQL** & **NoSQL**).

---

## 1. Các nguồn dữ liệu hỗ trợ

| Nguồn (`source`) | Đường dẫn gốc | Đặc tả bộ lọc & dữ liệu |
| :--- | :--- | :--- |
| `cellphones` | https://cellphones.com.vn/laptop | Định vị danh mục hãng (`Mac`, `Asus`, `Lenovo`, `MSI`, `Acer`, `HP`, `Dell`, `Gigabyte`, `LG`,...) & phân khúc; lấy giá bán, giá gốc, trả góp, thông số kỹ thuật chi tiết và các tuỳ chọn phiên bản/màu sắc. |
| `thegioididong` | https://www.thegioididong.com/laptop | Định vị danh mục `/laptop-<hang-dong-may>`; lấy thông tin thẻ sản phẩm kết hợp JSON-LD và bảng cấu hình trên trang chi tiết. |
| `dienmayxanh` | https://www.dienmayxanh.com/may-doi-tra/laptop | Định vị danh mục hãng & bộ lọc máy đổi trả (`/may-doi-tra/laptop-*`); lấy thông tin máy cũ/đổi trả, giá máy cũ, giá máy mới, mức tiết kiệm, số lượng máy và danh sách từng máy đổi trả kèm thời hạn bảo hành & tỉnh/thành có hàng. |
| `fptshop` | https://fptshop.com.vn/may-tinh-xach-tay | Định vị danh mục nhu cầu (`Laptop AI`, `Gaming - Đồ hoạ`, `Sinh viên - Văn phòng`, `Mỏng nhẹ`,...) và thương hiệu; trích xuất giá, cấu hình rút gọn từ tiêu đề H1, bảng thông số và dữ liệu có cấu trúc JSON-LD. |

---

## 2. Cấu trúc thư mục

```text
├── data/                             # Thư mục chung lưu kết quả JSON (nằm ở thư mục gốc ../data)
│   ├── cellphones.json
│   ├── thegioididong.json
│   ├── dienmayxanh.json
│   ├── fptshop.json
│   └── all_laptops_normalized.json   # File tổng hợp toàn bộ dữ liệu chuẩn hoá
├── crawler/
│   ├── src/
│   │   ├── crawlers/
│   │   │   ├── cellphonesCrawler.js      # Bộ crawl CellphoneS
│   │   │   ├── thegioididongCrawler.js   # Bộ crawl Thế Giới Di Động
│   │   │   ├── dienmayxanhCrawler.js     # Bộ crawl Điện Máy Xanh (Máy đổi trả)
│   │   │   └── fptshopCrawler.js         # Bộ crawl FPT Shop
│   │   ├── models/
│   │   │   └── laptopSchema.js           # Chuẩn hoá đối tượng Laptop & bóc tách cấu hình
│   │   └── utils/
│   │       ├── browser.js                # Cấu hình Puppeteer, cuộn trang lazy-load
│   │       └── storage.js                # Lưu trữ và gộp dữ liệu JSON
│   ├── index.js                          # CLI điều phối chạy các bộ crawler (mặc định lưu vào ../data)
│   └── package.json
├── embedder/                             # Xử lý vector embeddings & lưu trữ Qdrant
```

---

## 3. Hướng dẫn cài đặt và chạy

```bash
cd crawler
npm install
```

### Chạy toàn bộ 4 bộ crawler
```bash
npm start
# Hoặc tuỳ chỉnh số lượng category, sản phẩm và trang chi tiết:
node index.js --source=all --max-categories=2 --max-products=25 --max-details=5
```

### Chạy riêng từng trang
```bash
npm run crawl:cellphones
npm run crawl:thegioididong
npm run crawl:dienmayxanh
npm run crawl:fptshop
```

---

## 4. Cấu trúc JSON chuẩn hoá (Thiết kế hướng CSDL SQL / NoSQL)

Mỗi đối tượng laptop trong mảng `products` của file JSON được chuẩn hoá bởi `createNormalizedLaptop()` với cấu trúc nhất quán:

```json
{
  "id": "a1b2c3d4e5f60718",
  "source": "cellphones",
  "sku": "83Y9003VVN",
  "name": "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
  "brand": "Lenovo",
  "model": null,
  "url": "https://cellphones.com.vn/laptop-lenovo-loq-15irh11e-83y9003vvn.html",
  "condition": "new",
  "availability": "in_stock",
  "categories": [
    {
      "name": "Lenovo",
      "slug": "laptop/lenovo",
      "url": "https://cellphones.com.vn/laptop/lenovo.html",
      "type": "brand"
    }
  ],
  "pricing": {
    "currency": "VND",
    "current": 26990000,
    "original": 36990000,
    "discountPercent": 27,
    "installment": "Trả góp 0%",
    "priceNote": null
  },
  "specs": {
    "cpu": "Intel Core i5-13450HX",
    "ram": "8GB",
    "storage": "512GB SSD M.2 2242 PCIe 4.0x4 NVMe",
    "gpu": "NVIDIA GeForce RTX 3050 6GB GDDR6",
    "screen": "15.6 inch FHD",
    "battery": "60Wh",
    "weight": "2.38 kg",
    "os": "Windows 11 Home",
    "ports": null,
    "rawSpecs": {
      "Dung lượng RAM": "8GB",
      "Loại RAM": "SODIMM DDR5-5200",
      "Ổ cứng": "512GB SSD M.2 2242 PCIe 4.0x4 NVMe"
    }
  },
  "options": [
    {
      "type": "configuration",
      "label": "i5 13450HX / 8GB / 512GB",
      "value": "i5 13450HX / 8GB / 512GB",
      "price": 26990000,
      "url": "https://cellphones.com.vn/laptop-lenovo-loq-15irh11e-83y9003vvn.html",
      "sku": null,
      "isSelected": true
    }
  ],
  "promotions": [],
  "rating": {
    "average": 5,
    "count": 12
  },
  "media": {
    "thumbnail": "https://cdn2.cellphones.com.vn/...",
    "images": ["https://cdn2.cellphones.com.vn/..."]
  },
  "metadata": {
    "warranty": null,
    "storeCount": null,
    "defectNote": null,
    "crawledAt": "2026-11-11T04:35:00.000Z"
  }
}
```

### Ánh xạ sang thiết kế CSDL:
- **NoSQL (MongoDB / Couchbase / Elasticsearch)**: Có thể lưu trực tiếp từng document trong `products` vào collection `laptops`, đánh index trên `id`, `source`, `brand`, `pricing.current`, `specs.cpu`, `specs.ram`, `categories.slug`.
- **SQL (PostgreSQL / MySQL)**:
  - Bảng `laptops`: `id (PK)`, `source`, `sku`, `name`, `brand`, `model`, `url`, `condition`, `availability`, `rating_avg`, `rating_count`, `thumbnail`, `warranty`, `crawled_at`.
  - Bảng `laptop_prices` (1-1 hoặc 1-N lưu lịch sử giá): `laptop_id (FK)`, `currency`, `current_price`, `original_price`, `discount_percent`, `installment`, `price_note`, `recorded_at`.
  - Bảng `laptop_specs` (1-1): `laptop_id (FK)`, `cpu`, `ram`, `storage`, `gpu`, `screen`, `battery`, `weight`, `os`, `ports`, `raw_specs (JSONB)`.
  - Bảng `laptop_options` (1-N): `id (PK)`, `laptop_id (FK)`, `option_type`, `label`, `value`, `price`, `url`, `sku`, `is_selected`.
  - Bảng `categories` & `laptop_categories` (N-N): `category_id`, `laptop_id`, `name`, `slug`, `url`, `type`.
