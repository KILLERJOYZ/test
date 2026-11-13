import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeExternalQuote,
  buildChunkPayload,
  configWarning,
  createHybridEvidenceRetriever,
  createMemoryNudgeCache,
  createPostgresCatalogRepository,
  evaluateProactiveNudge,
  explainComparisonTradeoffs,
  findSimilarDealsAndPriceHistory,
  resolveCrawledEntity,
  runConversationalPicker,
  searchVerifiedEvidences,
  synthesizeReviewEvidence,
  type AiEngineDeps,
  type PickerResult,
  type QdrantPayloadFilter,
  type SqlClient,
  type StructuredLlm,
  type StructuredLlmRequest,
  type UserRequirementProfile,
  type VectorStore,
} from "../index.js";
import {
  createFakeCatalogRepository,
  createFakeEvidenceRetriever,
  mockApprovedEvidence,
  mockReviewSources,
  mockVariants,
} from "./fixtures/mock-catalog.js";

type ScriptEntry = unknown | ((input: unknown) => unknown);

interface ScriptedLlm extends StructuredLlm {
  calls: string[];
}

/** Structured-output fake: scripts per prompt name and validates with Zod. */
function scriptedLlm(script: Record<string, ScriptEntry>): ScriptedLlm {
  const calls: string[] = [];
  return {
    calls,
    async generate<T>(request: StructuredLlmRequest<T>): Promise<T> {
      calls.push(request.name);
      const entry = script[request.name];
      if (entry === undefined) throw new Error(`no script for ${request.name}`);
      const output = typeof entry === "function" ? (entry as (input: unknown) => unknown)(request.input) : entry;
      return request.schema.parse(output);
    },
  };
}

function makeDeps(
  llm?: StructuredLlm,
  overrides: Partial<AiEngineDeps> = {},
): AiEngineDeps {
  return {
    catalog: createFakeCatalogRepository(),
    evidence: createFakeEvidenceRetriever(),
    llm,
    nudgeCache: createMemoryNudgeCache(),
    ...overrides,
  };
}

const officeProfile: UserRequirementProfile = {
  category: "laptop",
  primary_goals: ["Văn phòng", "Học tập"],
  mandatory_tasks: ["office"],
  max_budget_vnd: 20_000_000,
  soft_preferences: [],
  missing_fields: [],
};

const codingProfile: UserRequirementProfile = {
  category: "laptop",
  primary_goals: ["Lập trình"],
  mandatory_tasks: ["coding"],
  max_budget_vnd: 20_000_000,
  soft_preferences: [],
  missing_fields: [],
};

const confirmedOfficeInput = {
  message: "xác nhận",
  draft_profile: officeProfile,
  is_confirmed: true,
};

test("zero hallucination: fabricated prices, specs and quotes never reach output", async () => {
  const llm = scriptedLlm({
    picker_explanation: (input: unknown) => {
      const recommendations = (input as { recommendations: { variant_id: string }[] }).recommendations;
      return {
        advisor_note: "RTX 4090 chỉ 5 triệu là lựa chọn tốt nhất.",
        recommendations: [
          {
            variant_id: recommendations[0]!.variant_id,
            fit_reasons: ["RTX 4090 giá 5 triệu"],
            tradeoffs: ["Pin 100Wh"],
          },
        ],
      };
    },
  });
  const picker = await runConversationalPicker(confirmedOfficeInput, makeDeps(llm));
  assert.equal(picker.status, "COMPLETED");
  assert.ok(llm.calls.includes("picker_explanation"));
  const pickerText = JSON.stringify(picker);
  assert.equal(pickerText.includes("RTX 4090"), false);
  assert.equal(pickerText.includes("5.000.000"), false);
  assert.equal(pickerText.includes("100Wh"), false);

  const reviewLlm = scriptedLlm({
    review_evidence_extract: {
      performance: {
        summary: "Tóm tắt bịa hoàn toàn.",
        quotes: [
          "đạt 12.450 điểm Cinebench R23 đa nhân",
          "999 fps nhờ RTX 5090",
        ],
      },
      thermals_and_noise: { summary: null, quotes: ["quạt chạy ồn 47 dB khi render"] },
      battery_life: { summary: null, quotes: ["Pin dùng văn phòng được 6 giờ 15 phút"] },
      cons_and_quirks: { summary: null, quotes: ["webcam 1080p thiếu chi tiết"] },
    },
  });
  const source = mockReviewSources[0]!;
  const review = await synthesizeReviewEvidence(
    {
      raw_text: source.raw_text,
      source_name: source.source_name,
      source_url: source.source_url,
      measured_at: source.measured_at,
      candidate_variants: mockVariants,
      target_variant_id: "v-vivobook-4050",
    },
    makeDeps(reviewLlm),
  );
  assert.equal(review.status, "pending_review");
  const sections = Object.values(review.sections);
  const quotes = sections.flatMap((section) => section.quotes);
  assert.ok(quotes.includes("đạt 12.450 điểm Cinebench R23 đa nhân"));
  for (const quote of quotes) {
    assert.ok(source.raw_text.includes(quote), `quote must exist in source: ${quote}`);
  }
  const reviewText = JSON.stringify(review.sections);
  assert.equal(reviewText.includes("999 fps"), false);
  assert.equal(reviewText.includes("RTX 5090"), false);
  assert.equal(reviewText.includes("Tóm tắt bịa"), false);
});

