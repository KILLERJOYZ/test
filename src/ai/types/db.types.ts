/**
 * Rows the AI layer reads from PostgreSQL, and the drafts it returns.
 * The backend owns migrations, CRUD, and RBAC. These types are the contract
 * only: agents never publish a row and never touch HTTP.
 */

export type ProductCategory = "laptop" | "phone";
export type ModelStatus = "draft" | "published" | "archived";
export type VariantStatus = "draft" | "published";
export type EvidenceType = "benchmark" | "editorial_review" | "spec_sheet";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder" | "unknown";
export type ProductCondition = "new" | "open_box" | "refurbished" | "used";
export type OfferStatus = "pending" | "active" | "expired" | "hidden";

/** Stored staging status. Agent output is only `pending` or `needs_review`. */
export type StagingReviewStatusStored = "pending" | "needs_review" | "approved" | "rejected";
export type AgentReviewStatus = "pending" | "needs_review";

/** Stored evidence status. Agent output is only `pending_review`. */
export type EvidenceStatusStored = "pending_review" | "approved" | "rejected";

export type AnomalyCode =
  | "spec_mismatch"
  | "price_anomaly"
  | "missing_mandatory_fees"
  | "ambiguous_variant"
  | "blocked_auto_publish";

export interface AnomalyFlag {
  code: AnomalyCode;
  detail: string;
}

/** PostgreSQL `product_models` row. */
export interface ProductModel {
  id: string;
  category: ProductCategory;
  brand: string;
  name: string;
  series: string | null;
  release_year: number | null;
  status: ModelStatus;
}

/**
 * PostgreSQL `product_variants` row (v.*) plus `product_models.name/brand/category`
 * aliased as `model_name`, `brand`, `category` by the read adapter.
 */
export interface ProductVariant {
  id: string;
  model_id: string;
  category: ProductCategory;
  sku_code: string;
  region: string;
  cpu: string | null;
  gpu: string | null;
  ram_gb: number | null;
  ram_type: string | null;
  ram_upgradable: boolean | null;
  storage_gb: number | null;
  storage_slots: number | null;
  display_size: number | null;
  display_res: string | null;
  display_panel: string | null;
  color_gamut: string | null;
  refresh_rate: number | null;
  battery_wh: number | null;
  weight_kg: number | null;
  os: string | null;
  specs_json: Record<string, unknown>;
  status: VariantStatus;
  merged_into_id: string | null;
  model_name: string;
  brand: string;
}

export interface StoreFeePolicy {
  id: string;
  name: string;
  requires_mandatory_fees: boolean;
}

/** PostgreSQL `price_histories` row. */
export interface PriceHistoryPoint {
  id?: string;
  offer_id?: string | null;
  variant_id: string;
  store_id?: string | null;
  price_vnd: number;
  recorded_at?: string;
}

/** PostgreSQL `stores` row. */
export interface Store {
  id: string;
  name: string;
  website: string;
  shipping_regions: string[];
  warranty_policy: string | null;
  return_policy: string | null;
  is_verified: boolean;
}

/**
 * PostgreSQL `offers` row. A missing mandatory fee makes the total unknown,
 * never free; only active offers join to a published variant.
 */
export interface Offer {
  id: string;
  variant_id: string;
  store_id: string;
  listed_price_vnd: number;
  mandatory_fees_vnd: number | null;
  total_known_price_vnd: number | null;
  conditional_price_vnd: number | null;
  promo_conditions: string | null;
  stock_status: StockStatus;
  product_condition: ProductCondition;
  source_url: string;
  is_sponsored: boolean;
  checked_at: string;
  expires_at: string | null;
  status: OfferStatus;
}

/** Read model joining one published variant to its best active offer. */
export interface VariantOffer {
  variant: ProductVariant;
  offer: Offer;
  store: Store;
}

export interface SourceCitation {
  source_name: string;
  source_url: string;
  measured_at: string;
}

/**
 * Approved PostgreSQL `evidences_and_reviews` row joined to `product_variants`
 * for the exact `sku_code`. `status` is narrowed to `approved`.
 */
export interface VerifiedEvidence {
  id: string;
  model_id: string;
  variant_id: string;
  sku_code: string;
  source_name: string;
  source_url: string;
  evidence_type: EvidenceType;
  summary_performance: string | null;
  summary_thermals_noise: string | null;
  summary_battery: string | null;
  summary_cons_quirks: string | null;
  raw_excerpt: string;
  measured_at: string;
  status: "approved";
}

