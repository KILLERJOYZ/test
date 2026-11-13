import { createHash } from "node:crypto";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import {
  classifyReviewSentences,
  configWarning,
  evidenceDraftSchema,
} from "../agents/review-synthesis.js";
import type { AiEngineDeps } from "../deps.js";
import { buildChunkPayload } from "../qdrant/payload.js";
import {
  reviewEvidenceInputSchema,
  reviewEvidenceResultSchema,
  reviewExtractionSchema,
  type ReviewEvidenceInput,
  type ReviewEvidenceResult,
  type ReviewSections,
} from "../schemas/ingestion.js";
import type { ProductVariant } from "../types/db.types.js";
import { foldText } from "../tools/helpers.js";

const SECTION_KEYS = [
  "performance",
  "thermals_and_noise",
  "battery_life",
  "cons_and_quirks",
] as const;

const MAX_QUOTES_PER_SECTION = 3;

const REVIEW_SYSTEM = `Bạn trích xuất bằng chứng từ một bài review laptop/điện thoại.
Chỉ dùng nội dung có trong raw_text. Mỗi phần tử trong quotes PHẢI là một chuỗi con nguyên văn của raw_text.
Không tóm tắt bằng kiến thức bên ngoài, không suy đoán số đo, không gộp kết quả của cấu hình khác.
Nếu một mục không có thông tin trong bài, trả summary = null và quotes = [].
Ưu tiên câu có số đo cụ thể (fps, nhiệt độ, thời lượng pin, benchmark).`;

interface ReviewMatch {
  variant: ProductVariant;
  confidence: number;
  matchedBy: string[];
  hardwareWarning: string | null;
  matchWarning: string | null;
}

const ReviewEvidenceState = Annotation.Root({
  input: Annotation<ReviewEvidenceInput>(),
  match: Annotation<ReviewMatch | null>(),
  sections: Annotation<ReviewSections | null>(),
  result: Annotation<ReviewEvidenceResult | null>(),
});

type ReviewEvidenceStateValue = typeof ReviewEvidenceState.State;

/**
 * Ingestion agent 1: turn one review/benchmark URL into a pending evidence
 * draft plus Qdrant chunk payloads. It never publishes: every exit path is
 * `pending_review`, and every quote is checked against the raw source text.
 */
export async function synthesizeReviewEvidence(
  rawInput: ReviewEvidenceInput,
  deps: AiEngineDeps,
): Promise<ReviewEvidenceResult> {
  const input = reviewEvidenceInputSchema.parse(rawInput);
  const graph = new StateGraph(ReviewEvidenceState)
    .addNode("match_variant", (state: ReviewEvidenceStateValue) => ({
      match: matchReviewVariant(state.input),
    }))
    .addNode("extract_sections", (state: ReviewEvidenceStateValue) =>
      extractSectionsNode(state, deps),
    )
    .addNode("assemble_evidence", (state: ReviewEvidenceStateValue) =>
      assembleEvidenceNode(state),
    )
    .addEdge(START, "match_variant")
    .addEdge("match_variant", "extract_sections")
    .addEdge("extract_sections", "assemble_evidence")
    .addEdge("assemble_evidence", END)
    .compile();

  const state = await graph.invoke({
    input,
    match: null,
    sections: null,
    result: null,
  });
  if (!state.result) throw new Error("review evidence workflow returned no result");
  return reviewEvidenceResultSchema.parse(state.result);
}

async function extractSectionsNode(
  state: ReviewEvidenceStateValue,
  deps: AiEngineDeps,
): Promise<Partial<ReviewEvidenceStateValue>> {
  const match = state.match;
  if (!match) throw new Error("review evidence workflow ran without a variant match");
  const deterministic = deterministicSections(state.input.raw_text);
  const fromLlm = await extractWithLlm(state.input, match.variant, deps);
  return { sections: fromLlm ?? deterministic };
}

