import { z } from "zod";

import type { CatalogRepository } from "../types/db.types.js";
import { formatVnd, median, priceValues } from "./helpers.js";

export const dealHistoryInputSchema = z
  .object({
    variant_id: z.string().min(1),
  })
  .strict();

export type DealHistoryInput = z.infer<typeof dealHistoryInputSchema>;

export const cheaperEquivalentSchema = z
  .object({
    variant_id: z.string(),
    sku_code: z.string(),
    title: z.string(),
    total_known_price_vnd: z.number().int(),
    delta_vnd: z.number().int(),
    store_name: z.string(),
    source_url: z.string(),
    checked_at: z.string(),
  })
  .strict();

export const dealHistoryOutputSchema = z
  .object({
    variant_id: z.string(),
    sku_code: z.string(),
    title: z.string(),
    current_total_known_price_vnd: z.number().int().nullable(),
    stock_status: z.string().nullable(),
    checked_at: z.string().nullable(),
    history_points: z.number().int(),
    latest_history_vnd: z.number().int().nullable(),
    median_history_vnd: z.number().int().nullable(),
    min_history_vnd: z.number().int().nullable(),
    max_history_vnd: z.number().int().nullable(),
    change_pct: z.number().nullable(),
    lowest_ever: z.boolean(),
    cheaper_equivalents: z.array(cheaperEquivalentSchema),
    note: z.string(),
  })
  .strict();

export type DealHistoryOutput = z.infer<typeof dealHistoryOutputSchema>;

/** Tool 4: price history plus equivalent configurations that are cheaper now. */
export async function findSimilarDealsAndPriceHistory(
  rawInput: DealHistoryInput,
  deps: { catalog: CatalogRepository },
): Promise<DealHistoryOutput> {
  const input = dealHistoryInputSchema.parse(rawInput);
  const rows = await deps.catalog.getVariantsByIds([input.variant_id]);
  const current = rows[0] ?? null;
  const catalogVariant = current?.variant ?? (await deps.catalog.listResolutionVariants()).find(
    (variant) => variant.id === input.variant_id,
  );

  if (!catalogVariant) {
    return dealHistoryOutputSchema.parse({
      variant_id: input.variant_id,
      sku_code: "",
      title: "",
      current_total_known_price_vnd: null,
      stock_status: null,
      checked_at: null,
      history_points: 0,
      latest_history_vnd: null,
      median_history_vnd: null,
      min_history_vnd: null,
      max_history_vnd: null,
      change_pct: null,
      lowest_ever: false,
      cheaper_equivalents: [],
      note: "Không tìm thấy biến thể đã published trong danh mục.",
    });
  }

  const history = await deps.catalog.getPriceHistory([input.variant_id]);
  // The repository contract does not promise row order; sort chronologically
  // before picking the latest point and the baseline window.
  const orderedHistory = [...history].sort((left, right) =>
    String(left.recorded_at ?? "").localeCompare(String(right.recorded_at ?? "")),
  );
  const values = priceValues(orderedHistory);
  const latest = orderedHistory[orderedHistory.length - 1] ?? null;
  const baselineValues = values.length >= 2 ? values.slice(0, -1) : [];
  const baseline = median(baselineValues);
  const currentTotal = current?.offer.total_known_price_vnd ?? null;
  const changePct =
    latest?.price_vnd != null && baseline != null && baseline > 0
      ? round1(((latest.price_vnd - baseline) / baseline) * 100)
      : null;

  const similar = await deps.catalog.findSimilarOffers(input.variant_id);
  const currentReference = currentTotal ?? latest?.price_vnd ?? null;
  const cheaper = similar
    .filter((row) => row.offer.total_known_price_vnd != null)
    .filter((row) => row.offer.stock_status === "in_stock" || row.offer.stock_status === "low_stock")
    .filter((row) => currentReference == null || (row.offer.total_known_price_vnd ?? Infinity) < currentReference)
    .map((row) => ({
      variant_id: row.variant.id,
      sku_code: row.variant.sku_code,
      title: `${row.variant.brand} ${row.variant.model_name}`.trim(),
      total_known_price_vnd: row.offer.total_known_price_vnd!,
      delta_vnd: (row.offer.total_known_price_vnd ?? 0) - (currentReference ?? 0),
      store_name: row.store.name,
      source_url: row.offer.source_url,
      checked_at: row.offer.checked_at,
    }))
    .sort((left, right) => left.total_known_price_vnd - right.total_known_price_vnd)
    .slice(0, 5);

  const min = values.length > 0 ? Math.min(...values) : null;
  const max = values.length > 0 ? Math.max(...values) : null;
  const latestValue = latest?.price_vnd ?? null;
  const note =
    values.length === 0
      ? "Chưa có lịch sử giá; không kết luận đắt/rẻ."
      : cheaper.length > 0
        ? `Có ${cheaper.length} cấu hình tương đương rẻ hơn${currentReference != null ? ` ít nhất ${formatVnd(Math.abs(cheaper[0]!.delta_vnd))}` : ""}.`
        : "Không thấy cấu hình tương đương rẻ hơn trong danh mục hiện tại.";

  return dealHistoryOutputSchema.parse({
    variant_id: catalogVariant.id,
    sku_code: catalogVariant.sku_code,
    title: `${catalogVariant.brand} ${catalogVariant.model_name}`.trim(),
    current_total_known_price_vnd: currentTotal,
    stock_status: current?.offer.stock_status ?? null,
    checked_at: current?.offer.checked_at ?? null,
    history_points: values.length,
    latest_history_vnd: latestValue,
    median_history_vnd: median(values),
    min_history_vnd: min,
    max_history_vnd: max,
    change_pct: changePct,
    lowest_ever: latestValue != null && min != null && latestValue <= min,
    cheaper_equivalents: cheaper,
    note,
  });
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
