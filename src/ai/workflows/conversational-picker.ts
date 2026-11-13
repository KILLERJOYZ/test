import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { AiEngineDeps } from "../deps.js";
import {
  pickerExplanationSchema,
  pickerInputSchema,
  pickerResultSchema,
  type PickerExplanation,
  type PickerInput,
  type PickerRecommendation,
  type PickerResult,
} from "../schemas/picker.js";
import {
  profileExtractionSchema,
  type ProfileExtraction,
  type UserRequirementProfile,
} from "../schemas/profile.js";
import {
  NO_VERIFIED_EVIDENCE,
  searchVerifiedEvidences,
  type EvidenceItem,
} from "../tools/evidence-tools.js";
import { formatVnd, taskLabel, colorGamutPct } from "../tools/helpers.js";
import { hardwareSpecText, hasInventedHardwareClaims } from "../tools/claim-guard.js";
import { queryVariantsByConstraints } from "../tools/variant-tools.js";
import type { VariantSummary } from "../schemas/catalog.js";

import {
  buildConfirmationQuestions,
  isConfirmationMessage,
  mergeProfile,
  sameProfile,
} from "./profile-extraction.js";

const PROFILE_SYSTEM = `Bạn là bộ trích xuất hồ sơ mua laptop/điện thoại cho người Việt.
Chỉ trả JSON đúng schema. Không bịa ngân sách: nếu người dùng không nêu số tiền cụ thể, trả max_budget_vnd = null.
primary_goals: 1-3 mục đích theo thứ tự ưu tiên, viết tiếng Việt ngắn.
mandatory_tasks: chỉ chọn trong danh sách office, student, coding, graphic_2d, graphic_3d, video_editing, gaming, portability, battery_life, local_ai.
soft_preferences: tối đa 2, chỉ chọn lighter, better_battery, better_display, quieter, upgradable, cheaper.
Không tự thêm ràng buộc người dùng chưa nói.`;

const EXPLAIN_SYSTEM = `Bạn là chuyên gia tư vấn mua laptop. Chỉ dùng dữ liệu JSON được cấp.
Không được bịa thông số, giá, hay nhận định hiệu năng/nhiệt độ/pin nếu evidence_status không phải "available".
Không được nâng ngân sách. Không được đổi variant_id.
Trả JSON đúng schema, mỗi gợi ý tối đa 4 lý do và 4 đánh đổi, câu ngắn.`;

const PickerState = Annotation.Root({
  input: Annotation<PickerInput>(),
  profile: Annotation<UserRequirementProfile | null>(),
  status: Annotation<PickerResult["status"]>(),
  questions: Annotation<string[]>(),
  recommendations: Annotation<PickerRecommendation[]>(),
  /** DB-backed specs used to validate optional LLM prose. */
  variants: Annotation<VariantSummary[]>(),
  notes: Annotation<string[]>(),
  advisorNote: Annotation<string | null>(),
});

type PickerStateValue = typeof PickerState.State;

export async function runConversationalPicker(
  rawInput: PickerInput,
  deps: AiEngineDeps,
): Promise<PickerResult> {
  const input = pickerInputSchema.parse(rawInput);
  const graph = new StateGraph(PickerState)
    .addNode("extract_profile", (state: PickerStateValue) => extractProfileNode(state, deps))
    .addNode("confirmation_gate", (state: PickerStateValue) => confirmationGateNode(state))
    .addNode("retrieve_and_rank", (state: PickerStateValue) => retrieveAndRankNode(state, deps))
    .addNode("tradeoff_explainer", (state: PickerStateValue) => tradeoffExplainerNode(state, deps))
    .addEdge(START, "extract_profile")
    .addEdge("extract_profile", "confirmation_gate")
    .addConditionalEdges("confirmation_gate", (state: PickerStateValue) =>
      state.status === "AWAITING_CONFIRMATION" ? END : "retrieve_and_rank",
    )
    .addConditionalEdges("retrieve_and_rank", (state: PickerStateValue) =>
      state.status === "NO_MATCH" ? END : "tradeoff_explainer",
    )
    .addEdge("tradeoff_explainer", END)
    .compile();

  const state = await graph.invoke({
    input,
    profile: null,
    status: "AWAITING_CONFIRMATION" as const,
    questions: [],
    recommendations: [],
    variants: [],
    notes: [],
    advisorNote: null,
  });

  return pickerResultSchema.parse({
    status: state.status,
    extracted_profile: state.profile,
    questions: state.questions,
    recommendations: state.recommendations,
    notes: state.notes,
    advisor_note: state.advisorNote,
  });
}

