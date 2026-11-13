import { z } from "zod";

import { sourceCitationSchema } from "./catalog.js";
import { userRequirementProfileSchema } from "./profile.js";

export const nudgeTriggerSchema = z.enum([
  "DEEP_INSPECTION",
  "COMPARISON_HESITATION",
  "FILTER_THRASHING",
  "DEAL_WATCHOUT",
]);

export type NudgeTrigger = z.infer<typeof nudgeTriggerSchema>;

export const activeFiltersSchema = z
  .object({
    max_price_vnd: z.number().int().positive().nullable().optional(),
    min_ram_gb: z.number().int().positive().nullable().optional(),
    max_weight_kg: z.number().positive().nullable().optional(),
    min_color_gamut_pct: z.number().min(0).max(100).nullable().optional(),
    min_battery_wh: z.number().positive().nullable().optional(),
    brand: z.string().nullable().optional(),
  })
  .strict();

export type ActiveFilters = z.infer<typeof activeFiltersSchema>;

export const nudgeInputSchema = z
  .object({
    trigger_type: nudgeTriggerSchema,
    current_variant_id: z.string().min(1),
    recent_variant_ids: z.array(z.string()).max(10).default([]),
    active_filters: activeFiltersSchema.default({}),
    user_profile: userRequirementProfileSchema,
  })
  .strict();

export type NudgeInput = z.infer<typeof nudgeInputSchema>;

export const nudgeTypeSchema = z.enum([
  "blind_spot",
  "better_deal",
  "price_drop",
  "filter_unlock",
  "comparison_insight",
]);

export const ctaActionSchema = z.enum(["view_variant", "compare", "adjust_filters", "open_deal"]);

/** LLM micro-prompt output. Every identifier is checked against DB evidence. */
export const nudgeDraftSchema = z
  .object({
    should_show: z.boolean(),
    nudge_type: nudgeTypeSchema,
    short_message: z.string().max(140),
    evidence_citation: sourceCitationSchema,
    cta_label: z.string().max(40),
    cta_action: ctaActionSchema,
    target_variant_ids: z.array(z.string()).max(3),
  })
  .strict();

export type NudgeDraft = z.infer<typeof nudgeDraftSchema>;

export const nudgeResultSchema = z.union([
  z.object({ should_show: z.literal(false) }).strict(),
  z
    .object({
      should_show: z.literal(true),
      nudge_type: nudgeTypeSchema,
      short_message: z.string().max(140),
      evidence_citation: sourceCitationSchema,
      cta_label: z.string(),
      cta_action: ctaActionSchema,
      target_variant_ids: z.array(z.string()).max(3),
    })
    .strict(),
]);

export type NudgeResult = z.infer<typeof nudgeResultSchema>;
