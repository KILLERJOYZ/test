# Báo cáo nghiệm thu module AI — `src/ai`

**Ngày:** 14/11/2026
**Phạm vi:** audit, sửa lỗi logic/schema/token, bổ sung test. Không thêm tính năng sản phẩm.
**Trạng thái tổng:** PASS toàn bộ 12 hạng mục nghiệm thu.

---

## 1. Kết luận nhanh

| # | Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1 | Ranh giới module, đúng 6 hàm public, contract TypeScript + Zod | PASS | `src/ai/index.ts`, 6 schema bộ input/output |
| 2 | Không có HTTP route/controller, auth/RBAC, migration trong `src/` | PASS | grep chỉ còn 2 dòng comment mô tả backend sở hữu |
| 3 | `searchVerifiedEvidences` dùng Hybrid RAG thật, không mock | PASS | `createHybridEvidenceRetriever` + test "hybrid RAG validates…" |
| 4 | PostgreSQL/Qdrant hard-filter exact `variant_id` + `sku_code` + approved/published | PASS | `postgres-catalog.ts`, `qdrant/payload.ts`, `rag/hybrid.ts` |
| 5 | Nudge chạy gate deterministic trước LLM; không evidence ⇒ `{ should_show: false }`, 0 token | PASS | test "proactive nudge uses zero LLM calls…" |
| 6 | Cache key `(variant_id, trigger_type, goal_hash)` chống gọi LLM trùng | PASS | test "nudge prompt stays compact, caches per context…" |
| 7 | Prompt nudge gọn (~250–400 token), không nhét specs/review thô | PASS | đo 1.462 ký tự ≈ 366 token; test chặn < 1.800 ký tự |
| 8 | Picker dừng ở `AWAITING_CONFIRMATION`, không tự nâng `max_budget_vnd` | PASS | `conversational-picker.ts` + test "budget lock…" |
| 9 | Thiếu evidence ⇒ đúng chuỗi `"Chưa có dữ liệu kiểm chứng"`, không bịa hiệu năng/pin | PASS | `evidence-tools.ts`, guard prose ở 3 workflow |
| 10 | Review lệch CPU/GPU/RAM/màn hình ⇒ `version_mismatch_warning = true` | PASS | test "review version guard flags CPU and display differences" |
| 11 | Mọi output đo lường giữ `source_name`, `source_url`, `measured_at` | PASS | Zod schema + `SourceCitation` bắt buộc |
| 12 | `npx tsc --noEmit` sạch, test AI pass 29/29 | PASS | log bên dưới |

---

## 2. Ranh giới module và bề mặt public

`src/ai/index.ts` export đúng 6 hàm nghiệp vụ:

| Hàm public | Workflow | Input schema | Output schema | Hành vi then chốt |
|---|---|---|---|---|
| `runConversationalPicker` | `workflows/conversational-picker.ts` | `pickerInputSchema` | `pickerResultSchema` | Trả `AWAITING_CONFIRMATION` khi thiếu field/điều kiện đổi; chỉ chạy retrieve khi `is_confirmed === true`; không sửa ngân sách người dùng |
| `evaluateProactiveNudge` | `workflows/proactive-nudge.ts` | `nudgeInputSchema` | `nudgeResultSchema` | Gate deterministic trước LLM; cache theo context; fail-closed |
| `explainComparisonTradeoffs` | `workflows/comparison.ts` | `comparisonInputSchema` | `comparisonResultSchema` | Ma trận variant + evidence thật; LLM chỉ viết summary, bị guard |
| `analyzeExternalQuote` | `workflows/external-quote.ts` | `quoteInputSchema` | `quoteResultSchema` | Khớp đúng variant theo brand/model + cấu hình; check budget trần |
| `synthesizeReviewEvidence` | `workflows/review-evidence.ts` | `reviewEvidenceInputSchema` | `reviewEvidenceResultSchema` | Luôn `pending_review`; cảnh báo lệch phiên bản |
| `resolveCrawledEntity` | `workflows/crawled-entity.ts` | `crawlResolutionInputSchema` | `crawlResolutionResultSchema` | Ghép SKU exact; không auto-publish; anomaly code uppercase ở output |

Export phụ trợ (adapter/tool/schema) nằm cùng file nhưng không phải entry point nghiệp vụ: `createPostgresCatalogRepository`, `createHybridEvidenceRetriever`, `createQdrantVectorStore`, `createOpenAiStructuredLlm`, `createMemoryNudgeCache`, `searchVerifiedEvidences`, `queryVariantsByConstraints`, `findSimilarDealsAndPriceHistory`, `getVariantsComparisonMatrix`, toàn bộ Zod schema và type DB.

