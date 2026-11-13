import assert from "node:assert/strict";
import test from "node:test";

import type { ProductVariant, StagingCrawledItem } from "../types/db.types.js";
import { blockPublication, resolveStagingItem } from "./entity-resolution.js";
import { runEntityResolution, runReviewSynthesis } from "./graphs.js";
import { synthesizeReview } from "./review-synthesis.js";

function variant(overrides: Partial<ProductVariant> & Pick<ProductVariant, "id" | "sku_code">): ProductVariant {
  return {
    model_id: "m1",
    category: "laptop",
    region: "VN",
    cpu: null,
    gpu: "NVIDIA GeForce RTX 3050",
    ram_gb: 8,
    ram_type: null,
    ram_upgradable: null,
    storage_gb: null,
    storage_slots: null,
    display_size: 15.3,
    display_res: "1920x1200",
    display_panel: null,
    color_gamut: null,
    refresh_rate: null,
    battery_wh: null,
    weight_kg: null,
    os: null,
    specs_json: {},
    status: "draft",
    merged_into_id: null,
    model_name: "LOQ 15IRH11E",
    brand: "Lenovo",
    ...overrides,
  };
}

const v8 = variant({ id: "v8", sku_code: "83Y9003VVN" });
const v16 = variant({
  id: "v16",
  sku_code: "83Y9004VVN",
  ram_gb: 16,
  gpu: "NVIDIA GeForce RTX 4050",
});

function item(overrides: Partial<StagingCrawledItem> = {}): StagingCrawledItem {
  return {
    raw_title: "Laptop Lenovo LOQ 15IRH11E",
    raw_specs_json: { ram: "8GB", gpu: "RTX 3050", screen: "15.3 inch" },
    raw_price: 25_000_000,
    raw_url: "https://example.test/loq",
    ...overrides,
  };
}

function codes(result: { anomaly_flags: { code: string }[] }): Set<string> {
  return new Set(result.anomaly_flags.map((flag) => flag.code));
}

const review = [
  "Hiệu năng thực tế đạt 60 fps trong game.",
  "Nhiệt độ CPU khoảng 85 độ và quạt ồn khi render.",
  "Pin dùng văn phòng khoảng 6 giờ.",
  "Điểm trừ là webcam tối và bản lề lỏng.",
].join(" ");

const reviewVariant = {
  id: "v16",
  sku_code: "83Y9004VVN",
  ram_gb: 16,
  gpu: "NVIDIA GeForce RTX 4050",
};

test("exact sku stays pending and is not approved", () => {
  const result = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_specs_json: {
        sku: "83Y9003VVN",
        ram: "8GB",
        gpu: "RTX 3050",
        screen: "15.3 inch",
        fees_included: true,
      },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 26_990_000 }],
  });
  assert.equal(result.matched_variant_id, "v8");
  assert.equal(result.review_status, "pending");
  assert.ok(result.confidence_score >= 0.85);
  assert.deepEqual(result.anomaly_flags, []);
});

test("same name with different ram, gpu, or display is flagged", () => {
  const ram = resolveStagingItem({
    item: item({ raw_specs_json: { ram: "16GB", gpu: "RTX 3050", screen: "15.3 inch" } }),
    variants: [v8],
  });
  assert.ok(codes(ram).has("spec_mismatch"));
  assert.equal(ram.matched_variant_id, null);
  assert.equal(ram.review_status, "needs_review");

  const gpu = resolveStagingItem({
    item: item({ raw_specs_json: { ram: "8GB", gpu: "RTX 4050", screen: "15.3 inch" } }),
    variants: [v8],
  });
  assert.ok(codes(gpu).has("spec_mismatch"));
  assert.notEqual(gpu.matched_variant_id, "v8");

  const display = resolveStagingItem({
    item: item({ raw_specs_json: { ram: "8GB", gpu: "RTX 3050", screen: "14 inch" } }),
    variants: [v8],
  });
  assert.ok(codes(display).has("spec_mismatch"));
});

test("matching component variant is chosen", () => {
  const result = resolveStagingItem({
    item: item({
      raw_specs_json: { ram: "16GB", gpu: "RTX 4050", screen: "15.3 inch", fees_included: true },
    }),
    variants: [v8, v16],
  });
  assert.equal(result.matched_variant_id, "v16");
  assert.equal(codes(result).has("spec_mismatch"), false);
  assert.equal(result.review_status, "pending");
});

test("sku conflict with specs stays in review", () => {
  const result = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_specs_json: { sku: "83Y9003VVN", ram: "16GB", gpu: "RTX 3050" },
    }),
    variants: [v8],
  });
  assert.equal(result.matched_variant_id, "v8");
  assert.ok(codes(result).has("spec_mismatch"));
  assert.equal(result.review_status, "needs_review");
  assert.ok(result.confidence_score < 0.85);
});

