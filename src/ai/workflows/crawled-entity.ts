import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { resolveStagingItem } from "../agents/entity-resolution.js";
import type { AiEngineDeps } from "../deps.js";
import {
  crawlArbiterSchema,
  crawlResolutionInputSchema,
  crawlResolutionResultSchema,
  crawlSpecExtractionSchema,
  type CrawlResolutionInput,
  type CrawlResolutionResult,
  type CrawlSpecExtraction,
} from "../schemas/ingestion.js";
import type {
  AnomalyCode,
  ProductVariant,
  ResolutionResult,
  StagingCrawledItem,
} from "../types/db.types.js";
import { foldText } from "../tools/helpers.js";

const NORMALIZE_SYSTEM = `Bạn chuẩn hóa dữ liệu crawl laptop/điện thoại.
Chỉ trích các trường thực sự xuất hiện trong raw_title, raw_specs_json hoặc raw_price.
Không suy đoán cấu hình, không tự thêm SKU/GPU/RAM/giá. Trường không thấy thì trả null.
Giá VND là số nguyên đồng, không dùng đơn vị triệu.`;

const ARBITER_SYSTEM = `Bạn là trọng tài ghép một bản crawl vào đúng biến thể trong danh sách candidates.
Chỉ chọn variant_id có trong candidates; nếu thông tin không đủ để chắc chắn, trả variant_id = null.
Không được tạo variant mới. Đây chỉ là đề xuất cho admin duyệt, không phải xuất bản.`;

const FLAG_MAP: Record<AnomalyCode, CrawlResolutionResult["anomaly_flags"][number]["code"]> = {
  spec_mismatch: "SPEC_MISMATCH",
  price_anomaly: "PRICE_OUTLIER",
  missing_mandatory_fees: "MISSING_MANDATORY_FEES",
  ambiguous_variant: "AMBIGUOUS_VARIANT",
  blocked_auto_publish: "BLOCKED_AUTO_PUBLISH",
};

const CrawlState = Annotation.Root({
  input: Annotation<CrawlResolutionInput>(),
  variants: Annotation<ProductVariant[]>(),
  normalizedItem: Annotation<StagingCrawledItem | null>(),
  candidates: Annotation<ProductVariant[]>(),
  resolution: Annotation<ResolutionResult | null>(),
  arbiterNote: Annotation<string | null>(),
  result: Annotation<CrawlResolutionResult | null>(),
});

type CrawlStateValue = typeof CrawlState.State;

/**
 * Ingestion agent 2: resolve one crawled listing to an exact variant.
 *
 * The deterministic matcher is authoritative. The optional LLM may only
 * normalize fields that literally appear in the crawl text and, when the
 * deterministic result is unresolved, suggest an existing candidate for the
 * admin. Every result stays pending/needs_review; nothing is auto-published.
 */
export async function resolveCrawledEntity(
  rawInput: CrawlResolutionInput,
  deps: AiEngineDeps,
): Promise<CrawlResolutionResult> {
  const input = crawlResolutionInputSchema.parse(rawInput);
  const graph = new StateGraph(CrawlState)
    .addNode("load_and_normalize", (state: CrawlStateValue) => loadAndNormalize(state, deps))
    .addNode("resolve_entity", (state: CrawlStateValue) => resolveEntity(state, deps))
    .addNode("assemble_result", (state: CrawlStateValue) => assembleResult(state, deps))
    .addEdge(START, "load_and_normalize")
    .addEdge("load_and_normalize", "resolve_entity")
    .addEdge("resolve_entity", "assemble_result")
    .addEdge("assemble_result", END)
    .compile();

  const state = await graph.invoke({
    input,
    variants: [],
    normalizedItem: null,
    candidates: [],
    resolution: null,
    arbiterNote: null,
    result: null,
  });
  if (!state.result) throw new Error("crawl resolution workflow returned no result");
  return crawlResolutionResultSchema.parse(state.result);
}

async function loadAndNormalize(
  state: CrawlStateValue,
  deps: AiEngineDeps,
): Promise<Partial<CrawlStateValue>> {
  const variants = await deps.catalog.listResolutionVariants();
  const normalizedItem = await normalizeItem(state.input.item, deps);
  return { variants, normalizedItem };
}

