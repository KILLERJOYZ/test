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
  const total =
    v.advertisedPrice !== null &&
    v.shipping !== null &&
    v.fees !== null &&
    Number.isSafeInteger(v.advertisedPrice + v.shipping + v.fees)
      ? v.advertisedPrice + v.shipping + v.fees
      : null;
  if (v.advertisedPrice !== null && v.advertisedPrice > r.budget)
    failed.push("Giá niêm yết đã vượt ngân sách");
  else if (total !== null && total > r.budget)
    failed.push("Tổng chi phí đã vượt ngân sách");
  if (total === null) unknown.push("Chưa đủ tổng chi phí");
  if (r.tasks.length)
    unknown.push("Chưa có bằng chứng năng lực cho tác vụ đã chọn");
  return {
    state: failed.length
      ? ("excluded" as const)
      : ("needs_verification" as const),
    failed,
    unknown,
    total,
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
          : (a.assessment.total ?? a.listing.advertisedPrice ?? Infinity) -
            (b.assessment.total ?? b.listing.advertisedPrice ?? Infinity)) ||
        a.listing.id.localeCompare(b.listing.id),
    );
}
export function facts(v: Listing, r: Requirements): Record<string, string> {
  const a = assess(v, r);
  const evidence = listingEvidence(v);
  return {
    identity: `${v.name}: định danh cấu hình chưa kiểm duyệt.`,
    price: `Giá niêm yết lịch sử: ${v.advertisedPrice === null ? "chưa rõ" : v.advertisedPrice.toLocaleString("vi-VN") + " ₫"}; quan sát ${v.observedAt}. Chưa xác nhận giá hiện tại.`,
    cost:
      a.total !== null
        ? `Tổng chi phí đã biết: ${a.total.toLocaleString("vi-VN")} ₫ (giá ${v.advertisedPrice!.toLocaleString("vi-VN")} ₫ + vận chuyển ${v.shipping!.toLocaleString("vi-VN")} ₫ + phí ${v.fees!.toLocaleString("vi-VN")} ₫). Tồn kho và khả năng chi trả: chưa xác minh.`
        : "Phí giao hàng, phí bắt buộc, tồn kho và khả năng chi trả: chưa xác minh.",
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
const CONTEXT_KEYS: (keyof AdviceContext)[] = [
  "catalogRevision",
  "decisionRevision",
  "focusId",
  "requestId",
];
export function sameContext(a: AdviceContext, b: AdviceContext) {
  return CONTEXT_KEYS.every((k) => a[k] === b[k]);
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
const STOP_WORDS = new Set(["laptop", "máy", "tính", "xách", "tay", "chính", "hãng"]);
function familyTokens(name: string): string[] {
  return name
    .toLocaleLowerCase("vi")
    .replace(/[^a-z0-9à-ỹ\s-]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .slice(0, 3);
}
export function relatedListings(c: Catalog, target: Listing, limit = 6): Listing[] {
  const base = familyTokens(target.name);
  if (base.length < 2) return [];
  return c.listings
    .filter((v) => {
      if (v.id === target.id) return false;
      const tokens = familyTokens(v.name);
      return tokens.length >= 2 && tokens[0] === base[0] && tokens[1] === base[1];
    })
    .sort(
      (a, b) =>
        (a.advertisedPrice ?? Infinity) - (b.advertisedPrice ?? Infinity) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
export function budgetUpgradeCandidates(
  c: Catalog,
  r: Requirements,
  deltaVnd = 5000000,
  limit = 3,
) {
  if (!validRequirements(r) || deltaVnd <= 0) return [];
  const cap = Math.min(1000000000, r.budget + deltaVnd);
  if (cap <= r.budget) return [];
  const higherReq: Requirements = { ...r, budget: cap };
  return c.listings
    .map((v) => {
      const now = assess(v, r);
      const next = assess(v, higherReq);
      const price = now.total ?? v.advertisedPrice;
      return {
        listing: v,
        now,
        next,
        extraVnd: price !== null ? price - r.budget : null,
      };
    })
    .filter(
      (x) =>
        x.now.state === "excluded" &&
        x.now.failed.length === 1 &&
        x.now.failed[0].includes("ngân sách") &&
        x.next.state === "needs_verification" &&
        x.extraVnd !== null &&
        x.extraVnd > 0 &&
        x.extraVnd <= deltaVnd,
    )
    .sort((a, b) => a.extraVnd! - b.extraVnd! || a.listing.id.localeCompare(b.listing.id))
    .slice(0, limit);
}
export function observationAgeLabel(observedAt: string, nowMs = Date.now()): string {
  const parsed = Date.parse(observedAt);
  if (!Number.isFinite(parsed))
    return "Quan sát lịch sử · chưa xác nhận giá hiện tại";
  const days = Math.max(0, Math.floor((nowMs - parsed) / 86400000));
  return days === 0
    ? "Quan sát lịch sử trong ngày · chưa phải giá trực tiếp"
    : `Quan sát lịch sử (${days} ngày trước · chưa phải giá trực tiếp)`;
}
export function taskGuidance(v: Listing, r: Requirements) {
  const evidence = listingEvidence(v);
  const strengths: string[] = [];
  const caveats: string[] = [];
  if (evidence.ram !== null) {
    if (r.tasks.includes("Máy ảo")) {
      if (evidence.ram >= 32)
        strengths.push(`RAM ${evidence.ram} GB phù hợp cấp phát bộ nhớ máy ảo`);
      else if (evidence.ram < 16)
        caveats.push(`Tác vụ Máy ảo: RAM ${evidence.ram} GB hạn chế khi chạy máy ảo`);
    } else if (
      (r.tasks.includes("Lập trình") ||
        r.tasks.includes("Thiết kế") ||
        r.tasks.includes("Chơi game")) &&
      evidence.ram >= 16
    ) {
      strengths.push(`RAM ${evidence.ram} GB đáp ứng mức đa nhiệm thông thường`);
    } else if (
      (r.tasks.includes("Lập trình") ||
        r.tasks.includes("Thiết kế") ||
        r.tasks.includes("Chơi game")) &&
      evidence.ram < 16
    ) {
      caveats.push(`RAM ${evidence.ram} GB có thể chật khi mở tác vụ nặng`);
    }
  }
  if (evidence.storage !== null && evidence.storage >= 512)
    strengths.push(`Ổ lưu trữ ${evidence.storage} GB`);
  if (evidence.conflicts.length > 0)
    caveats.push(...evidence.conflicts);
  if (r.tasks.length > 0)
    caveats.push("Chưa có bài đo độc lập cho tác vụ đã chọn");
  return { strengths, caveats };
}
const ALLOWLISTED_RETAILERS: Record<string, string> = {
  "fptshop.com.vn": "fptshop",
  "thegioididong.com": "thegioididong",
  "dienmayxanh.com": "dienmayxanh",
  "cellphones.com.vn": "cellphones",
  "gearvn.com": "gearvn",
  "phongvu.vn": "phongvu",
  "hacom.vn": "hacom",
  "laptopaz.vn": "laptopaz",
};
function optionalNonNegInt(raw: string | undefined, max: number): number | null | "invalid" {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (!/^\d+$/.test(s)) return "invalid";
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n < 0 || n > max) return "invalid";
  return n;
}
export function parseQuotationDraft(input: {
  name: string;
  url?: string;
  advertisedPrice: string;
  shipping?: string;
  fees?: string;
  ram?: string;
  storage?: string;
  cpu?: string;
  os?: string;
  condition?: "new" | "used" | "unknown";
  nowIso?: string;
}): { listing: Listing; recognizedRetailer: boolean } | null {
  const name = (input.name ?? "").trim();
  if (!name || name.length > 200) return null;
  const price = optionalNonNegInt(input.advertisedPrice, 1000000000);
  if (price === "invalid" || price === null || price <= 0) return null;
  const shipping = optionalNonNegInt(input.shipping, 100000000);
  const fees = optionalNonNegInt(input.fees, 100000000);
  const ram = optionalNonNegInt(input.ram, 1024);
  const storage = optionalNonNegInt(input.storage, 100000);
  if (
    shipping === "invalid" ||
    fees === "invalid" ||
    ram === "invalid" ||
    storage === "invalid" ||
    (ram !== null && ram <= 0) ||
    (storage !== null && storage <= 0)
  )
    return null;
  const rawUrl = (input.url ?? "").trim();
  let url = "https://quote.lua.vn/manual";
  let source = "manual-quote";
  let recognizedRetailer = false;
  if (rawUrl) {
    if (!safeLink(rawUrl)) return null;
    url = rawUrl;
    const host = new URL(rawUrl).hostname.replace(/^www\./i, "").toLowerCase();
    if (ALLOWLISTED_RETAILERS[host]) {
      source = ALLOWLISTED_RETAILERS[host];
      recognizedRetailer = true;
    }
  }
  const observedAt =
    input.nowIso && Number.isFinite(Date.parse(input.nowIso))
      ? input.nowIso
      : new Date().toISOString();
  const condition =
    input.condition && ["new", "used", "unknown"].includes(input.condition)
      ? input.condition
      : "new";
  const slug = `${source}:${name}:${price}:${shipping ?? ""}:${fees ?? ""}:${ram ?? ""}:${storage ?? ""}`;
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  const listing: Listing = {
    id: `${source}:quote-${hex}`,
    name,
    source,
    url,
    condition,
    observedAt,
    ram,
    storage,
    cpu: input.cpu?.trim() ? input.cpu.trim().slice(0, 100) : null,
    os: input.os?.trim() ? input.os.trim().slice(0, 100) : null,
    screen: null,
    weight: null,
    advertisedPrice: price,
    shipping,
    fees,
    stock: "unknown",
    identity: "unreviewed",
    rawHash: `quote-${hex}`,
  };
  return { listing, recognizedRetailer };
}



