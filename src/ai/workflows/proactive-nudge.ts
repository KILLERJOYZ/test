import { createHash } from "node:crypto";

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createMemoryNudgeCache, type NudgeCache } from "../cache.js";
import type { AiEngineDeps } from "../deps.js";
import {
  nudgeDraftSchema,
  nudgeInputSchema,
  nudgeResultSchema,
  type NudgeDraft,
  type NudgeInput,
  type NudgeResult,
  type NudgeTrigger,
} from "../schemas/nudge.js";
import type { UserRequirementProfile } from "../schemas/profile.js";
import type { VariantSummary } from "../schemas/catalog.js";
import type { SourceCitation, VariantOffer } from "../types/db.types.js";
import {
  colorGamutPct,
  citationFromOffer,
  formatVnd,
  hasDiscreteGpu,
  taskCapability,
  toVariantSummary,
} from "../tools/helpers.js";
import {
  hardwareSpecText,
  hasInventedHardwareClaims,
} from "../tools/claim-guard.js";
import { findSimilarDealsAndPriceHistory } from "../tools/deal-tools.js";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_PROMPT_VARIANTS = 3;
const MAX_PROMPT_EVIDENCE = 2;
const MAX_PROMPT_SUMMARY_CHARS = 140;
const defaultCache = createMemoryNudgeCache();

const NUDGE_SYSTEM = `Bạn là trợ lý gợi ý chủ động trong lúc người dùng đang xem sản phẩm.
Chỉ dùng đúng db_evidence và variants_summary được cấp; không thêm kiến thức ngoài.
Không bịa giá, thông số, hay nhận định hiệu năng/nhiệt độ/pin.
short_message tối đa 140 ký tự, tiếng Việt, nêu đúng một lý do có bằng chứng.
evidence_citation phải chọn một source_url trong db_evidence.
target_variant_ids chỉ được lấy trong variants_summary.
Nếu bằng chứng không đủ thuyết phục, trả should_show = false.`;

type NudgeCode =
  | "RAM_NOT_UPGRADABLE"
  | "LOW_COLOR_GAMUT"
  | "WEAK_GPU"
  | "LOW_STORAGE"
  | "LOW_BATTERY"
  | "HEAVY"
  | "PRICE_DROP"
  | "CHEAPER_EQUIVALENT"
  | "OUT_OF_STOCK"
  | "FILTER_UNLOCK"
  | "COMPARISON_GAP";

interface NudgeEvidence {
  code: NudgeCode;
  nudge_type: NudgeDraft["nudge_type"];
  summary: string;
  variant_id: string;
  target_variant_ids: string[];
  citation: SourceCitation;
  prices_vnd: number[];
}

interface NudgeVariantSummary {
  variant_id: string;
  title: string;
  total_known_price_vnd: number | null;
  ram_gb: number | null;
  gpu: string | null;
  color_gamut: string | null;
  weight_kg: number | null;
  battery_wh: number | null;
}

const NudgeState = Annotation.Root({
  input: Annotation<NudgeInput>(),
  evidence: Annotation<NudgeEvidence[]>(),
  variants: Annotation<NudgeVariantSummary[]>(),
  result: Annotation<NudgeResult | null>(),
});

type NudgeStateValue = typeof NudgeState.State;

/**
 * Tiered contextual nudge:
 *   1. deterministic DB gate (zero LLM calls when no concrete evidence)
 *   2. goal-hash cache
 *   3. compact micro-prompt, validated against the same DB evidence
 */
export async function evaluateProactiveNudge(
  rawInput: NudgeInput,
  deps: AiEngineDeps,
): Promise<NudgeResult> {
  const input = nudgeInputSchema.parse(rawInput);
  const graph = new StateGraph(NudgeState)
    .addNode("deterministic_gate", (state: NudgeStateValue) => deterministicGateNode(state, deps))
    .addNode("cache_and_llm", (state: NudgeStateValue) => cacheAndLlmNode(state, deps))
    .addEdge(START, "deterministic_gate")
    .addConditionalEdges("deterministic_gate", (state: NudgeStateValue) =>
      state.result ? END : "cache_and_llm",
    )
    .addEdge("cache_and_llm", END)
    .compile();

  const state = await graph.invoke({
    input,
    evidence: [],
    variants: [],
    result: null,
  });
  return nudgeResultSchema.parse(state.result ?? { should_show: false });
}