### Kiểm tra out-of-scope

```
grep -E "(express|fastify|nestjs|@Controller|router\.(get|post|put|patch|delete)|app\.(get|post|put|patch|delete)|CREATE TABLE|ALTER TABLE|DROP TABLE|passport|jsonwebtoken|rbac|auth middleware)" src
→ chỉ 2 match, đều là comment:
  src/ai/index.ts:8        "The backend owns HTTP, auth/RBAC, migrations and all writes."
  src/ai/types/db.types.ts:3 "The backend owns migrations, CRUD, and RBAC."
```

- Không có route/controller/middleware/auth/RBAC/migration nào trong `src/`.
- Không có `INSERT/UPDATE/DELETE` SQL trong `src/ai`; toàn bộ query là `SELECT`.
- `spikes/brd-retrieval/schema.sql` và `server.py` là file có sẵn từ trước, nằm ngoài `src/ai`, không bị sửa trong đợt này.

---

## 3. Hybrid RAG — nối module thật, PostgreSQL là source of truth

Luồng thực tế:

```
searchVerifiedEvidences(input, { evidence })
  → createHybridEvidenceRetriever({ catalog, vectors }).search()
      1. catalog.findApprovedEvidences(variantIds, limit*3)   // PostgreSQL
      2. nếu 0 approved row → return [] (không gọi Qdrant)
      3. vectors.search({ filter: approvedEvidenceFilter(variantIds, skuCodes) })
      4. mỗi hit phải qua allowEvidencePayload(payload, variantIds, skuCodes)
      5. payload.evidence_id phải khớp row approved
      6. payload.variant_id === row.variant_id
      7. payload.sku_code === row.sku_code
      8. status === "approved"
      9. giữ claim + source_name/source_url/measured_at/score
```

Điểm quan trọng:

- **Không mock trong production path.** `searchVerifiedEvidences` chỉ phụ thuộc port `EvidenceRetriever`; backend inject retriever thật. Test dùng `createHybridEvidenceRetriever` + fake `VectorStore` để chứng minh composition thật.
- **Chống stale Qdrant point:** admin reject/sửa review → row PostgreSQL biến mất/không còn approved → payload cũ bị loại dù vector vẫn còn.
- **Chống lẫn cấu hình anh em:** filter Qdrant bắt buộc `status = approved`, `variant_id ∈ approved ids`, và `sku_code ∈ approved skus`. Payload lệch SKU bị loại ngay cả khi cùng `variant_id`.
- **SQL hard-filter:** mọi truy vấn catalog/evidence/price history đều join `product_models` + `product_variants` và yêu cầu `v.status='published'`, `m.status='published'`, `v.merged_into_id IS NULL`; evidence thêm `e.status='approved'` và `e.model_id = v.model_id`.
- **Offer chỉ đọc offer còn hiệu lực:** `status='active'`, `stock_status IN ('in_stock','low_stock')`, chưa hết hạn, `total_known_price_vnd IS NOT NULL`; thiếu phí bắt buộc ⇒ tổng không xác định, không được coi là 0đ.

---

## 4. Nudge — tiết kiệm token và chống gọi LLM thừa

### 4.1 Gate deterministic trước LLM

`deterministicGateNode` chạy trước mọi node LLM:

- Thu evidence từ catalog + evidence retriever.
- Không có blind spot/evidence ⇒ trả ngay `{ should_show: false }`, **0 LLM call**.
- Catalog/DB lỗi ⇒ `catch` fail-closed, trả `{ should_show: false }`, **0 LLM call** (không tiêu token cho suy đoán).

Test tương ứng: `proactive nudge uses zero LLM calls when there is no blind spot`.

### 4.2 Cache key

```
cache_key = `${current_variant_id}|${trigger_type}|${goal_hash}`
goal_hash = sha256(
  category, sorted(primary_goals), sorted(mandatory_tasks), max_budget_vnd,
  sorted(soft_preferences), sorted(recent_variant_ids), active_filters
).slice(0,16)
```

- Cùng context ⇒ hit cache, không gọi LLM lần 2.
- Đổi bộ variant đang so sánh hoặc đổi filter ⇒ key đổi, không tái dùng nudge cũ.
- TTL 10 phút, cache injectable qua `NudgeCache`.

