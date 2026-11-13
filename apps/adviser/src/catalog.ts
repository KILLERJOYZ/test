import { listingEvidence } from "./listing-evidence.ts";
export type Listing = {
  id: string;
  name: string;
  source: string;
  url: string;
  condition: string;
  observedAt: string;
  ram: number | null;
  storage: number | null;
  cpu: string | null;
  os: string | null;
  screen: string | null;
  weight: string | null;
  advertisedPrice: number | null;
  shipping: number | null;
  fees: number | null;
  stock: "unknown";
  identity: "unreviewed";
  rawHash: string;
};
export type Catalog = {
  schemaVersion: 1;
  revision: string;
  importedAt: string;
  listings: Listing[];
};
export type Requirements = {
  budget: number;
  minRam: number;
  minStorage: number;
  os: string;
  tasks: string[];
};
export const INITIAL_REQUIREMENTS: Requirements = {
  budget: 25000000,
  minRam: 0,
  minStorage: 0,
  os: "",
  tasks: [],
};
export function validRequirements(x: any): x is Requirements {
  return (
    !!x &&
    Object.keys(x).every((key) =>
      ["budget", "minRam", "minStorage", "os", "tasks"].includes(key),
    ) &&
    Number.isSafeInteger(x.budget) &&
    x.budget > 0 &&
    x.budget <= 1000000000 &&
    Number.isSafeInteger(x.minRam) &&
    x.minRam >= 0 &&
    x.minRam <= 1024 &&
    Number.isSafeInteger(x.minStorage) &&
    x.minStorage >= 0 &&
    x.minStorage <= 100000 &&
    typeof x.os === "string" &&
    x.os.length <= 100 &&
    Array.isArray(x.tasks) &&
    x.tasks.length <= 5 &&
    new Set(x.tasks).size === x.tasks.length &&
    x.tasks.every(
      (t: any) => typeof t === "string" && t.length > 0 && t.length <= 100,
    )
  );
}
export function validCatalog(x: any): x is Catalog {
  return (
    x?.schemaVersion === 1 &&
    typeof x.revision === "string" &&
    x.revision.length > 0 &&
    Number.isFinite(Date.parse(x.importedAt)) &&
    Array.isArray(x.listings) &&
    x.listings.length <= 10000 &&
    new Set(x.listings.map((v: any) => v.id)).size === x.listings.length &&
    x.listings.every(
      (v: any) =>
        v &&
        ["id", "name", "source", "rawHash"].every(
          (k) => typeof v[k] === "string" && v[k].length > 0,
        ) &&
        safeLink(v.url) &&
        Number.isFinite(Date.parse(v.observedAt)) &&
        ["new", "used", "unknown"].includes(v.condition) &&
        v.stock === "unknown" &&
        v.identity === "unreviewed" &&
        ["ram", "storage", "advertisedPrice", "shipping", "fees"].every(
          (k) => v[k] === null || (Number.isSafeInteger(v[k]) && v[k] >= 0),
        ) &&
        ["cpu", "os", "screen", "weight"].every(
          (k) => v[k] === null || typeof v[k] === "string",
        ),
    )
  );
}
export function safeLink(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function assess(v: Listing, r: Requirements) {
  const evidence = listingEvidence(v);
  const ram = evidence.ram,
    storage = evidence.storage;
  const failed: string[] = [],
    unknown: string[] = [
      "Chưa kiểm duyệt định danh cấu hình",
      "Chưa xác nhận tồn kho và giá hiện tại",
    ];
  unknown.push(...evidence.conflicts);
  if (r.minRam)
    ram === null
      ? unknown.push("Chưa rõ RAM")
      : ram! < r.minRam && failed.push("RAM dưới yêu cầu");
  if (r.minStorage)
    storage === null
      ? unknown.push("Chưa rõ dung lượng ổ")
      : storage! < r.minStorage && failed.push("Ổ lưu trữ dưới yêu cầu");
  if (r.os)
    v.os === null
      ? unknown.push("Chưa rõ hệ điều hành")
      : !v.os.toLowerCase().includes(r.os.toLowerCase()) &&
        failed.push("Hệ điều hành không khớp");
  if (v.advertisedPrice !== null && v.advertisedPrice > r.budget)
    failed.push("Giá niêm yết đã vượt ngân sách");
  if (v.shipping === null || v.fees === null || v.advertisedPrice === null)
    unknown.push("Chưa đủ tổng chi phí");
  if (r.tasks.length)
    unknown.push("Chưa có bằng chứng năng lực cho tác vụ đã chọn");
  return {
    state: failed.length
      ? ("excluded" as const)
      : ("needs_verification" as const),
    failed,
    unknown,
    total: null,
    affordability: "unknown" as const,
  };
}
export function searchCatalog(
  c: Catalog,
  r: Requirements,
  query = "",
  source = "",
  sort = "price",
) {
  if (!validRequirements(r)) throw Error("INVALID_REQUIREMENTS");
  const q = query.trim().toLocaleLowerCase("vi");
  return c.listings
    .filter(
      (v) =>
        (!source || v.source === source) &&
        (!q ||
          [
            v.name,
            v.cpu,
            v.ram && `${v.ram} GB`,
            v.storage && `${v.storage} GB`,
            v.source,
          ]
            .join(" ")
            .toLocaleLowerCase("vi")
            .includes(q)),
    )
    .map((v) => ({ listing: v, assessment: assess(v, r) }))
    .sort(
      (a, b) =>
        Number(a.assessment.state === "excluded") -
          Number(b.assessment.state === "excluded") ||
        (sort === "name"
          ? a.listing.name.localeCompare(b.listing.name)
          : (a.listing.advertisedPrice ?? Infinity) -
            (b.listing.advertisedPrice ?? Infinity)) ||
        a.listing.id.localeCompare(b.listing.id),
    );
}
export function facts(v: Listing, r: Requirements): Record<string, string> {
  const a = assess(v, r);
  const evidence = listingEvidence(v);
  return {
    identity: `${v.name}: định danh cấu hình chưa kiểm duyệt.`,
    price: `Giá niêm yết lịch sử: ${v.advertisedPrice === null ? "chưa rõ" : v.advertisedPrice.toLocaleString("vi-VN") + " ₫"}; quan sát ${v.observedAt}. Chưa xác nhận giá hiện tại.`,
    cost: "Phí giao hàng, phí bắt buộc, tồn kho và khả năng chi trả: chưa xác minh.",
    spec: `RAM: ${evidence.ram ?? "chưa xác minh"} GB; ổ: ${evidence.storage ?? "chưa xác minh"} GB; CPU: ${v.cpu ?? "chưa rõ"}. ${evidence.conflicts.join("; ")}`,
    fit: a.failed.length
      ? a.failed.join("; ")
      : "Chưa đủ bằng chứng kết luận phù hợp tác vụ.",
    source: `Nguồn: ${v.source} — ${v.url}`,
  };
}
export type AdviceContext = {
  catalogRevision: string;
  decisionRevision: number;
  focusId: string;
  requestId: string;
};
export function sameContext(a: AdviceContext, b: AdviceContext) {
  return ["catalogRevision", "decisionRevision", "focusId", "requestId"].every(
    (k) => (a as any)[k] === (b as any)[k],
  );
}
export function checkedAdvice(value: any, allowed: Record<string, string>) {
  if (
    !value ||
    !Array.isArray(value.factIds) ||
    value.factIds.length > 6 ||
    new Set(value.factIds).size !== value.factIds.length ||
    value.factIds.some(
      (k: any) => typeof k !== "string" || !Object.hasOwn(allowed, k),
    ) ||
    !(value.proposal === null || validRequirements(value.proposal))
  )
    throw Error("INVALID_AI_OUTPUT");
  return {
    text: value.factIds.map((k: string) => allowed[k]).join("\n\n"),
    proposal: value.proposal as Requirements | null,
  };
}
export type SavedDecision = {
  id: string;
  savedAt: string;
  catalogRevision: string;
  requirements: Requirements;
  listings: Listing[];
};
export function validSaved(x: any): x is SavedDecision {
  return (
    !!x &&
    typeof x.id === "string" &&
    x.id.length > 0 &&
    Number.isFinite(Date.parse(x.savedAt)) &&
    typeof x.catalogRevision === "string" &&
    validRequirements(x.requirements) &&
    Array.isArray(x.listings) &&
    x.listings.length > 0 &&
    x.listings.length <= 2 &&
    validCatalog({
      schemaVersion: 1,
      revision: x.catalogRevision,
      importedAt: x.savedAt,
      listings: x.listings,
    })
  );
}
