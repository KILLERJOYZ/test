-- Staging model: Parse các trường có cấu trúc từ bảng raw_crawled_laptops
{{ config(materialized='view') }}

WITH raw_source AS (
    SELECT
        id,
        source,
        sku,
        crawled_at,
        payload,
        loaded_at
    FROM {{ source('raw', 'raw_crawled_laptops') }}
),

parsed AS (
    SELECT
        id,
        source,
        COALESCE(sku, payload->>'sku') AS sku,
        COALESCE(payload->>'name', 'Laptop') AS name,
        COALESCE(payload->>'brand', 'Unknown') AS brand,
        payload->>'model' AS model,
        payload->>'url' AS url,
        COALESCE(payload->>'condition', 'new') AS condition,
        COALESCE(payload->>'availability', 'in_stock') AS availability,

        -- Giá cả
        NULLIF(payload->'pricing'->>'current', '')::BIGINT AS price_current,
        NULLIF(payload->'pricing'->>'original', '')::BIGINT AS price_original,
        NULLIF(payload->'pricing'->>'discountPercent', '')::NUMERIC(5, 2) AS discount_percent,
        payload->'pricing'->>'installment' AS installment,

        -- Cấu hình phần cứng
        payload->'specs'->>'cpu' AS cpu,
        payload->'specs'->>'ram' AS ram,
        payload->'specs'->>'storage' AS storage,
        payload->'specs'->>'gpu' AS gpu,
        payload->'specs'->>'screen' AS screen,
        payload->'specs'->>'battery' AS battery,
        payload->'specs'->>'weight' AS weight,
        payload->'specs'->>'os' AS os,

        -- Hình ảnh và truyền thông
        COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail') AS thumbnail,
        CASE 
            WHEN payload->'media'->'images' IS NOT NULL AND jsonb_typeof(payload->'media'->'images') = 'array' 
                THEN payload->'media'->'images'
            WHEN payload->'images' IS NOT NULL AND jsonb_typeof(payload->'images') = 'array' 
                THEN payload->'images'
            WHEN COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail') IS NOT NULL 
                THEN jsonb_build_array(COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail'))
            ELSE '[]'::jsonb
        END AS images,
        COALESCE(
            payload->'media',
            jsonb_build_object(
                'thumbnail', COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail'),
                'images', CASE 
                    WHEN payload->'images' IS NOT NULL AND jsonb_typeof(payload->'images') = 'array' 
                        THEN payload->'images'
                    WHEN COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail') IS NOT NULL 
                        THEN jsonb_build_array(COALESCE(payload->'media'->>'thumbnail', payload->>'thumbnail'))
                    ELSE '[]'::jsonb
                END
            )
        ) AS media,
        COALESCE(payload->'categories', '[]'::jsonb) AS categories,

        -- Đánh giá
        NULLIF(payload->'rating'->>'average', '')::NUMERIC(3, 2) AS rating_average,
        COALESCE(NULLIF(payload->'rating'->>'count', '')::INTEGER, 0) AS rating_count,

        -- Sinh text mô tả dùng cho vector embedding tương đồng với embedder.ingest
        CONCAT_WS(
            E'\n',
            'Laptop: ' || COALESCE(payload->>'name', 'Laptop'),
            'Hãng: ' || COALESCE(payload->>'brand', 'Unknown') || ' | Nguồn: ' || source || ' | Tình trạng: ' || COALESCE(payload->>'condition', 'new'),
            'Giá hiện tại: ' || CASE 
                WHEN NULLIF(payload->'pricing'->>'current', '') IS NOT NULL 
                THEN TO_CHAR((payload->'pricing'->>'current')::BIGINT, 'FM999,999,999,999') || ' VND'
                ELSE 'Liên hệ'
            END,
            NULLIF(
                TRIM(
                    BOTH ' | ' FROM
                    CONCAT_WS(' | ',
                        CASE WHEN payload->'specs'->>'cpu' IS NOT NULL THEN 'CPU: ' || (payload->'specs'->>'cpu') END,
                        CASE WHEN payload->'specs'->>'ram' IS NOT NULL THEN 'RAM: ' || (payload->'specs'->>'ram') END,
                        CASE WHEN payload->'specs'->>'storage' IS NOT NULL THEN 'Ổ cứng: ' || (payload->'specs'->>'storage') END,
                        CASE WHEN payload->'specs'->>'gpu' IS NOT NULL THEN 'GPU: ' || (payload->'specs'->>'gpu') END,
                        CASE WHEN payload->'specs'->>'screen' IS NOT NULL THEN 'Màn hình: ' || (payload->'specs'->>'screen') END,
                        CASE WHEN payload->'specs'->>'os' IS NOT NULL THEN 'HĐH: ' || (payload->'specs'->>'os') END
                    )
                ),
                ''
            )
        ) AS embedding_text,

        crawled_at,
        CURRENT_TIMESTAMP AS created_at,
        CURRENT_TIMESTAMP AS updated_at
    FROM raw_source
)

SELECT * FROM parsed
