import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import type { AiEngineDeps } from "../deps.js";
import {
  extractedQuoteSchema,
  quoteInputSchema,
  quoteResultSchema,
  type ExtractedQuote,
  type QuoteInput,
  type QuoteResult,
} from "../schemas/quote.js";
import type { ProductVariant, VariantOffer } from "../types/db.types.js";
import { findSimilarDealsAndPriceHistory } from "../tools/deal-tools.js";
import { formatVnd, foldText, median, priceValues, toVariantSummary } from "../tools/helpers.js";

const QUOTE_SYSTEM = `Bạn trích xuất báo giá laptop/điện thoại từ văn bản người dùng dán.
Chỉ dùng thông tin có trong văn bản. Không suy đoán cấu hình, giá, khuyến mãi còn thiếu.
Trường không thấy thì trả null; promo_conditions là mảng các điều kiện/khuyến mãi nguyên văn.
Không biến giá trả góp thành giá máy nếu văn bản có giá máy rõ ràng.`;

const QuoteState = Annotation.Root({
  input: Annotation<QuoteInput>(),
  result: Annotation<QuoteResult | null>(),
});

type QuoteStateValue = typeof QuoteState.State;

/** Workflow 4: inspect a user-supplied quote without browsing arbitrary sites. */
export async function analyzeExternalQuote(
  rawInput: QuoteInput,
  deps: AiEngineDeps,
): Promise<QuoteResult> {
  const input = quoteInputSchema.parse(rawInput);
  const graph = new StateGraph(QuoteState)
    .addNode("extract_match_compare", (state: QuoteStateValue) => runQuote(state, deps))
    .addEdge(START, "extract_match_compare")
    .addEdge("extract_match_compare", END)
    .compile();

  const state = await graph.invoke({ input, result: null });
  if (!state.result) throw new Error("quote workflow returned no result");
  return quoteResultSchema.parse(state.result);
}

async function runQuote(
  state: QuoteStateValue,
  deps: AiEngineDeps,
): Promise<Partial<QuoteStateValue>> {
  const input = state.input;
  const warnings: string[] = [];
  const { text, fetched } = await readQuoteText(input.raw_url_or_text, deps, warnings);
  const deterministic = extractDeterministicQuote(text);
  const extracted = await extractWithLlm(text, deterministic, deps, warnings);
  const missingFields = missingQuoteFields(extracted);

  const variants = await deps.catalog.listResolutionVariants();
  const match = matchQuoteVariant(extracted, variants);
  if (match.conflict) {
    warnings.push(
      "Cấu hình trong báo giá (GPU/RAM/lưu trữ) không khớp biến thể published nào; cần xác minh đúng SKU trước khi so sánh giá.",
    );
  } else if (match.ambiguous) {
    warnings.push("Có nhiều biến thể gần giống; cần xác nhận đúng SKU trước khi kết luận.");
  } else if (!match.variant) {
    warnings.push("Không khớp được với biến thể published nào trong danh mục.");
  }

  let matchedRow: VariantOffer | null = null;
  if (match.variant) {
    const rows = await deps.catalog.getVariantsByIds([match.variant.id]);
    matchedRow = rows[0] ?? null;
    if (!matchedRow) {
      warnings.push("Biến thể có trong danh mục nhưng chưa có offer active đủ tổng giá.");
    }
  }

  const effectiveTotal = quoteTotal(extracted);
  if (extracted.listed_price_vnd != null && extracted.mandatory_fees_vnd == null) {
    warnings.push("Chưa rõ phí bắt buộc nên tổng giá chưa đầy đủ.");
  }

  const history = match.variant
    ? await deps.catalog.getPriceHistory([match.variant.id])
    : [];
  const priceCheck = assessPrice(effectiveTotal, priceValues(history), extracted);
  const budgetFit = assessBudget(effectiveTotal, input.user_profile?.max_budget_vnd ?? null);

  let equivalentDeals: QuoteResult["equivalent_deals"] = [];
  if (match.variant) {
    const deal = await findSimilarDealsAndPriceHistory(
      { variant_id: match.variant.id },
      { catalog: deps.catalog },
    );
    equivalentDeals = deal.cheaper_equivalents.map((item) => ({
      variant_id: item.variant_id,
      title: item.title,
      sku_code: item.sku_code,
      total_known_price_vnd: item.total_known_price_vnd,
      store_name: item.store_name,
      source_url: item.source_url,
      checked_at: item.checked_at,
      price_delta_vnd: item.delta_vnd,
    }));
  }

  const questions = sellerQuestions(extracted, matchedRow, effectiveTotal);
  const requiresUserConfirmation =
    missingFields.length > 0 ||
    match.ambiguous ||
    !match.variant ||
    budgetFit.within_budget === false ||
    priceCheck.verdict === "incomplete_total" ||
    priceCheck.verdict === "above_market";

  if (fetched) warnings.push("Nội dung được đọc từ URL người dùng cung cấp; hãy kiểm tra lại giá tại trang gốc.");

  return {
    result: {
      extracted,
      matched_variant: matchedRow
        ? {
            variant: toVariantSummary(matchedRow),
            confidence: match.confidence,
            matched_by: match.matchedBy,
          }
        : null,
      price_check: priceCheck,
      budget_fit: budgetFit,
      equivalent_deals: equivalentDeals,
      missing_fields: missingFields,
      seller_verification_questions: questions,
      warnings,
      requires_user_confirmation: requiresUserConfirmation,
    },
  };
}

