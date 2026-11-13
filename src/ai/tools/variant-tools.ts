import { z } from "zod";

import type { VariantSummary } from "../schemas/catalog.js";
import { productCategorySchema, variantSummarySchema } from "../schemas/catalog.js";
import { mandatoryTaskSchema, softPreferenceSchema } from "../schemas/profile.js";
import type { CatalogRepository, VariantOffer } from "../types/db.types.js";
import {
  formatVnd,
  scoreVariant,
  taskCapability,
  taskLabel,
  toVariantSummary,
} from "./helpers.js";

export const queryVariantsInputSchema = z
  .object({
    mandatory_tasks: z.array(mandatoryTaskSchema).max(10).default([]),
    max_budget_vnd: z.number().int().positive(),
    category: productCategorySchema.default("laptop"),
    soft_preferences: z.array(softPreferenceSchema).max(2).default([]),
  })
  .strict();

export type QueryVariantsInput = z.infer<typeof queryVariantsInputSchema>;

export const excludedVariantSchema = z
  .object({
    variant_id: z.string(),
    title: z.string(),
    reasons: z.array(z.string()),
  })
  .strict();

export const queryVariantsOutputSchema = z
  .object({
    variants: z.array(variantSummarySchema).max(10),
    excluded: z.array(excludedVariantSchema).max(10),
  })
  .strict();

export type QueryVariantsOutput = z.infer<typeof queryVariantsOutputSchema>;

export interface ToolDeps {
  catalog: CatalogRepository;
}

/**
 * Tool 1: hard budget + mandatory capability filter, then soft ranking.
 *
 * `total_known_price_vnd` is mandatory. A listing whose mandatory fees are
 * unknown never qualifies for a ceiling because its total is not known.
 */
export async function queryVariantsByConstraints(
  rawInput: QueryVariantsInput,
  deps: ToolDeps,
): Promise<QueryVariantsOutput> {
  const input = queryVariantsInputSchema.parse(rawInput);
  const rows = await deps.catalog.queryVariants({
    max_budget_vnd: input.max_budget_vnd,
    category: input.category,
    limit: 100,
  });

  const eligible: { row: VariantOffer; score: number }[] = [];
  const excluded: { variant_id: string; title: string; reasons: string[] }[] = [];

  for (const row of dedupeRows(rows)) {
    const reasons: string[] = [];
    const total = row.offer.total_known_price_vnd;
    if (total == null) reasons.push("chưa rõ tổng giá do thiếu phí bắt buộc");
    else if (total > input.max_budget_vnd) reasons.push(`tổng ${formatVnd(total)} vượt ngân sách`);
    if (row.offer.stock_status === "out_of_stock" || row.offer.stock_status === "preorder") {
      reasons.push(`tình trạng ${row.offer.stock_status}`);
    }
    for (const task of input.mandatory_tasks) {
      const capability = taskCapability(row.variant, task);
      if (!capability.ok) reasons.push(`${taskLabel(task)}: ${capability.reason}`);
    }
    if (row.variant.status !== "published") reasons.push("biến thể chưa published");

    if (reasons.length > 0) {
      excluded.push({
        variant_id: row.variant.id,
        title: `${row.variant.brand} ${row.variant.model_name}`.trim(),
        reasons,
      });
      continue;
    }
    eligible.push({
      row,
      score: scoreVariant(row, input.soft_preferences, input.max_budget_vnd),
    });
  }

  eligible.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return (left.row.offer.total_known_price_vnd ?? Infinity) - (right.row.offer.total_known_price_vnd ?? Infinity);
  });

  return queryVariantsOutputSchema.parse({
    variants: eligible.slice(0, 10).map((entry) => toVariantSummary(entry.row)),
    excluded: excluded.slice(0, 10),
  });
}

export const comparisonMatrixInputSchema = z
  .object({
    variant_ids: z.array(z.string().min(1)).min(2).max(3),
  })
  .strict();

export const comparisonMatrixOutputSchema = z
  .object({
    variants: z.array(variantSummarySchema),
    missing_variant_ids: z.array(z.string()),
    differences: z.array(
      z
        .object({
          field: z.string(),
          label: z.string(),
          values: z.record(z.string()),
        })
        .strict(),
    ),
    component_warnings: z.array(z.string()),
  })
  .strict();

export type ComparisonMatrixOutput = z.infer<typeof comparisonMatrixOutputSchema>;

/**
 * Tool 3: deterministic matrix for 2-3 exact SKUs. It never mixes a shared
 * model name with a different RAM/GPU/panel configuration.
 */