test("budget lock: the picker never recommends above the confirmed ceiling", async () => {
  const result: PickerResult = await runConversationalPicker(
    confirmedOfficeInput,
    makeDeps(),
  );
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.extracted_profile.max_budget_vnd, 20_000_000);
  assert.ok(result.recommendations.length > 0);
  for (const recommendation of result.recommendations) {
    assert.ok(
      recommendation.total_known_price_vnd <= 20_000_000,
      `${recommendation.title} must stay inside the ceiling`,
    );
  }
  const ids = new Set(result.recommendations.map((item) => item.variant_id));
  assert.equal(ids.has("v-nitro-4050"), false);
  assert.equal(ids.has("v-legion-4060"), false);
  assert.equal(ids.has("v-vivobook-4050"), false);

  const comparison = await explainComparisonTradeoffs(
    {
      variant_ids: ["v-ideapad-8-512", "v-vivobook-4050", "v-legion-4060"],
      user_profile: { ...officeProfile, max_budget_vnd: 25_000_000 },
    },
    makeDeps(),
  );
  assert.ok(comparison.budget_warning);
  assert.equal(comparison.requires_budget_confirmation, true);
  assert.ok(
    comparison.variants.some((variant) => variant.total_known_price_vnd > 25_000_000),
  );
});

test("proactive nudge uses zero LLM calls when there is no blind spot", async () => {
  const llm = scriptedLlm({});
  const result = await evaluateProactiveNudge(
    {
      trigger_type: "DEEP_INSPECTION",
      current_variant_id: "v-ideapad-16-512",
      recent_variant_ids: [],
      active_filters: {},
      user_profile: officeProfile,
    },
    makeDeps(llm),
  );
  assert.deepEqual(result, { should_show: false });
  assert.equal(llm.calls.length, 0);

  const cache = createMemoryNudgeCache();
  const blindSpotLlm = scriptedLlm({
    nudge_micro_prompt: (input: unknown) => {
      const evidence = (
        input as {
          db_evidence: {
            source_name: string;
            source_url: string;
            measured_at: string;
            target_variant_ids: string[];
          }[];
        }
      ).db_evidence[0]!;
      return {
        should_show: true,
        nudge_type: "blind_spot",
        short_message: "Nâng cấp RTX 4090 chỉ 5 triệu!",
        evidence_citation: {
          source_name: evidence.source_name,
          source_url: evidence.source_url,
          measured_at: evidence.measured_at,
        },
        cta_label: "Xem máy",
        cta_action: "view_variant",
        target_variant_ids: evidence.target_variant_ids,
      };
    },
  });
  const nudgeInput = {
    trigger_type: "DEEP_INSPECTION" as const,
    current_variant_id: "v-ideapad-8-512",
    recent_variant_ids: [],
    active_filters: {},
    user_profile: codingProfile,
  };
  const deps = makeDeps(blindSpotLlm, { nudgeCache: cache });
  const first = await evaluateProactiveNudge(nudgeInput, deps);
  assert.equal(blindSpotLlm.calls.length, 1);
  assert.equal(first.should_show, true);
  if (first.should_show) {
    assert.ok(first.short_message.includes("RAM"));
    assert.equal(first.short_message.includes("triệu"), false);
  }
  const second = await evaluateProactiveNudge(nudgeInput, deps);
  assert.equal(blindSpotLlm.calls.length, 1, "second call must hit the nudge cache");
  assert.deepEqual(second, first);
});