async function deterministicGateNode(
  state: NudgeStateValue,
  deps: AiEngineDeps,
): Promise<Partial<NudgeStateValue>> {
  try {
    const collected = await collectNudgeEvidence(state.input, deps);
    if (collected.evidence.length === 0) {
      return { evidence: [], variants: collected.variants, result: { should_show: false } };
    }
    return { evidence: collected.evidence, variants: collected.variants };
  } catch {
    // Fail closed: a catalog/database outage must not spend LLM tokens or
    // produce a speculative nudge.
    return { evidence: [], variants: [], result: { should_show: false } };
  }
}

async function cacheAndLlmNode(
  state: NudgeStateValue,
  deps: AiEngineDeps,
): Promise<Partial<NudgeStateValue>> {
  const cache: NudgeCache = deps.nudgeCache ?? defaultCache;
  const key = cacheKey(state.input);
  const cached = cache.get(key);
  if (cached) return { result: cached.value };

  const result = await buildNudge(state.input, state.evidence, state.variants, deps);
  cache.set(key, {
    value: result,
    expires_at: Date.now() + CACHE_TTL_MS,
  });
  return { result };
}

async function buildNudge(
  input: NudgeInput,
  evidence: readonly NudgeEvidence[],
  variants: readonly NudgeVariantSummary[],
  deps: AiEngineDeps,
): Promise<NudgeResult> {
  const fallback = deterministicNudge(evidence);
  if (!deps.llm) return fallback;

  const allowedUrls = new Set(evidence.map((item) => item.citation.source_url).filter(Boolean));
  const allowedTargets = new Set(evidence.flatMap((item) => item.target_variant_ids));
  const allowedPrices = new Set(
    [...evidence.flatMap((item) => item.prices_vnd), ...variants.map((variant) => variant.total_known_price_vnd)]
      .filter((value): value is number => value != null),
  );
  const allowedHardware = [
    ...variants.map((variant) =>
      hardwareSpecText({
        gpu: variant.gpu,
        ram_gb: variant.ram_gb,
        color_gamut: variant.color_gamut,
        weight_kg: variant.weight_kg,
        battery_wh: variant.battery_wh,
      }),
    ),
    ...evidence.map((item) => item.summary),
  ].join(" · ");

  try {
    const draft = await deps.llm.generate({
      name: "nudge_micro_prompt",
      schema: nudgeDraftSchema,
      system: NUDGE_SYSTEM,
      input: {
        user_profile: {
          primary_goals: input.user_profile.primary_goals,
          mandatory_tasks: input.user_profile.mandatory_tasks,
          max_budget_vnd: input.user_profile.max_budget_vnd,
          soft_preferences: input.user_profile.soft_preferences,
        },
        trigger_type: input.trigger_type,
        variants_summary: variants.slice(0, MAX_PROMPT_VARIANTS).map((variant) => ({
          variant_id: variant.variant_id,
          title: truncate(variant.title, 60),
          price_vnd: variant.total_known_price_vnd,
          ram_gb: variant.ram_gb,
          gpu: variant.gpu,
          color_gamut: variant.color_gamut,
          weight_kg: variant.weight_kg,
          battery_wh: variant.battery_wh,
        })),
        db_evidence: evidence.slice(0, MAX_PROMPT_EVIDENCE).map((item) => ({
          code: item.code,
          summary: truncate(item.summary, MAX_PROMPT_SUMMARY_CHARS),
          variant_id: item.variant_id,
          target_variant_ids: item.target_variant_ids.slice(0, 2),
          source_name: truncate(item.citation.source_name, 40),
          source_url: item.citation.source_url,
          measured_at: item.citation.measured_at,
        })),
      },
      maxOutputTokens: 320,
      temperature: 0.2,
    });
    return (
      validateDraft(
        draft,
        input,
        evidence,
        allowedUrls,
        allowedTargets,
        allowedPrices,
        allowedHardware,
      ) ?? fallback
    );
  } catch {
    return fallback;
  }
}