Test: `nudge prompt stays compact, caches per context, and fails closed without a catalog` xác nhận `llm.calls.length === 1` sau 2 lần gọi cùng input, và tăng lên 2 khi đổi `recent_variant_ids`.

### 4.3 Payload gọn

| Thành phần | Giới hạn |
|---|---|
| `variants_summary` | tối đa 3 variant; chỉ `variant_id`, title 60 ký tự, price, ram, gpu, color_gamut, weight, battery |
| `db_evidence` | tối đa 2 item; summary 140 ký tự; target ids tối đa 2; source_name 40 ký tự |
| `maxOutputTokens` | 320 |
| Đo thực tế | **1.462 ký tự ≈ 366 token** (4 ký tự/token) |
| Test chặn | `< 1.800 ký tự` |

Không gửi `specs_json` thô, không gửi toàn văn review, không gửi lịch sử chat.

---

## 5. Guardrail chống hallucination

### 5.1 Guard phần cứng dùng chung

`src/ai/tools/claim-guard.ts`:

- Trích token phần cứng từ prose: GPU (`RTX/GTX/RX/Arc`), CPU (Intel/Ryzen/Apple M), RAM/VRAM/storage (GB), Wh, kg, Hz, inch, resolution.
- So với context DB được phép dùng; token lạ ⇒ **reject toàn bộ prose LLM**, fallback về câu deterministic.
- Áp dụng cho: picker (`fit_reasons`, `tradeoffs`, `advisor_note`), comparison (`summary`), nudge (`short_message`).
- Giá được kiểm riêng bằng `includesUnknownMoney`; prompt nudge còn kiểm citation URL và target variant id.

### 5.2 Thiếu dữ liệu kiểm chứng

Hằng số dùng chung:

```
NO_VERIFIED_EVIDENCE = "Chưa có dữ liệu kiểm chứng cho đúng phiên bản này."
```

- Picker: recommendation `evidence_status !== "available"` luôn có note này trong `tradeoffs`; prose LLM nói về hiệu năng/pin bị lọc nếu không có evidence.
- Comparison: variant thiếu evidence nhận đúng note; summary LLM bị chặn nếu claim `hiệu năng/fps/nhiệt/độ ồn/pin thực/benchmark` mà không có evidence.
- Nudge: không evidence ⇒ không hiện nudge.

### 5.3 Review lệch phiên bản

`configWarning` + `review-evidence.ts` truyền đủ `cpu`, `gpu`, `ram_gb`, `display_size`, `display_res`, `display_panel`. Lệch bất kỳ trường nào ⇒:

- `version_mismatch_warning = true`
- `draft.config_warning` nêu rõ CPU/màn hình lệch
- `status = "pending_review"` (không bao giờ approved)

Test: `review version guard flags CPU and display differences` (CPU `i7-13700H` vs `i7-13650HX`, màn `14" 1920x1080` vs `15.6" 2560x1440`).

### 5.4 Giữ nguồn

Mọi item evidence/đo lường đi qua schema có `source_name`, `source_url`, `measured_at` bắt buộc:

- `sourceCitationSchema` (catalog)
- `pickerEvidenceSchema`
- `evidenceItemSchema`
- `equivalentDealSchema`
- `VerifiedEvidence` / `EvidenceDraft`

Không có nhánh nào xuất claim đo lường mà thiếu 3 trường này.

---

## 6. Kiểm tra chất lượng — log thực tế

### 6.1 Typecheck

```
> npx tsc --noEmit
TSC_EXIT=0
(không có output lỗi)
```

### 6.2 Test AI

