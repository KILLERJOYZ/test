-- ============================================================================
-- Mart Model: laptops (Incremental Materialization)
-- ============================================================================
-- Quy tắc:
-- 1. Nếu CSDL chưa có dữ liệu (lần đầu chạy): Lấy tất cả dữ liệu mới.
-- 2. Nếu đã có dữ liệu từ các lần crawl trước: Chỉ lấy dữ liệu mới hơn mốc
--    thời gian crawled_at lớn nhất đang lưu trong CSDL.
-- ============================================================================

{{
    config(
        materialized='incremental',
        unique_key='id',
        on_schema_change='sync_all_columns',
        indexes=[
            {'columns': ['crawled_at']},
            {'columns': ['brand']},
            {'columns': ['price_current']},
            {'columns': ['source']},
            {'columns': ['synced_to_qdrant']}
        ]
    )
}}

WITH source_data AS (
    SELECT
        id,
        source,
        sku,
        name,
        brand,
        model,
        url,
        condition,
        availability,
        price_current,
        price_original,
        discount_percent,
        installment,
        cpu,
        ram,
        storage,
        gpu,
        screen,
        battery,
        weight,
        os,
        thumbnail,
        images,
        categories,
        rating_average,
        rating_count,
        embedding_text,
        crawled_at,
        created_at,
        updated_at,
        FALSE AS synced_to_qdrant,
        NULL::TIMESTAMPTZ AS qdrant_synced_at
    FROM {{ ref('stg_laptops') }}

    {% if is_incremental() %}
    -- =========================================================================
    -- TRƯỜNG HỢP ĐÃ CÓ DỮ LIỆU TỪ CÁC LẦN CRAWL TRƯỚC:
    -- So sánh thời gian tạo dữ liệu từ crawler với mốc lớn nhất trong CSDL hiện tại.
    -- Chỉ nạp các bản ghi cào mới hơn mốc này.
    -- =========================================================================
    WHERE crawled_at > (
        SELECT COALESCE(MAX(crawled_at), '1970-01-01 00:00:00+00'::timestamptz) 
        FROM {{ this }}
    )
    {% endif %}
    -- =========================================================================
    -- TRƯỜNG HỢP CHƯA CÓ DỮ LIỆU (FIRST RUN):
    -- Đoạn WHERE trên bị bỏ qua, dbt nạp toàn bộ dữ liệu mới vào bảng laptops!
    -- =========================================================================
)

SELECT * FROM source_data
