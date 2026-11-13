import { z } from "zod";

import { variantSummarySchema } from "./catalog.js";
import { userRequirementProfileSchema } from "./profile.js";

export const quoteInputSchema = z
  .object({
    raw_url_or_text: z.string().min(1),
    user_profile: userRequirementProfileSchema.nullable().optional(),
  })
  .strict();

export type QuoteInput = z.infer<typeof quoteInputSchema>;

export const extractedQuoteSchema = z
  .object({
    store_name: z.string().nullable(),
    product_name: z.string().nullable(),
    cpu: z.string().nullable(),
    gpu: z.string().nullable(),
    ram_gb: z.number().int().positive().nullable(),
    storage_gb: z.number().int().positive().nullable(),
    display_size: z.number().positive().nullable(),
    display_res: z.string().nullable(),
    listed_price_vnd: z.number().int().positive().nullable(),
    mandatory_fees_vnd: z.number().int().nonnegative().nullable(),
    promo_conditions: z.array(z.string()),
    product_condition: z.enum(["new", "open_box", "refurbished", "used"]).nullable(),
    raw_notes: z.string().nullable(),
  })
  .strict();

export type ExtractedQuote = z.infer<typeof extractedQuoteSchema>;

export const quoteMatchSchema = z
  .object({
    variant: variantSummarySchema,
    confidence: z.number().min(0).max(1),
    matched_by: z.array(z.string()),
  })
  .strict();

export const equivalentDealSchema = z
  .object({
    variant_id: z.string(),
    title: z.string(),
    sku_code: z.string(),
    total_known_price_vnd: z.number().int(),
    store_name: z.string(),
    source_url: z.string(),
    checked_at: z.string(),
    price_delta_vnd: z.number().int(),
  })
  .strict();

export const quotePriceCheckSchema = z
  .object({
    effective_total_vnd: z.number().int().nullable(),
    median_history_vnd: z.number().int().nullable(),
    delta_pct: z.number().nullable(),
    verdict: z.enum(["good_deal", "fair", "above_market", "insufficient_data", "incomplete_total"]),
    note: z.string(),
  })
  .strict();

export const quoteBudgetFitSchema = z
  .object({
    max_budget_vnd: z.number().int().nullable(),
    within_budget: z.boolean().nullable(),
    over_by_vnd: z.number().int().nullable(),
    note: z.string().nullable(),
  })
  .strict();

export const quoteResultSchema = z
  .object({
    extracted: extractedQuoteSchema,
    matched_variant: quoteMatchSchema.nullable(),
    price_check: quotePriceCheckSchema,
    budget_fit: quoteBudgetFitSchema,
    equivalent_deals: z.array(equivalentDealSchema),
    missing_fields: z.array(z.string()),
    seller_verification_questions: z.array(z.string()),
    warnings: z.array(z.string()),
    requires_user_confirmation: z.boolean(),
  })
  .strict();

export type QuoteResult = z.infer<typeof quoteResultSchema>;
