import type { QdrantPayloadFilter } from "../types/db.types.js";

export interface VectorSearchInput {
  text: string;
  filter: QdrantPayloadFilter;
  limit: number;
  scoreThreshold?: number;
}

export interface VectorHit {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export interface VectorStore {
  search(input: VectorSearchInput): Promise<VectorHit[]>;
}

export interface QdrantVectorStoreOptions {
  url: string;
  collection: string;
  embed: (text: string) => number[];
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

interface QdrantResponse {
  result?: { points?: { id: string | number; score?: number; payload?: Record<string, unknown> | null }[] };
  status?: { error?: string };
}

/**
 * Thin REST adapter for the existing Qdrant service. No SDK dependency keeps
 * the AI package light; the backend can substitute its own VectorStore.
 */
export function createQdrantVectorStore(options: QdrantVectorStoreOptions): VectorStore {
  const baseUrl = options.url.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async search(input: VectorSearchInput): Promise<VectorHit[]> {
      const response = await fetchImpl(
        `${baseUrl}/collections/${encodeURIComponent(options.collection)}/points/query`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(options.apiKey ? { "api-key": options.apiKey } : {}),
          },
          body: JSON.stringify({
            query: options.embed(input.text),
            filter: input.filter,
            limit: input.limit,
            with_payload: true,
            with_vector: false,
            ...(input.scoreThreshold != null ? { score_threshold: input.scoreThreshold } : {}),
          }),
          signal: AbortSignal.timeout(options.timeoutMs ?? 12_000),
        },
      );

      const body = (await response.json()) as QdrantResponse;
      if (!response.ok) {
        throw new Error(`Qdrant ${response.status}: ${body.status?.error ?? "query failed"}`);
      }
      const points = body.result?.points ?? [];
      return points.map((point) => ({
        id: String(point.id),
        score: point.score ?? 0,
        payload: point.payload ?? {},
      }));
    },
  };
}
