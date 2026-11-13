import { z } from "zod";

import type {
  AnomalyFlag,
  EntityResolutionInput,
  PriceHistoryPoint,
  ProductVariant,
  ResolutionResult,
  StagingCrawledItem,
} from "../types/db.types.js";

export const HIGH_CONFIDENCE = 0.85;
export const PRICE_ANOMALY_RATIO = 0.25;
export const DISPLAY_TOLERANCE = 0.15;

const GENERIC = new Set([
  "laptop",
  "phone",
  "dien",
  "thoai",
  "may",
  "tinh",
  "gaming",
  "new",
  "chinh",
  "hang",
  "intel",
  "amd",
  "core",
  "ryzen",
  "nvidia",
  "geforce",
  "gb",
  "ssd",
  "ram",
]);

const GPU_RE = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/i;
const RAM_FIELD_RE = /(\d{1,3})\s*gb\b/i;
const SCREEN_RE = /(\d{2}(?:[.,]\d)?)\s*(?:inch|inches|"|”)/i;
const RES_RE = /(\d{3,4})\s*[x×]\s*(\d{3,4})/i;
const RAM_LABEL_RE = /(\d{1,3})\s*gb\s*ram|\bram\D{0,8}(\d{1,3})\s*gb/i;

const RAM_KEYS = ["ram_gb", "ram", "Dung lượng RAM", "dung_luong_ram"] as const;
const GPU_KEYS = ["gpu", "Loại card đồ họa", "gpu_name"] as const;
const SIZE_KEYS = ["display_size", "screen", "Kích thước màn hình"] as const;
const RES_KEYS = ["display_res", "Độ phân giải màn hình", "display_resolution"] as const;
const SKU_KEYS = ["sku_code", "sku", "SKU"] as const;
const PRICE_KEYS = ["price", "listed_price_vnd", "current"] as const;

export const anomalyFlagSchema = z
  .object({
    code: z.enum([
      "spec_mismatch",
      "price_anomaly",
      "missing_mandatory_fees",
      "ambiguous_variant",
      "blocked_auto_publish",
    ]),
    detail: z.string(),
  })
  .strict();

export const resolutionResultSchema = z
  .object({
    matched_variant_id: z.string().nullable(),
    confidence_score: z.number().min(0).max(1),
    anomaly_flags: z.array(anomalyFlagSchema),
    review_status: z.enum(["pending", "needs_review"]),
  })
  .strict();

interface Observation {
  sku: string | null;
  ram_gb: number | null;
  gpu_code: string | null;
  display_size: number | null;
  display_res: string | null;
  price_vnd: number | null;
  fees_known: boolean;
}

interface MatchDecision {
  matched_variant_id: string | null;
  confidence_score: number;
  anomaly_flags: AnomalyFlag[];
  observed: Observation;
  compared_to: string | null;
}

export function resolveStagingItem(input: EntityResolutionInput): ResolutionResult {
  const decision = decideMatch(input.item, input.variants);
  const flagged = applyAnomalies(decision, input.item, input.price_points ?? [], {
    requiresMandatoryFees: input.requires_mandatory_fees ?? false,
  });
  return resolutionResultSchema.parse(blockPublication(flagged));
}

export function blockPublication(
  result: Omit<ResolutionResult, "review_status"> & { review_status: string },
): ResolutionResult {
  const flags = result.anomaly_flags.map((flag) => ({ ...flag }));
  if (result.review_status === "pending" || result.review_status === "needs_review") {
    return {
      matched_variant_id: result.matched_variant_id,
      confidence_score: result.confidence_score,
      anomaly_flags: flags,
      review_status: result.review_status,
    };
  }
  flags.push({
    code: "blocked_auto_publish",
    detail: "Agent không được chuyển bản ghi sang approved.",
  });
  return {
    matched_variant_id: result.matched_variant_id,
    confidence_score: result.confidence_score,
    anomaly_flags: flags,
    review_status: "needs_review",
  };
}

function decideMatch(item: StagingCrawledItem, variants: readonly ProductVariant[]): MatchDecision {
  const observed = extractObservation(item);
  const title = item.raw_title ?? "";
  const usable = variants.filter((variant) => !variant.merged_into_id);
  const skuHits = usable.filter((variant) => skuMatches(observed.sku, title, variant));
  const flags: AnomalyFlag[] = [];

  if (skuHits.length > 1) {
    flags.push({
      code: "ambiguous_variant",
      detail: "Nhiều biến thể cùng mã SKU. Không gán tự động.",
    });
    return decision(null, 0.35, flags, observed);
  }

  if (skuHits.length === 1) {
    const candidate = skuHits[0]!;
    const reasons = contradictions(observed, candidate);
    if (reasons.length > 0) {
      flags.push({
        code: "spec_mismatch",
        detail: `SKU khớp nhưng linh kiện khác: ${reasons.join("; ")}`,
      });
      return decision(candidate.id, 0.4, flags, observed);
    }
    const confidence = specsPresent(observed) ? 0.96 : 0.9;
    return decision(candidate.id, confidence, flags, observed);
  }

  const nameHits = usable.filter((variant) => nameMatch(variant, title));
  if (nameHits.length === 0) {
    return decision(null, 0.05, flags, observed);
  }

  const compatible = nameHits.filter((variant) => contradictions(observed, variant).length === 0);
  if (compatible.length === 1) {
    const confidence = specsPresent(observed) ? 0.88 : 0.72;
    return decision(compatible[0]!.id, confidence, flags, observed);
  }
  if (compatible.length > 1) {
    flags.push({
      code: "ambiguous_variant",
      detail: "Cùng dòng máy khớp nhiều cấu hình. Cần admin chọn variant.",
    });
    return decision(null, 0.35, flags, observed);
  }

  const nearest = nameHits[0]!;
  const reasons = contradictions(observed, nearest);
  flags.push({
    code: "spec_mismatch",
    detail: `Cùng dòng ${nearest.model_name} nhưng khác linh kiện: ${reasons.join("; ")}`,
  });
  return decision(null, 0.3, flags, observed, nearest.id);
}

function applyAnomalies(
  match: MatchDecision,
  item: StagingCrawledItem,
  pricePoints: readonly PriceHistoryPoint[],
  options: { requiresMandatoryFees: boolean },
): ResolutionResult {
  const flags = match.anomaly_flags.map((flag) => ({ ...flag }));
  const compared = match.matched_variant_id ?? match.compared_to;
  if (match.observed.price_vnd != null && compared) {
    const median = medianPrice(pricePoints, compared);
    if (median) {
      const ratio = Math.abs(match.observed.price_vnd - median) / median;
      if (ratio > PRICE_ANOMALY_RATIO) {
        flags.push({
          code: "price_anomaly",
          detail:
            `Giá ${match.observed.price_vnd} lệch ${formatPercent(ratio)} so với trung vị ` +
            `${Math.trunc(median)} của biến thể ${compared}.`,
        });
      }
    }
  }
  if (options.requiresMandatoryFees && !match.observed.fees_known) {
    flags.push({
      code: "missing_mandatory_fees",
      detail: "Cửa hàng yêu cầu phí bắt buộc nhưng bản crawl không khai báo.",
    });
  } else if (feesExplicitlyMissing(item) && !match.observed.fees_known) {
    flags.push({
      code: "missing_mandatory_fees",
      detail: "Bản crawl khai báo mandatory_fees_vnd rỗng.",
    });
  }

  let confidence = match.confidence_score;
  const matched = match.matched_variant_id;
  let reviewStatus: ResolutionResult["review_status"];
  if (flags.length > 0) {
    confidence = Math.min(confidence, 0.49);
    reviewStatus = "needs_review";
  } else if (matched && confidence >= HIGH_CONFIDENCE) {
    reviewStatus = "pending";
  } else {
    reviewStatus = "needs_review";
  }
  return {
    matched_variant_id: matched,
    confidence_score: round4(confidence),
    anomaly_flags: flags,
    review_status: reviewStatus,
  };
}

function extractObservation(item: StagingCrawledItem): Observation {
  const specs = asRecord(item.raw_specs_json);
  const nested = asRecord(specs.rawSpecs);
  const title = item.raw_title ?? "";
  const sku = firstText(specs, nested, SKU_KEYS);
  let ram = ramFromValue(firstValue(specs, nested, RAM_KEYS));
  if (ram == null) ram = ramNearLabel(title);
  const gpuText = firstText(specs, nested, GPU_KEYS) ?? title;
  let size = sizeFromValue(firstValue(specs, nested, SIZE_KEYS));
  if (size == null) size = sizeFromValue(title);
  const resolutionText = firstText(specs, nested, RES_KEYS);
  const displayRes = resolutionText ? normRes(resolutionText) : null;
  const fees = readFees(specs, nested);
  const price = item.raw_price ?? firstValue(specs, nested, PRICE_KEYS);
  return {
    sku,
    ram_gb: ram,
    gpu_code: gpuCode(gpuText),
    display_size: size,
    display_res: displayRes,
    price_vnd: asInt(price),
    fees_known: fees.known,
  };
}

function contradictions(observed: Observation, variant: ProductVariant): string[] {
  const reasons: string[] = [];
  const variantRam = asInt(variant.ram_gb);
  if (observed.ram_gb != null && variantRam != null && observed.ram_gb !== variantRam) {
    reasons.push(`RAM ${observed.ram_gb}GB khác ${variantRam}GB`);
  }
  const variantGpu = gpuCode(variant.gpu ?? "");
  if (observed.gpu_code && variantGpu && observed.gpu_code !== variantGpu) {
    reasons.push(`GPU ${observed.gpu_code} khác ${variantGpu}`);
  }
  const variantSize = asFloat(variant.display_size);
  if (
    observed.display_size != null &&
    variantSize != null &&
    Math.abs(observed.display_size - variantSize) > DISPLAY_TOLERANCE
  ) {
    reasons.push(`màn hình ${observed.display_size}" khác ${variantSize}"`);
  }
  const variantRes = normRes(variant.display_res ?? "");
  if (observed.display_res && variantRes && observed.display_res !== variantRes) {
    reasons.push(`độ phân giải ${observed.display_res} khác ${variantRes}`);
  }
  return reasons;
}

function nameMatch(variant: ProductVariant, title: string): boolean {
  const folded = title.toLowerCase();
  const brand = (variant.brand ?? "").toLowerCase().trim();
  if (brand && !folded.includes(brand)) return false;
  const tokens = distinctiveTokens(variant.model_name ?? "");
  if (tokens.length === 0) return false;
  return tokens.every((token) => folded.includes(token));
}

function distinctiveTokens(name: string): string[] {
  return [...name.toLowerCase().matchAll(/[a-z0-9]+/g)]
    .map((match) => match[0])
    .filter((token) => token.length >= 3 && !GENERIC.has(token));
}

function gpuCode(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = GPU_RE.exec(text);
  if (!match?.[1] || !match[2]) return null;
  return `${match[1].toLowerCase()}${match[2]}`;
}

function normRes(text: string): string {
  const match = RES_RE.exec(text || "");
  if (!match?.[1] || !match[2]) return "";
  return `${match[1]}x${match[2]}`;
}

function medianPrice(points: readonly PriceHistoryPoint[], variantId: string): number | null {
  const values = points
    .filter((point) => String(point.variant_id) === String(variantId) && point.price_vnd != null)
    .map((point) => Math.trunc(point.price_vnd));
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

function decision(
  matched: string | null,
  confidence: number,
  flags: AnomalyFlag[],
  observed: Observation,
  comparedTo: string | null = null,
): MatchDecision {
  return {
    matched_variant_id: matched,
    confidence_score: confidence,
    anomaly_flags: flags,
    observed,
    compared_to: comparedTo,
  };
}

function specsPresent(observed: Observation): boolean {
  return [observed.ram_gb, observed.gpu_code, observed.display_size, observed.display_res].some(
    (value) => value != null,
  );
}

function skuMatches(observedSku: string | null, title: string, variant: ProductVariant): boolean {
  const sku = variant.sku_code ?? "";
  if (!sku) return false;
  if (observedSku && observedSku.toLowerCase() === sku.toLowerCase()) return true;
  if (sku.length < 5) return false;
  return title.toLowerCase().includes(sku.toLowerCase());
}

function firstValue(
  specs: Record<string, unknown>,
  nested: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const source of [specs, nested]) {
    for (const key of keys) {
      if (key in source && source[key] != null && source[key] !== "") return source[key];
    }
  }
  return null;
}

function firstText(
  specs: Record<string, unknown>,
  nested: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  const value = firstValue(specs, nested, keys);
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function ramFromValue(value: unknown): number | null {
  if (value == null || typeof value === "boolean") return null;
  if (typeof value === "number" && Number.isInteger(value)) {
    return value <= 256 ? value : null;
  }
  const match = RAM_FIELD_RE.exec(String(value));
  if (!match?.[1]) return null;
  const number = Number(match[1]);
  return number > 256 ? null : number;
}

function ramNearLabel(title: string): number | null {
  const match = RAM_LABEL_RE.exec(title);
  if (!match) return null;
  return Number(match[1] || match[2]);
}

function sizeFromValue(value: unknown): number | null {
  if (value == null || typeof value === "boolean") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 10 && value <= 20 ? value : null;
  }
  const match = SCREEN_RE.exec(String(value));
  if (!match?.[1]) return null;
  return Number(match[1].replace(",", "."));
}

function readFees(
  specs: Record<string, unknown>,
  nested: Record<string, unknown>,
): { known: boolean; amount: number | null } {
  for (const source of [specs, nested]) {
    if (source.fees_included === true) return { known: true, amount: 0 };
    if ("mandatory_fees_vnd" in source && source.mandatory_fees_vnd != null) {
      return { known: true, amount: asInt(source.mandatory_fees_vnd) };
    }
  }
  return { known: false, amount: null };
}

function feesExplicitlyMissing(item: StagingCrawledItem): boolean {
  const specs = asRecord(item.raw_specs_json);
  return Object.prototype.hasOwnProperty.call(specs, "mandatory_fees_vnd") && specs.mandatory_fees_vnd == null;
}

function asInt(value: unknown): number | null {
  if (value == null || typeof value === "boolean") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const text = String(value).trim().replaceAll(".", "").replaceAll(",", "");
  if (/^\d+$/.test(text)) return Number(text);
  return null;
}

function asFloat(value: unknown): number | null {
  if (value == null || typeof value === "boolean") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
