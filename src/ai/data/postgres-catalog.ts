import type {
  CatalogQuery,
  CatalogRepository,
  PriceHistoryPoint,
  ProductVariant,
  VariantOffer,
  VerifiedEvidence,
} from "../types/db.types.js";
import { variantOfferSchema } from "../schemas/catalog.js";

export interface SqlQueryResult<Row extends Record<string, unknown> = Record<string, unknown>> {
  rows: Row[];
}

/** Minimal surface of a `pg` Pool/Client, so the backend owns the dependency. */
export interface SqlClient {
  query<Row extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<SqlQueryResult<Row>>;
}

const OFFER_LATERAL = `
  JOIN LATERAL (
    SELECT o.*
    FROM offers o
    WHERE o.variant_id = v.id
      AND o.status = 'active'
      AND o.stock_status IN ('in_stock', 'low_stock')
      AND (o.expires_at IS NULL OR o.expires_at > now())
      AND o.total_known_price_vnd IS NOT NULL
      __BUDGET__
    ORDER BY o.total_known_price_vnd ASC, o.is_sponsored ASC
    LIMIT 1
  ) o ON true
  JOIN stores s ON s.id = o.store_id
`;

const VARIANT_COLUMNS = `
  v.id, v.model_id, v.sku_code, v.region, v.cpu, v.gpu, v.ram_gb, v.ram_type,
  v.ram_upgradable, v.storage_gb, v.storage_slots, v.display_size, v.display_res,
  v.display_panel, v.color_gamut, v.refresh_rate, v.battery_wh, v.weight_kg, v.os,
  v.specs_json, v.status, v.merged_into_id,
  m.name AS model_name, m.brand, m.category,
  o.id AS offer_id, o.store_id, o.listed_price_vnd, o.mandatory_fees_vnd,
  o.total_known_price_vnd, o.conditional_price_vnd, o.promo_conditions,
  o.stock_status, o.product_condition, o.source_url, o.is_sponsored, o.checked_at,
  o.expires_at, o.status AS offer_status,
  s.name AS store_name, s.website, s.shipping_regions, s.warranty_policy,
  s.return_policy, s.is_verified
`;

/**
 * PostgreSQL read adapter for the contract in `CatalogRepository`.
 *
 * The AI layer only reads published catalog rows. It never inserts, updates or
 * publishes a staging/evidence row; those mutations stay in the admin backend.
 */