test("GPU version mismatch is flagged and never approved", async () => {
  const wrongGpu = mockReviewSources.find((source) => source.id === "review-legion-wrong-gpu")!;
  const review = await synthesizeReviewEvidence(
    {
      raw_text: wrongGpu.raw_text,
      source_name: wrongGpu.source_name,
      source_url: wrongGpu.source_url,
      measured_at: wrongGpu.measured_at,
      candidate_variants: mockVariants,
      target_variant_id: "v-legion-4060",
    },
    makeDeps(),
  );
  assert.equal(review.variant_id, "v-legion-4060");
  assert.equal(review.version_mismatch_warning, true);
  assert.ok((review.match_confidence ?? 1) < 0.6);
  assert.ok(review.draft.config_warning?.includes("rtx4070"));
  assert.equal(review.draft.status, "pending_review");
  assert.equal(review.status, "pending_review");
  assert.ok(review.qdrant_chunks.length > 0);
  for (const chunk of review.qdrant_chunks) {
    assert.equal(chunk.payload.status, "pending_review");
  }

  const crawl = await resolveCrawledEntity(
    {
      item: {
        raw_title: "Laptop ASUS Vivobook Pro 15 OLED M6500XV",
        raw_specs_json: { ram: "32GB", gpu: "RTX 4070" },
        raw_price: 29_000_000,
        raw_url: "https://shop.example/vivobook",
      },
    },
    makeDeps(),
  );
  const codes = new Set(crawl.anomaly_flags.map((flag) => flag.code));
  assert.ok(codes.has("SPEC_MISMATCH"));
  assert.equal(crawl.matched_variant_id, null);
  assert.equal(crawl.review_status, "needs_review");
});

test("comparison ignores fabricated LLM claims and explains real upgrades", async () => {
  const llm = scriptedLlm({
    comparison_explainer: {
      summary: "RTX 4090 chỉ 5 triệu là lựa chọn tốt nhất, không cần so sánh thêm.",
    },
  });
  const result = await explainComparisonTradeoffs(
    {
      variant_ids: ["v-ideapad-8-512", "v-vivobook-4050", "v-legion-4060"],
      user_profile: { ...officeProfile, max_budget_vnd: 25_000_000 },
    },
    makeDeps(llm),
  );
  assert.equal(llm.calls.length, 1);
  assert.equal(result.summary.includes("RTX 4090"), false);
  assert.equal(result.summary.includes("chỉ 5 triệu"), false);
  assert.ok(result.summary.startsWith("Từ "), "must fall back to the deterministic summary");
  assert.equal(result.upgrades.length, 2);
  assert.deepEqual(
    result.variants.map((variant) => variant.variant_id),
    ["v-ideapad-8-512", "v-vivobook-4050", "v-legion-4060"],
  );
  const firstUpgrade = result.upgrades[0]!;
  assert.ok(firstUpgrade.gains.some((gain) => gain.aspect === "ram"));
  assert.ok(firstUpgrade.gains.some((gain) => gain.aspect === "gpu"));
  assert.ok(result.unverified_notes.some((note) => note.includes("Chưa có dữ liệu kiểm chứng")));
});

test("external quote is matched to the exact variant and cannot bypass the budget", async () => {
  const quoteText = [
    "Laptop ASUS Vivobook Pro 15 OLED M6500XV",
    "Ryzen 7 7840HS, RTX 4050, 16GB RAM, 512GB SSD, 15.6 inch 2880x1620",
    "Giá niêm yết 24.990.000đ",
    "Phí bắt buộc 100.000đ",
    "Tặng túi chống sốc, trả góp 0%",
  ].join("\n");
  const result = await analyzeExternalQuote(
    {
      raw_url_or_text: quoteText,
      user_profile: { ...officeProfile, max_budget_vnd: 25_000_000 },
    },
    makeDeps(),
  );
  assert.equal(result.matched_variant?.variant.variant_id, "v-vivobook-4050");
  assert.equal(result.extracted.mandatory_fees_vnd, 100_000);
  assert.equal(result.price_check.effective_total_vnd, 25_090_000);
  assert.equal(result.budget_fit.within_budget, false);
  assert.equal(result.budget_fit.over_by_vnd, 90_000);
  assert.equal(result.requires_user_confirmation, true);
});

