import { z } from "zod";

import { sourceCitationSchema } from "../schemas/catalog.js";
import type { EvidenceRetriever } from "../types/db.types.js";
import { allowEvidencePayload } from "../qdrant/payload.js";

export const evidenceSearchInputSchema = z
  .object({
    variant_ids: z.array(z.string().min(1)).min(1).max(10),
    query: z.string().min(1),
    limit: z.number().int().positive().max(12).default(6),
  })
  .strict();

export type EvidenceSearchInput = z.infer<typeof evidenceSearchInputSchema>;

export const evidenceItemSchema = z
  .object({
    evidence_id: z.string(),
    variant_id: z.string(),
    sku_code: z.string(),
    evidence_type: z.enum(["benchmark", "editorial_review", "spec_sheet"]),
    claim: z.string(),
    source_name: z.string(),
    source_url: z.string(),
    measured_at: z.string(),
    source_citation: sourceCitationSchema,
    score: z.number().nullable(),
  })
  .strict();

export const evidenceSearchOutputSchema = z
  .object({
    status: z.enum(["available", "missing", "unavailable"]),
    evidences: z.array(evidenceItemSchema),
    note: z.string(),
  })
  .strict();

export type EvidenceSearchOutput = z.infer<typeof evidenceSearchOutputSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;

export const NO_VERIFIED_EVIDENCE = "Chưa có dữ liệu kiểm chứng cho đúng phiên bản này.";

/** Tool 2: hybrid retrieval with a hard approved + exact-variant gate. */
export async function searchVerifiedEvidences(
  rawInput: EvidenceSearchInput,
  deps: { evidence: EvidenceRetriever },
): Promise<EvidenceSearchOutput> {
  const input = evidenceSearchInputSchema.parse(rawInput);
  let rows;
  try {
    rows = await deps.evidence.search({
      variant_ids: [...new Set(input.variant_ids)],
      query: input.query,
      limit: input.limit,
    });
  } catch {
    return evidenceSearchOutputSchema.parse({
      status: "unavailable",
      evidences: [],
      note: `${NO_VERIFIED_EVIDENCE} Kho bằng chứng không phản hồi.`,
    });
  }

  const seen = new Set<string>();
  const evidences = rows
    .filter((row) => row.status === "approved")
    .filter((row) =>
      allowEvidencePayload(
        {
          evidence_id: row.id,
          model_id: row.model_id,
          variant_id: row.variant_id,
          sku_code: row.sku_code,
          source_url: row.source_url,
          measured_at: row.measured_at,
          status: row.status,
        },
        input.variant_ids,
      ),
    )
    .filter((row) => {
      const key = `${row.id}:${row.claim}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, input.limit)
    .map((row) => ({
      evidence_id: row.id,
      variant_id: row.variant_id,
      sku_code: row.sku_code,
      evidence_type: row.evidence_type,
      claim: row.claim,
      source_name: row.source_name,
      source_url: row.source_url,
      measured_at: row.measured_at,
      source_citation: {
        source_name: row.source_name,
        source_url: row.source_url,
        measured_at: row.measured_at,
      },
      score: row.score,
    }));

  if (evidences.length === 0) {
    return evidenceSearchOutputSchema.parse({
      status: "missing",
      evidences: [],
      note: NO_VERIFIED_EVIDENCE,
    });
  }

  return evidenceSearchOutputSchema.parse({
    status: "available",
    evidences,
    note: `Có ${evidences.length} đoạn kiểm chứng đã được duyệt, gắn đúng variant_id/SKU.`,
  });
}
