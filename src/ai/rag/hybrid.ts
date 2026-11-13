import type {
  CatalogRepository,
  EvidenceQuery,
  EvidenceRetriever,
  RetrievedEvidence,
  VerifiedEvidence,
} from "../types/db.types.js";
import type { VectorStore } from "../data/qdrant.js";
import { allowEvidencePayload, approvedEvidenceFilter } from "../qdrant/payload.js";

export interface HybridRetrieverOptions {
  catalog: CatalogRepository;
  vectors: VectorStore;
  /** Minimum cosine score for a vector hit to be attached. */
  scoreThreshold?: number;
}

/**
 * Hybrid retrieval = PostgreSQL approved rows + Qdrant vector chunks.
 *
 * PostgreSQL is the source of truth: a vector payload is only accepted when
 * its `evidence_id` exists in the approved row set. This blocks stale Qdrant
 * points left behind after an admin rejects or edits a review.
 */
export function createHybridEvidenceRetriever(options: HybridRetrieverOptions): EvidenceRetriever {
  const scoreThreshold = options.scoreThreshold ?? 0.2;

  return {
    async search(input: EvidenceQuery): Promise<RetrievedEvidence[]> {
      const variantIds = [...new Set(input.variant_ids.filter(Boolean))];
      if (variantIds.length === 0) return [];
      const limit = Math.max(1, Math.min(input.limit ?? 6, 20));

      const rows = await options.catalog.findApprovedEvidences(variantIds, limit * 3);
      if (rows.length === 0) return [];
      const approved = new Map(rows.map((row) => [row.id, row]));
      const skuCodes = [...new Set(rows.map((row) => row.sku_code).filter(Boolean))];

      let vectorHits: Awaited<ReturnType<VectorStore["search"]>> = [];
      try {
        vectorHits = await options.vectors.search({
          text: input.query,
          filter: approvedEvidenceFilter(variantIds, skuCodes),
          limit: limit * 3,
          scoreThreshold,
        });
      } catch {
        // Vector outage degrades to lexical PostgreSQL evidence. It must not
        // turn into invented review text.
        vectorHits = [];
      }

      const merged: RetrievedEvidence[] = [];
      const seen = new Set<string>();
      for (const hit of vectorHits) {
        const payload = hit.payload;
        if (!allowEvidencePayload(payload, variantIds, skuCodes)) continue;
        const evidenceId = String(payload.evidence_id ?? "");
        const row = approved.get(evidenceId);
        if (!row) continue;
        if (String(payload.variant_id) !== row.variant_id) continue;
        if (String(payload.sku_code) !== row.sku_code) continue;
        const claim = String(payload.claim ?? "").trim();
        if (!claim) continue;
        const key = `${row.id}:${claim}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({ ...row, claim, score: hit.score });
      }

      // Lexical rows not returned by the vector search still count as
      // approved evidence. They are ranked by token overlap, score = null.
      const tokens = queryTokens(input.query);
      for (const row of rows) {
        const claim = pickClaim(row, tokens);
        if (!claim) continue;
        const key = `${row.id}:${claim}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push({ ...row, claim, score: null });
      }

      merged.sort((left, right) => {
        const leftScore = left.score ?? lexicalScore(left.claim, tokens);
        const rightScore = right.score ?? lexicalScore(right.claim, tokens);
        if (rightScore !== leftScore) return rightScore - leftScore;
        return right.measured_at.localeCompare(left.measured_at);
      });
      return merged.slice(0, limit);
    },
  };
}

function pickClaim(row: VerifiedEvidence, tokens: Set<string>): string | null {
  const candidates = [
    row.summary_performance,
    row.summary_thermals_noise,
    row.summary_battery,
    row.summary_cons_quirks,
    row.raw_excerpt,
  ].filter((value): value is string => Boolean(value && value.trim()));

  if (candidates.length === 0) return null;
  let best = candidates[0]!;
  let bestScore = -1;
  for (const candidate of candidates) {
    const score = lexicalScore(candidate, tokens);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best.length > 1200 ? `${best.slice(0, 1200)}…` : best;
}

function queryTokens(query: string): Set<string> {
  return new Set(
    query
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length >= 3),
  );
}

function lexicalScore(text: string, tokens: Set<string>): number {
  if (tokens.size === 0) return 0;
  const folded = text.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (folded.includes(token)) score += 1;
  }
  return score / tokens.size;
}
