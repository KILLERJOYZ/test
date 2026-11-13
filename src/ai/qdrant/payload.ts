import { createHash } from "node:crypto";

import { z } from "zod";

import type { EvidenceChunkPayload, QdrantPayloadFilter } from "../types/db.types.js";

export const POINT_NAMESPACE = "6f0c1a2e-4b7d-4e5a-9c1f-8a2b3c4d5e6f";
export const APPROVED_STATUS = "approved";
export const REQUIRED_PAYLOAD_FIELDS = [
  "model_id",
  "variant_id",
  "sku_code",
  "source_url",
  "measured_at",
  "status",
] as const;

const matchSchema = z.union([
  z.object({ any: z.array(z.string()) }).strict(),
  z.object({ value: z.string() }).strict(),
]);

export const qdrantPayloadFilterSchema = z
  .object({
    must: z.array(
      z
        .object({
          key: z.string().min(1),
          match: matchSchema,
        })
        .strict(),
    ),
  })
  .strict();

export const evidenceChunkSchema = z
  .object({
    evidence_id: z.string().min(1),
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
  .strict();

export interface ChunkPayloadInput {
  evidence_id: string;
  model_id: string;
  variant_id: string;
  sku_code: string;
  source_url: string;
  measured_at: string;
  status: string;
  claim: string;
  source_label: string;
}

export function pointId(evidenceId: string): string {
  return uuidV5(evidenceId, POINT_NAMESPACE);
}

export function ragStatus(publicationState: string | null | undefined): string {
  if (publicationState === "published" || publicationState === "approved") return APPROVED_STATUS;
  return publicationState || "draft";
}

export function buildChunkPayload(input: ChunkPayloadInput): EvidenceChunkPayload {
  const payload: EvidenceChunkPayload = {
    evidence_id: input.evidence_id,
    model_id: input.model_id,
    variant_id: input.variant_id,
    sku_code: input.sku_code || "",
    source_url: input.source_url || "",
    measured_at: input.measured_at || "",
    status: ragStatus(input.status),
    claim: input.claim,
    source_label: input.source_label,
    product_id: input.model_id,
  };
  if (payload.status === APPROVED_STATUS) {
    const missing = REQUIRED_PAYLOAD_FIELDS.filter((key) => !payload[key]);
    if (missing.length > 0) {
      throw new Error(`approved evidence is missing ${missing.join(", ")}`);
    }
  }
  return evidenceChunkSchema.parse(payload);
}

export function allowEvidencePayload(
  payload: Partial<Record<(typeof REQUIRED_PAYLOAD_FIELDS)[number] | "evidence_id", unknown>>,
  variantIds: readonly string[],
  skuCodes: readonly string[] = [],
): boolean {
  if (payload.status !== APPROVED_STATUS) return false;
  const allowed = new Set(variantIds);
  if (!allowed.has(String(payload.variant_id))) return false;
  if (skuCodes.length > 0 && !new Set(skuCodes).has(String(payload.sku_code))) return false;
  return REQUIRED_PAYLOAD_FIELDS.every((key) => payload[key] != null && payload[key] !== "");
}

/**
 * Qdrant filter for approved evidence. Both exact variant IDs and exact SKU
 * codes are mandatory when the caller knows the approved SKU set, so a stale
 * point from a sibling configuration can never leak into a comparison.
 */
export function approvedEvidenceFilter(
  variantIds: readonly string[],
  skuCodes: readonly string[] = [],
): QdrantPayloadFilter {
  const must: QdrantPayloadFilter["must"] = [
    { key: "variant_id", match: { any: [...variantIds] } },
    { key: "status", match: { value: APPROVED_STATUS } },
  ];
  const skus = [...new Set(skuCodes.filter(Boolean))];
  if (skus.length > 0) {
    must.push({ key: "sku_code", match: { any: skus } });
  }
  return qdrantPayloadFilterSchema.parse({ must });
}

function uuidV5(name: string, namespace: string): string {
  const ns = Buffer.from(namespace.replaceAll("-", ""), "hex");
  if (ns.length !== 16) throw new Error("point namespace must be a UUID");
  const hash = createHash("sha1").update(ns).update(name, "utf8").digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
