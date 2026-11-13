import { z } from "zod";

import type {
  Offer,
  ProductVariant,
  RetrievedEvidence,
  Store,
  VariantOffer,
  VerifiedEvidence,
} from "../types/db.types.js";

/**
 * Runtime schemas for catalog rows the AI layer is allowed to read.
 * Keeping them next to the interfaces makes the backend contract explicit.
 */

export const productCategorySchema = z.enum(["laptop", "phone"]);
export const productVariantSchema: z.ZodType<ProductVariant> = z
  .object({
    id: z.string().min(1),
    model_id: z.string().min(1),
    category: z.enum(["laptop", "phone"]),
    sku_code: z.string(),
    region: z.string(),
    cpu: z.string().nullable(),
    gpu: z.string().nullable(),
    ram_gb: z.number().int().nonnegative().nullable(),
    ram_type: z.string().nullable(),
    ram_upgradable: z.boolean().nullable(),
    storage_gb: z.number().int().nonnegative().nullable(),
    storage_slots: z.number().int().nonnegative().nullable(),
    display_size: z.number().nonnegative().nullable(),
    display_res: z.string().nullable(),
    display_panel: z.string().nullable(),
    color_gamut: z.string().nullable(),
    refresh_rate: z.number().nonnegative().nullable(),
    battery_wh: z.number().nonnegative().nullable(),
    weight_kg: z.number().nonnegative().nullable(),
    os: z.string().nullable(),
    specs_json: z.record(z.unknown()),
    status: z.enum(["draft", "published"]),
    merged_into_id: z.string().nullable(),
    model_name: z.string(),
    brand: z.string(),
  })
  .strict();

export const storeSchema: z.ZodType<Store> = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    website: z.string(),
    shipping_regions: z.array(z.string()),
    warranty_policy: z.string().nullable(),
    return_policy: z.string().nullable(),
    is_verified: z.boolean(),
  })
  .strict();

export const offerSchema: z.ZodType<Offer> = z
  .object({
    id: z.string().min(1),
    variant_id: z.string().min(1),
    store_id: z.string().min(1),
    listed_price_vnd: z.number().int().nonnegative(),
    mandatory_fees_vnd: z.number().int().nonnegative().nullable(),
    total_known_price_vnd: z.number().int().nonnegative().nullable(),
    conditional_price_vnd: z.number().int().nonnegative().nullable(),
    promo_conditions: z.string().nullable(),
    stock_status: z.enum(["in_stock", "low_stock", "out_of_stock", "preorder", "unknown"]),
    product_condition: z.enum(["new", "open_box", "refurbished", "used"]),
    source_url: z.string(),
    is_sponsored: z.boolean(),
    checked_at: z.string(),
    expires_at: z.string().nullable(),
    status: z.enum(["pending", "active", "expired", "hidden"]),
  })
  .strict();

export const variantOfferSchema: z.ZodType<VariantOffer> = z
  .object({
    variant: productVariantSchema,
    offer: offerSchema,
    store: storeSchema,
  })
  .strict();

const verifiedEvidenceObject = z
  .object({
    id: z.string().min(1),
    model_id: z.string(),
    variant_id: z.string(),
    sku_code: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    evidence_type: z.enum(["benchmark", "editorial_review", "spec_sheet"]),
    summary_performance: z.string().nullable(),
    summary_thermals_noise: z.string().nullable(),
    summary_battery: z.string().nullable(),
    summary_cons_quirks: z.string().nullable(),
    raw_excerpt: z.string(),
    measured_at: z.string(),
    status: z.literal("approved"),
  })
  .strict();

export const verifiedEvidenceSchema: z.ZodType<VerifiedEvidence> = verifiedEvidenceObject;

export const retrievedEvidenceSchema: z.ZodType<RetrievedEvidence> = verifiedEvidenceObject
  .extend({
    claim: z.string(),
    score: z.number().nullable(),
  })
  .strict();

export const sourceCitationSchema = z
  .object({
    source_name: z.string().min(1),
    source_url: z.string().min(1),
    measured_at: z.string().min(1),
  })
  .strict();

export const variantSummarySchema = z
  .object({
    variant_id: z.string(),
    sku_code: z.string(),
    model_id: z.string(),
    title: z.string(),
    brand: z.string(),
    category: productCategorySchema,
    cpu: z.string().nullable(),
    gpu: z.string().nullable(),
    ram_gb: z.number().int().nullable(),
    ram_type: z.string().nullable(),
    ram_upgradable: z.boolean().nullable(),
    storage_gb: z.number().int().nullable(),
    storage_slots: z.number().int().nullable(),
    display_size: z.number().nullable(),
    display_res: z.string().nullable(),
    display_panel: z.string().nullable(),
    color_gamut: z.string().nullable(),
    refresh_rate: z.number().nullable(),
    battery_wh: z.number().nullable(),
    weight_kg: z.number().nullable(),
    os: z.string().nullable(),
    listed_price_vnd: z.number().int(),
    mandatory_fees_vnd: z.number().int().nullable(),
    total_known_price_vnd: z.number().int(),
    conditional_price_vnd: z.number().int().nullable(),
    promo_conditions: z.string().nullable(),
    stock_status: z.string(),
    product_condition: z.string(),
    store_id: z.string(),
    store_name: z.string(),
    store_verified: z.boolean(),
    source_url: z.string(),
    checked_at: z.string(),
    expires_at: z.string().nullable(),
  })
  .strict();

export type VariantSummary = z.infer<typeof variantSummarySchema>;
