import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { AiEngineDeps } from "../deps.js";
import {
  comparisonExplanationSchema,
  comparisonInputSchema,
  comparisonResultSchema,
  type ComparisonInput,
  type ComparisonResult,
} from "../schemas/comparison.js";
import type { VariantSummary } from "../schemas/catalog.js";
import type { SourceCitation } from "../types/db.types.js";
import { NO_VERIFIED_EVIDENCE, searchVerifiedEvidences, type EvidenceItem } from "../tools/evidence-tools.js";
import { hardwareSpecText, hasInventedHardwareClaims } from "../tools/claim-guard.js";
import { colorGamutPct, formatVnd, gpuRank, taskLabel } from "../tools/helpers.js";
import { getVariantsComparisonMatrix } from "../tools/variant-tools.js";

const COMPARE_SYSTEM = `Bạn là chuyên gia so sánh laptop. Chỉ dùng đúng dữ liệu JSON.
Không bịa giá, thông số hay nhận định hiệu năng/nhiệt độ/pin ngoài db_evidence.
Không nâng ngân sách của người dùng. Trả JSON đúng schema, summary tối đa 1200 ký tự, tiếng Việt.`;

const ComparisonState = Annotation.Root({
  input: Annotation<ComparisonInput>(),
  result: Annotation<ComparisonResult | null>(),
});

type ComparisonStateValue = typeof ComparisonState.State;

/** Workflow 3: spec-aware trade-off explanation with approved evidence. */
export async function explainComparisonTradeoffs(
  rawInput: ComparisonInput,
  deps: AiEngineDeps,
): Promise<ComparisonResult> {
  const input = comparisonInputSchema.parse(rawInput);
  const graph = new StateGraph(ComparisonState)
    .addNode("load_and_explain", (state: ComparisonStateValue) => loadAndExplain(state, deps))
    .addEdge(START, "load_and_explain")
    .addEdge("load_and_explain", END)
    .compile();

  const state = await graph.invoke({ input, result: null });
  if (!state.result) throw new Error("comparison workflow returned no result");
  return comparisonResultSchema.parse(state.result);
}

async function loadAndExplain(
  state: ComparisonStateValue,
  deps: AiEngineDeps,
): Promise<Partial<ComparisonStateValue>> {
  const input = state.input;
  const matrix = await getVariantsComparisonMatrix(
    { variant_ids: input.variant_ids },
    { catalog: deps.catalog },
  );
  if (matrix.variants.length === 0) {
    return {
      result: {
        variants: [],
        missing_variant_ids: matrix.missing_variant_ids,
        upgrades: [],
        summary: "Không tìm thấy biến thể published nào trong danh mục.",
        budget_warning: null,
        requires_budget_confirmation: false,
        unverified_notes: [NO_VERIFIED_EVIDENCE],
      },
    };
  }

  const query = [
    ...input.user_profile.primary_goals,
    ...input.user_profile.mandatory_tasks.map((task) => taskLabel(task)),
    "hiệu năng nhiệt độ pin",
  ].join(" ");
  const evidence = await searchVerifiedEvidences(
    {
      variant_ids: matrix.variants.map((variant) => variant.variant_id),
      query,
      limit: 9,
    },
    { evidence: deps.evidence },
  );
  const evidenceByVariant = groupEvidence(evidence.evidences);

  const sorted = [...matrix.variants].sort(
    (left, right) => left.total_known_price_vnd - right.total_known_price_vnd,
  );
  const upgrades = buildUpgrades(sorted, evidenceByVariant);
  const unverifiedNotes: string[] = [];
  for (const variant of sorted) {
    if ((evidenceByVariant.get(variant.variant_id) ?? []).length === 0) {
      unverifiedNotes.push(
        `${NO_VERIFIED_EVIDENCE} (${variant.title} · ${variant.sku_code})`,
      );
    }
  }
  if (matrix.component_warnings.length > 0) unverifiedNotes.push(...matrix.component_warnings);
  if (matrix.missing_variant_ids.length > 0) {
    unverifiedNotes.push(`Không tìm thấy variant: ${matrix.missing_variant_ids.join(", ")}.`);
  }

  const budget = budgetAssessment(sorted, input);
  const deterministicSummary = buildSummary(sorted, upgrades, budget.warning);
  const summary = await explainSummary(
    input,
    deps,
    sorted,
    upgrades,
    evidenceByVariant,
    deterministicSummary,
    budget.allowedMoney,
  );

  return {
    result: {
      variants: sorted,
      missing_variant_ids: matrix.missing_variant_ids,
      upgrades,
      summary,
      budget_warning: budget.warning,
      requires_budget_confirmation: budget.requiresConfirmation,
      unverified_notes: unverifiedNotes,
    },
  };
}