async function extractProfileNode(
  state: PickerStateValue,
  deps: AiEngineDeps,
): Promise<Partial<PickerStateValue>> {
  const message = state.input.message;
  const draft = state.input.draft_profile ?? null;
  const skipLlm =
    Boolean(draft) && state.input.is_confirmed === true && isConfirmationMessage(message);

  let extracted: ProfileExtraction | null = null;
  if (deps.llm && !skipLlm) {
    try {
      extracted = await deps.llm.generate({
        name: "picker_profile",
        schema: profileExtractionSchema,
        system: PROFILE_SYSTEM,
        input: {
          message,
          draft_profile: draft,
          known_budget_from_text: null,
        },
        maxOutputTokens: 550,
      });
    } catch {
      extracted = null;
    }
  }

  const profile = mergeProfile(extracted, message, draft);
  return { profile };
}

function confirmationGateNode(state: PickerStateValue): Partial<PickerStateValue> {
  const profile = state.profile;
  if (!profile) {
    return { status: "AWAITING_CONFIRMATION", questions: ["Bạn muốn mua laptop hay điện thoại?"] };
  }

  const draft = state.input.draft_profile ?? null;
  const confirmed = state.input.is_confirmed === true;
  const unchanged = draft ? sameProfile(profile, draft) : false;
  const complete = profile.missing_fields.length === 0;
  const canSearch = Boolean(draft) && confirmed && unchanged && complete;

  if (canSearch) {
    return { status: "COMPLETED", questions: [] };
  }

  const questions = buildConfirmationQuestions(profile);
  return { status: "AWAITING_CONFIRMATION", questions };
}

async function retrieveAndRankNode(
  state: PickerStateValue,
  deps: AiEngineDeps,
): Promise<Partial<PickerStateValue>> {
  const profile = state.profile;
  if (!profile || profile.max_budget_vnd == null) {
    return {
      status: "NO_MATCH",
      recommendations: [],
      notes: ["Thiếu ngân sách trần; không tìm máy khi chưa xác nhận."],
    };
  }

  const result = await queryVariantsByConstraints(
    {
      mandatory_tasks: profile.mandatory_tasks,
      max_budget_vnd: profile.max_budget_vnd,
      category: profile.category,
      soft_preferences: profile.soft_preferences,
    },
    { catalog: deps.catalog },
  );

  if (result.variants.length === 0) {
    const notes = result.excluded
      .slice(0, 3)
      .map((item) => `${item.title}: ${item.reasons.join("; ")}`);
    return {
      status: "NO_MATCH",
      recommendations: [],
      notes:
        notes.length > 0
          ? [`Không có cấu hình nào đáp ứng đồng thời ngân sách và tác vụ bắt buộc.`, ...notes]
          : ["Không có cấu hình nào đáp ứng đồng thời ngân sách và tác vụ bắt buộc."],
    };
  }

  const top = result.variants.slice(0, 3);
  const query = [
    ...profile.primary_goals,
    ...profile.mandatory_tasks.map((task) => taskLabel(task)),
  ].join(" ");
  const evidence = await searchVerifiedEvidences(
    { variant_ids: top.map((variant) => variant.variant_id), query, limit: 8 },
    { evidence: deps.evidence },
  );
  const byVariant = groupEvidence(evidence.evidences);

  const recommendations = top.map((variant) =>
    buildRecommendation(variant, profile, byVariant.get(variant.variant_id) ?? [], evidence.status),
  );

  const notes: string[] = [];
  if (evidence.status === "unavailable") {
    notes.push(`${NO_VERIFIED_EVIDENCE} Kho bằng chứng không phản hồi; không suy đoán ưu nhược điểm.`);
  } else if (evidence.status === "missing") {
    notes.push(NO_VERIFIED_EVIDENCE);
  }

  return {
    status: "COMPLETED",
    recommendations,
    variants: top,
    notes,
    advisorNote: `Đã lọc theo ngân sách trần ${formatVnd(profile.max_budget_vnd)} và các tác vụ bắt buộc.`,
  };
}

async function tradeoffExplainerNode(
  state: PickerStateValue,
  deps: AiEngineDeps,
): Promise<Partial<PickerStateValue>> {
  const profile = state.profile;
  const recommendations = state.recommendations;
  if (!profile || recommendations.length === 0) return {};

  const withMissingNotes = recommendations.map((recommendation) => ensureMissingEvidenceNote(recommendation));

  if (!deps.llm) {
    return {
      recommendations: withMissingNotes,
      advisorNote: state.advisorNote ?? null,
    };
  }

  const allowedTotals = new Set([
    ...withMissingNotes.map((recommendation) => recommendation.total_known_price_vnd),
    ...(profile.max_budget_vnd != null ? [profile.max_budget_vnd] : []),
  ]);

  try {
    const explanation = await deps.llm.generate({
      name: "picker_explanation",
      schema: pickerExplanationSchema,
      system: EXPLAIN_SYSTEM,
      input: {
        user_profile: profile,
        recommendations: withMissingNotes.map((recommendation) => ({
          variant_id: recommendation.variant_id,
          title: recommendation.title,
          total_known_price_vnd: recommendation.total_known_price_vnd,
          evidence_status: recommendation.evidence_status,
          evidences: recommendation.evidences.map((item) => ({
            claim: item.claim,
            source_name: item.source_name,
            measured_at: item.measured_at,
          })),
          current_fit_reasons: recommendation.fit_reasons,
          current_tradeoffs: recommendation.tradeoffs,
        })),
      },
      maxOutputTokens: 700,
    });
    return applyExplanation(
      explanation,
      withMissingNotes,
      allowedTotals,
      state.advisorNote,
      state.variants,
    );
  } catch {
    return { recommendations: withMissingNotes };
  }
}

