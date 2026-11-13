export { findSimilarDealsAndPriceHistory, dealHistoryInputSchema, dealHistoryOutputSchema } from "./deal-tools.js";
export { searchVerifiedEvidences, evidenceSearchInputSchema, evidenceSearchOutputSchema } from "./evidence-tools.js";
export {
  getVariantsComparisonMatrix,
  queryVariantsByConstraints,
  comparisonMatrixInputSchema,
  queryVariantsInputSchema,
} from "./variant-tools.js";

import { z } from "zod";

import { dealHistoryInputSchema } from "./deal-tools.js";
import { evidenceSearchInputSchema } from "./evidence-tools.js";
import { comparisonMatrixInputSchema, queryVariantsInputSchema } from "./variant-tools.js";

/**
 * Metadata for wiring these functions into a LangGraph `ToolNode` or any
 * other tool runtime. The functions themselves stay plain async TypeScript.
 */
export const AI_TOOL_DEFINITIONS = [
  {
    name: "query_variants_by_constraints",
    description:
      "Lọc variant published theo ngân sách trần tuyệt đối và các tác vụ bắt buộc; trả thông số, giá, cửa hàng, checked_at.",
    inputSchema: queryVariantsInputSchema,
  },
  {
    name: "search_verified_evidences",
    description:
      "Hybrid RAG (PostgreSQL + Qdrant) chỉ trả evidence status=approved, đúng variant_id/SKU, kèm nguồn và ngày đo.",
    inputSchema: evidenceSearchInputSchema,
  },
  {
    name: "get_variants_comparison_matrix",
    description:
      "So sánh 2-3 variant_id, nêu khác biệt linh kiện và cảnh báo cùng dòng máy nhưng khác cấu hình.",
    inputSchema: comparisonMatrixInputSchema,
  },
  {
    name: "find_similar_deals_and_price_history",
    description:
      "Lịch sử giá và các cấu hình tương đương đang rẻ hơn cho một variant_id.",
    inputSchema: dealHistoryInputSchema,
  },
] as const satisfies readonly {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
}[];