async function extractWithLlm(
  input: ReviewEvidenceInput,
  variant: ProductVariant,
  deps: AiEngineDeps,
): Promise<ReviewSections | null> {
  if (!deps.llm) return null;
  try {
    const draft = await deps.llm.generate({
      name: "review_evidence_extract",
      schema: reviewExtractionSchema,
      system: REVIEW_SYSTEM,
      input: {
        source_name: input.source_name,
        source_url: input.source_url,
        measured_at: input.measured_at,
        variant: {
          sku_code: variant.sku_code,
          title: `${variant.brand} ${variant.model_name}`.trim(),
          cpu: variant.cpu,
          gpu: variant.gpu,
          ram_gb: variant.ram_gb,
          storage_gb: variant.storage_gb,
          display_size: variant.display_size,
          display_panel: variant.display_panel,
        },
        raw_text: input.raw_text.slice(0, 12_000),
      },
      maxOutputTokens: 1_000,
      temperature: 0,
    });
    return validateSections(draft, input.raw_text);
  } catch {
    return null;
  }
}

/**
 * Keeps only quotes that really occur in the source. LLM summaries are
 * discarded; the final summary is rebuilt from validated quotes + citation.
 */
function validateSections(sections: ReviewSections, rawText: string): ReviewSections {
  const normalizedSource = normalizeForMatch(rawText);
  const clean = (quotes: readonly string[]): string[] => {
    const kept: string[] = [];
    const seen = new Set<string>();
    for (const quote of quotes) {
      const trimmed = quote.replace(/\s+/g, " ").trim();
      if (trimmed.length < 3) continue;
      if (!normalizedSource.includes(normalizeForMatch(trimmed))) continue;
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
      kept.push(trimmed);
      if (kept.length >= MAX_QUOTES_PER_SECTION) break;
    }
    return kept;
  };

  const result: ReviewSections = {
    performance: { summary: null, quotes: clean(sections.performance.quotes) },
    thermals_and_noise: { summary: null, quotes: clean(sections.thermals_and_noise.quotes) },
    battery_life: { summary: null, quotes: clean(sections.battery_life.quotes) },
    cons_and_quirks: { summary: null, quotes: clean(sections.cons_and_quirks.quotes) },
  };
  return result;
}

function deterministicSections(rawText: string): ReviewSections {
  const buckets = classifyReviewSentences(rawText);
  return {
    performance: {
      summary: null,
      quotes: buckets.summary_performance.slice(0, MAX_QUOTES_PER_SECTION),
    },
    thermals_and_noise: {
      summary: null,
      quotes: buckets.summary_thermals_noise.slice(0, MAX_QUOTES_PER_SECTION),
    },
    battery_life: {
      summary: null,
      quotes: buckets.summary_battery.slice(0, MAX_QUOTES_PER_SECTION),
    },
    cons_and_quirks: {
      summary: null,
      quotes: buckets.summary_cons_quirks.slice(0, MAX_QUOTES_PER_SECTION),
    },
  };
}

function assembleEvidenceNode(
  state: ReviewEvidenceStateValue,
): Partial<ReviewEvidenceStateValue> {
  const input = state.input;
  const match = state.match;
  if (!match) throw new Error("review evidence workflow ran without a variant match");
  const sections = enrichSections(state.sections ?? deterministicSections(input.raw_text), input);
  const evidenceId = resolveEvidenceId(input, match.variant.id);
  const citation = `Nguồn: ${input.source_url} | Ngày kiểm tra: ${input.measured_at}`;
  const warnings = [match.hardwareWarning, match.matchWarning].filter(
    (warning): warning is string => Boolean(warning),
  );
  const configWarningText = warnings.length > 0 ? warnings.join(" ") : null;

  const draft = evidenceDraftSchema.parse({
    variant_id: match.variant.id,
    source_name: input.source_name,
    source_url: input.source_url,
    evidence_type: "editorial_review",
    measured_at: input.measured_at,
    raw_excerpt: input.raw_text.slice(0, 4000),
    summary_performance: sectionSummary(sections.performance, citation),
    summary_thermals_noise: sectionSummary(sections.thermals_and_noise, citation),
    summary_battery: sectionSummary(sections.battery_life, citation),
    summary_cons_quirks: sectionSummary(sections.cons_and_quirks, citation),
    config_warning: configWarningText,
    status: "pending_review",
  });

  const qdrantChunks = SECTION_KEYS.flatMap((section) =>
    sections[section].quotes.map((claim) => ({
      section,
      claim,
      payload: buildChunkPayload({
        evidence_id: evidenceId,
        model_id: match.variant.model_id,
        variant_id: match.variant.id,
        sku_code: match.variant.sku_code,
        source_url: input.source_url,
        measured_at: input.measured_at,
        status: "pending_review",
        claim,
        source_label: input.source_name,
      }),
    })),
  );

  return {
    result: {
      variant_id: match.variant.id,
      sku_code: match.variant.sku_code,
      model_id: match.variant.model_id,
      source_name: input.source_name,
      source_url: input.source_url,
      measured_at: input.measured_at,
      version_mismatch_warning: match.hardwareWarning != null,
      match_confidence: round4(match.confidence),
      matched_by: [...match.matchedBy],
      sections,
      draft,
      qdrant_chunks: qdrantChunks,
      status: "pending_review",
    },
  };
}