function buildRecommendation(
  variant: VariantSummary,
  profile: UserRequirementProfile,
  evidences: EvidenceItem[],
  overallStatus: "available" | "missing" | "unavailable",
): PickerRecommendation {
  const fitReasons = [
    `Tổng đã biết ${formatVnd(variant.total_known_price_vnd)} nằm trong ngân sách ${formatVnd(
      profile.max_budget_vnd,
    )}.`,
  ];
  for (const task of profile.mandatory_tasks) {
    fitReasons.push(taskFitReason(variant, task));
  }
  if (variant.ram_upgradable === true) fitReasons.push("RAM có thể nâng cấp sau này.");
  if (evidences.length > 0) fitReasons.push(`Có ${evidences.length} đoạn kiểm chứng đã duyệt cho đúng SKU.`);

  const tradeoffs = hardwareTradeoffs(variant);
  const evidenceStatus = evidences.length > 0 ? "available" : overallStatus === "unavailable" ? "unavailable" : "missing";
  if (evidenceStatus !== "available") tradeoffs.push(NO_VERIFIED_EVIDENCE);

  return {
    variant_id: variant.variant_id,
    sku_code: variant.sku_code,
    title: variant.title,
    brand: variant.brand,
    total_known_price_vnd: variant.total_known_price_vnd,
    store_name: variant.store_name,
    offer_url: variant.source_url,
    checked_at: variant.checked_at,
    fit_reasons: fitReasons.slice(0, 5),
    tradeoffs: tradeoffs.slice(0, 5),
    evidence_status: evidenceStatus,
    evidences: evidences.slice(0, 2).map((item) => ({
      evidence_id: item.evidence_id,
      claim: item.claim,
      source_name: item.source_name,
      source_url: item.source_url,
      measured_at: item.measured_at,
      source_citation: {
        source_name: item.source_name,
        source_url: item.source_url,
        measured_at: item.measured_at,
      },
    })),
  };
}

function taskFitReason(variant: VariantSummary, task: UserRequirementProfile["mandatory_tasks"][number]): string {
  switch (task) {
    case "gaming":
    case "graphic_3d":
    case "video_editing":
      return `${taskLabel(task)}: GPU ${variant.gpu ?? "chưa rõ"} và RAM ${variant.ram_gb ?? "?"}GB.`;
    case "graphic_2d":
      return `Đồ họa 2D: màn hình ${variant.color_gamut ?? "chưa rõ"} và RAM ${variant.ram_gb ?? "?"}GB.`;
    case "coding":
      return `Lập trình: RAM ${variant.ram_gb ?? "?"}GB, SSD ${variant.storage_gb ?? "?"}GB.`;
    case "portability":
      return `Mang đi: nặng ${variant.weight_kg != null ? `${variant.weight_kg}kg` : "chưa rõ"}.`;
    case "battery_life":
      return `Pin ${variant.battery_wh != null ? `${variant.battery_wh}Wh` : "chưa rõ"}.`;
    case "local_ai":
      return `AI cục bộ: RAM ${variant.ram_gb ?? "?"}GB.`;
    default:
      return `Đáp ứng nhu cầu ${taskLabel(task)}.`;
  }
}

function hardwareTradeoffs(variant: VariantSummary): string[] {
  const tradeoffs: string[] = [];
  if (variant.weight_kg != null && variant.weight_kg > 2) tradeoffs.push(`Nặng ${variant.weight_kg}kg.`);
  if (variant.battery_wh != null && variant.battery_wh < 60) tradeoffs.push(`Pin chỉ ${variant.battery_wh}Wh.`);
  const color = colorGamutPct({ color_gamut: variant.color_gamut });
  if (color != null && color < 95) tradeoffs.push(`Màn hình chỉ ${variant.color_gamut}.`);
  if (variant.ram_upgradable === false) tradeoffs.push("RAM hàn chết, không nâng cấp được.");
  if (variant.storage_slots != null && variant.storage_slots <= 1) tradeoffs.push("Chỉ có 1 khe SSD.");
  if (variant.conditional_price_vnd != null && variant.promo_conditions) {
    tradeoffs.push(`Giá ${formatVnd(variant.conditional_price_vnd)} chỉ áp dụng khi: ${variant.promo_conditions}.`);
  }
  if (variant.product_condition !== "new") tradeoffs.push(`Tình trạng máy: ${variant.product_condition}.`);
  return tradeoffs;
}