```
> npm run test:ai
> tsx --test src/ai/agents/agents.test.ts src/ai/qdrant/payload.test.ts src/ai/__tests__/ai-eval.test.ts

✔ zero hallucination: fabricated prices, specs and quotes never reach output
✔ budget lock: the picker never recommends above the confirmed ceiling
✔ proactive nudge uses zero LLM calls when there is no blind spot
✔ GPU version mismatch is flagged and never approved
✔ comparison ignores fabricated LLM claims and explains real upgrades
✔ external quote is matched to the exact variant and cannot bypass the budget
✔ external quote cannot be matched across a conflicting GPU/RAM/storage configuration
✔ crawled entity resolves exact SKU and flags missing fees and price outliers
✔ ambiguous crawl stays unresolved and cannot auto-publish
✔ review version guard flags CPU and display differences
✔ nudge prompt stays compact, caches per context, and fails closed without a catalog
✔ nudge rejects invented hardware even when the citation is valid
✔ picker and comparison reject invented hardware without invented prices
✔ hybrid RAG validates Qdrant payloads against approved PostgreSQL rows and exact SKU
✔ postgres adapter hard-filters published, non-merged, approved rows
✔ price history reads the latest recorded_at, not warehouse row order
✔ exact sku stays pending and is not approved
✔ same name with different ram, gpu, or display is flagged
✔ matching component variant is chosen
✔ sku conflict with specs stays in review
✔ price far from history is flagged and the exact 25 percent band is not
✔ missing mandatory fees and an ambiguous name stay in review
✔ resolution graph cannot approve
✔ four review groups keep the source and stay pending
✔ wrong ram, gpu, and sibling sku warn for admin review
✔ synthesis graph forces pending_review when the extractor approves or throws
✔ draft payloads stay out and approved payloads need every identity field
✔ approved filter matches variant ids, exact sku codes and status
✔ point ids match Python uuid5

ℹ tests 29
ℹ pass 29
ℹ fail 0
ℹ duration_ms 1527.9874
```

Phân bổ: `ai-eval.test.ts` 16 test, `agents.test.ts` 10 test, `payload.test.ts` 3 test.

---

## 7. Bảng mapping schema backend

### 7.1 PostgreSQL — bảng/ cột AI đọc

| Bảng | Cột AI đọc | Điều kiện bắt buộc | Dùng cho |
|---|---|---|---|
| `product_models` (`m`) | `id`, `category`, `brand`, `name`, `series`, `release_year`, `status` | `m.status = 'published'` | Tên máy, brand, category, join variant |
| `product_variants` (`v`) | `id`, `model_id`, `sku_code`, `region`, `cpu`, `gpu`, `ram_gb`, `ram_type`, `ram_upgradable`, `storage_gb`, `storage_slots`, `display_size`, `display_res`, `display_panel`, `color_gamut`, `refresh_rate`, `battery_wh`, `weight_kg`, `os`, `specs_json`, `status`, `merged_into_id` | `v.status = 'published'`, `v.merged_into_id IS NULL` | Ứng viên, so khớp cấu hình, chống gộp trùng |
| `offers` (`o`) | `id`, `variant_id`, `store_id`, `listed_price_vnd`, `mandatory_fees_vnd`, `total_known_price_vnd`, `conditional_price_vnd`, `promo_conditions`, `stock_status`, `product_condition`, `source_url`, `is_sponsored`, `checked_at`, `expires_at`, `status` | `o.status='active'`, `stock_status IN ('in_stock','low_stock')`, `expires_at IS NULL OR expires_at > now()`, `total_known_price_vnd IS NOT NULL` | Giá, tồn kho, citation mua |
| `stores` (`s`) | `id`, `name`, `website`, `shipping_regions`, `warranty_policy`, `return_policy`, `is_verified` | join theo `s.id = o.store_id` | Tên shop, chính sách, citation |
| `price_histories` (`ph`) | `id`, `offer_id`, `variant_id`, `store_id`, `price_vnd`, `recorded_at` | join variant/model published, chưa gộp; `recorded_at >= now() - 180 ngày` (hoặc `since`) | Median, deal, biến động giá |
| `evidences_and_reviews` (`e`) | `id`, `model_id`, `variant_id`, `source_name`, `source_url`, `evidence_type`, `summary_performance`, `summary_thermals_noise`, `summary_battery`, `summary_cons_quirks`, `raw_excerpt`, `measured_at`, `status` | `e.status='approved'`, `e.model_id = v.model_id`, variant/model published, chưa gộp | Review/benchmark đã duyệt |
| `ops_settings` (key `ai_fallback_enabled`) | giá trị boolean | chỉ đọc | Bật/tắt fallback AI |

Ghi chú contract:

- `ProductVariant` nhận thêm alias `model_name`, `brand`, `category` từ join `product_models`.
- `offers.total_known_price_vnd` có thể `NULL`; AI không bao giờ quy đổi NULL thành 0.
- AI **không ghi** bảng nào; staging/review status do backend quản lý.

### 7.2 Qdrant — payload collection evidence

