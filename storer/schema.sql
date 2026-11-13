-- ============================================================================
-- Schema: PostgreSQL Database for Laptop Storage, dbt Transformations & Qdrant Sync
-- Database: PostgreSQL 14+
-- ============================================================================

-- Tạo schema nếu chưa có (mặc định public)
CREATE SCHEMA IF NOT EXISTS public;

-- 1. BẢNG RAW: Chứa dữ liệu gốc từ các phương thức crawler (JSONB)
-- Phục vụ việc lưu dữ liệu tạm và so sánh mốc thời gian crawl trước khi biến đổi
CREATE TABLE IF NOT EXISTS public.raw_crawled_laptops (
    id VARCHAR(64) PRIMARY KEY,                       -- Deterministic SHA-256 hash từ crawler
    source VARCHAR(50) NOT NULL,                      -- cellphones, thegioididong, dienmayxanh, fptshop
    sku VARCHAR(150),
    crawled_at TIMESTAMPTZ NOT NULL,                  -- Thời điểm crawler thu thập dữ liệu
    payload JSONB NOT NULL,                           -- Toàn bộ object JSON chuẩn hóa của laptop
    loaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP   -- Thời điểm ghi vào PostgreSQL
);

-- Index cho bảng raw để tối ưu truy vấn thời gian cào
CREATE INDEX IF NOT EXISTS idx_raw_crawled_laptops_crawled_at 
    ON public.raw_crawled_laptops (crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_crawled_laptops_source 
    ON public.raw_crawled_laptops (source);

-- 2. BẢNG CHÍNH: Laptops đã chuẩn hóa và làm sạch qua dbt model
-- Được cập nhật theo cơ chế Incremental: chỉ lấy dữ liệu mới hơn lần crawl trước
CREATE TABLE IF NOT EXISTS public.laptops (
    id VARCHAR(64) PRIMARY KEY,                       -- Khóa chính duy nhất
    source VARCHAR(50) NOT NULL,                      -- Nguồn crawl
    sku VARCHAR(150),                                 -- Mã SKU từ nhà bán lẻ
    name VARCHAR(255) NOT NULL,                       -- Tên sản phẩm đầy đủ
    brand VARCHAR(100),                               -- Thương hiệu (Apple, Asus, Lenovo, HP, Dell, ...)
    model VARCHAR(150),                               -- Dòng máy (Inspiron, Vivobook, Legion, ...)
    url TEXT,                                         -- Đường dẫn sản phẩm
    condition VARCHAR(50) DEFAULT 'new',              -- new, used, refurbished
    availability VARCHAR(50) DEFAULT 'in_stock',      -- in_stock, out_of_stock, pre_order
    
    -- Thông tin giá (VND)
    price_current BIGINT,                             -- Giá bán hiện tại
    price_original BIGINT,                            -- Giá niêm yết ban đầu
    discount_percent NUMERIC(5, 2),                   -- Phần trăm giảm giá (%)
    installment VARCHAR(100),                         -- Ưu đãi trả góp (ví dụ: Trả góp 0%)
    
    -- Thông số phần cứng chi tiết
    cpu TEXT,                                         -- Vi xử lý
    ram VARCHAR(100),                                 -- Bộ nhớ RAM
    storage VARCHAR(255),                             -- Dung lượng & loại ổ cứng
    gpu VARCHAR(255),                                 -- Card đồ họa
    screen VARCHAR(255),                              -- Kích thước & thông số màn hình
    battery VARCHAR(255),                             -- Dung lượng pin & sạc
    weight VARCHAR(100),                              -- Khối lượng máy
    os VARCHAR(100),                                  -- Hệ điều hành
    
    -- Dữ liệu hình ảnh & truyền thông
    thumbnail TEXT,                                   -- URL ảnh đại diện chính
    images JSONB DEFAULT '[]'::jsonb,                 -- Danh sách mảng URL các ảnh sản phẩm
    media JSONB DEFAULT '{}'::jsonb,                  -- Đối tượng media tổng hợp {thumbnail, images}
    categories JSONB DEFAULT '[]'::jsonb,             -- Cây danh mục sản phẩm
    
    -- Đánh giá từ khách hàng
    rating_average NUMERIC(3, 2),                     -- Điểm đánh giá (thang điểm 5)
    rating_count INTEGER DEFAULT 0,                   -- Số lượt đánh giá
    
    -- Chuỗi văn bản phục vụ Vector Embedding trong Qdrant
    embedding_text TEXT,                              -- Text tổng hợp để nhúng vector
    
    -- Trạng thái đồng bộ với Qdrant Vector Database
    synced_to_qdrant BOOLEAN DEFAULT FALSE,           -- Đã nhúng vector và đẩy lên Qdrant chưa?
    qdrant_synced_at TIMESTAMPTZ,                     -- Thời điểm sync vào Qdrant thành công
    
    -- Dấu mốc thời gian
    crawled_at TIMESTAMPTZ NOT NULL,                  -- Thời điểm cào dữ liệu
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Thời điểm bản ghi được tạo
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- Thời điểm bản ghi được cập nhật
);

-- Các Index tối ưu hóa truy vấn lọc, tìm kiếm và đồng bộ
CREATE INDEX IF NOT EXISTS idx_laptops_crawled_at 
    ON public.laptops (crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_laptops_brand 
    ON public.laptops (brand);
CREATE INDEX IF NOT EXISTS idx_laptops_source 
    ON public.laptops (source);
CREATE INDEX IF NOT EXISTS idx_laptops_price 
    ON public.laptops (price_current);
CREATE INDEX IF NOT EXISTS idx_laptops_sync_qdrant 
    ON public.laptops (synced_to_qdrant) 
    WHERE NOT synced_to_qdrant;

-- 3. BẢNG AUDIT / LOG: Giám sát lịch sử chạy của Data Pipeline
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
    run_id SERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'RUNNING',    -- RUNNING, SUCCESS, FAILED
    crawled_count INT DEFAULT 0,
    new_records_count INT DEFAULT 0,
    qdrant_synced_count INT DEFAULT 0,
    error_message TEXT
);