export function createPostgresCatalogRepository(db: SqlClient): CatalogRepository {
  return {
    async queryVariants(input: CatalogQuery): Promise<VariantOffer[]> {
      const limit = Math.max(1, Math.min(input.limit ?? 20, 100));
      const params: unknown[] = [input.max_budget_vnd];
      let categoryClause = "";
      if (input.category) {
        params.push(input.category);
        categoryClause = "AND m.category = $2";
      }
      params.push(limit);
      const limitParam = params.length;
      const sql = `
        SELECT ${VARIANT_COLUMNS}
        FROM product_variants v
        JOIN product_models m ON m.id = v.model_id
        ${OFFER_LATERAL.replace("__BUDGET__", "AND o.total_known_price_vnd <= $1")}
        WHERE v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
          ${categoryClause}
        ORDER BY o.total_known_price_vnd ASC
        LIMIT $${limitParam}
      `;
      const result = await db.query(sql, params);
      return result.rows.map((row) => mapVariantOffer(row));
    },

    async getVariantsByIds(variantIds: readonly string[]): Promise<VariantOffer[]> {
      const ids = [...new Set(variantIds.filter(Boolean))];
      if (ids.length === 0) return [];
      const sql = `
        SELECT ${VARIANT_COLUMNS}
        FROM product_variants v
        JOIN product_models m ON m.id = v.model_id
        ${OFFER_LATERAL.replace("__BUDGET__", "")}
        WHERE v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
          AND v.id = ANY($1::text[])
        ORDER BY o.total_known_price_vnd ASC
      `;
      const result = await db.query(sql, [ids]);
      return result.rows.map((row) => mapVariantOffer(row));
    },

    async listResolutionVariants(): Promise<ProductVariant[]> {
      const result = await db.query(
        `
        SELECT v.id, v.model_id, v.sku_code, v.region, v.cpu, v.gpu, v.ram_gb,
               v.ram_type, v.ram_upgradable, v.storage_gb, v.storage_slots,
               v.display_size, v.display_res, v.display_panel, v.color_gamut,
               v.refresh_rate, v.battery_wh, v.weight_kg, v.os, v.specs_json,
               v.status, v.merged_into_id, m.name AS model_name, m.brand, m.category
        FROM product_variants v
        JOIN product_models m ON m.id = v.model_id
        WHERE v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
        ORDER BY m.brand, m.name, v.sku_code
        `,
      );
      return result.rows.map((row) => mapVariant(row));
    },

    async getPriceHistory(variantIds: readonly string[], since?: string): Promise<PriceHistoryPoint[]> {
      const ids = [...new Set(variantIds.filter(Boolean))];
      if (ids.length === 0) return [];
      const result = await db.query(
        `
        SELECT ph.id, ph.offer_id, ph.variant_id, ph.store_id, ph.price_vnd, ph.recorded_at
        FROM price_histories ph
        JOIN product_variants v ON v.id = ph.variant_id
        JOIN product_models m ON m.id = v.model_id
        WHERE ph.variant_id = ANY($1::text[])
          AND v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
          AND ph.recorded_at >= COALESCE($2::timestamptz, now() - interval '180 days')
        ORDER BY ph.recorded_at ASC
        `,
        [ids, since ?? null],
      );
      return result.rows.map((row) => ({
        id: row.id == null ? undefined : String(row.id),
        offer_id: row.offer_id == null ? null : String(row.offer_id),
        variant_id: String(row.variant_id),
        store_id: row.store_id == null ? null : String(row.store_id),
        price_vnd: numberValue(row.price_vnd) ?? 0,
        recorded_at: isoValue(row.recorded_at),
      }));
    },

    async findApprovedEvidences(
      variantIds: readonly string[],
      limit = 12,
    ): Promise<VerifiedEvidence[]> {
      const ids = [...new Set(variantIds.filter(Boolean))];
      if (ids.length === 0) return [];
      const result = await db.query(
        `
        SELECT e.id, e.model_id, e.variant_id, v.sku_code, e.source_name, e.source_url,
               e.evidence_type, e.summary_performance, e.summary_thermals_noise,
               e.summary_battery, e.summary_cons_quirks, e.raw_excerpt, e.measured_at
        FROM evidences_and_reviews e
        JOIN product_variants v ON v.id = e.variant_id
        JOIN product_models m ON m.id = v.model_id
        WHERE e.status = 'approved'
          AND e.variant_id = ANY($1::text[])
          AND e.model_id = v.model_id
          AND v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
        ORDER BY e.measured_at DESC
        LIMIT $2
        `,
        [ids, Math.max(1, Math.min(limit, 50))],
      );
      return result.rows.map((row) => ({
        id: String(row.id),
        model_id: String(row.model_id),
        variant_id: String(row.variant_id),
        sku_code: String(row.sku_code ?? ""),
        source_name: String(row.source_name ?? ""),
        source_url: String(row.source_url ?? ""),
        evidence_type: evidenceType(row.evidence_type),
        summary_performance: nullableString(row.summary_performance),
        summary_thermals_noise: nullableString(row.summary_thermals_noise),
        summary_battery: nullableString(row.summary_battery),
        summary_cons_quirks: nullableString(row.summary_cons_quirks),
        raw_excerpt: String(row.raw_excerpt ?? ""),
        measured_at: isoValue(row.measured_at),
        status: "approved",
      }));
    },

    async findSimilarOffers(variantId: string): Promise<VariantOffer[]> {
      const sql = `
        SELECT ${VARIANT_COLUMNS}
        FROM product_variants v
        JOIN product_models m ON m.id = v.model_id
        JOIN product_variants target ON target.id = $1
        ${OFFER_LATERAL.replace("__BUDGET__", "")}
        WHERE v.status = 'published' AND m.status = 'published'
          AND v.merged_into_id IS NULL
          AND v.id <> target.id
          AND v.model_id = target.model_id
        ORDER BY o.total_known_price_vnd ASC
        LIMIT 20
      `;
      const result = await db.query(sql, [variantId]);
      return result.rows.map((row) => mapVariantOffer(row));
    },
  };
}