export async function getVariantsComparisonMatrix(
  rawInput: z.infer<typeof comparisonMatrixInputSchema>,
  deps: ToolDeps,
): Promise<ComparisonMatrixOutput> {
  const input = comparisonMatrixInputSchema.parse(rawInput);
  const uniqueIds = [...new Set(input.variant_ids)];
  const rows = await deps.catalog.getVariantsByIds(uniqueIds);
  const byId = new Map(rows.map((row) => [row.variant.id, row]));
  const ordered = uniqueIds.map((id) => byId.get(id)).filter((row): row is VariantOffer => Boolean(row));
  const missing = uniqueIds.filter((id) => !byId.has(id));
  const summaries = ordered.map((row) => toVariantSummary(row));

  return comparisonMatrixOutputSchema.parse({
    variants: summaries,
    missing_variant_ids: missing,
    differences: buildDifferences(summaries),
    component_warnings: buildComponentWarnings(ordered),
  });
}

function dedupeRows(rows: readonly VariantOffer[]): VariantOffer[] {
  const byVariant = new Map<string, VariantOffer>();
  for (const row of rows) {
    const current = byVariant.get(row.variant.id);
    if (!current) {
      byVariant.set(row.variant.id, row);
      continue;
    }
    const currentTotal = current.offer.total_known_price_vnd ?? Infinity;
    const nextTotal = row.offer.total_known_price_vnd ?? Infinity;
    if (nextTotal < currentTotal) byVariant.set(row.variant.id, row);
  }
  return [...byVariant.values()];
}

function buildDifferences(variants: readonly VariantSummary[]): ComparisonMatrixOutput["differences"] {
  if (variants.length < 2) return [];
  const fields: { field: string; label: string; value: (variant: VariantSummary) => string }[] = [
    { field: "total_known_price_vnd", label: "Tổng giá đã biết", value: (variant) => formatVnd(variant.total_known_price_vnd) },
    { field: "cpu", label: "CPU", value: (variant) => variant.cpu ?? "chưa rõ" },
    { field: "gpu", label: "GPU", value: (variant) => variant.gpu ?? "chưa rõ" },
    {
      field: "ram",
      label: "RAM",
      value: (variant) =>
        `${variant.ram_gb ?? "?"}GB ${variant.ram_type ?? ""} ${
          variant.ram_upgradable === true ? "(nâng cấp được)" : variant.ram_upgradable === false ? "(hàn chết)" : ""
        }`.trim(),
    },
    {
      field: "storage",
      label: "Lưu trữ",
      value: (variant) =>
        `${variant.storage_gb ?? "?"}GB${variant.storage_slots != null ? ` / ${variant.storage_slots} khe` : ""}`,
    },
    {
      field: "display",
      label: "Màn hình",
      value: (variant) =>
        [
          variant.display_size != null ? `${variant.display_size}"` : null,
          variant.display_res,
          variant.display_panel,
          variant.refresh_rate != null ? `${variant.refresh_rate}Hz` : null,
          variant.color_gamut,
        ]
          .filter(Boolean)
          .join(" · ") || "chưa rõ",
    },
    { field: "battery_wh", label: "Pin", value: (variant) => (variant.battery_wh != null ? `${variant.battery_wh}Wh` : "chưa rõ") },
    { field: "weight_kg", label: "Cân nặng", value: (variant) => (variant.weight_kg != null ? `${variant.weight_kg}kg` : "chưa rõ") },
    { field: "os", label: "Hệ điều hành", value: (variant) => variant.os ?? "chưa rõ" },
    {
      field: "store",
      label: "Cửa hàng / kiểm tra",
      value: (variant) => `${variant.store_name} · ${variant.checked_at}`,
    },
  ];

  const differences: ComparisonMatrixOutput["differences"] = [];
  for (const field of fields) {
    const values: Record<string, string> = {};
    for (const variant of variants) values[variant.variant_id] = field.value(variant);
    if (new Set(Object.values(values)).size > 1) {
      differences.push({ field: field.field, label: field.label, values });
    }
  }
  return differences;
}

function buildComponentWarnings(rows: readonly VariantOffer[]): string[] {
  const warnings: string[] = [];
  const byModel = new Map<string, VariantOffer[]>();
  for (const row of rows) {
    const list = byModel.get(row.variant.model_id) ?? [];
    list.push(row);
    byModel.set(row.variant.model_id, list);
  }
  for (const list of byModel.values()) {
    if (list.length < 2) continue;
    const first = list[0]!.variant;
    const title = `${first.brand} ${first.model_name}`.trim();
    const ram = new Set(list.map((row) => row.variant.ram_gb));
    const gpu = new Set(list.map((row) => row.variant.gpu));
    const display = new Set(list.map((row) => `${row.variant.display_panel}|${row.variant.display_res}`));
    const skus = new Set(list.map((row) => row.variant.sku_code));
    const parts: string[] = [];
    if (ram.size > 1) parts.push("RAM khác nhau");
    if (gpu.size > 1) parts.push("GPU khác nhau");
    if (display.size > 1) parts.push("màn hình khác nhau");
    if (skus.size > 1) parts.push("mã SKU khác nhau");
    if (parts.length > 0) {
      warnings.push(`${title}: ${parts.join(", ")}. Không dùng chung giá hoặc kết luận đo kiểm.`);
    }
  }
  return warnings;
}
