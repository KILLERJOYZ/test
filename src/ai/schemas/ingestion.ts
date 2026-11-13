import { z } from "zod";

import type { EvidenceDraft, StagingCrawledItem } from "../types/db.types.js";
import { productVariantSchema, sourceCitationSchema } from "./catalog.js";

const stagingItemSchema: z.ZodType<StagingCrawledItem> = z
  .object({
    id: z.string().optional(),
    source_id: z.string().optional(),
    raw_title: z.string(),
    raw_specs_json: z.record(z.unknown()),
    raw_price: z.number().int().nonnegative().nullable(),
    raw_url: z.string().nullable(),
    store_name: z.string().nullable().optional(),
    matched_variant_id: z.string().nullable().optional(),
    confidence_score: z.number().min(0).max(1).nullable().optional(),
    anomaly_flags: z
      .array(
        z
          .object({
            code: z.enum([
              "spec_mismatch",
              "price_anomaly",
              "missing_mandatory_fees",
              "ambiguous_variant",
              "blocked_auto_publish",
            ]),
            detail: z.string(),
          })
          .strict(),
      )
      .optional(),
    review_status: z.enum(["pending", "needs_review", "approved", "rejected"]).optional(),
  })
  .strict();

const evidenceDraftViewSchema: z.ZodType<EvidenceDraft> = z
  .object({
    variant_id: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    evidence_type: z.enum(["benchmark", "editorial_review", "spec_sheet"]),
    summary_performance: z.string().nullable(),
    summary_thermals_noise: z.string().nullable(),
    summary_battery: z.string().nullable(),
    summary_cons_quirks: z.string().nullable(),
    raw_excerpt: z.string(),
    measured_at: z.string(),
    config_warning: z.string().nullable(),
    status: z.literal("pending_review"),
    ai_blocked: z.boolean().optional(),
  })
  .strict();

export const reviewEvidenceInputSchema = z
  .object({
    raw_text: z.string().min(1),
    source_name: z.string().min(1),
    source_url: z.string().min(1),
    measured_at: z.string().min(1),
    candidate_variants: z.array(productVariantSchema).min(1).max(20),
    target_variant_id: z.string().nullable().optional(),
    evidence_id: z.string().nullable().optional(),
  })
  .strict();

export type ReviewEvidenceInput = z.infer<typeof reviewEvidenceInputSchema>;

export const reviewSectionSchema = z
  .object({
    summary: z.string().nullable(),
    quotes: z.array(z.string()),
  })
  .strict();

export const reviewSectionsSchema = z
  .object({
    performance: reviewSectionSchema,
    thermals_and_noise: reviewSectionSchema,
    battery_life: reviewSectionSchema,
    cons_and_quirks: reviewSectionSchema,
  })
  .strict();

export type ReviewSections = z.infer<typeof reviewSectionsSchema>;

export const reviewEvidenceResultSchema = z
  .object({
    variant_id: z.string(),
    sku_code: z.string(),
    model_id: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    measured_at: z.string(),
    version_mismatch_warning: z.boolean(),
    match_confidence: z.number().min(0).max(1),
    matched_by: z.array(z.string()),
    sections: reviewSectionsSchema,
    draft: evidenceDraftViewSchema,
    qdrant_chunks: z.array(
      z
        .object({
          section: z.enum(["performance", "thermals_and_noise", "battery_life", "cons_and_quirks"]),
          claim: z.string(),
          payload: z
            .object({
              evidence_id: z.string(),
              model_id: z.string(),
              variant_id: z.string(),
              sku_code: z.string(),
              source_url: z.string(),
              measured_at: z.string(),
              status: z.string(),
              claim: z.string(),
              source_label: z.string(),
              product_id: z.string(),
            })
            .strict(),
        })
        .strict(),
    ),
    status: z.literal("pending_review"),
  })
  .strict();

export type ReviewEvidenceResult = z.infer<typeof reviewEvidenceResultSchema>;

/** LLM extraction; quotes must be substrings of the source text. */
export const reviewExtractionSchema = z
  .object({
    performance: reviewSectionSchema,
    thermals_and_noise: reviewSectionSchema,
    battery_life: reviewSectionSchema,
    cons_and_quirks: reviewSectionSchema,
  })
  .strict();

export type ReviewExtraction = z.infer<typeof reviewExtractionSchema>;

export const crawlResolutionInputSchema = z
  .object({
    item: stagingItemSchema,
    requires_mandatory_fees: z.boolean().optional(),
  })
  .strict();

export type CrawlResolutionInput = z.infer<typeof crawlResolutionInputSchema>;

export const crawlAnomalyCodeSchema = z.enum([
  "SPEC_MISMATCH",
  "PRICE_OUTLIER",
  "AMBIGUOUS_VARIANT",
  "MISSING_MANDATORY_FEES",
  "BLOCKED_AUTO_PUBLISH",
]);

export const crawlResolutionResultSchema = z
  .object({
    matched_variant_id: z.string().nullable(),
    confidence_score: z.number().min(0).max(1),
    anomaly_flags: z.array(
      z
        .object({
          code: crawlAnomalyCodeSchema,
          detail: z.string(),
        })
        .strict(),
    ),
    review_status: z.enum(["pending", "needs_review"]),
    reasoning: z.string(),
    normalized_item: stagingItemSchema,
    candidates: z.array(
      z
        .object({
          variant_id: z.string(),
          sku_code: z.string(),
          title: z.string(),
          total_known_price_vnd: z.number().int().nullable(),
          citation: sourceCitationSchema.nullable(),
        })
        .strict(),
    ),
  })
  .strict();

export type CrawlResolutionResult = z.infer<typeof crawlResolutionResultSchema>;

/** LLM normalizes only fields it can see in the crawl text. */
export const crawlSpecExtractionSchema = z
  .object({
    sku_code: z.string().nullable(),
    cpu: z.string().nullable(),
    gpu: z.string().nullable(),
    ram_gb: z.number().int().positive().nullable(),
    display_size: z.number().positive().nullable(),
    display_res: z.string().nullable(),
    listed_price_vnd: z.number().int().positive().nullable(),
    mandatory_fees_vnd: z.number().int().nonnegative().nullable(),
  })
  .strict();

export type CrawlSpecExtraction = z.infer<typeof crawlSpecExtractionSchema>;

export const crawlArbiterSchema = z
  .object({
    variant_id: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().max(500),
  })
  .strict();

export type CrawlArbiter = z.infer<typeof crawlArbiterSchema>;