test("external quote cannot be matched across a conflicting GPU/RAM/storage configuration", async () => {
  const wrongConfigText = [
    "Laptop ASUS Vivobook Pro 15 OLED M6500XV",
    "Ryzen 7 7840HS, RTX 4070, 16GB RAM, 512GB SSD, 15.6 inch 2880x1620",
    "Giá niêm yết 27.990.000đ",
    "Phí bắt buộc 100.000đ",
  ].join("\n");
  const wrongConfig = await analyzeExternalQuote(
    { raw_url_or_text: wrongConfigText },
    makeDeps(),
  );
  assert.equal(wrongConfig.matched_variant, null);
  assert.ok(
    wrongConfig.warnings.some((warning) => warning.includes("không khớp biến thể published nào")),
  );
  assert.equal(wrongConfig.price_check.verdict, "insufficient_data");
  assert.equal(wrongConfig.requires_user_confirmation, true);

  const exact4060Text = [
    "Laptop ASUS Vivobook Pro 15 OLED M6500XV",
    "Ryzen 7 7840HS, RTX 4060, 32GB RAM, 1024GB SSD, 15.6 inch 2880x1620",
    "Giá niêm yết 29.990.000đ",
    "Phí bắt buộc 100.000đ",
  ].join("\n");
  const exact4060 = await analyzeExternalQuote(
    { raw_url_or_text: exact4060Text },
    makeDeps(),
  );
  assert.equal(exact4060.matched_variant?.variant.variant_id, "v-vivobook-4060");
  assert.equal(exact4060.extracted.gpu, "RTX 4060");
  assert.equal(exact4060.price_check.verdict, "fair");
});

test("crawled entity resolves exact SKU and flags missing fees and price outliers", async () => {
  const exact = await resolveCrawledEntity(
    {
      item: {
        raw_title: "Laptop ASUS Vivobook Pro 15 OLED M6500XV M6500XV-R74050",
        raw_specs_json: {
          sku: "M6500XV-R74050",
          ram: "16GB",
          gpu: "RTX 4050",
          fees_included: true,
        },
        raw_price: 24_990_000,
        raw_url: "https://gearvn.com/products/m6500xv-r74050",
      },
    },
    makeDeps(),
  );
  assert.equal(exact.matched_variant_id, "v-vivobook-4050");
  assert.equal(exact.review_status, "pending");
  assert.equal(exact.anomaly_flags.length, 0);
  assert.equal(exact.candidates[0]?.variant_id, "v-vivobook-4050");
  assert.equal(exact.normalized_item.review_status, "pending");

  const missingFees = await resolveCrawledEntity(
    {
      item: {
        raw_title: "Laptop ASUS Vivobook Pro 15 OLED M6500XV M6500XV-R74050",
        raw_specs_json: { sku: "M6500XV-R74050", ram: "16GB", gpu: "RTX 4050" },
        raw_price: 24_990_000,
        raw_url: "https://gearvn.com/products/m6500xv-r74050",
      },
      requires_mandatory_fees: true,
    },
    makeDeps(),
  );
  assert.ok(
    new Set(missingFees.anomaly_flags.map((flag) => flag.code)).has(
      "MISSING_MANDATORY_FEES",
    ),
  );
  assert.equal(missingFees.review_status, "needs_review");

  const outlier = await resolveCrawledEntity(
    {
      item: {
        raw_title: "Laptop ASUS Vivobook Pro 15 OLED M6500XV M6500XV-R74050",
        raw_specs_json: {
          sku: "M6500XV-R74050",
          ram: "16GB",
          gpu: "RTX 4050",
          fees_included: true,
        },
        raw_price: 15_000_000,
        raw_url: "https://gearvn.com/products/m6500xv-r74050",
      },
    },
    makeDeps(),
  );
  assert.ok(
    new Set(outlier.anomaly_flags.map((flag) => flag.code)).has("PRICE_OUTLIER"),
  );
  assert.equal(outlier.review_status, "needs_review");
});