function buildUpgrades(
  sorted: readonly VariantSummary[],
  evidenceByVariant: Map<string, EvidenceItem[]>,
): ComparisonResult["upgrades"] {
  const upgrades: ComparisonResult["upgrades"] = [];
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const from = sorted[index]!;
    const to = sorted[index + 1]!;
    const gains: ComparisonResult["upgrades"][number]["gains"] = [];
    const toEvidence = evidenceByVariant.get(to.variant_id) ?? [];

    if ((to.ram_gb ?? 0) > (from.ram_gb ?? 0)) {
      gains.push({
        aspect: "ram",
        description: `RAM ${from.ram_gb ?? "?"}GB → ${to.ram_gb}GB${
          to.ram_upgradable === true ? " (có thể nâng cấp)" : ""
        }.`,
        citation: pickCitation("ram", toEvidence, to),
      });
    }
    if (gpuRank(to) > gpuRank(from)) {
      gains.push({
        aspect: "gpu",
        description: `GPU ${from.gpu ?? "tích hợp"} → ${to.gpu ?? "cao hơn"}.`,
        citation: pickCitation("gpu", toEvidence, to),
      });
    }
    if ((to.storage_gb ?? 0) > (from.storage_gb ?? 0)) {
      gains.push({
        aspect: "storage",
        description: `SSD ${from.storage_gb ?? "?"}GB → ${to.storage_gb}GB.`,
        citation: pickCitation("storage", toEvidence, to),
      });
    }
    const displayGain = displayUpgrade(from, to);
    if (displayGain) {
      gains.push({
        aspect: "display",
        description: displayGain,
        citation: pickCitation("display", toEvidence, to),
      });
    }
    if ((to.battery_wh ?? 0) >= (from.battery_wh ?? 0) + 5) {
      gains.push({
        aspect: "battery",
        description: `Pin ${from.battery_wh ?? "?"}Wh → ${to.battery_wh}Wh.`,
        citation: pickCitation("battery", toEvidence, to),
      });
    }
    if (from.weight_kg != null && to.weight_kg != null && from.weight_kg - to.weight_kg >= 0.1) {
      gains.push({
        aspect: "weight",
        description: `Nhẹ hơn ${Math.round((from.weight_kg - to.weight_kg) * 100) / 100}kg (${from.weight_kg}kg → ${to.weight_kg}kg).`,
        citation: pickCitation("weight", toEvidence, to),
      });
    }
    if (from.ram_upgradable === false && to.ram_upgradable === true) {
      gains.push({
        aspect: "upgradability",
        description: "RAM nâng cấp được, kéo dài tuổi thọ cấu hình.",
        citation: pickCitation("ram", toEvidence, to),
      });
    }
    if ((to.cpu ?? "").trim() && (from.cpu ?? "").trim() && to.cpu !== from.cpu) {
      gains.push({
        aspect: "cpu",
        description: `CPU ${from.cpu} → ${to.cpu}.`,
        citation: pickCitation("cpu", toEvidence, to),
      });
    }

    upgrades.push({
      from_variant_id: from.variant_id,
      to_variant_id: to.variant_id,
      price_delta_vnd: to.total_known_price_vnd - from.total_known_price_vnd,
      gains: gains.slice(0, 6),
    });
  }
  return upgrades;
}