function enrichSections(sections: ReviewSections, input: ReviewEvidenceInput): ReviewSections {
  const citation = `Nguồn: ${input.source_url} | Ngày kiểm tra: ${input.measured_at}`;
  const withSummary = (section: ReviewSections["performance"]) => ({
    summary: sectionSummary(section, citation),
    quotes: [...section.quotes],
  });
  return {
    performance: withSummary(sections.performance),
    thermals_and_noise: withSummary(sections.thermals_and_noise),
    battery_life: withSummary(sections.battery_life),
    cons_and_quirks: withSummary(sections.cons_and_quirks),
  };
}

function sectionSummary(
  section: ReviewSections["performance"],
  citation: string,
): string | null {
  if (section.quotes.length === 0) return null;
  return `${section.quotes.join(" ")} ${citation}`;
}

function resolveEvidenceId(input: ReviewEvidenceInput, variantId: string): string {
  const explicit = input.evidence_id?.trim();
  if (explicit) return explicit;
  const digest = createHash("sha256")
    .update(`${variantId}|${input.source_url}|${input.measured_at}`)
    .digest("hex")
    .slice(0, 24);
  return `review_${digest}`;
}

function matchReviewVariant(input: ReviewEvidenceInput): ReviewMatch {
  const candidates = input.candidate_variants;
  const rawText = input.raw_text;
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const siblings = (variant: ProductVariant): string[] =>
    candidates
      .filter((candidate) => candidate.id !== variant.id)
      .map((candidate) => candidate.sku_code)
      .filter(Boolean);

  const target = input.target_variant_id ? byId.get(input.target_variant_id) : undefined;
  if (target) {
    const hardware = hardwareWarning(rawText, target, siblings(target));
    return {
      variant: target,
      confidence: hardware ? 0.45 : 0.95,
      matchedBy: ["target_variant_id"],
      hardwareWarning: hardware,
      matchWarning: null,
    };
  }

  const foldedText = foldText(rawText);
  const skuHits = candidates.filter((candidate) => skuAppears(foldedText, candidate.sku_code));
  if (skuHits.length === 1) {
    const variant = skuHits[0]!;
    const hardware = hardwareWarning(rawText, variant, siblings(variant));
    return {
      variant,
      confidence: hardware ? 0.5 : 0.98,
      matchedBy: [`sku:${variant.sku_code}`],
      hardwareWarning: hardware,
      matchWarning: null,
    };
  }
  if (skuHits.length > 1) {
    const variant = skuHits[0]!;
    const hardware = hardwareWarning(rawText, variant, siblings(variant));
    return {
      variant,
      confidence: 0.4,
      matchedBy: [`sku_ambiguous:${skuHits.map((hit) => hit.sku_code).join(",")}`],
      hardwareWarning: hardware,
      matchWarning: "Bài review nhắc nhiều mã SKU; cần admin chọn đúng biến thể.",
    };
  }

  const nameHits = candidates.filter((candidate) => nameAppears(foldedText, candidate));
  if (nameHits.length > 0) {
    const compatible = nameHits.filter(
      (candidate) => hardwareWarning(rawText, candidate, siblings(candidate)) == null,
    );
    if (compatible.length === 1) {
      const variant = compatible[0]!;
      return {
        variant,
        confidence: 0.82,
        matchedBy: [`model:${variant.model_name}`, `brand:${variant.brand}`],
        hardwareWarning: null,
        matchWarning: null,
      };
    }
    if (compatible.length > 1) {
      const ranked = [...compatible].sort(
        (left, right) => hardwareHits(foldedText, right) - hardwareHits(foldedText, left),
      );
      const best = ranked[0]!;
      const unique = hardwareHits(foldedText, best) > hardwareHits(foldedText, ranked[1]!);
      return {
        variant: best,
        confidence: unique ? 0.8 : 0.4,
        matchedBy: [`model:${best.model_name}`, `brand:${best.brand}`],
        hardwareWarning: null,
        matchWarning: unique
          ? null
          : "Nhiều biến thể cùng dòng khớp bài review; cần admin chọn đúng SKU.",
      };
    }
    const nearest = nameHits[0]!;
    const hardware = hardwareWarning(rawText, nearest, siblings(nearest));
    return {
      variant: nearest,
      confidence: 0.35,
      matchedBy: [`model:${nearest.model_name}`, `brand:${nearest.brand}`],
      hardwareWarning: hardware,
      matchWarning: "Không có biến thể nào khớp hoàn toàn thông số bài review.",
    };
  }

  const fallback = candidates[0]!;
  const hardware = hardwareWarning(rawText, fallback, siblings(fallback));
  return {
    variant: fallback,
    confidence: candidates.length === 1 ? 0.3 : 0.15,
    matchedBy: [candidates.length === 1 ? "single_candidate" : "fallback_first_candidate"],
    hardwareWarning: hardware,
    matchWarning:
      candidates.length === 1
        ? "Chỉ có một biến thể ứng viên; cần admin xác nhận lại."
        : "Không ghép được biến thể nào; cần admin chọn tay.",
  };
}