test("ambiguous crawl stays unresolved and cannot auto-publish", async () => {
  const result = await resolveCrawledEntity(
    {
      item: {
        raw_title: "Laptop ASUS Vivobook Pro 15 OLED M6500XV",
        raw_specs_json: {},
        raw_price: null,
        raw_url: "https://shop.example/vivobook",
      },
    },
    makeDeps(),
  );
  const codes = new Set(result.anomaly_flags.map((flag) => flag.code));
  assert.ok(codes.has("AMBIGUOUS_VARIANT"));
  assert.equal(result.matched_variant_id, null);
  assert.equal(result.review_status, "needs_review");
  assert.ok(result.candidates.length >= 2);
  assert.equal(result.normalized_item.review_status, "needs_review");
});

test("review version guard flags CPU and display differences", async () => {
  const variantRef = {
    id: "v-legion-4060",
    sku_code: "82YU00VHVN",
    cpu: "Intel Core i7-13650HX",
    gpu: "NVIDIA GeForce RTX 4060 8GB",
    ram_gb: 16,
    display_size: 15.6,
    display_res: "2560x1440",
    display_panel: "IPS",
  };
  assert.equal(
    configWarning(
      "Bài đo dùng CPU i7-13650HX, RTX 4060, 16GB RAM, màn hình 15.6 inch 2560x1440 IPS.",
      variantRef,
    ),
    null,
  );

  const cpuWarning = configWarning(
    "Bài đo dùng CPU i7-13700H, RTX 4060, 16GB RAM, màn hình 15.6 inch 2560x1440 IPS.",
    variantRef,
  );
  assert.ok(cpuWarning?.includes("i7-13700h"));

  const displayWarning = configWarning(
    "Bài đo dùng CPU i7-13650HX, RTX 4060, 16GB RAM, màn hình 14 inch 1920x1080 IPS.",
    variantRef,
  );
  assert.ok(displayWarning?.includes("14"));
  assert.ok(displayWarning?.includes("1920x1080"));

  const review = await synthesizeReviewEvidence(
    {
      raw_text:
        "Lenovo Legion 5 15IRX9 82YU00VHVN dùng CPU i7-13700H, RTX 4060 8GB, 16GB RAM, màn hình 15.6 inch 2560x1440 IPS. " +
        "Hiệu năng tốt và quạt êm khi làm việc.",
      source_name: "Relab",
      source_url: "https://relab.vn/review/legion-wrong-cpu",
      measured_at: "2026-11-01",
      candidate_variants: mockVariants,
      target_variant_id: "v-legion-4060",
    },
    makeDeps(),
  );
  assert.equal(review.version_mismatch_warning, true);
  assert.ok(review.draft.config_warning?.includes("i7-13700h"));
  assert.equal(review.status, "pending_review");
});

