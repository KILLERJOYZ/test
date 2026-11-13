import { z } from "zod";

import { sourceCitationSchema } from "./catalog.js";
import { userRequirementProfileSchema } from "./profile.js";

export const pickerEvidenceSchema = z
  .object({
    evidence_id: z.string(),
    claim: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    measured_at: z.string(),
    source_citation: sourceCitationSchema,
  })
  .strict();

export const pickerRecommendationSchema = z
  .object({
    variant_id: z.string(),
    sku_code: z.string(),
    title: z.string(),
    brand: z.string(),
    total_known_price_vnd: z.number().int(),
    store_name: z.string(),
    offer_url: z.string(),
    checked_at: z.string(),
    fit_reasons: z.array(z.string()),
    tradeoffs: z.array(z.string()),
    evidence_status: z.enum(["available", "missing", "unavailable"]),
    evidences: z.array(pickerEvidenceSchema),
  })
  .strict();

export type PickerRecommendation = z.infer<typeof pickerRecommendationSchema>;

export const pickerInputSchema = z
  .object({
    message: z.string().default(""),
    draft_profile: userRequirementProfileSchema.nullable().optional(),
    is_confirmed: z.boolean().optional(),
  })
  .strict();

export type PickerInput = z.infer<typeof pickerInputSchema>;

export const pickerResultSchema = z
  .object({
    status: z.enum(["AWAITING_CONFIRMATION", "COMPLETED", "NO_MATCH"]),
    extracted_profile: userRequirementProfileSchema,
    questions: z.array(z.string()).max(2),
    recommendations: z.array(pickerRecommendationSchema).max(3),
    notes: z.array(z.string()),
    advisor_note: z.string().nullable(),
  })
  .strict();

export type PickerResult = z.infer<typeof pickerResultSchema>;

/** Compact LLM answer for the trade-off explanation node. */
export const pickerExplanationSchema = z
  .object({
    advisor_note: z.string().nullable(),
    recommendations: z
      .array(
        z
          .object({
            variant_id: z.string(),
            fit_reasons: z.array(z.string()).max(4),
            tradeoffs: z.array(z.string()).max(4),
          })
          .strict(),
      )
      .max(3),
  })
  .strict();

export type PickerExplanation = z.infer<typeof pickerExplanationSchema>;
