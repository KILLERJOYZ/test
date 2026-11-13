import { z } from "zod";

import { sourceCitationSchema, variantSummarySchema } from "./catalog.js";
import { userRequirementProfileSchema } from "./profile.js";

export const comparisonInputSchema = z
  .object({
    variant_ids: z.array(z.string().min(1)).min(2).max(3),
    user_profile: userRequirementProfileSchema,
    extra_budget_vnd: z.number().int().nonnegative().nullable().optional(),
  })
  .strict();

export type ComparisonInput = z.infer<typeof comparisonInputSchema>;

export const comparisonGainSchema = z
  .object({
    aspect: z.enum(["cpu", "gpu", "ram", "storage", "display", "battery", "weight", "upgradability"]),
    description: z.string(),
    citation: sourceCitationSchema.nullable(),
  })
  .strict();

export const comparisonUpgradeSchema = z
  .object({
    from_variant_id: z.string(),
    to_variant_id: z.string(),
    price_delta_vnd: z.number().int(),
    gains: z.array(comparisonGainSchema),
  })
  .strict();

export const comparisonResultSchema = z
  .object({
    variants: z.array(variantSummarySchema).max(3),
    missing_variant_ids: z.array(z.string()),
    upgrades: z.array(comparisonUpgradeSchema),
    summary: z.string(),
    budget_warning: z.string().nullable(),
    requires_budget_confirmation: z.boolean(),
    unverified_notes: z.array(z.string()),
  })
  .strict();

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

export const comparisonExplanationSchema = z
  .object({
    summary: z.string().max(1200),
  })
  .strict();