test("nudge prompt stays compact, caches per context, and fails closed without a catalog", async () => {
  interface NudgeCapture {
    variants_summary: unknown[];
    db_evidence: unknown[];
  }
  const capture: { current: NudgeCapture | null } = { current: null };
  const llm = scriptedLlm({
    nudge_micro_prompt: (input: unknown) => {
      const payload = input as NudgeCapture & {
        db_evidence: {
          source_name: string;
          source_url: string;
          measured_at: string;
          target_variant_ids: string[];
        }[];
      };
      capture.current = payload;
      const evidence = payload.db_evidence[0]!;
      return {
        should_show: true,
        nudge_type: "comparison_insight",
        short_message: "RAM 16GB phù hợp hơn cho lập trình.",
        evidence_citation: {
          source_name: evidence.source_name,
          source_url: evidence.source_url,
          measured_at: evidence.measured_at,
        },
        cta_label: "So sánh",
        cta_action: "compare",
        target_variant_ids: evidence.target_variant_ids,
      };
    },
  });
  const cache = createMemoryNudgeCache();
  const deps = makeDeps(llm, { nudgeCache: cache });
  const profile: UserRequirementProfile = { ...codingProfile, max_budget_vnd: 50_000_000 };
  const input = {
    trigger_type: "COMPARISON_HESITATION" as const,
    current_variant_id: "v-ideapad-8-512",
    recent_variant_ids: mockVariants.map((variant) => variant.id),
    active_filters: { min_ram_gb: 16 },
    user_profile: profile,
  };

  const first = await evaluateProactiveNudge(input, deps);
  assert.equal(first.should_show, true);
  const prompt = capture.current;
  assert.ok(prompt);
  assert.ok(prompt.variants_summary.length <= 3);
  assert.ok(prompt.db_evidence.length <= 2);
  assert.ok(JSON.stringify(prompt).length < 1800, "micro-prompt must stay compact");

  await evaluateProactiveNudge(input, deps);
  assert.equal(llm.calls.length, 1, "same trigger context must hit the cache");

  await evaluateProactiveNudge(
    { ...input, recent_variant_ids: ["v-ideapad-16-512"] },
    deps,
  );
  assert.equal(llm.calls.length, 2, "changed comparison context must not reuse a stale nudge");

  const failingCatalog = createFakeCatalogRepository({
    getVariantsByIds: async () => {
      throw new Error("postgres down");
    },
  });
  const offlineLlm = scriptedLlm({});
  const offline = await evaluateProactiveNudge(
    {
      trigger_type: "DEEP_INSPECTION",
      current_variant_id: "v-ideapad-8-512",
      recent_variant_ids: [],
      active_filters: {},
      user_profile: codingProfile,
    },
    makeDeps(offlineLlm, { catalog: failingCatalog }),
  );
  assert.deepEqual(offline, { should_show: false });
  assert.equal(offlineLlm.calls.length, 0);
});

test("nudge rejects invented hardware even when the citation is valid", async () => {
  const llm = scriptedLlm({
    nudge_micro_prompt: (input: unknown) => {
      const evidence = (
        input as {
          db_evidence: {
            source_name: string;
            source_url: string;
            measured_at: string;
            target_variant_ids: string[];
          }[];
        }
      ).db_evidence[0]!;
      return {
        should_show: true,
        nudge_type: "blind_spot",
        short_message: "Nâng cấp RTX 4090 cho mượt hơn.",
        evidence_citation: {
          source_name: evidence.source_name,
          source_url: evidence.source_url,
          measured_at: evidence.measured_at,
        },
        cta_label: "Xem máy",
        cta_action: "view_variant",
        target_variant_ids: evidence.target_variant_ids,
      };
    },
  });
  const result = await evaluateProactiveNudge(
    {
      trigger_type: "DEEP_INSPECTION",
      current_variant_id: "v-ideapad-8-512",
      recent_variant_ids: [],
      active_filters: {},
      user_profile: codingProfile,
    },
    makeDeps(llm),
  );
  assert.equal(result.should_show, true);
  if (result.should_show) {
    assert.equal(result.short_message.includes("RTX 4090"), false);
    assert.ok(result.short_message.includes("RAM"));
  }
});

test("picker and comparison reject invented hardware without invented prices", async () => {
  const pickerLlm = scriptedLlm({
    picker_explanation: (input: unknown) => {
      const recommendations = (input as { recommendations: { variant_id: string }[] }).recommendations;
      return {
        advisor_note: "RTX 4090 là lựa chọn tốt nhất.",
        recommendations: [
          {
            variant_id: recommendations[0]!.variant_id,
            fit_reasons: ["GPU RTX 4090 mạnh nhất"],
            tradeoffs: [],
          },
        ],
      };
    },
  });
  const picker = await runConversationalPicker(confirmedOfficeInput, makeDeps(pickerLlm));
  assert.equal(picker.status, "COMPLETED");
  assert.equal(JSON.stringify(picker).includes("RTX 4090"), false);

  const comparisonLlm = scriptedLlm({
    comparison_explainer: { summary: "RTX 4090 mạnh hơn nhiều." },
  });
  const comparison = await explainComparisonTradeoffs(
    {
      variant_ids: ["v-ideapad-8-512", "v-vivobook-4050", "v-legion-4060"],
      user_profile: { ...officeProfile, max_budget_vnd: 25_000_000 },
    },
    makeDeps(comparisonLlm),
  );
  assert.equal(comparison.summary.includes("RTX 4090"), false);
  assert.ok(comparison.summary.startsWith("Từ "));
});

