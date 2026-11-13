import { PRODUCTS, OFFERS } from "./domain.ts";
import type { Product, Offer } from "./domain.ts";
import { evaluate, EMPTY_FILTERS, POLICY_VERSION } from "./picker.ts";
import type { Needs } from "./picker.ts";

export type Catalog = {
  schema: 1;
  version: string;
  mode: "synthetic";
  observedAt: string;
  products: Product[];
  offers: Offer[];
};
export const BASE: Catalog = {
  schema: 1,
  version: "demo2-catalog-1",
  mode: "synthetic",
  observedAt: "2026-11-11T09:00:00+07:00",
  products: PRODUCTS,
  offers: OFFERS,
};
export const UPDATE: Catalog = {
  ...BASE,
  version: "demo2-catalog-2",
  offers: OFFERS.map((o) => ({ ...o, base: o.base + 1500000 })),
};
export function validateCatalog(value: unknown): Catalog {
  const c = value as Catalog;
  if (
    !c ||
    c.schema !== 1 ||
    c.mode !== "synthetic" ||
    !["demo2-catalog-1", "demo2-catalog-2"].includes(c.version) ||
    c.observedAt !== BASE.observedAt ||
    !Array.isArray(c.products) ||
    !Array.isArray(c.offers)
  )
    throw Error("Gói dữ liệu không tương thích.");
  // Demo bundles accept only the known fixture identities/specifications; price changes are separately validated.
  if (
    JSON.stringify(c.products) !== JSON.stringify(PRODUCTS) ||
    c.offers.length !== OFFERS.length ||
    new Set(c.offers.map((o) => o.id)).size !== OFFERS.length
  )
    throw Error("Sai cấu hình hoặc định danh.");
  for (const o of c.offers) {
    const known = OFFERS.find((x) => x.id === o.id);
    if (
      !known ||
      o.productId !== known.productId ||
      o.seller !== known.seller ||
      !["current", "expired", "unavailable"].includes(o.status) ||
      typeof o.eligible !== "boolean" ||
      ![o.base, o.fee, o.coupon].every(
        (n) => Number.isSafeInteger(n) && n >= 0,
      ) ||
      !(
        o.shipping === null ||
        (Number.isSafeInteger(o.shipping) && o.shipping >= 0)
      ) ||
      o.coupon > o.base ||
      !Number.isSafeInteger(o.base + (o.shipping ?? 0) + o.fee)
    )
      throw Error("Giá hoặc liên kết cấu hình không hợp lệ.");
  }
  return c;
}
export function run(needs: Needs, catalog: Catalog) {
  return {
    ...evaluate(needs, EMPTY_FILTERS, catalog.offers, catalog.products),
    key: `${needs.revision}:${catalog.version}:${POLICY_VERSION}`,
  };
}
export type BudgetProposal = {
  baseRevision: number;
  catalogVersion: string;
  budget: number;
  evidence: string;
};
export function proposeBudget(
  text: string,
  needs: Needs,
  catalog: Catalog,
): BudgetProposal {
  const match =
    /^\s*(?:không quá|tối đa)\s+(\d+(?:[.,]\d+)?)\s*triệu\s*[.!]?\s*$/iu.exec(
      text,
    );
  if (!match)
    throw Error(
      "Hãy nhập trần rõ ràng, ví dụ “Tối đa 20 triệu”, hoặc dùng biểu mẫu.",
    );
  const budget = Number(match[1].replace(",", ".")) * 1000000;
  if (!Number.isSafeInteger(budget) || budget <= 0)
    throw Error("Trần tiền không hợp lệ.");
  return {
    baseRevision: needs.revision,
    catalogVersion: catalog.version,
    budget,
    evidence: text,
  };
}
export function applyProposal(
  p: BudgetProposal,
  needs: Needs,
  catalog: Catalog,
): Needs {
  if (p.baseRevision !== needs.revision || p.catalogVersion !== catalog.version)
    throw Error("Đề xuất đã cũ. Hãy phân tích lại.");
  if (!Number.isSafeInteger(p.budget) || p.budget <= 0)
    throw Error("Trần tiền không hợp lệ.");
  return { ...needs, budget: p.budget, revision: needs.revision + 1 };
}
