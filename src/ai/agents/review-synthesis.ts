import { z } from "zod";

import type { EvidenceDraft, ReviewSynthesisInput, ReviewVariantRef } from "../types/db.types.js";

const SENTENCE_RE = /(?<=[.!?])\s+|\n+/;
const GPU_RE = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/gi;
const RAM_RE = /\b(\d{1,3})\s*gb\b/gi;
const RAM_ONLY = new Set([4, 8, 12, 16, 18, 20, 24, 32, 36, 40, 48, 64, 96]);
const STORAGE_PREFIXES = ["ssd", "nvme", "ổ cứng", "o cung", "storage", "hdd"];
const INTEL_CPU_RE = /\b(i[3579])\s*-\s*(\d{4,5}[a-z]{0,2})\b/gi;
const RYZEN_CPU_RE = /\bryzen\s*([3579])\s+(\d{4}[a-z]{0,2})\b/gi;
const APPLE_CPU_RE = /\bapple\s+m(\d)(?:\s*(pro|max))?\b/gi;
const INCH_RE = /(\d{2}(?:[.,]\d)?)\s*(?:inch(?:es)?|"|”)/gi;
const RES_RE = /\b(\d{3,4})\s*[x×]\s*(\d{3,4})\b/gi;

const GROUPS = [
  ["summary_performance", ["hiệu năng", "hieu nang", "fps", "benchmark", "cinebench", "geekbench", "render", "mượt", "muot"]],
  ["summary_thermals_noise", ["nhiệt", "nhiet", "độ ồn", "do on", "ồn", "fan", "thermal", "nóng", "nong"]],
  ["summary_battery", ["pin", "battery", "thời lượng pin", "thoi luong pin"]],
  ["summary_cons_quirks", ["lỗi", "loi", "nhược", "nhuoc", "điểm trừ", "diem tru", "bản lề", "webcam", "quirk"]],
] as const;

type SummaryKey = (typeof GROUPS)[number][0];

export const evidenceDraftSchema = z
  .object({
    variant_id: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    evidence_type: z.enum(["benchmark", "editorial_review", "spec_sheet"]),
    summary_performance: z.string().nullable(),
    summary_thermals_noise: z.string().nullable(),
    summary_battery: z.string().nullable(),
    summary_cons_quirks: z.string().nullable(),
    raw_excerpt: z.string().max(4000),
    measured_at: z.string(),
    config_warning: z.string().nullable(),
    status: z.literal("pending_review"),
    ai_blocked: z.boolean().optional(),
  })
  .strict();

/**
 * Deterministic sentence bucketing shared by the legacy synthesizer and the
 * review-evidence workflow. A sentence may feed more than one section.
 */
export function classifyReviewSentences(rawText: string): Record<SummaryKey, string[]> {
  const sentences = rawText
    .split(SENTENCE_RE)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const buckets: Record<SummaryKey, string[]> = {
    summary_performance: [],
    summary_thermals_noise: [],
    summary_battery: [],
    summary_cons_quirks: [],
  };
  for (const sentence of sentences) {
    const folded = sentence.toLowerCase();
    for (const [name, words] of GROUPS) {
      if (words.some((word) => folded.includes(word))) buckets[name].push(sentence);
    }
  }
  return buckets;
}

export function synthesizeReview(input: ReviewSynthesisInput): EvidenceDraft {
  const rawText = input.raw_text ?? "";
  const buckets = classifyReviewSentences(rawText);
  const citation = `Nguồn: ${input.source_url} | Ngày kiểm tra: ${input.measured_at}`;
  const summaries = Object.fromEntries(
    GROUPS.map(([name]) => [name, buckets[name].length > 0 ? joinLines(buckets[name], citation) : null]),
  ) as Record<SummaryKey, string | null>;
  return evidenceDraftSchema.parse({
    variant_id: String(input.variant.id),
    source_name: input.source_name,
    source_url: input.source_url,
    evidence_type: input.evidence_type ?? "editorial_review",
    measured_at: input.measured_at,
    raw_excerpt: rawText.slice(0, 4000),
    config_warning: configWarning(rawText, input.variant, input.sibling_skus ?? []),
    status: "pending_review",
    ...summaries,
  });
}

export function configWarning(
  rawText: string,
  variant: ReviewVariantRef,
  siblingSkus: readonly string[] = [],
): string | null {
  const notes: string[] = [];
  if (variant.ram_gb != null) {
    const foreign = [...new Set(mentionedRam(rawText).filter((value) => value !== Math.trunc(variant.ram_gb!)))].sort(
      (left, right) => left - right,
    );
    if (foreign.length > 0) {
      notes.push(
        `Bài nhắc RAM ${foreign.join(", ")}GB trong khi biến thể là ${Math.trunc(variant.ram_gb)}GB.`,
      );
    }
  }
  const variantGpu = gpuCode(variant.gpu ?? "");
  const mentioned = mentionedGpu(rawText);
  if (variantGpu && mentioned.some((code) => code !== variantGpu)) {
    notes.push(`Bài nhắc GPU ${mentioned.join(", ")} trong khi biến thể là ${variantGpu}.`);
  }

  const variantCpuCodes = cpuCodes(variant.cpu ?? "");
  if (variantCpuCodes.size > 0) {
    const foreignCpu = [...mentionedCpu(rawText)]
      .filter((code) => !variantCpuCodes.has(code))
      .sort();
    if (foreignCpu.length > 0) {
      notes.push(
        `Bài nhắc CPU ${foreignCpu.join(", ")} trong khi biến thể là ${variant.cpu ?? "không rõ"}.`,
      );
    }
  }

  if (variant.display_size != null) {
    const foreignSize = [...new Set(mentionedDisplaySizes(rawText))]
      .filter((size) => Math.abs(size - variant.display_size!) > 0.2)
      .sort((left, right) => left - right);
    if (foreignSize.length > 0) {
      notes.push(
        `Bài nhắc màn hình ${foreignSize.join(", ")} inch trong khi biến thể là ${variant.display_size} inch.`,
      );
    }
  }
  if (variant.display_res) {
    const ownRes = normalizeRes(variant.display_res);
    const foreignRes = [...new Set(mentionedResolutions(rawText))]
      .filter((resolution) => resolution !== ownRes)
      .sort();
    if (foreignRes.length > 0) {
      notes.push(
        `Bài nhắc độ phân giải ${foreignRes.join(", ")} trong khi biến thể là ${variant.display_res}.`,
      );
    }
  }
  if (variant.display_panel) {
    const ownPanel = panelType(variant.display_panel);
    const textHasOled = /\boled\b/.test(rawText.toLowerCase());
    const textHasIps = /\bips\b/.test(rawText.toLowerCase());
    if (ownPanel === "oled" && textHasIps && !textHasOled) {
      notes.push(`Bài nhắc màn hình IPS trong khi biến thể là ${variant.display_panel}.`);
    } else if (ownPanel === "ips" && textHasOled && !textHasIps) {
      notes.push(`Bài nhắc màn hình OLED trong khi biến thể là ${variant.display_panel}.`);
    }
  }

  const ownSku = (variant.sku_code ?? "").toLowerCase();
  const folded = rawText.toLowerCase();
  for (const sku of siblingSkus) {
    const token = (sku ?? "").toLowerCase();
    if (token.length >= 5 && token !== ownSku && folded.includes(token)) {
      notes.push(`Bài nhắc SKU khác cùng dòng: ${sku}.`);
    }
  }
  if (notes.length === 0) return null;
  return `${notes.join(" ")} Cần admin kiểm lại đúng phiên bản phần cứng.`;
}

export function forcePending(
  result: Omit<EvidenceDraft, "status"> & { status?: string },
  warning?: string | null,
): EvidenceDraft {
  const guarded: EvidenceDraft = { ...result, status: "pending_review" };
  if (warning) {
    guarded.config_warning = guarded.config_warning ? `${guarded.config_warning} ${warning}`.trim() : warning;
  }
  return guarded;
}

export function fallbackReview(input: ReviewSynthesisInput, error: string, fallbackEnabled: boolean): EvidenceDraft {
  const message = fallbackEnabled
    ? `AI lỗi (${error}). Fallback bật: lưu chờ duyệt, không xuất bản.`
    : `AI lỗi (${error}). Fallback đang tắt: không xuất bản, cần chạy lại.`;
  return forcePending({
    variant_id: String(input.variant.id),
    source_name: input.source_name,
    source_url: input.source_url,
    evidence_type: input.evidence_type ?? "editorial_review",
    measured_at: input.measured_at,
    raw_excerpt: (input.raw_text ?? "").slice(0, 4000),
    summary_performance: null,
    summary_thermals_noise: null,
    summary_battery: null,
    summary_cons_quirks: null,
    config_warning: message,
    status: "pending_review",
    ai_blocked: !fallbackEnabled,
  });
}

function joinLines(lines: readonly string[], citation: string): string {
  return `${lines.join(" ")} ${citation}`;
}

function mentionedRam(text: string): number[] {
  const found: number[] = [];
  for (const match of text.matchAll(RAM_RE)) {
    const number = Number(match[1]);
    if (!RAM_ONLY.has(number)) continue;
    const start = match.index ?? 0;
    const prefix = text.slice(Math.max(0, start - 16), start).toLowerCase();
    if (STORAGE_PREFIXES.some((word) => prefix.includes(word))) continue;
    found.push(number);
  }
  return found;
}

function mentionedGpu(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(GPU_RE)) {
    const code = gpuCode(match[0]);
    if (code) found.add(code);
  }
  return [...found].sort();
}