function hardwareWarning(
  rawText: string,
  variant: ProductVariant,
  siblingSkus: readonly string[],
): string | null {
  return configWarning(
    rawText,
    {
      id: variant.id,
      sku_code: variant.sku_code,
      cpu: variant.cpu,
      gpu: variant.gpu,
      ram_gb: variant.ram_gb,
      display_size: variant.display_size,
      display_res: variant.display_res,
      display_panel: variant.display_panel,
    },
    siblingSkus,
  );
}

function skuAppears(foldedText: string, skuCode: string): boolean {
  const sku = foldText(skuCode).trim();
  return sku.length >= 5 && foldedText.includes(sku);
}

const GENERIC_TOKENS = new Set(["laptop", "gaming", "series", "inch", "notebook"]);

function nameAppears(foldedText: string, variant: ProductVariant): boolean {
  const brand = foldText(variant.brand).trim();
  if (brand && !foldedText.includes(brand)) return false;
  const tokens = [...foldText(variant.model_name).matchAll(/[a-z0-9]+/g)]
    .map((match) => match[0]!)
    .filter((token) => token.length >= 3 && !GENERIC_TOKENS.has(token) && !brand.includes(token));
  if (tokens.length === 0) return false;
  return tokens.every((token) => foldedText.includes(token));
}

const GPU_RE = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/gi;
const RAM_RE = /\b(\d{1,3})\s*gb\b/gi;
const RAM_ONLY = new Set([4, 8, 12, 16, 18, 20, 24, 32, 36, 40, 48, 64, 96]);

function hardwareHits(foldedText: string, variant: ProductVariant): number {
  let hits = 0;
  const variantGpu = gpuCode(foldText(variant.gpu ?? ""));
  if (variantGpu) {
    for (const match of foldedText.matchAll(GPU_RE)) {
      if (gpuCode(match[0]) === variantGpu) hits += 1;
    }
  }
  if (variant.ram_gb != null) {
    for (const match of foldedText.matchAll(RAM_RE)) {
      const value = Number(match[1]);
      if (RAM_ONLY.has(value) && value === Math.trunc(variant.ram_gb)) hits += 1;
    }
  }
  return hits;
}

function gpuCode(text: string): string | null {
  const match = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/i.exec(text);
  if (!match?.[1] || !match[2]) return null;
  return `${match[1].toLowerCase()}${match[2]}`;
}

function normalizeForMatch(text: string): string {
  return text
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
