import type { NudgeCache } from "./cache.js";
import type { StructuredLlm } from "./llm/structured.js";
import type { CatalogRepository, EvidenceRetriever } from "./types/db.types.js";

/**
 * Everything the AI layer needs from the rest of the system. The backend
 * supplies its PostgreSQL/Qdrant adapters; tests supply deterministic fakes.
 */
export interface AiEngineDeps {
  catalog: CatalogRepository;
  evidence: EvidenceRetriever;
  /** Optional: without a provider every workflow falls back deterministically. */
  llm?: StructuredLlm;
  nudgeCache?: NudgeCache;
  now?: () => Date;
  /** Optional page reader for URL quotes. Never used for arbitrary browsing. */
  fetchText?: (url: string) => Promise<string>;
}