async function readQuoteText(
  raw: string,
  deps: AiEngineDeps,
  warnings: string[],
): Promise<{ text: string; fetched: boolean }> {
  const trimmed = raw.trim();
  if (!/^https?:\/\/\S+$/i.test(trimmed)) {
    return { text: trimmed, fetched: false };
  }
  if (!deps.fetchText) {
    warnings.push("Không có bộ đọc URL; hãy dán nội dung báo giá để kiểm tra chính xác.");
    return { text: trimmed, fetched: false };
  }
  try {
    const html = await deps.fetchText(trimmed);
    return { text: stripHtml(html), fetched: true };
  } catch (error) {
    warnings.push(`Không đọc được URL (${error instanceof Error ? error.message : String(error)}).`);
    return { text: trimmed, fetched: false };
  }
}

async function extractWithLlm(
  text: string,
  deterministic: ExtractedQuote,
  deps: AiEngineDeps,
  warnings: string[],
): Promise<ExtractedQuote> {
  if (!deps.llm || text.length < 20) return deterministic;
  try {
    const draft = await deps.llm.generate({
      name: "quote_extract",
      schema: extractedQuoteSchema,
      system: QUOTE_SYSTEM,
      input: { text: text.slice(0, 6000) },
      maxOutputTokens: 700,
    });
    return mergeExtraction(draft, deterministic, text);
  } catch {
    warnings.push("AI không trích xuất được báo giá; dùng bộ đọc tất định.");
    return deterministic;
  }
}

function mergeExtraction(
  llm: ExtractedQuote,
  deterministic: ExtractedQuote,
  text: string,
): ExtractedQuote {
  const gpu = deterministic.gpu ?? supportedText(llm.gpu, text);
  const cpu = deterministic.cpu ?? supportedText(llm.cpu, text);
  const llmPromotions = llm.promo_conditions.filter((condition) => supportedText(condition, text) != null);
  return extractedQuoteSchema.parse({
    store_name: deterministic.store_name ?? supportedText(llm.store_name, text),
    product_name: deterministic.product_name ?? supportedText(llm.product_name, text),
    cpu,
    gpu,
    ram_gb: deterministic.ram_gb ?? supportedNumber(llm.ram_gb, text),
    storage_gb: deterministic.storage_gb ?? supportedNumber(llm.storage_gb, text),
    display_size: deterministic.display_size ?? supportedNumber(llm.display_size, text),
    display_res: deterministic.display_res ?? supportedText(llm.display_res, text),
    listed_price_vnd: deterministic.listed_price_vnd ?? supportedNumber(llm.listed_price_vnd, text),
    mandatory_fees_vnd: deterministic.mandatory_fees_vnd ?? supportedNumber(llm.mandatory_fees_vnd, text),
    promo_conditions:
      deterministic.promo_conditions.length > 0 ? deterministic.promo_conditions : llmPromotions.slice(0, 4),
    product_condition: deterministic.product_condition ?? supportedCondition(llm.product_condition, text),
    raw_notes: deterministic.raw_notes ?? supportedText(llm.raw_notes, text),
  });
}