function mapVariantOffer(row: Record<string, unknown>): VariantOffer {
  return variantOfferSchema.parse({
    variant: mapVariant(row),
    offer: {
      id: String(row.offer_id),
      variant_id: String(row.id),
      store_id: String(row.store_id),
      listed_price_vnd: numberValue(row.listed_price_vnd) ?? 0,
      mandatory_fees_vnd: numberValue(row.mandatory_fees_vnd),
      total_known_price_vnd: numberValue(row.total_known_price_vnd),
      conditional_price_vnd: numberValue(row.conditional_price_vnd),
      promo_conditions: nullableString(row.promo_conditions),
      stock_status: stockStatus(row.stock_status),
      product_condition: productCondition(row.product_condition),
      source_url: String(row.source_url ?? ""),
      is_sponsored: Boolean(row.is_sponsored),
      checked_at: isoValue(row.checked_at),
      expires_at: row.expires_at == null ? null : isoValue(row.expires_at),
      status: offerStatus(row.offer_status),
    },
    store: {
      id: String(row.store_id),
      name: String(row.store_name ?? ""),
      website: String(row.website ?? ""),
      shipping_regions: stringArray(row.shipping_regions),
      warranty_policy: nullableString(row.warranty_policy),
      return_policy: nullableString(row.return_policy),
      is_verified: Boolean(row.is_verified),
    },
  });
}

function mapVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: String(row.id),
    model_id: String(row.model_id),
    category: row.category === "phone" ? "phone" : "laptop",
    sku_code: String(row.sku_code ?? ""),
    region: String(row.region ?? "VN"),
    cpu: nullableString(row.cpu),
    gpu: nullableString(row.gpu),
    ram_gb: numberValue(row.ram_gb),
    ram_type: nullableString(row.ram_type),
    ram_upgradable: row.ram_upgradable == null ? null : Boolean(row.ram_upgradable),
    storage_gb: numberValue(row.storage_gb),
    storage_slots: numberValue(row.storage_slots),
    display_size: numberValue(row.display_size),
    display_res: nullableString(row.display_res),
    display_panel: nullableString(row.display_panel),
    color_gamut: nullableString(row.color_gamut),
    refresh_rate: numberValue(row.refresh_rate),
    battery_wh: numberValue(row.battery_wh),
    weight_kg: numberValue(row.weight_kg),
    os: nullableString(row.os),
    specs_json: jsonObject(row.specs_json),
    status: row.status === "published" ? "published" : "draft",
    merged_into_id: nullableString(row.merged_into_id),
    model_name: String(row.model_name ?? ""),
    brand: String(row.brand ?? ""),
  };
}

function numberValue(value: unknown): number | null {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function isoValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (value == null) return "";
  return String(value);
}

function jsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function evidenceType(value: unknown): VerifiedEvidence["evidence_type"] {
  return value === "benchmark" || value === "spec_sheet" ? value : "editorial_review";
}

function stockStatus(value: unknown): VariantOffer["offer"]["stock_status"] {
  return value === "out_of_stock" ||
    value === "low_stock" ||
    value === "preorder" ||
    value === "unknown"
    ? value
    : "in_stock";
}

function productCondition(value: unknown): VariantOffer["offer"]["product_condition"] {
  return value === "open_box" || value === "refurbished" || value === "used" ? value : "new";
}

function offerStatus(value: unknown): VariantOffer["offer"]["status"] {
  return value === "pending" || value === "expired" || value === "hidden" ? value : "active";
}