function validateDraft(
  draft: NudgeDraft,
  input: NudgeInput,
  evidence: readonly NudgeEvidence[],
  allowedUrls: Set<string>,
  allowedTargets: Set<string>,
  allowedPrices: Set<number>,
  allowedHardware: string,
): NudgeResult | null {
  if (!draft.should_show) return { should_show: false };
  const message = draft.short_message.trim();
  if (!message || message.length > 140) return null;
  if (includesUnknownMoney(message, allowedPrices)) return null;
  if (hasInventedHardwareClaims(message, allowedHardware)) return null;

  const citationSource = evidence.find((item) => item.citation.source_url === draft.evidence_citation.source_url);
  if (!citationSource || !allowedUrls.has(draft.evidence_citation.source_url)) return null;

  const targets = draft.target_variant_ids.filter((id) => allowedTargets.has(id));
  if (targets.length === 0) return null;

  const expectedType = expectedNudgeType(input.trigger_type);
  const nudgeType = draft.nudge_type === expectedType ? draft.nudge_type : evidence[0]!.nudge_type;
  const ctaLabel = draft.cta_label.trim() || defaultCta(nudgeType).label;

  return nudgeResultSchema.parse({
    should_show: true,
    nudge_type: nudgeType,
    short_message: message,
    evidence_citation: citationSource.citation,
    cta_label: ctaLabel.slice(0, 40),
    cta_action: draft.cta_action,
    target_variant_ids: targets.slice(0, 3),
  });
}

function deterministicNudge(evidence: readonly NudgeEvidence[]): NudgeResult {
  const first = evidence[0];
  if (!first) return { should_show: false };
  const cta = defaultCta(first.nudge_type);
  return nudgeResultSchema.parse({
    should_show: true,
    nudge_type: first.nudge_type,
    short_message: truncate(first.summary, 140),
    evidence_citation: first.citation,
    cta_label: cta.label,
    cta_action: cta.action,
    target_variant_ids: first.target_variant_ids.slice(0, 3),
  });
}

async function collectNudgeEvidence(
  input: NudgeInput,
  deps: AiEngineDeps,
): Promise<{ evidence: NudgeEvidence[]; variants: NudgeVariantSummary[] }> {
  const profile = input.user_profile;
  const currentRows = await deps.catalog.getVariantsByIds([input.current_variant_id]);
  const current = currentRows[0] ?? null;
  const recentRows = await deps.catalog.getVariantsByIds(input.recent_variant_ids);
  const variants = dedupeRows([...(current ? [current] : []), ...recentRows]).map(toNudgeSummary);

  let evidence: NudgeEvidence[] = [];
  switch (input.trigger_type) {
    case "DEEP_INSPECTION":
      evidence = current ? deepInspectionEvidence(current, profile) : [];
      break;
    case "DEAL_WATCHOUT":
      evidence = await dealWatchoutEvidence(input, current, deps);
      break;
    case "FILTER_THRASHING":
      evidence = await filterThrashingEvidence(input, deps);
      break;
    case "COMPARISON_HESITATION":
      evidence = comparisonEvidence(current, recentRows, profile);
      break;
  }
  return { evidence, variants };
}