function displayUpgrade(from: VariantSummary, to: VariantSummary): string | null {
  const fromColor = colorGamutPct({ color_gamut: from.color_gamut }) ?? 0;
  const toColor = colorGamutPct({ color_gamut: to.color_gamut }) ?? 0;
  const panelChanged = (from.display_panel ?? "").toLowerCase() !== (to.display_panel ?? "").toLowerCase();
  const resChanged = (from.display_res ?? "") !== (to.display_res ?? "");
  const refreshChanged = (from.refresh_rate ?? 0) !== (to.refresh_rate ?? 0);
  const colorChanged = toColor >= fromColor + 10;
  const sizeChanged = Math.abs((to.display_size ?? 0) - (from.display_size ?? 0)) >= 0.2;
  if (!panelChanged && !resChanged && !refreshChanged && !colorChanged && !sizeChanged) return null;
  const left = [from.display_size != null ? `${from.display_size}"` : null, from.display_res, from.display_panel, from.color_gamut]
    .filter(Boolean)
    .join(" ");
  const right = [to.display_size != null ? `${to.display_size}"` : null, to.display_res, to.display_panel, to.color_gamut]
    .filter(Boolean)
    .join(" ");
  return `Màn hình ${left || "chưa rõ"} → ${right || "chưa rõ"}.`;
}

function pickCitation(
  aspect: "ram" | "gpu" | "storage" | "display" | "battery" | "weight" | "cpu",
  evidences: readonly EvidenceItem[],
  variant: VariantSummary,
): SourceCitation {
  const patterns: Record<typeof aspect, RegExp> = {
    ram: /(ram|bộ nhớ|hiệu năng)/i,
    gpu: /(gpu|đồ họa|hiệu năng|game|fps)/i,
    storage: /(ssd|ổ cứng|lưu trữ)/i,
    display: /(màn hình|display|oled|màu|srgb)/i,
    battery: /(pin|battery|thời lượng)/i,
    weight: /(nặng|weight|kg)/i,
    cpu: /(cpu|hiệu năng|xử lý)/i,
  };
  const match = evidences.find((item) => patterns[aspect].test(item.claim));
  if (match) {
    return {
      source_name: match.source_name,
      source_url: match.source_url,
      measured_at: match.measured_at,
    };
  }
  return {
    source_name: `${variant.store_name} (thông số niêm yết)`,
    source_url: variant.source_url,
    measured_at: variant.checked_at,
  };
}

function budgetAssessment(
  variants: readonly VariantSummary[],
  input: ComparisonInput,
): { warning: string | null; requiresConfirmation: boolean; allowedMoney: Set<number> } {
  const max = input.user_profile.max_budget_vnd;
  const extra = input.extra_budget_vnd ?? 0;
  const allowedMoney = new Set<number>();
  for (const variant of variants) {
    allowedMoney.add(variant.total_known_price_vnd);
    if (variant.conditional_price_vnd != null) allowedMoney.add(variant.conditional_price_vnd);
  }
  if (max != null) {
    allowedMoney.add(max);
    if (extra > 0) allowedMoney.add(max + extra);
  }
  if (max == null) {
    return { warning: "Chưa có ngân sách trần đã xác nhận; không kết luận vượt/không vượt.", requiresConfirmation: false, allowedMoney };
  }

  const over = variants.filter((variant) => variant.total_known_price_vnd > max);
  if (over.length === 0) {
    return { warning: null, requiresConfirmation: false, allowedMoney };
  }

  const names = over.map((variant) => `${variant.title} (${formatVnd(variant.total_known_price_vnd)})`).join(", ");
  if (extra > 0) {
    const stillOver = over.filter((variant) => variant.total_known_price_vnd > max + extra);
    if (stillOver.length > 0) {
      return {
        warning: `Vượt trần ${formatVnd(max)} ngay cả khi thêm ${formatVnd(extra)}: ${names}. Không tự nâng ngân sách.`,
        requiresConfirmation: true,
        allowedMoney,
      };
    }
    return {
      warning: `Vượt trần hiện tại ${formatVnd(max)}. Khoản thêm ${formatVnd(
        extra,
      )} đủ cho ${names}, nhưng cần bạn xác nhận lại ngân sách trước khi dùng.`,
      requiresConfirmation: true,
      allowedMoney,
    };
  }
  return {
    warning: `Vượt trần ${formatVnd(max)}: ${names}. Không tự nâng ngân sách; hãy chọn cấu hình thấp hơn hoặc xác nhận trần mới.`,
    requiresConfirmation: true,
    allowedMoney,
  };
}