function ensureMissingEvidenceNote(recommendation: PickerRecommendation): PickerRecommendation {
  if (recommendation.evidence_status === "available") return recommendation;
  if (recommendation.tradeoffs.some((item) => item.includes("Chưa có dữ liệu kiểm chứng"))) {
    return recommendation;
  }
  return {
    ...recommendation,
    tradeoffs: [...recommendation.tradeoffs, NO_VERIFIED_EVIDENCE].slice(0, 6),
  };
}

function applyExplanation(
  explanation: PickerExplanation,
  recommendations: PickerRecommendation[],
  allowedTotals: Set<number>,
  fallbackNote: string | null,
  variants: readonly VariantSummary[],
): Partial<PickerStateValue> {
  const byId = new Map(recommendations.map((recommendation) => [recommendation.variant_id, recommendation]));
  const variantsById = new Map(variants.map((variant) => [variant.variant_id, variant]));
  const allowedIds = new Set(byId.keys());
  const allowedHardwareFor = (recommendation: PickerRecommendation): string => {
    const variant = variantsById.get(recommendation.variant_id);
    const evidenceText = recommendation.evidences.map((item) => item.claim).join(" · ");
    const currentText = [
      ...recommendation.fit_reasons,
      ...recommendation.tradeoffs,
      recommendation.title,
    ].join(" · ");
    return [
      variant ? hardwareSpecText(variant) : "",
      evidenceText,
      currentText,
    ].join(" · ");
  };
  const globalHardware = recommendations
    .map((recommendation) => `${allowedHardwareFor(recommendation)} · ${recommendation.brand}`)
    .join(" · ");
  const texts = [
    explanation.advisor_note ?? "",
    ...explanation.recommendations.flatMap((item) => [...item.fit_reasons, ...item.tradeoffs]),
  ];
  if (texts.some((text) => includesUnknownMoney(text, allowedTotals))) {
    return { recommendations };
  }

  const updated = recommendations.map((recommendation) => {
    const proposed = explanation.recommendations.find(
      (item) => item.variant_id === recommendation.variant_id && allowedIds.has(item.variant_id),
    );
    if (!proposed) return recommendation;
    const allowedHardware = allowedHardwareFor(recommendation);
    const fitReasons = proposed.fit_reasons
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => recommendation.evidence_status === "available" || !claimsMeasuredBehavior(item))
      .filter((item) => !hasInventedHardwareClaims(item, allowedHardware));
    const tradeoffs = proposed.tradeoffs
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => recommendation.evidence_status === "available" || !claimsMeasuredBehavior(item))
      .filter((item) => !hasInventedHardwareClaims(item, allowedHardware));
    return ensureMissingEvidenceNote({
      ...recommendation,
      fit_reasons: fitReasons.length > 0 ? fitReasons.slice(0, 4) : recommendation.fit_reasons,
      tradeoffs: [...(tradeoffs.length > 0 ? tradeoffs.slice(0, 4) : recommendation.tradeoffs), ...(
        recommendation.evidence_status !== "available" && !tradeoffs.some((item) => item.includes("Chưa có dữ liệu kiểm chứng"))
          ? [NO_VERIFIED_EVIDENCE]
          : []
      )].slice(0, 6),
    });
  });

  const advisorNote =
    explanation.advisor_note &&
    !includesUnknownMoney(explanation.advisor_note, allowedTotals) &&
    !hasInventedHardwareClaims(explanation.advisor_note, globalHardware)
      ? explanation.advisor_note.trim()
      : fallbackNote;

  return { recommendations: updated, advisorNote };
}

function claimsMeasuredBehavior(text: string): boolean {
  return /(hiệu năng|fps|benchmark|nhiệt|độ ồn|quạt|pin thực|thời lượng pin|render)/i.test(text);
}

function includesUnknownMoney(text: string, allowed: Set<number>): boolean {
  if (!text) return false;
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

function groupEvidence(rows: readonly EvidenceItem[]): Map<string, EvidenceItem[]> {
  const grouped = new Map<string, EvidenceItem[]>();
  for (const row of rows) {
    const list = grouped.get(row.variant_id) ?? [];
    list.push(row);
    grouped.set(row.variant_id, list);
  }
  return grouped;
}