test("hybrid RAG validates Qdrant payloads against approved PostgreSQL rows and exact SKU", async () => {
  const row = mockApprovedEvidence[0]!;
  const catalog = createFakeCatalogRepository({
    findApprovedEvidences: async () => [{ ...row }],
  });
  let sawFilter: QdrantPayloadFilter | null = null;
  const basePayload = buildChunkPayload({
    evidence_id: row.id,
    model_id: row.model_id,
    variant_id: row.variant_id,
    sku_code: row.sku_code,
    source_url: row.source_url,
    measured_at: row.measured_at,
    status: row.status,
    claim: "Cinebench R23 đa nhân 12.450 điểm.",
    source_label: row.source_name,
  });
  const vectors: VectorStore = {
    async search(input) {
      sawFilter = input.filter;
      return [
        {
          id: "point-valid",
          score: 0.91,
          payload: { ...basePayload, claim: "Cinebench R23 đa nhân 12.450 điểm." },
        },
        {
          id: "point-wrong-sku",
          score: 0.88,
          payload: { ...basePayload, claim: "BỊA 999 fps", sku_code: "OTHER-SKU" },
        },
        {
          id: "point-draft",
          score: 0.81,
          payload: { ...basePayload, claim: "BỊA chưa duyệt", status: "draft" },
        },
      ];
    },
  };
  const retriever = createHybridEvidenceRetriever({ catalog, vectors });
  const result = await searchVerifiedEvidences(
    { variant_ids: [row.variant_id], query: "hiệu năng pin", limit: 6 },
    { evidence: retriever },
  );

  assert.ok(sawFilter);
  const filter = sawFilter as QdrantPayloadFilter;
  assert.ok(filter.must.some((condition) => condition.key === "sku_code"));
  assert.equal(result.status, "available");
  assert.ok(result.evidences.every((item) => item.sku_code === row.sku_code));
  assert.equal(result.evidences.some((item) => item.claim.includes("BỊA")), false);
});

test("postgres adapter hard-filters published, non-merged, approved rows", async () => {
  const queries: { sql: string; params?: readonly unknown[] }[] = [];
  const client: SqlClient = {
    async query<Row extends Record<string, unknown>>(sql: string, params?: readonly unknown[]) {
      queries.push({ sql, params });
      return { rows: [] as Row[] };
    },
  };
  const repository = createPostgresCatalogRepository(client);

  await repository.listResolutionVariants();
  const listSql = queries.at(-1)!.sql;
  assert.match(listSql, /v\.status = 'published'/);
  assert.match(listSql, /m\.status = 'published'/);
  assert.match(listSql, /v\.merged_into_id IS NULL/);

  await repository.findApprovedEvidences(["v-vivobook-4050"]);
  const evidenceSql = queries.at(-1)!.sql;
  assert.match(evidenceSql, /e\.status = 'approved'/);
  assert.match(evidenceSql, /v\.status = 'published'/);
  assert.match(evidenceSql, /m\.status = 'published'/);
  assert.match(evidenceSql, /v\.merged_into_id IS NULL/);

  await repository.getPriceHistory(["v-vivobook-4050"]);
  const historySql = queries.at(-1)!.sql;
  assert.match(historySql, /ph\.variant_id = ANY\(\$1::text\[\]\)/);
  assert.match(historySql, /v\.merged_into_id IS NULL/);
});

test("price history reads the latest recorded_at, not warehouse row order", async () => {
  const catalog = createFakeCatalogRepository({
    getPriceHistory: async () => [
      { variant_id: "v-vivobook-4050", price_vnd: 20_000_000, recorded_at: "2026-11-01T00:00:00.000Z" },
      { variant_id: "v-vivobook-4050", price_vnd: 24_000_000, recorded_at: "2026-08-01T00:00:00.000Z" },
      { variant_id: "v-vivobook-4050", price_vnd: 22_000_000, recorded_at: "2026-09-01T00:00:00.000Z" },
    ],
  });
  const deal = await findSimilarDealsAndPriceHistory(
    { variant_id: "v-vivobook-4050" },
    { catalog },
  );
  assert.equal(deal.latest_history_vnd, 20_000_000);
  assert.equal(deal.median_history_vnd, 22_000_000);
  assert.equal(deal.change_pct, -13);
});
