import type { MandatoryTask, SoftPreference } from "../schemas/profile.js";
import type { VariantSummary } from "../schemas/catalog.js";
import type {
  PriceHistoryPoint,
  ProductVariant,
  SourceCitation,
  VariantOffer,
} from "../types/db.types.js";

export const DISCRETE_GPU_RE = /\b(rtx|gtx|rx\s*\d|arc\s+a|radeon\s+rx)\b/i;

export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function colorGamutPct(variant: { color_gamut: string | null }): number | null {
  if (!variant.color_gamut) return null;
  const match = /(\d{1,3}(?:[.,]\d+)?)\s*%/.exec(variant.color_gamut);
  if (!match?.[1]) return null;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function hasDiscreteGpu(variant: ProductVariant): boolean {
  return Boolean(variant.gpu && DISCRETE_GPU_RE.test(variant.gpu));
}

export function gpuRank(variant: { gpu: string | null }): number {
  const gpu = foldText(variant.gpu ?? "");
  if (!gpu) return 0;
  if (/\brtx\s*40|rtx\s*50/.test(gpu)) return 5;
  if (/\brtx\b/.test(gpu)) return 4;
  if (/\b(gtx|rx\s*\d|arc\s+a)\b/.test(gpu)) return 3;
  if (/\b(apple m[1-9]|radeon|arc)\b/.test(gpu)) return 2;
  return 1;
}

export function taskCapability(
  variant: ProductVariant,
  task: MandatoryTask,
): { ok: boolean; reason: string } {
  const ram = variant.ram_gb;
  const storage = variant.storage_gb;
  const battery = variant.battery_wh;
  const weight = variant.weight_kg;
  const color = colorGamutPct(variant);

  switch (task) {
    case "office":
      return check(ram != null && ram >= 8 && storage != null && storage >= 256, "cần RAM ≥ 8GB và SSD ≥ 256GB");
    case "student":
      return check(ram != null && ram >= 8 && storage != null && storage >= 256, "cần RAM ≥ 8GB và SSD ≥ 256GB");
    case "coding":
      return check(ram != null && ram >= 16 && storage != null && storage >= 512, "cần RAM ≥ 16GB và SSD ≥ 512GB");
    case "graphic_2d":
      if (color == null) return { ok: false, reason: "chưa có dữ liệu độ phủ màu để xác nhận đồ họa 2D" };
      return check(
        color >= 95 && ram != null && ram >= 16,
        "cần màn hình ≥ 95% sRGB và RAM ≥ 16GB",
      );
    case "graphic_3d":
      return check(
        hasDiscreteGpu(variant) && ram != null && ram >= 16,
        "cần GPU rời và RAM ≥ 16GB",
      );
    case "video_editing":
      return check(
        hasDiscreteGpu(variant) && ram != null && ram >= 16 && storage != null && storage >= 512,
        "cần GPU rời, RAM ≥ 16GB và SSD ≥ 512GB",
      );
    case "gaming":
      return check(hasDiscreteGpu(variant) && ram != null && ram >= 16, "cần GPU rời và RAM ≥ 16GB");
    case "portability":
      return check(weight != null && weight <= 1.8, "cần máy ≤ 1.8kg");
    case "battery_life":
      return check(battery != null && battery >= 60, "cần pin ≥ 60Wh");
    case "local_ai":
      return check(ram != null && ram >= 32, "cần RAM ≥ 32GB cho AI cục bộ");
  }
}

export function softPreferenceSatisfied(variant: ProductVariant, preference: SoftPreference): boolean {
  switch (preference) {
    case "lighter":
      return variant.weight_kg != null && variant.weight_kg <= 1.7;
    case "better_battery":
      return variant.battery_wh != null && variant.battery_wh >= 60;
    case "better_display":
      return (colorGamutPct(variant) ?? 0) >= 95 || Boolean(variant.display_panel && /oled/i.test(variant.display_panel));
    case "quieter":
      return !hasDiscreteGpu(variant) || (variant.battery_wh ?? 0) >= 70;
    case "upgradable":
      return variant.ram_upgradable === true || (variant.storage_slots ?? 0) >= 2;
    case "cheaper":
      return true;
  }
}

export function scoreVariant(
  row: VariantOffer,
  softPreferences: readonly SoftPreference[],
  maxBudgetVnd: number,
): number {
  const variant = row.variant;
  let score = 0;
  for (const preference of softPreferences) {
    if (softPreferenceSatisfied(variant, preference)) score += 3;
  }
  if ((variant.ram_gb ?? 0) >= 16) score += 2;
  if ((colorGamutPct(variant) ?? 0) >= 95) score += 2;
  if ((variant.weight_kg ?? 99) <= 1.6) score += 1;
  if ((variant.battery_wh ?? 0) >= 60) score += 1;
  if (hasDiscreteGpu(variant)) score += 1;
  const total = row.offer.total_known_price_vnd;
  if (total != null && maxBudgetVnd > 0) {
    score += Math.max(0, 2 - (total / maxBudgetVnd) * 2);
  }
  return Math.round(score * 100) / 100;
}

export function taskLabel(task: MandatoryTask): string {
  const labels: Record<MandatoryTask, string> = {
    office: "văn phòng",
    student: "học tập",
    coding: "lập trình",
    graphic_2d: "đồ họa 2D",
    graphic_3d: "đồ họa 3D",
    video_editing: "dựng video",
    gaming: "chơi game",
    portability: "mang đi nhiều",
    battery_life: "pin lâu",
    local_ai: "AI cục bộ",
  };
  return labels[task];
}

export function toVariantSummary(row: VariantOffer): VariantSummary {
  const variant = row.variant;
  const offer = row.offer;
  return {
    variant_id: variant.id,
    sku_code: variant.sku_code,
    model_id: variant.model_id,
    title: `${variant.brand} ${variant.model_name}`.trim(),
    brand: variant.brand,
    category: variant.category,
    cpu: variant.cpu,
    gpu: variant.gpu,
    ram_gb: variant.ram_gb,
    ram_type: variant.ram_type,
    ram_upgradable: variant.ram_upgradable,
    storage_gb: variant.storage_gb,
    storage_slots: variant.storage_slots,
    display_size: variant.display_size,
    display_res: variant.display_res,
    display_panel: variant.display_panel,
    color_gamut: variant.color_gamut,
    refresh_rate: variant.refresh_rate,
    battery_wh: variant.battery_wh,
    weight_kg: variant.weight_kg,
    os: variant.os,
    listed_price_vnd: offer.listed_price_vnd,
    mandatory_fees_vnd: offer.mandatory_fees_vnd,
    total_known_price_vnd: offer.total_known_price_vnd ?? offer.listed_price_vnd,
    conditional_price_vnd: offer.conditional_price_vnd,
    promo_conditions: offer.promo_conditions,
    stock_status: offer.stock_status,
    product_condition: offer.product_condition,
    store_id: row.store.id,
    store_name: row.store.name,
    store_verified: row.store.is_verified,
    source_url: offer.source_url,
    checked_at: offer.checked_at,
    expires_at: offer.expires_at,
  };
}

export function citationFromOffer(row: VariantOffer): SourceCitation {
  return {
    source_name: row.store.name,
    source_url: row.offer.source_url,
    measured_at: row.offer.checked_at,
  };
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle]!;
  return Math.round((sorted[middle - 1]! + sorted[middle]!) / 2);
}

export function priceValues(points: readonly PriceHistoryPoint[]): number[] {
  return points.map((point) => point.price_vnd).filter((value) => Number.isFinite(value));
}

export function formatVnd(value: number | null): string {
  if (value == null) return "chưa rõ";
  return `${Math.round(value).toLocaleString("vi-VN")}₫`;
}

function check(condition: boolean, reason: string): { ok: boolean; reason: string } {
  return condition ? { ok: true, reason: "" } : { ok: false, reason };
}