async function resolveEntity(
  state: CrawlStateValue,
  deps: AiEngineDeps,
): Promise<Partial<CrawlStateValue>> {
  const item = state.normalizedItem ?? state.input.item;
  const variants = state.variants;
  if (variants.length === 0) {
    return {
      candidates: [],
      resolution: {
        matched_variant_id: null,
        confidence_score: 0,
        anomaly_flags: [
          {
            code: "ambiguous_variant",
            detail: "Danh mục chưa có biến thể published nào để ghép.",
          },
        ],
        review_status: "needs_review",
      },
    };
  }

  const candidates = pickCandidateVariants(item, variants);
  const priceHistory = await deps.catalog.getPriceHistory(candidates.map((variant) => variant.id));
  const deterministic = resolveStagingItem({
    item,
    variants,
    price_points: priceHistory,
    requires_mandatory_fees: state.input.requires_mandatory_fees ?? false,
  });

  const arbitration = await arbitrate(deterministic, candidates, item, deps);
  return {
    candidates,
    resolution: arbitration.resolution,
    arbiterNote: arbitration.note,
  };
}

async function assembleResult(
  state: CrawlStateValue,
  deps: AiEngineDeps,
): Promise<Partial<CrawlStateValue>> {
  const resolution = state.resolution;
  if (!resolution) throw new Error("crawl resolution workflow ran without a resolution");
  const item = state.normalizedItem ?? state.input.item;

  const ordered = orderCandidates(state.candidates, resolution.matched_variant_id);
  const offerRows =
    ordered.length > 0
      ? await deps.catalog.getVariantsByIds(ordered.map((variant) => variant.id))
      : [];
  const offerByVariant = new Map(offerRows.map((row) => [row.variant.id, row]));

  const anomalyFlags = resolution.anomaly_flags.map((flag) => ({
    code: FLAG_MAP[flag.code],
    detail: flag.detail,
  }));
  const normalizedItem: StagingCrawledItem = {
    ...item,
    raw_specs_json: { ...item.raw_specs_json },
    matched_variant_id: resolution.matched_variant_id,
    confidence_score: resolution.confidence_score,
    anomaly_flags: resolution.anomaly_flags.map((flag) => ({ ...flag })),
    review_status: resolution.review_status,
  };

  return {
    result: {
      matched_variant_id: resolution.matched_variant_id,
      confidence_score: resolution.confidence_score,
      anomaly_flags: anomalyFlags,
      review_status: resolution.review_status,
      reasoning: buildReasoning(resolution, ordered, state.arbiterNote),
      normalized_item: normalizedItem,
      candidates: ordered.map((variant) => {
        const row = offerByVariant.get(variant.id) ?? null;
        return {
          variant_id: variant.id,
          sku_code: variant.sku_code,
          title: `${variant.brand} ${variant.model_name}`.trim(),
          total_known_price_vnd: row?.offer.total_known_price_vnd ?? null,
          citation: row
            ? {
                source_name: row.store.name,
                source_url: row.offer.source_url,
                measured_at: row.offer.checked_at,
              }
            : null,
        };
      }),
    },
  };
}

interface Arbitration {
  resolution: ResolutionResult;
  note: string | null;
}

async function arbitrate(
  deterministic: ResolutionResult,
  candidates: readonly ProductVariant[],
  item: StagingCrawledItem,
  deps: AiEngineDeps,
): Promise<Arbitration> {
  if (deterministic.matched_variant_id || deps.llm == null || candidates.length < 2) {
    return { resolution: deterministic, note: null };
  }
  try {
    const draft = await deps.llm.generate({
      name: "crawl_entity_arbiter",
      schema: crawlArbiterSchema,
      system: ARBITER_SYSTEM,
      input: {
        raw_title: item.raw_title,
        raw_specs_json: item.raw_specs_json,
        raw_price: item.raw_price,
        candidates: candidates.map((variant) => ({
          variant_id: variant.id,
          sku_code: variant.sku_code,
          title: `${variant.brand} ${variant.model_name}`.trim(),
          cpu: variant.cpu,
          gpu: variant.gpu,
          ram_gb: variant.ram_gb,
          storage_gb: variant.storage_gb,
          display_size: variant.display_size,
          display_res: variant.display_res,
        })),
      },
      maxOutputTokens: 320,
      temperature: 0,
    });
    const allowed = new Set(candidates.map((variant) => variant.id));
    if (!draft.variant_id || !allowed.has(draft.variant_id) || draft.confidence < 0.6) {
      return { resolution: deterministic, note: null };
    }
    const flags = deterministic.anomaly_flags.some((flag) => flag.code === "ambiguous_variant")
      ? deterministic.anomaly_flags
      : [
          ...deterministic.anomaly_flags,
          {
            code: "ambiguous_variant" as const,
            detail: "LLM chỉ đề xuất biến thể; admin phải xác nhận lại.",
          },
        ];
    return {
      resolution: {
        matched_variant_id: draft.variant_id,
        confidence_score: Math.min(0.6, round4(draft.confidence)),
        anomaly_flags: flags.map((flag) => ({ ...flag })),
        review_status: "needs_review",
      },
      note: draft.reasoning,
    };
  } catch {
    return { resolution: deterministic, note: null };
  }
}