| Field | Kiểu | Vai trò | Bắt buộc để nhận |
|---|---|---|---|
| `evidence_id` | string | Khóa đối chiếu với `evidences_and_reviews.id` | Có, và phải tồn tại trong row approved |
| `model_id` | string | Danh tính model | Có |
| `variant_id` | string | Danh tính biến thể | Có, phải nằm trong approved variant ids |
| `sku_code` | string | Danh tính SKU chính xác | Có, phải nằm trong approved SKU set |
| `source_url` | string | Citation | Có |
| `measured_at` | string (ISO) | Thời điểm đo | Có |
| `status` | string | Chỉ `approved` mới được dùng | Có, `= "approved"` |
| `claim` | string | Câu claim gửi LLM | Không (nhưng nếu thiếu thì hit bị bỏ) |
| `source_label` | string | Tên nguồn hiển thị | Không |
| `product_id` | string | Liên kết product cha | Không |

Filter Qdrant thực tế:

```json
{
  "must": [
    { "key": "variant_id", "match": { "any": ["<approved variant ids>"] } },
    { "key": "status",     "match": { "value": "approved" } },
    { "key": "sku_code",   "match": { "any": ["<approved sku codes>"] } }
  ]
}
```

Payload chỉ được chấp nhận khi đồng thời: `status=approved`, `evidence_id` khớp row PostgreSQL, `variant_id` khớp row, `sku_code` khớp row, và đủ 6 field bắt buộc.

---

## 8. File thay đổi chính

| File | Thay đổi |
|---|---|
| `src/ai/index.ts` | Chốt 6 entry point + export adapter/schema/tool |
| `src/ai/types/db.types.ts` | Contract đầy đủ PostgreSQL/Qdrant; mở rộng `ReviewVariantRef` |
| `src/ai/tools/claim-guard.ts` | Guard token phần cứng dùng chung (mới) |
| `src/ai/workflows/proactive-nudge.ts` | Gate fail-closed, cache context, prompt nén, guard hardware |
| `src/ai/workflows/conversational-picker.ts` | Guard hardware cho prose; giữ nguyên luồng xác nhận |
| `src/ai/workflows/comparison.ts` | Guard hardware cho summary |
| `src/ai/workflows/review-evidence.ts` | Truyền CPU/display vào cảnh báo lệch phiên bản |
| `src/ai/workflows/external-quote.ts` | Khớp exact variant; siết field LLM theo source text |
| `src/ai/agents/review-synthesis.ts` | So khớp CPU/GPU/RAM/display size/res/panel |
| `src/ai/data/postgres-catalog.ts` | Hard-filter published/merged/approved; price history join |
| `src/ai/qdrant/payload.ts` | `approvedEvidenceFilter` thêm `sku_code`; validate SKU |
| `src/ai/rag/hybrid.ts` | Đối chiếu payload với row approved; exact variant + SKU |
| `src/ai/tools/deal-tools.ts` | Sắp xếp price history theo `recorded_at` |
| `src/ai/__tests__/ai-eval.test.ts` | 7 test regression mới |
| `src/ai/qdrant/payload.test.ts` | Test filter/validate SKU |

---

## 9. Việc backend cần làm (ngoài phạm vi AI)

1. Implement `CatalogRepository` bằng `pg` Pool thật (adapter mẫu đã có trong `postgres-catalog.ts`).
2. Cấu hình `createQdrantVectorStore` + embedder thật; đảm bảo payload có đủ 6 field bắt buộc.
3. Khi admin approve/reject review: cập nhật PostgreSQL **và** đồng bộ/xóa point Qdrant tương ứng.
4. Cung cấp `NudgeCache` phân tán (Redis) nếu chạy nhiều instance.
5. Cung cấp `AiFallbackSetting` từ `ops_settings` và LLM client thật.
6. Không cấp quyền ghi DB cho AI layer.

---

## 10. Kết luận

Module `src/ai` đạt nghiệm thu: đúng 6 entry point, contract Zod/TypeScript rõ ràng, Hybrid RAG thật với PostgreSQL là source of truth, hard-filter variant/SKU/approved, nudge tiết kiệm token và fail-closed, guardrail chống bịa thông số/giá/nguồn, review lệch phiên bản bị chặn, typecheck sạch và 29/29 test pass. Không có thay đổi ngoài phạm vi (HTTP/auth/RBAC/migration).

> Lưu ý trạng thái git: toàn bộ `src/`, `package.json`, `tsconfig.json`, `package-lock.json` đang untracked; hai file `spikes/brd-retrieval/agent_flow.py` và `flow.py` đã modified từ trước và không bị đụng trong đợt này.
