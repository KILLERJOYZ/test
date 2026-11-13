import { foldText } from "./helpers.js";

/**
 * Hardware-token guard for LLM prose.
 *
 * Prices are checked separately. This guard extracts concrete hardware claims
 * (GPU/CPU model codes, RAM/storage/VRAM sizes, battery, weight, refresh rate,
 * display size and resolution) from generated text and rejects any token that
 * is not present in the DB-backed context the model was allowed to use.
 *
 * It is deliberately conservative: a false rejection only drops optional LLM
 * prose and falls back to deterministic text, while a false acceptance would
 * let an invented spec reach the user.
 */

const GPU_RE = /\b(rtx|gtx|rx|arc)\s*-?\s*a?\s*(\d{3,4})(?:\s*ti)?\b/gi;
const INTEL_CPU_RE = /\b(i[3579])\s*-\s*(\d{4,5}[a-z]{0,2})\b/gi;
const RYZEN_CPU_RE = /\bryzen\s*([3579])\s+(\d{4}[a-z]{0,2})\b/gi;
const APPLE_CPU_RE = /\bapple\s+m(\d)(?:\s*(pro|max))?\b/gi;
const GB_RE = /\b(\d{1,3})\s*gb\b/gi;
const WH_RE = /\b(\d{1,3}(?:[.,]\d+)?)\s*wh\b/gi;
const KG_RE = /\b(\d(?:[.,]\d+)?)\s*kg\b/gi;
const HZ_RE = /\b(\d{2,3})\s*hz\b/gi;
const INCH_RE = /(\d{2}(?:[.,]\d)?)\s*(?:inch(?:es)?|"|”)/gi;
const RES_RE = /\b(\d{3,4})\s*[x×]\s*(\d{3,4})\b/gi;

const GPU_PREFIX_RE = /\b(rtx|gtx|rx|arc|vram|gpu)\b/;
const STORAGE_PREFIX_RE = /\b(ssd|nvme|hdd|storage)\b|(ổ cứng|o cung|lưu trữ|luu tru)/;

export interface HardwareSpecLike {
  cpu?: string | null;
  gpu?: string | null;
  ram_gb?: number | null;
  storage_gb?: number | null;
  display_size?: number | null;
  display_res?: string | null;
  display_panel?: string | null;
  color_gamut?: string | null;
  refresh_rate?: number | null;
  battery_wh?: number | null;
  weight_kg?: number | null;
}

/** Render real specs into the same vocabulary the guard recognises. */
export function hardwareSpecText(spec: HardwareSpecLike): string {
  return [
    spec.cpu ? `CPU ${spec.cpu}` : null,
    spec.gpu ? `GPU ${spec.gpu}` : null,
    spec.ram_gb != null ? `RAM ${spec.ram_gb}GB` : null,
    spec.storage_gb != null ? `SSD ${spec.storage_gb}GB` : null,
    spec.display_size != null ? `${spec.display_size} inch` : null,
    spec.display_res ? `độ phân giải ${spec.display_res}` : null,
    spec.display_panel,
    spec.color_gamut,
    spec.refresh_rate != null ? `${spec.refresh_rate}Hz` : null,
    spec.battery_wh != null ? `${spec.battery_wh}Wh` : null,
    spec.weight_kg != null ? `${spec.weight_kg}kg` : null,
  ]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" · ");
}

/** Extract normalized hardware tokens from free text. */
export function hardwareClaimTokens(text: string): Set<string> {
  const folded = foldText(text);
  const tokens = new Set<string>();

  for (const match of folded.matchAll(GPU_RE)) {
    tokens.add(`gpu:${match[1]}${match[2]}${/ti\b/.test(match[0]) ? "ti" : ""}`);
  }
  for (const match of folded.matchAll(INTEL_CPU_RE)) {
    tokens.add(`cpu:${match[1]}-${match[2]}`);
  }
  for (const match of folded.matchAll(RYZEN_CPU_RE)) {
    tokens.add(`cpu:ryzen${match[1]}-${match[2]}`);
  }
  for (const match of folded.matchAll(APPLE_CPU_RE)) {
    tokens.add(`cpu:apple-m${match[1]}${match[2] ?? ""}`);
  }
  for (const match of folded.matchAll(GB_RE)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const before = folded.slice(Math.max(0, start - 24), start);
    const after = folded.slice(end, end + 12);
    const number = Number(match[1]);
    if (!Number.isFinite(number)) continue;
    if (/\bram\b/.test(after) || /\bram\b/.test(before)) {
      tokens.add(`ram:${number}`);
    } else if (GPU_PREFIX_RE.test(before) || /\bvram\b/.test(after)) {
      tokens.add(`vram:${number}`);
    } else if (STORAGE_PREFIX_RE.test(before) || STORAGE_PREFIX_RE.test(after)) {
      tokens.add(`storage:${number}`);
    } else {
      tokens.add(`ram:${number}`);
    }
  }
  for (const match of folded.matchAll(WH_RE)) {
    tokens.add(`wh:${Number((match[1] ?? "").replace(",", "."))}`);
  }
  for (const match of folded.matchAll(KG_RE)) {
    tokens.add(`kg:${Number((match[1] ?? "").replace(",", "."))}`);
  }
  for (const match of folded.matchAll(HZ_RE)) {
    tokens.add(`hz:${Number(match[1])}`);
  }
  for (const match of folded.matchAll(INCH_RE)) {
    tokens.add(`inch:${Number((match[1] ?? "").replace(",", "."))}`);
  }
  for (const match of folded.matchAll(RES_RE)) {
    tokens.add(`res:${match[1]}x${match[2]}`);
  }
  return tokens;
}

/**
 * True when `text` contains a concrete hardware token that is absent from the
 * allowed DB context. Callers fall back to deterministic prose on true.
 */
export function hasInventedHardwareClaims(text: string, allowedContext: string): boolean {
  if (!text.trim()) return false;
  const allowed = hardwareClaimTokens(allowedContext);
  for (const token of hardwareClaimTokens(text)) {
    if (!allowed.has(token)) return true;
  }
  return false;
}
