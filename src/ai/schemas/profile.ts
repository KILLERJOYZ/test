import { z } from "zod";

/**
 * Canonical tasks the deterministic tools know how to enforce. The LLM may
 * only map natural language onto this list; free-form tasks are kept as goals
 * but cannot silently relax a hard constraint.
 */
export const mandatoryTaskSchema = z.enum([
  "office",
  "student",
  "coding",
  "graphic_2d",
  "graphic_3d",
  "video_editing",
  "gaming",
  "portability",
  "battery_life",
  "local_ai",
]);

export type MandatoryTask = z.infer<typeof mandatoryTaskSchema>;

export const softPreferenceSchema = z.enum([
  "lighter",
  "better_battery",
  "better_display",
  "quieter",
  "upgradable",
  "cheaper",
]);

export type SoftPreference = z.infer<typeof softPreferenceSchema>;

export const userRequirementProfileSchema = z
  .object({
    category: z.enum(["laptop", "phone"]),
    primary_goals: z.array(z.string().min(1)).min(1).max(3),
    mandatory_tasks: z.array(mandatoryTaskSchema).max(10),
    max_budget_vnd: z.number().int().positive().nullable(),
    soft_preferences: z.array(softPreferenceSchema).max(2),
    missing_fields: z.array(z.string()),
  })
  .strict();

export type UserRequirementProfile = z.infer<typeof userRequirementProfileSchema>;

/** LLM output for profile extraction. Money is re-derived from the message. */
export const profileExtractionSchema = z
  .object({
    category: z.enum(["laptop", "phone"]),
    primary_goals: z.array(z.string().min(1)).min(1).max(3),
    mandatory_tasks: z.array(mandatoryTaskSchema).max(10),
    max_budget_vnd: z.number().int().positive().nullable(),
    soft_preferences: z.array(softPreferenceSchema).max(2),
  })
  .strict();

export type ProfileExtraction = z.infer<typeof profileExtractionSchema>;

export const CORE_MISSING_FIELDS = ["max_budget_vnd", "primary_goals"] as const;

export function profileMissingFields(profile: {
  primary_goals: readonly string[];
  max_budget_vnd: number | null;
}): string[] {
  const missing: string[] = [];
  if (!profile.max_budget_vnd) missing.push("max_budget_vnd");
  if (profile.primary_goals.length === 0) missing.push("primary_goals");
  return missing;
}