test("price far from history is flagged and the exact 25 percent band is not", () => {
  const far = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_price: 14_000_000,
      raw_specs_json: { sku: "83Y9003VVN", ram: "8GB", gpu: "RTX 3050", fees_included: true },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 20_000_000 }],
  });
  assert.ok(codes(far).has("price_anomaly"));
  assert.equal(far.review_status, "needs_review");

  const inside = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_price: 18_000_000,
      raw_specs_json: { sku: "83Y9003VVN", ram: "8GB", gpu: "RTX 3050", fees_included: true },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 20_000_000 }],
  });
  assert.equal(codes(inside).has("price_anomaly"), false);
  assert.equal(inside.review_status, "pending");

  const edge = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_price: 15_000_000,
      raw_specs_json: { sku: "83Y9003VVN", ram: "8GB", gpu: "RTX 3050", fees_included: true },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 20_000_000 }],
  });
  assert.equal(codes(edge).has("price_anomaly"), false);
});

test("missing mandatory fees and an ambiguous name stay in review", () => {
  const fees = resolveStagingItem({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_specs_json: { sku: "83Y9003VVN", ram: "8GB", gpu: "RTX 3050", screen: "15.3 inch" },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 25_000_000 }],
    requires_mandatory_fees: true,
  });
  assert.ok(codes(fees).has("missing_mandatory_fees"));
  assert.equal(fees.review_status, "needs_review");

  const ambiguous = resolveStagingItem({
    item: item({ raw_specs_json: {} }),
    variants: [v8, v16],
  });
  assert.ok(codes(ambiguous).has("ambiguous_variant"));
  assert.equal(ambiguous.matched_variant_id, null);
});

test("resolution graph cannot approve", async () => {
  const result = await runEntityResolution({
    item: item({
      raw_title: "Laptop Lenovo LOQ 15IRH11E 83Y9003VVN",
      raw_specs_json: { sku: "83Y9003VVN", ram: "8GB", gpu: "RTX 3050", fees_included: true },
    }),
    variants: [v8],
    price_points: [{ variant_id: "v8", price_vnd: 26_990_000 }],
  });
  assert.ok(result.review_status === "pending" || result.review_status === "needs_review");
  const blocked = blockPublication({ ...result, review_status: "approved" });
  assert.equal(blocked.review_status, "needs_review");
  assert.ok(codes(blocked).has("blocked_auto_publish"));
});

test("four review groups keep the source and stay pending", () => {
  const result = synthesizeReview({
    raw_text: review,
    variant: reviewVariant,
    source_name: "Relab",
    source_url: "https://relab.example/loq",
    measured_at: "2026-03-01",
  });
  assert.equal(result.status, "pending_review");
  assert.equal(result.config_warning, null);
  for (const key of [
    "summary_performance",
    "summary_thermals_noise",
    "summary_battery",
    "summary_cons_quirks",
  ] as const) {
    assert.ok(result[key]?.includes("https://relab.example/loq"));
    assert.ok(result[key]?.includes("2026-03-01"));
  }
  assert.ok(result.summary_performance?.includes("60 fps"));
  assert.ok(result.summary_thermals_noise?.includes("ồn"));
  assert.ok(result.summary_battery?.includes("6 giờ"));
  assert.ok(result.summary_cons_quirks?.includes("webcam"));
});

test("wrong ram, gpu, and sibling sku warn for admin review", () => {
  const hardware = synthesizeReview({
    raw_text: `${review} Bản đo là máy 32GB RTX 3050.`,
    variant: reviewVariant,
    source_name: "Relab",
    source_url: "https://relab.example/loq",
    measured_at: "2026-03-01",
    sibling_skus: ["83Y9003VVN"],
  });
  assert.equal(hardware.status, "pending_review");
  assert.ok(hardware.config_warning?.includes("32GB"));
  assert.ok(hardware.config_warning?.includes("rtx3050"));

  const sibling = synthesizeReview({
    raw_text: `${review} So với 83Y9003VVN.`,
    variant: reviewVariant,
    source_name: "Relab",
    source_url: "https://relab.example/loq",
    measured_at: "2026-03-01",
    sibling_skus: ["83Y9003VVN"],
  });
  assert.ok(sibling.config_warning?.includes("83Y9003VVN"));
});

test("synthesis graph forces pending_review when the extractor approves or throws", async () => {
  const approved = await runReviewSynthesis({
    request: {
      raw_text: review,
      variant: reviewVariant,
      source_name: "Relab",
      source_url: "https://relab.example/loq",
      measured_at: "2026-03-01",
    },
    extractor: (request) => {
      const result = synthesizeReview(request);
      return { ...result, status: "approved" };
    },
  });
  assert.equal(approved.status, "pending_review");

  const disabled = await runReviewSynthesis({
    request: {
      raw_text: review,
      variant: reviewVariant,
      source_name: "Relab",
      source_url: "https://relab.example/loq",
      measured_at: "2026-03-01",
    },
    ai_fallback_enabled: false,
    extractor: () => {
      throw new Error("model down");
    },
  });
  assert.equal(disabled.status, "pending_review");
  assert.equal(disabled.ai_blocked, true);
  assert.ok(disabled.config_warning?.includes("Fallback đang tắt"));
  assert.equal(disabled.summary_performance, null);
});