function gpuCode(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/i.exec(text);
  if (!match?.[1] || !match[2]) return null;
  return `${match[1].toLowerCase()}${match[2]}`;
}

function cpuCodes(text: string): Set<string> {
  const found = new Set<string>();
  for (const match of text.matchAll(INTEL_CPU_RE)) {
    found.add(`${match[1]}-${match[2]}`.toLowerCase());
  }
  for (const match of text.matchAll(RYZEN_CPU_RE)) {
    found.add(`ryzen${match[1]}-${match[2]}`.toLowerCase());
  }
  for (const match of text.matchAll(APPLE_CPU_RE)) {
    found.add(`apple-m${match[1]}${match[2] ?? ""}`.toLowerCase());
  }
  return found;
}

function mentionedCpu(text: string): Set<string> {
  return cpuCodes(text);
}

function mentionedDisplaySizes(text: string): number[] {
  const found: number[] = [];
  for (const match of text.matchAll(INCH_RE)) {
    const value = Number((match[1] ?? "").replace(",", "."));
    if (Number.isFinite(value) && value >= 8 && value <= 20) found.push(value);
  }
  return found;
}

function mentionedResolutions(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(RES_RE)) {
    if (match[1] && match[2]) found.push(`${match[1]}x${match[2]}`);
  }
  return found;
}

function normalizeRes(value: string): string {
  const match = /(\d{3,4})\s*[x×]\s*(\d{3,4})/i.exec(value);
  return match ? `${match[1]}x${match[2]}` : value.toLowerCase().replace(/\s+/g, "");
}

function panelType(value: string): "oled" | "ips" | null {
  const folded = value.toLowerCase();
  if (/\boled\b/.test(folded)) return "oled";
  if (/\bips\b/.test(folded)) return "ips";
  return null;
}