function extractDeterministicQuote(text: string): ExtractedQuote {
  const cleaned = text.replace(/\r/g, "");
  const folded = foldText(cleaned);
  const priceText = cleaned.replace(
    /\d[\d.,]*\s*(?:đ|vnd|₫)?\s*(?:\/|mỗi\s+)?tháng/gi,
    " ",
  );
  const prices = extractPrices(priceText);
  const price = prices.length > 0 ? Math.max(...prices) : null;

  const cpuMatch =
    /(Intel\s+Core\s+(?:Ultra\s+)?[A-Za-z0-9 -]{2,40}|(?:AMD\s+)?Ryzen\s+[3579]\s+[A-Za-z0-9 -]{2,30}|Apple\s+M[1-9](?:\s+(?:Pro|Max))?)/i.exec(
      cleaned,
    );
  const gpuMatch = /\b((?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s?-?\s?\d{3,4}(?:\s?Ti)?|Radeon\s+RX\s?\d{3,4})/i.exec(
    cleaned,
  );
  const ramMatch = /(?:RAM\s*:?\s*(\d{1,3})\s*GB|(\d{1,3})\s*GB\s*RAM)/i.exec(cleaned);
  const storageMatch = /(\d{3,4})\s*GB\s*(?:SSD|NVMe)|(\d)\s*TB\s*(?:SSD|NVMe)/i.exec(cleaned);
  const sizeMatch = /(\d{2}(?:[.,]\d)?)\s*(?:inch|inches|")/i.exec(cleaned);
  const resMatch = /(\d{3,4})\s*[x×]\s*(\d{3,4})/i.exec(cleaned);
  const feeMatch = /ph[íi][^.\n]{0,40}?(\d{1,3}(?:[.,]\d{3})+|\d+\s*(?:triệu|tr))/i.exec(cleaned);

  const storageGb = storageMatch
    ? storageMatch[1]
      ? Number(storageMatch[1])
      : Number(storageMatch[2]) * 1024
    : null;

  return extractedQuoteSchema.parse({
    store_name: detectStore(folded),
    product_name: firstProductName(cleaned),
    cpu: cpuMatch ? cpuMatch[1]!.trim() : null,
    gpu: gpuMatch ? gpuMatch[1]!.trim() : null,
    ram_gb: ramMatch ? Number(ramMatch[1] ?? ramMatch[2]) : null,
    storage_gb: storageGb,
    display_size: sizeMatch ? Number(sizeMatch[1]!.replace(",", ".")) : null,
    display_res: resMatch ? `${resMatch[1]}x${resMatch[2]}` : null,
    listed_price_vnd: price,
    mandatory_fees_vnd: feeMatch ? parseMoneyText(feeMatch[1]!) : null,
    promo_conditions: extractPromotions(cleaned),
    product_condition: /like new|open box|open-box/i.test(cleaned)
      ? "open_box"
      : /refurbished/i.test(cleaned)
        ? "refurbished"
        : /máy cũ|may cu|used/i.test(cleaned)
          ? "used"
          : null,
    raw_notes: cleaned.replace(/\s+/g, " ").trim().slice(0, 400) || null,
  });
}

function matchQuoteVariant(
  quote: ExtractedQuote,
  variants: readonly ProductVariant[],
): {
  variant: ProductVariant | null;
  confidence: number;
  matchedBy: string[];
  ambiguous: boolean;
  conflict: boolean;
} {
  const name = foldText(quote.product_name ?? "");
  const nameTokens = new Set(
    name.split(/[^\p{L}\p{N}]+/u).filter((token) => token.length >= 3),
  );
  const quoteGpu = gpuCode(quote.gpu);
  const scored: { variant: ProductVariant; score: number; matchedBy: string[] }[] = [];
  let conflictingCandidates = 0;

  for (const variant of variants) {
    if (variant.merged_into_id) continue;
    const matchedBy: string[] = [];
    let score = 0;
    const brand = foldText(variant.brand);
    const brandHit = Boolean(brand && name.includes(brand));
    if (brandHit) {
      score += 2;
      matchedBy.push(`brand:${variant.brand}`);
    }
    const modelTokens = foldText(variant.model_name)
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length >= 3 && !["laptop", "inch", "series"].includes(token));
    const hits = modelTokens.filter((token) => nameTokens.has(token));
    if (hits.length > 0) {
      score += Math.min(6, hits.length * 2);
      matchedBy.push(`model:${hits.join(",")}`);
    }
    // RAM/storage alone must never identify a variant: require a brand or
    // model-name hit before configuration fields can contribute.
    if (!brandHit && hits.length === 0) continue;
    const variantGpu = gpuCode(variant.gpu);
    if (quoteGpu && variantGpu) {
      if (quoteGpu === variantGpu) {
        score += 4;
        matchedBy.push(`gpu:${quoteGpu}`);
      } else {
        score -= 4;
      }
    }
    if (quote.ram_gb != null && variant.ram_gb != null) {
      if (quote.ram_gb === variant.ram_gb) {
        score += 3;
        matchedBy.push(`ram:${quote.ram_gb}GB`);
      } else {
        score -= 2;
      }
    }
    if (quote.storage_gb != null && variant.storage_gb != null && quote.storage_gb === variant.storage_gb) {
      score += 2;
      matchedBy.push(`storage:${quote.storage_gb}GB`);
    }
    if (quote.display_size != null && variant.display_size != null) {
      if (Math.abs(quote.display_size - variant.display_size) <= 0.2) {
        score += 1;
        matchedBy.push(`display:${variant.display_size}"`);
      }
    }
    if (quote.display_res && variant.display_res) {
      if (normalizeRes(quote.display_res) === normalizeRes(variant.display_res)) {
        score += 1;
        matchedBy.push(`res:${variant.display_res}`);
      }
    }

    if (
      quoteGpu &&
      variantGpu &&
      quoteGpu !== variantGpu
    ) {
      conflictingCandidates += 1;
      continue;
    }
    if (quote.ram_gb != null && variant.ram_gb != null && quote.ram_gb !== variant.ram_gb) {
      conflictingCandidates += 1;
      continue;
    }
    if (
      quote.storage_gb != null &&
      variant.storage_gb != null &&
      quote.storage_gb !== variant.storage_gb
    ) {
      conflictingCandidates += 1;
      continue;
    }

    if (score > 0) scored.push({ variant, score, matchedBy });
  }

  scored.sort((left, right) => right.score - left.score);
  if (scored.length === 0) {
    if (conflictingCandidates > 0) {
      return { variant: null, confidence: 0.15, matchedBy: [], ambiguous: false, conflict: true };
    }
    return { variant: null, confidence: 0, matchedBy: [], ambiguous: false, conflict: false };
  }
  const best = scored[0]!;
  const tied = scored.filter((entry) => entry.score === best.score);
  if (tied.length > 1) {
    return { variant: null, confidence: 0.3, matchedBy: [], ambiguous: true, conflict: false };
  }
  if (best.score < 4) {
    return {
      variant: null,
      confidence: round2(best.score / 12),
      matchedBy: best.matchedBy,
      ambiguous: false,
      conflict: false,
    };
  }
  return {
    variant: best.variant,
    confidence: round2(Math.min(0.98, best.score / 12)),
    matchedBy: best.matchedBy,
    ambiguous: false,
    conflict: false,
  };
}

function assessPrice(
  total: number | null,
  history: readonly number[],
  quote: ExtractedQuote,
): QuoteResult["price_check"] {
  if (quote.listed_price_vnd != null && quote.mandatory_fees_vnd == null) {
    return {
      effective_total_vnd: null,
      median_history_vnd: median(history),
      delta_pct: null,
      verdict: "incomplete_total",
      note: "Thiếu phí bắt buộc nên chưa có tổng đã biết để so sánh.",
    };
  }
  if (total == null) {
    return {
      effective_total_vnd: null,
      median_history_vnd: median(history),
      delta_pct: null,
      verdict: "insufficient_data",
      note: "Báo giá chưa có giá niêm yết.",
    };
  }
  const mid = median(history);
  if (mid == null) {
    return {
      effective_total_vnd: total,
      median_history_vnd: null,
      delta_pct: null,
      verdict: "insufficient_data",
      note: "Chưa có lịch sử giá của đúng biến thể; không kết luận đắt/rẻ.",
    };
  }
  const delta = round1(((total - mid) / mid) * 100);
  const verdict =
    delta <= -10 ? "good_deal" : delta >= 10 ? "above_market" : "fair";
  const note =
    verdict === "good_deal"
      ? `Thấp hơn trung vị lịch sử ${Math.abs(delta)}%.`
      : verdict === "above_market"
        ? `Cao hơn trung vị lịch sử ${delta}%.`
        : `Quanh trung vị lịch sử (${delta > 0 ? "+" : ""}${delta}%).`;
  return {
    effective_total_vnd: total,
    median_history_vnd: mid,
    delta_pct: delta,
    verdict,
    note,
  };
}

function assessBudget(total: number | null, maxBudget: number | null): QuoteResult["budget_fit"] {
  if (maxBudget == null) {
    return { max_budget_vnd: null, within_budget: null, over_by_vnd: null, note: "Chưa có ngân sách trần đã xác nhận." };
  }
  if (total == null) {
    return {
      max_budget_vnd: maxBudget,
      within_budget: null,
      over_by_vnd: null,
      note: "Chưa đủ tổng giá để so với ngân sách.",
    };
  }
  if (total > maxBudget) {
    return {
      max_budget_vnd: maxBudget,
      within_budget: false,
      over_by_vnd: total - maxBudget,
      note: `Vượt ngân sách ${formatVnd(total - maxBudget)}. Không tự nâng trần.`,
    };
  }
  return {
    max_budget_vnd: maxBudget,
    within_budget: true,
    over_by_vnd: 0,
    note: "Nằm trong ngân sách đã xác nhận.",
  };
}

function sellerQuestions(
  quote: ExtractedQuote,
  matched: VariantOffer | null,
  total: number | null,
): string[] {
  const questions: string[] = [];
  if (quote.mandatory_fees_vnd == null) questions.push("Giá đã bao gồm mọi phí bắt buộc chưa?");
  if (quote.promo_conditions.length > 0) {
    questions.push("Điều kiện cụ thể để được giá/khuyến mãi này là gì?");
  }
  if (quote.product_condition == null || quote.product_condition !== "new") {
    questions.push("Máy là hàng new, open-box hay refurbished? Còn bảo hành hãng không?");
  }
  if (!quote.product_name || !quote.cpu || !quote.ram_gb) {
    questions.push("Mã SKU chính xác và cấu hình CPU/RAM trên hộp là gì?");
  }
  if (matched && total != null) {
    questions.push("Giá còn hiệu lực đến khi nào và có xuất hóa đơn VAT không?");
  }
  return questions.slice(0, 5);
}

function missingQuoteFields(quote: ExtractedQuote): string[] {
  const missing: string[] = [];
  if (!quote.product_name) missing.push("tên sản phẩm");
  if (!quote.cpu) missing.push("CPU");
  if (!quote.gpu) missing.push("GPU");
  if (!quote.ram_gb) missing.push("RAM");
  if (!quote.storage_gb) missing.push("lưu trữ");
  if (!quote.display_size && !quote.display_res) missing.push("màn hình");
  if (!quote.listed_price_vnd) missing.push("giá niêm yết");
  if (quote.mandatory_fees_vnd == null) missing.push("phí bắt buộc");
  return missing;
}

function quoteTotal(quote: ExtractedQuote): number | null {
  if (quote.listed_price_vnd == null) return null;
  if (quote.mandatory_fees_vnd == null) return null;
  return quote.listed_price_vnd + quote.mandatory_fees_vnd;
}

function extractPrices(text: string): number[] {
  const prices: number[] = [];
  for (const match of text.matchAll(/(\d{1,3}(?:[.,]\d{3}){2,}|\d{7,})\s*(?:đ|vnd|₫)?/gi)) {
    const value = Number((match[1] ?? "").replace(/[.,]/g, ""));
    if (Number.isFinite(value) && value >= 1_000_000 && value <= 500_000_000) prices.push(value);
  }
  for (const match of text.matchAll(/(\d{1,3}(?:[.,]\d{1,2})?)\s*(triệu|tr|tỷ|ty)\b/gi)) {
    const value = Number((match[1] ?? "").replace(",", "."));
    const unit = (match[2] ?? "").toLowerCase();
    const amount = Math.round(value * (unit === "tỷ" || unit === "ty" ? 1_000_000_000 : 1_000_000));
    if (amount >= 1_000_000 && amount <= 500_000_000) prices.push(amount);
  }
  return prices;
}

function parseMoneyText(text: string): number | null {
  const unit = /(\d{1,3}(?:[.,]\d{1,2})?)\s*(triệu|tr|tỷ|ty)\b/i.exec(text);
  if (unit) {
    const value = Number((unit[1] ?? "").replace(",", "."));
    const scale = /tỷ|ty/i.test(unit[2] ?? "") ? 1_000_000_000 : 1_000_000;
    return Math.round(value * scale);
  }
  const raw = /\d[\d.,]*/.exec(text);
  if (!raw) return null;
  const value = Number(raw[0].replace(/[.,]/g, ""));
  return Number.isFinite(value) ? value : null;
}

function detectStore(folded: string): string | null {
  if (folded.includes("cellphones")) return "CellphoneS";
  if (folded.includes("fpt")) return "FPT Shop";
  if (folded.includes("thegioididong")) return "Thế Giới Di Động";
  if (folded.includes("dienmayxanh")) return "Điện Máy Xanh";
  if (folded.includes("gearvn")) return "GearVN";
  if (folded.includes("thinkpro")) return "ThinkPro";
  if (folded.includes("phong vu") || folded.includes("phongvu")) return "Phong Vũ";
  return null;
}

function firstProductName(text: string): string | null {
  const laptop = /\b(?:laptop|máy tính xách tay)\s+[^\n|,]{5,90}/i.exec(text);
  if (laptop) return laptop[0].replace(/\s+/g, " ").trim();
  const first = text.split(/\n/).map((line) => line.trim()).find((line) => line.length >= 5);
  return first ? first.slice(0, 120) : null;
}

function extractPromotions(text: string): string[] {
  const found: string[] = [];
  for (const line of text.split(/[\n.!?]/)) {
    const sentence = line.trim();
    if (sentence.length < 8) continue;
    if (/(giảm|thu cũ|trả góp|hoàn tiền|thẻ|sinh viên|quà tặng|bảo hành)/i.test(sentence)) {
      found.push(sentence.slice(0, 180));
    }
    if (found.length >= 4) break;
  }
  return found;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function supportedNumber(value: number | null, text: string): number | null {
  if (value == null) return null;
  const digits = String(Math.trunc(value));
  const compact = text.replace(/[.,\s]/g, "");
  return compact.includes(digits) ? value : null;
}

function supportedText(value: string | null, text: string): string | null {
  if (!value) return null;
  const folded = foldText(text);
  const tokens = foldText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) return null;
  return tokens.some((token) => folded.includes(token)) ? value : null;
}

function supportedCondition(
  value: ExtractedQuote["product_condition"],
  text: string,
): ExtractedQuote["product_condition"] {
  if (!value || value === "new") return null;
  if (value === "open_box") {
    return /like new|open[ -]?box/i.test(text) ? value : null;
  }
  if (value === "refurbished") {
    return /refurbished/i.test(text) ? value : null;
  }
  return /máy cũ|may cu|used/i.test(text) ? value : null;
}

function gpuCode(text: string | null): string | null {
  if (!text) return null;
  const match = /\b(rtx|gtx|rx|arc)\s*-?\s*(\d{3,4})\b/i.exec(text);
  if (!match?.[1] || !match[2]) return null;
  return `${match[1].toLowerCase()}${match[2]}`;
}

function normalizeRes(value: string): string {
  const match = /(\d{3,4})\s*[x×]\s*(\d{3,4})/i.exec(value);
  return match ? `${match[1]}x${match[2]}` : value.toLowerCase();
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