async function normalizeItem(
  item: StagingCrawledItem,
  deps: AiEngineDeps,
): Promise<StagingCrawledItem> {
  const normalized: StagingCrawledItem = {
    ...item,
    raw_specs_json: { ...item.raw_specs_json },
  };
  if (!deps.llm) return normalized;

  try {
    const spec = await deps.llm.generate({
      name: "crawl_spec_normalize",
      schema: crawlSpecExtractionSchema,
      system: NORMALIZE_SYSTEM,
      input: {
        raw_title: item.raw_title,
        raw_specs_json: item.raw_specs_json,
        raw_price: item.raw_price,
      },
      maxOutputTokens: 500,
      temperature: 0,
    });
    applyNormalizedSpec(normalized, spec);
  } catch {
    // Normalization is best-effort; the deterministic matcher still runs.
  }
  return normalized;
}

const SKU_KEYS = ["sku_code", "sku", "SKU"] as const;
const CPU_KEYS = ["cpu", "CPU", "Bộ xử lý"] as const;
const GPU_KEYS = ["gpu", "Loại card đồ họa", "gpu_name"] as const;
const RAM_KEYS = ["ram_gb", "ram", "Dung lượng RAM", "dung_luong_ram"] as const;
const SIZE_KEYS = ["display_size", "screen", "Kích thước màn hình"] as const;
const RES_KEYS = ["display_res", "Độ phân giải màn hình", "display_resolution"] as const;
const PRICE_KEYS = ["price", "listed_price_vnd", "current"] as const;
const FEE_KEYS = ["mandatory_fees_vnd", "fees_vnd"] as const;

function applyNormalizedSpec(item: StagingCrawledItem, spec: CrawlSpecExtraction): void {
  const specs = item.raw_specs_json;
  const text = sourceText(item);
  const folded = foldText(text);

  if (spec.sku_code && !hasAnyKey(specs, SKU_KEYS) && folded.includes(foldText(spec.sku_code))) {
    specs.sku_code = spec.sku_code;
  }
  if (spec.cpu && !hasAnyKey(specs, CPU_KEYS) && textSupported(folded, spec.cpu)) {
    specs.cpu = spec.cpu;
  }
  if (spec.gpu && !hasAnyKey(specs, GPU_KEYS) && textSupported(folded, spec.gpu)) {
    specs.gpu = spec.gpu;
  }
  if (
    spec.ram_gb != null &&
    !hasAnyKey(specs, RAM_KEYS) &&
    numberSupported(spec.ram_gb, text)
  ) {
    specs.ram_gb = spec.ram_gb;
  }
  if (
    spec.display_size != null &&
    !hasAnyKey(specs, SIZE_KEYS) &&
    decimalSupported(spec.display_size, text)
  ) {
    specs.display_size = spec.display_size;
  }
  if (spec.display_res && !hasAnyKey(specs, RES_KEYS) && resolutionSupported(spec.display_res, text)) {
    specs.display_res = spec.display_res;
  }
  if (
    spec.listed_price_vnd != null &&
    item.raw_price == null &&
    !hasAnyKey(specs, PRICE_KEYS) &&
    numberSupported(spec.listed_price_vnd, text)
  ) {
    item.raw_price = spec.listed_price_vnd;
    specs.listed_price_vnd = spec.listed_price_vnd;
  }
  if (
    spec.mandatory_fees_vnd != null &&
    !hasAnyKey(specs, FEE_KEYS) &&
    feeSupported(spec.mandatory_fees_vnd, text)
  ) {
    specs.mandatory_fees_vnd = spec.mandatory_fees_vnd;
  }
}

function sourceText(item: StagingCrawledItem): string {
  return [
    item.raw_title,
    JSON.stringify(item.raw_specs_json),
    item.raw_price == null ? "" : String(item.raw_price),
  ].join(" ");
}

function hasAnyKey(specs: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.some((key) => key in specs && specs[key] != null && specs[key] !== "");
}