function buildSummary(
  variants: readonly VariantSummary[],
  upgrades: ComparisonResult["upgrades"],
  budgetWarning: string | null,
): string {
  if (variants.length < 2) return "Cần ít nhất 2 biến thể để so sánh.";
  const parts: string[] = [];
  for (const upgrade of upgrades) {
    const from = variants.find((variant) => variant.variant_id === upgrade.from_variant_id);
    const to = variants.find((variant) => variant.variant_id === upgrade.to_variant_id);
    if (!from || !to) continue;
    const gainText =
      upgrade.gains.length > 0
        ? upgrade.gains.map((gain) => gain.description).join(" ")
        : "Không thấy nâng cấp phần cứng rõ ràng trong dữ liệu.";
    parts.push(
      `Từ ${from.title} lên ${to.title} chênh ${formatVnd(upgrade.price_delta_vnd)}: ${gainText}`,
    );
  }
  if (budgetWarning) parts.push(budgetWarning);
  return parts.join(" ").slice(0, 2000);
}

async function explainSummary(
  input: ComparisonInput,
  deps: AiEngineDeps,
  variants: readonly VariantSummary[],
  upgrades: ComparisonResult["upgrades"],
  evidenceByVariant: Map<string, EvidenceItem[]>,
  fallback: string,
  allowedMoney: Set<number>,
): Promise<string> {
  if (!deps.llm || variants.length < 2) return fallback;
  try {
    const explanation = await deps.llm.generate({
      name: "comparison_explainer",
      schema: comparisonExplanationSchema,
      system: COMPARE_SYSTEM,
      input: {
        user_profile: input.user_profile,
        extra_budget_vnd: input.extra_budget_vnd ?? null,
        variants,
        upgrades,
        evidence: variants.map((variant) => ({
          variant_id: variant.variant_id,
          evidence_status: (evidenceByVariant.get(variant.variant_id) ?? []).length > 0 ? "available" : "missing",
          claims: (evidenceByVariant.get(variant.variant_id) ?? []).map((item) => ({
            claim: item.claim,
            source_name: item.source_name,
            measured_at: item.measured_at,
          })),
        })),
      },
      maxOutputTokens: 800,
    });
    if (includesUnknownMoney(explanation.summary, allowedMoney)) return fallback;
    if (
      hasInventedHardwareClaims(
        explanation.summary,
        [
          ...variants.map((variant) => hardwareSpecText(variant)),
          ...variants.map((variant) => variant.title),
          ...upgrades.map((upgrade) => upgrade.gains.map((gain) => gain.description).join(" ")),
          ...[...evidenceByVariant.values()].flatMap((list) => list.map((item) => item.claim)),
        ].join(" · "),
      )
    ) {
      return fallback;
    }
    if (
      /(hiệu năng|fps|nhiệt|độ ồn|pin thực|benchmark)/i.test(explanation.summary) &&
      [...evidenceByVariant.values()].every((list) => list.length === 0)
    ) {
      return fallback;
    }
    return explanation.summary.trim() || fallback;
  } catch {
    return fallback;
  }
}

function groupEvidence(rows: readonly EvidenceItem[]): Map<string, EvidenceItem[]> {
  const grouped = new Map<string, EvidenceItem[]>();
  for (const row of rows) {
    const list = grouped.get(row.variant_id) ?? [];
    list.push(row);
    grouped.set(row.variant_id, list);
  }
  return grouped;
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