function deepInspectionEvidence(row: VariantOffer, profile: UserRequirementProfile): NudgeEvidence[] {
  const variant = row.variant;
  const evidence: NudgeEvidence[] = [];
  const citation = citationFromOffer(row);
  const total = row.offer.total_known_price_vnd;
  const needsRam = needsRam16(profile);
  const needsGraphics = needsGraphicsWork(profile);
  const needsPortable = profile.mandatory_tasks.includes("portability") || profile.soft_preferences.includes("lighter");
  const needsBattery = profile.mandatory_tasks.includes("battery_life");

  if (needsRam && (variant.ram_gb ?? 0) < 16 && variant.ram_upgradable === false) {
    evidence.push({
      code: "RAM_NOT_UPGRADABLE",
      nudge_type: "blind_spot",
      summary: `RAM ${variant.ram_gb ?? "?"}GB hàn chết, không nâng được lên 16GB cho nhu cầu hiện tại.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  const color = colorGamutPct(variant);
  if (needsGraphics && color != null && color < 95) {
    evidence.push({
      code: "LOW_COLOR_GAMUT",
      nudge_type: "blind_spot",
      summary: `Màn hình chỉ ${variant.color_gamut}, chưa đạt ngưỡng 95% sRGB cho đồ họa.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  if (profile.mandatory_tasks.includes("gaming") && !hasDiscreteGpu(variant)) {
    evidence.push({
      code: "WEAK_GPU",
      nudge_type: "blind_spot",
      summary: `GPU ${variant.gpu ?? "tích hợp"} không phải GPU rời, không đáp ứng nhu cầu chơi game.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  const needsStorage =
    profile.mandatory_tasks.includes("video_editing") || profile.mandatory_tasks.includes("coding");
  if (needsStorage && (variant.storage_gb ?? 0) < 512 && (variant.storage_slots ?? 0) <= 1) {
    evidence.push({
      code: "LOW_STORAGE",
      nudge_type: "blind_spot",
      summary: `SSD ${variant.storage_gb ?? "?"}GB và chỉ 1 khe, khó đủ cho dự án lớn.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  if (needsPortable && (variant.weight_kg ?? 0) > 2) {
    evidence.push({
      code: "HEAVY",
      nudge_type: "blind_spot",
      summary: `Máy nặng ${variant.weight_kg}kg, không phù hợp nếu ưu tiên mang đi.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  if (needsBattery && (variant.battery_wh ?? 0) < 60) {
    evidence.push({
      code: "LOW_BATTERY",
      nudge_type: "blind_spot",
      summary: `Pin ${variant.battery_wh ?? "?"}Wh, thấp hơn ngưỡng 60Wh cho nhu cầu pin lâu.`,
      variant_id: variant.id,
      target_variant_ids: [variant.id],
      citation,
      prices_vnd: total != null ? [total] : [],
    });
  }
  return evidence;
}

async function dealWatchoutEvidence(
  input: NudgeInput,
  current: VariantOffer | null,
  deps: AiEngineDeps,
): Promise<NudgeEvidence[]> {
  const evidence: NudgeEvidence[] = [];
  const ids = [...new Set([input.current_variant_id, ...input.recent_variant_ids])].slice(0, 4);
  const rows = await deps.catalog.getVariantsByIds(ids);
  const byId = new Map(rows.map((row) => [row.variant.id, row]));
  for (const id of ids) {
    const deal = await findSimilarDealsAndPriceHistory({ variant_id: id }, { catalog: deps.catalog });
    const row = byId.get(id) ?? (id === input.current_variant_id ? current : null);
    const currentTotal = deal.current_total_known_price_vnd;

    if (row && deal.change_pct != null && deal.change_pct <= -7) {
      evidence.push({
        code: "PRICE_DROP",
        nudge_type: "price_drop",
        summary: `Giá vừa giảm ${Math.abs(deal.change_pct)}% so với các lần ghi nhận trước.`,
        variant_id: deal.variant_id,
        target_variant_ids: [deal.variant_id],
        citation: citationFromOffer(row),
        prices_vnd: [currentTotal, deal.latest_history_vnd].filter((value): value is number => value != null),
      });
    }

    if (deal.stock_status === "out_of_stock" && deal.cheaper_equivalents.length > 0) {
      const alternative = deal.cheaper_equivalents[0]!;
      evidence.push({
        code: "OUT_OF_STOCK",
        nudge_type: "better_deal",
        summary: `Máy đang xem đã hết hàng; ${alternative.title} còn hàng.`,
        variant_id: deal.variant_id,
        target_variant_ids: [deal.variant_id, alternative.variant_id],
        citation: {
          source_name: alternative.store_name,
          source_url: alternative.source_url,
          measured_at: alternative.checked_at,
        },
        prices_vnd: [alternative.total_known_price_vnd],
      });
      continue;
    }

    if (currentTotal == null) continue;
    const threshold = Math.max(1_000_000, currentTotal * 0.08);
    const cheaper = deal.cheaper_equivalents.find((item) => Math.abs(item.delta_vnd) >= threshold);
    if (!cheaper) continue;
    evidence.push({
      code: "CHEAPER_EQUIVALENT",
      nudge_type: "better_deal",
      summary: `${cheaper.title} rẻ hơn ${formatVnd(Math.abs(cheaper.delta_vnd))} so với cấu hình đang xem.`,
      variant_id: deal.variant_id,
      target_variant_ids: [deal.variant_id, cheaper.variant_id],
      citation: {
        source_name: cheaper.store_name,
        source_url: cheaper.source_url,
        measured_at: cheaper.checked_at,
      },
      prices_vnd: [currentTotal, cheaper.total_known_price_vnd],
    });
  }
  return evidence;
}

async function filterThrashingEvidence(
  input: NudgeInput,
  deps: AiEngineDeps,
): Promise<NudgeEvidence[]> {
  const filters = input.active_filters;
  const budget = minBudget(input.user_profile.max_budget_vnd, filters.max_price_vnd);
  if (budget == null) return [];
  const rows = await deps.catalog.queryVariants({
    max_budget_vnd: budget,
    category: input.user_profile.category,
    limit: 100,
  });
  const eligible = rows.filter((row) => eligibleForProfile(row, input.user_profile));
  const strict = new Set(eligible.filter((row) => passesFilters(row, filters)).map((row) => row.variant.id));

  const relaxations: { label: string; filters: typeof filters }[] = [];
  if (filters.max_weight_kg != null) {
    relaxations.push({
      label: `nới cân nặng lên ${Math.round(filters.max_weight_kg * 1.15 * 10) / 10}kg`,
      filters: { ...filters, max_weight_kg: filters.max_weight_kg * 1.15 },
    });
  }
  if (filters.min_color_gamut_pct != null) {
    relaxations.push({
      label: `hạ mức màu xuống ${Math.max(0, filters.min_color_gamut_pct - 10)}%`,
      filters: { ...filters, min_color_gamut_pct: Math.max(0, filters.min_color_gamut_pct - 10) },
    });
  }
  if (filters.min_battery_wh != null) {
    relaxations.push({
      label: `nới pin xuống ${Math.round(filters.min_battery_wh * 0.85)}Wh`,
      filters: { ...filters, min_battery_wh: filters.min_battery_wh * 0.85 },
    });
  }
  if (filters.brand) {
    relaxations.push({ label: "bỏ lọc thương hiệu", filters: { ...filters, brand: null } });
  }

  const evidence: NudgeEvidence[] = [];
  for (const relaxation of relaxations) {
    const unlocked = eligible.filter(
      (row) => !strict.has(row.variant.id) && passesFilters(row, relaxation.filters),
    );
    if (unlocked.length === 0) continue;
    const best = unlocked[0]!;
    evidence.push({
      code: "FILTER_UNLOCK",
      nudge_type: "filter_unlock",
      summary: `Thử ${relaxation.label}: mở thêm ${unlocked.length} máy trong ngân sách.`,
      variant_id: best.variant.id,
      target_variant_ids: unlocked.slice(0, 2).map((row) => row.variant.id),
      citation: citationFromOffer(best),
      prices_vnd: unlocked
        .map((row) => row.offer.total_known_price_vnd)
        .filter((value): value is number => value != null),
    });
  }
  return evidence;
}

function comparisonEvidence(
  current: VariantOffer | null,
  recent: readonly VariantOffer[],
  profile: UserRequirementProfile,
): NudgeEvidence[] {
  if (!current || current.offer.total_known_price_vnd == null) return [];
  const evidence: NudgeEvidence[] = [];
  const currentTotal = current.offer.total_known_price_vnd;
  for (const alternative of recent) {
    if (alternative.variant.id === current.variant.id) continue;
    if (alternative.offer.total_known_price_vnd == null) continue;
    if (
      profile.max_budget_vnd != null &&
      alternative.offer.total_known_price_vnd > profile.max_budget_vnd
    ) {
      continue;
    }
    const gap = concreteGap(current, alternative, profile);
    if (!gap) continue;
    const delta = alternative.offer.total_known_price_vnd - currentTotal;
    evidence.push({
      code: "COMPARISON_GAP",
      nudge_type: "comparison_insight",
      summary: `${alternative.variant.model_name} có ${gap}${
        delta > 0 ? `, chênh ${formatVnd(delta)}` : delta < 0 ? `, lại rẻ hơn ${formatVnd(Math.abs(delta))}` : ""
      }.`,
      variant_id: current.variant.id,
      target_variant_ids: [current.variant.id, alternative.variant.id],
      citation: citationFromOffer(alternative),
      prices_vnd: [currentTotal, alternative.offer.total_known_price_vnd].filter(
        (value): value is number => Number.isFinite(value),
      ),
    });
  }
  return evidence.slice(0, 2);
}

function concreteGap(
  current: VariantOffer,
  alternative: VariantOffer,
  profile: UserRequirementProfile,
): string | null {
  const left = current.variant;
  const right = alternative.variant;
  if (needsRam16(profile) && (left.ram_gb ?? 0) < 16 && (right.ram_gb ?? 0) >= 16) {
    return `RAM ${right.ram_gb}GB thay vì ${left.ram_gb ?? "?"}GB`;
  }
  if (needsGraphicsWork(profile)) {
    const leftColor = colorGamutPct(left) ?? 0;
    const rightColor = colorGamutPct(right) ?? 0;
    if (leftColor < 95 && rightColor >= 95) return `màn hình ${right.color_gamut} thay vì ${left.color_gamut ?? "chưa rõ"}`;
  }
  if (profile.mandatory_tasks.includes("gaming") && !hasDiscreteGpu(left) && hasDiscreteGpu(right)) {
    return `GPU rời ${right.gpu}`;
  }
  if (profile.mandatory_tasks.includes("portability")) {
    if ((left.weight_kg ?? 99) > 1.8 && (right.weight_kg ?? 99) <= 1.8) {
      return `nhẹ hơn (${right.weight_kg}kg so với ${left.weight_kg}kg)`;
    }
  }
  if (profile.mandatory_tasks.includes("battery_life")) {
    if ((right.battery_wh ?? 0) - (left.battery_wh ?? 0) >= 10) {
      return `pin ${right.battery_wh}Wh thay vì ${left.battery_wh ?? "?"}Wh`;
    }
  }
  return null;
}

function needsRam16(profile: UserRequirementProfile): boolean {
  return profile.mandatory_tasks.some((task) =>
    ["coding", "graphic_2d", "graphic_3d", "video_editing", "gaming", "local_ai"].includes(task),
  );
}

function needsGraphicsWork(profile: UserRequirementProfile): boolean {
  return profile.mandatory_tasks.some((task) => ["graphic_2d", "graphic_3d", "video_editing"].includes(task));
}

function eligibleForProfile(row: VariantOffer, profile: UserRequirementProfile): boolean {
  if (row.variant.status !== "published") return false;
  if (row.offer.total_known_price_vnd == null) return false;
  if (profile.max_budget_vnd != null && row.offer.total_known_price_vnd > profile.max_budget_vnd) return false;
  return profile.mandatory_tasks.every((task) => taskCapability(row.variant, task).ok);
}

function passesFilters(row: VariantOffer, filters: NudgeInput["active_filters"]): boolean {
  const total = row.offer.total_known_price_vnd;
  if (filters.max_price_vnd != null && (total == null || total > filters.max_price_vnd)) return false;
  if (filters.min_ram_gb != null && (row.variant.ram_gb ?? 0) < filters.min_ram_gb) return false;
  if (filters.max_weight_kg != null && (row.variant.weight_kg ?? Infinity) > filters.max_weight_kg) return false;
  const color = colorGamutPct(row.variant);
  if (filters.min_color_gamut_pct != null && (color ?? 0) < filters.min_color_gamut_pct) return false;
  if (filters.min_battery_wh != null && (row.variant.battery_wh ?? 0) < filters.min_battery_wh) return false;
  if (filters.brand && row.variant.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
  return true;
}

function minBudget(profileBudget: number | null, filterBudget: number | null | undefined): number | null {
  if (profileBudget != null && filterBudget != null) return Math.min(profileBudget, filterBudget);
  return profileBudget ?? filterBudget ?? null;
}

function cacheKey(input: NudgeInput): string {
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        category: input.user_profile.category,
        goals: [...input.user_profile.primary_goals].sort(),
        tasks: [...input.user_profile.mandatory_tasks].sort(),
        budget: input.user_profile.max_budget_vnd,
        soft: [...input.user_profile.soft_preferences].sort(),
        // Trigger-relevant context belongs in the goal hash: a new comparison
        // set or filter state must not reuse a stale nudge message.
        recent: [...input.recent_variant_ids].sort(),
        filters: input.active_filters,
      }),
    )
    .digest("hex")
    .slice(0, 16);
  return `${input.current_variant_id}|${input.trigger_type}|${hash}`;
}

function expectedNudgeType(trigger: NudgeTrigger): NudgeDraft["nudge_type"] {
  switch (trigger) {
    case "DEEP_INSPECTION":
      return "blind_spot";
    case "DEAL_WATCHOUT":
      return "better_deal";
    case "FILTER_THRASHING":
      return "filter_unlock";
    case "COMPARISON_HESITATION":
      return "comparison_insight";
  }
}

function defaultCta(type: NudgeDraft["nudge_type"]): {
  label: string;
  action: NudgeDraft["cta_action"];
} {
  switch (type) {
    case "blind_spot":
      return { label: "Xem máy phù hợp hơn", action: "view_variant" };
    case "better_deal":
    case "price_drop":
      return { label: "Xem deal", action: "open_deal" };
    case "filter_unlock":
      return { label: "Nới bộ lọc", action: "adjust_filters" };
    case "comparison_insight":
      return { label: "So sánh ngay", action: "compare" };
  }
}

function includesUnknownMoney(text: string, allowed: Set<number>): boolean {
  const found: number[] = [];
  for (const match of text.matchAll(/\b\d{1,3}(?:[.,]\d{3}){1,}\b/g)) {
    found.push(Number((match[0] ?? "").replace(/[.,]/g, "")));
  }
  for (const match of text.matchAll(/(\d{1,3}(?:[.,]\d{1,2})?)\s*(triệu|tr|tỷ|ty)\b/gi)) {
    const value = Number((match[1] ?? "").replace(",", "."));
    const unit = (match[2] ?? "").toLowerCase();
    found.push(Math.round(value * (unit === "tỷ" || unit === "ty" ? 1_000_000_000 : 1_000_000)));
  }
  return found.some((value) => value >= 1_000_000 && !allowed.has(value));
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function dedupeRows(rows: readonly VariantOffer[]): VariantOffer[] {
  const byId = new Map<string, VariantOffer>();
  for (const row of rows) if (!byId.has(row.variant.id)) byId.set(row.variant.id, row);
  return [...byId.values()];
}

function toNudgeSummary(row: VariantOffer): NudgeVariantSummary {
  const summary: VariantSummary = toVariantSummary(row);
  return {
    variant_id: summary.variant_id,
    title: summary.title,
    total_known_price_vnd: summary.total_known_price_vnd,
    ram_gb: summary.ram_gb,
    gpu: summary.gpu,
    color_gamut: summary.color_gamut,
    weight_kg: summary.weight_kg,
    battery_wh: summary.battery_wh,
  };
}