/** A retrieval hit from the hybrid retriever: approved row plus one claim. */
export interface RetrievedEvidence extends VerifiedEvidence {
  claim: string;
  score: number | null;
}

export interface EvidenceQuery {
  variant_ids: string[];
  query: string;
  limit?: number;
}

/** Port for PostgreSQL + Qdrant hybrid retrieval. */
export interface EvidenceRetriever {
  search(input: EvidenceQuery): Promise<RetrievedEvidence[]>;
}

export interface CatalogQuery {
  max_budget_vnd: number;
  category?: ProductCategory;
  limit?: number;
}

/**
 * Port the backend implements over PostgreSQL. The AI layer never writes:
 * every method reads published variants, active offers, price history or
 * approved evidence only.
 */
export interface CatalogRepository {
  queryVariants(input: CatalogQuery): Promise<VariantOffer[]>;
  getVariantsByIds(variantIds: readonly string[]): Promise<VariantOffer[]>;
  listResolutionVariants(): Promise<ProductVariant[]>;
  getPriceHistory(variantIds: readonly string[], since?: string): Promise<PriceHistoryPoint[]>;
  findApprovedEvidences(variantIds: readonly string[], limit?: number): Promise<VerifiedEvidence[]>;
  findSimilarOffers(variantId: string): Promise<VariantOffer[]>;
}

export interface StagingCrawledItem {
  id?: string;
  source_id?: string;
  raw_title: string;
  raw_specs_json: Record<string, unknown>;
  raw_price: number | null;
  raw_url: string | null;
  store_name?: string | null;
  matched_variant_id?: string | null;
  confidence_score?: number | null;
  anomaly_flags?: AnomalyFlag[];
  review_status?: StagingReviewStatusStored;
}

export interface EntityResolutionInput {
  item: StagingCrawledItem;
  variants: ProductVariant[];
  price_points?: PriceHistoryPoint[];
  requires_mandatory_fees?: boolean;
}

export interface ResolutionResult {
  matched_variant_id: string | null;
  confidence_score: number;
  anomaly_flags: AnomalyFlag[];
  review_status: AgentReviewStatus;
}

/**
 * Hardware fields a review is checked against. A full ProductVariant satisfies
 * this. CPU/GPU/RAM/display differences all set `version_mismatch_warning`.
 */
export interface ReviewVariantRef {
  id: string;
  sku_code?: string | null;
  cpu?: string | null;
  gpu?: string | null;
  ram_gb?: number | null;
  display_size?: number | null;
  display_res?: string | null;
  display_panel?: string | null;
}

export interface ReviewSynthesisInput {
  raw_text: string;
  variant: ReviewVariantRef;
  source_name: string;
  source_url: string;
  measured_at: string;
  evidence_type?: EvidenceType;
  sibling_skus?: string[];
}

/** Read from ops_settings key `ai_fallback_enabled`. The agent does not write it. */
export interface AiFallbackSetting {
  ai_fallback_enabled: boolean;
}

export interface EvidenceDraft {
  variant_id: string;
  source_name: string;
  source_url: string;
  evidence_type: EvidenceType;
  summary_performance: string | null;
  summary_thermals_noise: string | null;
  summary_battery: string | null;
  summary_cons_quirks: string | null;
  raw_excerpt: string;
  measured_at: string;
  config_warning: string | null;
  status: "pending_review";
  ai_blocked?: boolean;
}

/**
 * Qdrant payload stored in the evidence collection. `evidence_id` must point
 * to an approved PostgreSQL row; `model_id`, `variant_id` and `sku_code` are
 * immutable identity fields used by the retrieval filter.
 */
export interface EvidenceChunkPayload {
  evidence_id: string;
  model_id: string;
  variant_id: string;
  sku_code: string;
  source_url: string;
  measured_at: string;
  status: string;
  claim: string;
  source_label: string;
  product_id: string;
}

export interface QdrantMatchAny {
  any: string[];
}

export interface QdrantMatchValue {
  value: string;
}

export interface QdrantFieldCondition {
  key: string;
  match: QdrantMatchAny | QdrantMatchValue;
}

/** Plain filter descriptor. The caller maps it onto the Qdrant client. */
export interface QdrantPayloadFilter {
  must: QdrantFieldCondition[];
}
