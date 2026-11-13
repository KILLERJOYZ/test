/**
 * Public AI engine surface.
 *
 * Six user/ingestion functions are exported:
 *   runConversationalPicker, evaluateProactiveNudge, explainComparisonTradeoffs,
 *   analyzeExternalQuote, synthesizeReviewEvidence, resolveCrawledEntity.
 *
 * The backend owns HTTP, auth/RBAC, migrations and all writes. This package
 * only reads published catalog rows / approved evidence and returns typed
 * drafts that still require admin approval.
 */

export { runConversationalPicker } from "./workflows/conversational-picker.js";
export { evaluateProactiveNudge } from "./workflows/proactive-nudge.js";
export { explainComparisonTradeoffs } from "./workflows/comparison.js";
export { analyzeExternalQuote } from "./workflows/external-quote.js";
export { synthesizeReviewEvidence } from "./workflows/review-evidence.js";
export { resolveCrawledEntity, mapCrawlAnomalies } from "./workflows/crawled-entity.js";

export type { AiEngineDeps } from "./deps.js";
export { createMemoryNudgeCache } from "./cache.js";
export type { NudgeCache, NudgeCacheEntry } from "./cache.js";

export {
  createOpenAiStructuredLlm,
  LlmError,
  zodToJsonSchema,
  type OpenAiLlmOptions,
  type StructuredLlm,
  type StructuredLlmRequest,
} from "./llm/index.js";

export {
  createHybridEvidenceRetriever,
  type HybridRetrieverOptions,
} from "./rag/index.js";

export {
  createLocalHashEmbedder,
  createPostgresCatalogRepository,
  createQdrantVectorStore,
  embedLocal,
  LOCAL_EMBEDDING_DIMENSION,
  type QdrantVectorStoreOptions,
  type SqlClient,
  type SqlQueryResult,
  type VectorHit,
  type VectorSearchInput,
  type VectorStore,
} from "./data/index.js";

export * from "./tools/index.js";
export * from "./schemas/index.js";

export type {
  AgentReviewStatus,
  AiFallbackSetting,
  AnomalyCode,
  AnomalyFlag,
  CatalogQuery,
  CatalogRepository,
  EntityResolutionInput,
  EvidenceChunkPayload,
  EvidenceDraft,
  EvidenceQuery,
  EvidenceRetriever,
  EvidenceStatusStored,
  EvidenceType,
  ModelStatus,
  Offer,
  OfferStatus,
  PriceHistoryPoint,
  ProductCategory,
  ProductCondition,
  ProductModel,
  ProductVariant,
  QdrantFieldCondition,
  QdrantMatchAny,
  QdrantMatchValue,
  QdrantPayloadFilter,
  ResolutionResult,
  RetrievedEvidence,
  ReviewSynthesisInput,
  ReviewVariantRef,
  SourceCitation,
  StagingCrawledItem,
  StagingReviewStatusStored,
  StockStatus,
  Store,
  StoreFeePolicy,
  VariantOffer,
  VariantStatus,
  VerifiedEvidence,
} from "./types/db.types.js";

// Legacy low-level agent APIs kept for direct unit tests and backend reuse.
export {
  blockPublication,
  HIGH_CONFIDENCE,
  PRICE_ANOMALY_RATIO,
  resolutionResultSchema,
  resolveStagingItem,
} from "./agents/entity-resolution.js";
export {
  classifyReviewSentences,
  configWarning,
  evidenceDraftSchema,
  fallbackReview,
  forcePending,
  synthesizeReview,
} from "./agents/review-synthesis.js";
export { runEntityResolution, runReviewSynthesis } from "./agents/graphs.js";
export type { ReviewExtractor, ReviewSynthesisRunInput } from "./agents/graphs.js";

export {
  allowEvidencePayload,
  approvedEvidenceFilter,
  APPROVED_STATUS,
  buildChunkPayload,
  pointId,
  ragStatus,
  REQUIRED_PAYLOAD_FIELDS,
} from "./qdrant/payload.js";