function textSupported(foldedSource: string, value: string): boolean {
  const foldedValue = foldText(value).trim();
  if (!foldedValue) return false;
  if (foldedSource.includes(foldedValue)) return true;
  const tokens = foldedValue.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length >= 2);
  return tokens.length > 0 && tokens.every((token) => foldedSource.includes(token));
}

function numberSupported(value: number, source: string): boolean {
  const digits = String(Math.trunc(value));
  const compact = source.replace(/[.,\s]/g, "");
  return compact.includes(digits);
}

function decimalSupported(value: number, source: string): boolean {
  const text = source.replace(",", ".");
  return text.includes(String(value));
}

function resolutionSupported(value: string, source: string): boolean {
  const normalized = value.toLowerCase().replace(/×/g, "x").replace(/\s+/g, "");
  const haystack = source.toLowerCase().replace(/×/g, "x").replace(/\s+/g, "");
  return haystack.includes(normalized);
}

function feeSupported(value: number, source: string): boolean {
  if (value > 0) return numberSupported(value, source);
  return /(miễn phí|mien phi|0\s*(?:đ|vnd|₫)|fees_included)/i.test(source);
}

function pickCandidateVariants(
  item: StagingCrawledItem,
  variants: readonly ProductVariant[],
): ProductVariant[] {
  const folded = foldText(item.raw_title);
  const bySku = variants.filter((variant) => {
    const sku = foldText(variant.sku_code).trim();
    return sku.length >= 5 && folded.includes(sku);
  });
  const byName = variants.filter((variant) => nameAppears(folded, variant));
  const pool = dedupe([...bySku, ...byName]);
  if (pool.length > 0) return pool.slice(0, 6);
  return [...variants]
    .sort((left, right) =>
      `${left.brand} ${left.model_name} ${left.sku_code}`.localeCompare(
        `${right.brand} ${right.model_name} ${right.sku_code}`,
      ),
    )
    .slice(0, 5);
}

const GENERIC_TOKENS = new Set(["laptop", "gaming", "series", "inch", "notebook"]);

function nameAppears(foldedTitle: string, variant: ProductVariant): boolean {
  const brand = foldText(variant.brand).trim();
  if (brand && !foldedTitle.includes(brand)) return false;
  const tokens = [...foldText(variant.model_name).matchAll(/[a-z0-9]+/g)]
    .map((match) => match[0]!)
    .filter((token) => token.length >= 3 && !GENERIC_TOKENS.has(token) && !brand.includes(token));
  if (tokens.length === 0) return false;
  return tokens.every((token) => foldedTitle.includes(token));
}

function dedupe(variants: readonly ProductVariant[]): ProductVariant[] {
  const byId = new Map<string, ProductVariant>();
  for (const variant of variants) if (!byId.has(variant.id)) byId.set(variant.id, variant);
  return [...byId.values()];
}

function orderCandidates(
  candidates: readonly ProductVariant[],
  matchedId: string | null,
): ProductVariant[] {
  if (!matchedId) return [...candidates];
  const matched = candidates.find((variant) => variant.id === matchedId);
  return matched
    ? [matched, ...candidates.filter((variant) => variant.id !== matchedId)]
    : [...candidates];
}

function buildReasoning(
  resolution: ResolutionResult,
  candidates: readonly ProductVariant[],
  arbiterNote: string | null,
): string {
  const matched = resolution.matched_variant_id
    ? candidates.find((variant) => variant.id === resolution.matched_variant_id) ?? null
    : null;
  const parts: string[] = [];
  if (matched) {
    parts.push(
      `Ghép với ${matched.brand} ${matched.model_name} (${matched.sku_code}) ` +
        `với độ tin cậy ${resolution.confidence_score}.`,
    );
  } else {
    parts.push("Không ghép chắc chắn được biến thể nào trong danh mục.");
  }
  if (arbiterNote) parts.push(`Gợi ý của LLM (chỉ để admin tham khảo): ${arbiterNote}`);
  if (resolution.anomaly_flags.length > 0) {
    parts.push(
      `Cờ bất thường: ${resolution.anomaly_flags
        .map((flag) => `${FLAG_MAP[flag.code]} (${flag.detail})`)
        .join("; ")}.`,
    );
  }
  parts.push("Bản ghi chỉ ở trạng thái chờ admin duyệt, không tự xuất bản.");
  return parts.join(" ");
}

export function mapCrawlAnomalies(
  flags: readonly { code: AnomalyCode; detail: string }[],
): CrawlResolutionResult["anomaly_flags"] {
  return flags.map((flag) => ({ code: FLAG_MAP[flag.code], detail: flag.detail }));
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
