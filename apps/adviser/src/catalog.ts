import { listingEvidence } from "./listing-evidence.ts";

export const MAX_COMPARE_ITEMS = 4;

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
  brand?: string | null;
  model?: string | null;
  gpu?: string | null;
  battery?: string | null;
  thumbnail?: string | null;
  priceOriginal?: number | null;
  discountPercent?: number | null;
  installment?: string | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;
  availability?: string | null;
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

function normalizeOsFamily(os: string): string {
  const s = os.trim().toLowerCase();
  if (!s) return "";
  if (/\b(win|windows|w10|w11)\b/.test(s)) return "windows";
  if (/\b(mac\s*os|macos|osx|sequoia|sonoma|ventura)\b/.test(s)) return "macos";
  if (/\b(ubuntu|linux|fedora|debian)\b/.test(s)) return "linux";
  if (/\b(chrome\s*os|chromeos)\b/.test(s)) return "chromeos";
  return s;
}

function osMatches(listingOs: string, requiredOs: string): boolean {
  const lLow = listingOs.toLowerCase();
  const rLow = requiredOs.trim().toLowerCase();
  if (lLow.includes(rLow)) return true;
  const lFam = normalizeOsFamily(listingOs);
  const rFam = normalizeOsFamily(requiredOs);
  return !!lFam && lFam === rFam && !/\d+/.test(rLow.replace(/\bwin(?:dows)?\s*11\b/, ""));
}

export function listingWeightKg(v: Listing): number | null {
  if (!v.weight) return null;
  const m = v.weight.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function listingScreenInches(v: Listing): number | null {
  const src = `${v.screen ?? ""} ${v.name}`;
  const m = src.match(/\b(1[1-8](?:\.\d)?|2[1-9](?:\.\d)?)\s*(?:inch|inches|")\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
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
      : !osMatches(v.os, r.os) && failed.push("Hệ điều hành không khớp");
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

export function suitabilityScore(v: Listing, r: Requirements): number {
  const a = assess(v, r);
  if (a.state === "excluded") return -1000 - a.failed.length * 100;
  const ev = listingEvidence(v);
  const g = taskGuidance(v, r);
  let score = 100;
  score += g.strengths.length * 18;
  score -= ev.conflicts.length * 30;
  if (ev.ram !== null) score += Math.min(32, ev.ram);
  else score -= 12;
  if (ev.storage !== null) score += Math.min(20, Math.round(ev.storage / 128) * 3);
  else score -= 10;
  if (v.cpu) score += 8;
  if (v.gpu && /\b(RTX|GTX|RX|Arc|Apple M)\b/i.test(v.gpu)) {
    if (
      r.tasks.includes("Chơi game") ||
      r.tasks.includes("Thiết kế") ||
      r.tasks.includes("Máy ảo")
    ) {
      score += 15;
    }
  }
  const price = a.total ?? v.advertisedPrice;
  if (price !== null && r.budget > 0) {
    const ratio = price / r.budget;
    // Prefer configurations that fit comfortably below ceiling while offering verified specs
    score += Math.max(0, Math.round((1 - ratio) * 20));
  } else {
    score -= 20;
  }
  return score;
}

export type CatalogExtraFilters = {
  maxWeightKg?: number | null;
  maxScreenIn?: number | null;
  minScreenIn?: number | null;
};

export function searchCatalog(
  c: Catalog,
  r: Requirements,
  query = "",
  source = "",
  sort = "price",
  extraFilters?: CatalogExtraFilters,
) {
  if (!validRequirements(r)) throw Error("INVALID_REQUIREMENTS");
  const q = query.trim().toLocaleLowerCase("vi");
  return c.listings
    .filter((v) => {
      if (source && v.source !== source) return false;
      if (extraFilters?.maxWeightKg != null && extraFilters.maxWeightKg > 0) {
        const w = listingWeightKg(v);
        if (w === null || w > extraFilters.maxWeightKg) return false;
      }
      if (extraFilters?.maxScreenIn != null && extraFilters.maxScreenIn > 0) {
        const sc = listingScreenInches(v);
        if (sc === null || sc > extraFilters.maxScreenIn) return false;
      }
      if (extraFilters?.minScreenIn != null && extraFilters.minScreenIn > 0) {
        const sc = listingScreenInches(v);
        if (sc === null || sc < extraFilters.minScreenIn) return false;
      }
      if (!q) return true;
      return [
        v.name,
        v.brand,
        v.model,
        v.cpu,
        v.gpu,
        v.ram && `${v.ram} GB`,
        v.storage && `${v.storage} GB`,
        v.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q);
    })
    .map((v) => ({
      listing: v,
      assessment: assess(v, r),
      fitScore: sort === "fit" ? suitabilityScore(v, r) : 0,
    }))
    .sort((a, b) => {
      const exclDiff =
        Number(a.assessment.state === "excluded") -
        Number(b.assessment.state === "excluded");
      if (exclDiff !== 0) return exclDiff;
      if (sort === "name") {
        return (
          a.listing.name.localeCompare(b.listing.name) ||
          a.listing.id.localeCompare(b.listing.id)
        );
      }
      if (sort === "fit") {
        return (
          b.fitScore - a.fitScore ||
          (a.listing.advertisedPrice ?? Infinity) -
            (b.listing.advertisedPrice ?? Infinity) ||
          a.listing.id.localeCompare(b.listing.id)
        );
      }
      if (sort === "total") {
        return (
          (a.assessment.total ?? a.listing.advertisedPrice ?? Infinity) -
            (b.assessment.total ?? b.listing.advertisedPrice ?? Infinity) ||
          a.listing.id.localeCompare(b.listing.id)
        );
      }
      if (sort === "weight") {
        return (
          (listingWeightKg(a.listing) ?? Infinity) -
            (listingWeightKg(b.listing) ?? Infinity) ||
          a.listing.id.localeCompare(b.listing.id)
        );
      }
      // sort === "price": strictly bare advertisedPrice (F-14)
      return (
        (a.listing.advertisedPrice ?? Infinity) -
          (b.listing.advertisedPrice ?? Infinity) ||
        a.listing.id.localeCompare(b.listing.id)
      );
    });
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
  groupName?: string;
};

export function validSaved(x: any): x is SavedDecision {
  return (
    !!x &&
    typeof x.id === "string" &&
    x.id.length > 0 &&
    Number.isFinite(Date.parse(x.savedAt)) &&
    typeof x.catalogRevision === "string" &&
    (x.groupName === undefined ||
      (typeof x.groupName === "string" && x.groupName.length <= 120)) &&
    validRequirements(x.requirements) &&
    Array.isArray(x.listings) &&
    x.listings.length > 0 &&
    x.listings.length <= MAX_COMPARE_ITEMS &&
    validCatalog({
      schemaVersion: 1,
      revision: x.catalogRevision,
      importedAt: x.savedAt,
      listings: x.listings,
    })
  );
}

const STOP_WORDS = new Set([
  "laptop",
  "máy",
  "tính",
  "xách",
  "tay",
  "chính",
  "hãng",
  "bảng",
  "để",
  "bàn",
  "all",
  "in",
  "one",
  "gaming",
  "mới",
  "cũ",
  "vna",
  "vn",
]);

function familyTokens(v: Pick<Listing, "name" | "brand">): string[] {
  const combined = `${v.brand ?? ""} ${v.name}`
    .toLocaleLowerCase("vi")
    .replace(/[^a-z0-9à-ỹ\s-]/gi, " ")
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 1 &&
        !STOP_WORDS.has(t) &&
        !/^\d+(?:gb|tb|inch|inches|hz)$/i.test(t),
    );
  const deduped: string[] = [];
  for (const tok of combined) {
    if (!deduped.includes(tok)) deduped.push(tok);
    if (deduped.length === 3) break;
  }
  return deduped;
}

export function relatedListings(
  c: Catalog,
  target: Listing,
  limit = 6,
): Listing[] {
  const base = familyTokens(target);
  if (base.length < 2) return [];
  return c.listings
    .filter((v) => {
      if (v.id === target.id) return false;
      const tokens = familyTokens(v);
      return (
        tokens.length >= 2 && tokens[0] === base[0] && tokens[1] === base[1]
      );
    })
    .sort(
      (a, b) =>
        (a.advertisedPrice ?? Infinity) - (b.advertisedPrice ?? Infinity) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}

export function variantHardwareDiff(base: Listing, other: Listing): string[] {
  const diffs: string[] = [];
  const eBase = listingEvidence(base);
  const eOther = listingEvidence(other);
  if (eBase.ram !== eOther.ram) {
    diffs.push(`RAM ${eOther.ram ?? "?"} GB (so với ${eBase.ram ?? "?"} GB)`);
  }
  if (eBase.storage !== eOther.storage) {
    diffs.push(
      `SSD ${eOther.storage ?? "?"} GB (so với ${eBase.storage ?? "?"} GB)`,
    );
  }
  if ((base.cpu ?? "") !== (other.cpu ?? "") && other.cpu) {
    diffs.push(`CPU ${other.cpu.split(",")[0]}`);
  }
  if ((base.gpu ?? "") !== (other.gpu ?? "") && other.gpu) {
    diffs.push(`GPU ${other.gpu.split(",")[0]}`);
  }
  return diffs;
}

export function savedDecisionDiffs(
  saved: SavedDecision,
  activeCatalog: Catalog,
): { listingId: string; status: "unchanged" | "price_changed" | "removed"; deltaVnd?: number; currentPrice?: number | null }[] {
  return saved.listings.map((item) => {
    const live = activeCatalog.listings.find((x) => x.id === item.id);
    if (!live) {
      return { listingId: item.id, status: "removed" };
    }
    if (
      live.advertisedPrice !== item.advertisedPrice &&
      live.advertisedPrice !== null &&
      item.advertisedPrice !== null
    ) {
      return {
        listingId: item.id,
        status: "price_changed",
        deltaVnd: live.advertisedPrice - item.advertisedPrice,
        currentPrice: live.advertisedPrice,
      };
    }
    return {
      listingId: item.id,
      status: "unchanged",
      currentPrice: live.advertisedPrice,
    };
  });
}

export function formatSavedShareBrief(savedList: SavedDecision[]): string {
  if (!savedList.length) return "Lựa Adviser · Chưa có quyết định nào được lưu.";
  const sections = savedList.slice(0, 20).map((s, idx) => {
    const title = s.groupName?.trim()
      ? `[${idx + 1}] ${s.groupName.trim()}`
      : `[${idx + 1}] Quyết định ngày ${new Date(s.savedAt).toLocaleDateString("vi-VN")}`;
    const budgetText = s.requirements.budget.toLocaleString("vi-VN") + " ₫";
    const itemsText = s.listings
      .map((l) => {
        const price =
          l.advertisedPrice === null
            ? "Chưa rõ giá"
            : l.advertisedPrice.toLocaleString("vi-VN") + " ₫";
        return `  • ${l.name} (${l.source}) — ${price}\n    ${l.url}`;
      })
      .join("\n");
    return `${title}\n  Ngân sách trần: ${budgetText} · Tác vụ: ${s.requirements.tasks.join(", ") || "Chưa chọn"}\n${itemsText}`;
  });
  return `Tóm tắt quyết định chọn máy · Lựa Adviser\n\n${sections.join("\n\n")}\n\nLưu ý: Giá ghi nhận lịch sử; vui lòng kiểm tra tồn kho và tổng thanh toán tại cửa hàng.`;
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
    .sort(
      (a, b) =>
        a.extraVnd! - b.extraVnd! || a.listing.id.localeCompare(b.listing.id),
    )
    .slice(0, limit);
}

export function observationAgeLabel(
  observedAt: string,
  nowMs = Date.now(),
): string {
  const parsed = Date.parse(observedAt);
  if (!Number.isFinite(parsed))
    return "Quan sát lịch sử · chưa xác nhận giá hiện tại";
  const days = Math.max(0, Math.floor((nowMs - parsed) / 86400000));
  if (days === 0) {
    return "Quan sát lịch sử trong ngày · chưa phải giá trực tiếp";
  }
  if (days >= 30) {
    return `Quan sát đã cũ (${days} ngày trước · chưa phải giá trực tiếp, cần kiểm tra lại)`;
  }
  return `Quan sát lịch sử (${days} ngày trước · chưa phải giá trực tiếp)`;
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
        caveats.push(
          `Tác vụ Máy ảo: RAM ${evidence.ram} GB hạn chế khi chạy máy ảo`,
        );
    } else if (
      (r.tasks.includes("Lập trình") ||
        r.tasks.includes("Thiết kế") ||
        r.tasks.includes("Chơi game")) &&
      evidence.ram >= 16
    ) {
      strengths.push(
        `RAM ${evidence.ram} GB đáp ứng mức đa nhiệm thông thường`,
      );
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
  if (
    r.tasks.includes("Thiết kế") &&
    v.screen &&
    /45%\s*ntsc/i.test(v.screen)
  ) {
    caveats.push("Màn hình 45% NTSC hạn chế độ chuẩn màu cho Thiết kế");
  }
  if (evidence.conflicts.length > 0) caveats.push(...evidence.conflicts);
  if (r.tasks.length > 0)
    caveats.push("Chưa có bài đo độc lập cho tác vụ đã chọn");
  return { strengths, caveats };
}

export type ProactiveNudge = {
  signalType: "blind_spot" | "indecision_compare" | "better_value_alternative";
  headline: string;
  detail: string;
  citedListingIds: string[];
  suggestedAction: "compare" | "open_listing";
  mode: string;
};

/** Zero-latency local proactive copilot trigger detector (STT 3.0). */
export function detectLocalProactiveNudge(
  catalog: Catalog,
  requirements: Requirements,
  currentListing: Listing | null,
  recentListingIds: string[],
  compareIds: string[],
): ProactiveNudge | null {
  // 1. Indecision loop: viewed 2-4 distinct models repeatedly without opening compare
  const uniqueRecent = [...new Set(recentListingIds)].filter((id) =>
    catalog.listings.some((x) => x.id === id),
  );
  if (
    !currentListing &&
    recentListingIds.length >= 3 &&
    uniqueRecent.length >= 2 &&
    compareIds.length < 2
  ) {
    const topIds = uniqueRecent.slice(0, MAX_COMPARE_ITEMS);
    return {
      signalType: "indecision_compare",
      headline: `Đang phân vân giữa ${topIds.length} mẫu máy vừa xem?`,
      detail:
        "Đặt tối đa 4 cấu hình lên bảng đối chiếu song song để thấy rõ khác biệt CPU, RAM, SSD và giá.",
      citedListingIds: topIds,
      suggestedAction: "compare",
      mode: "offline_rules_nano",
    };
  }

  if (!currentListing) return null;
  const ev = listingEvidence(currentListing);

  // 2. Better-value in-budget alternative when viewing an over-budget SKU
  if (
    currentListing.advertisedPrice !== null &&
    currentListing.advertisedPrice > requirements.budget
  ) {
    const candidates = searchCatalog(
      catalog,
      requirements,
      "",
      "",
      "fit",
    ).filter(
      (x) =>
        x.assessment.state !== "excluded" &&
        x.listing.id !== currentListing.id &&
        x.listing.advertisedPrice !== null,
    );
    if (candidates.length > 0) {
      const alt = candidates[0].listing;
      const savedVnd =
        currentListing.advertisedPrice - (alt.advertisedPrice ?? 0);
      return {
        signalType: "better_value_alternative",
        headline: "Mẫu đang xem vượt trần ngân sách đã đặt",
        detail: `${alt.name} nằm trong trần (${(alt.advertisedPrice ?? 0).toLocaleString("vi-VN")} ₫, tiết kiệm ${savedVnd.toLocaleString("vi-VN")} ₫) và đáp ứng tiêu chí cứng.`,
        citedListingIds: [currentListing.id, alt.id],
        suggestedAction: "open_listing",
        mode: "offline_rules_nano",
      };
    }
  }

  // 3. Hardware/price blind spots grounded in catalog facts
  if (
    ev.ram !== null &&
    ev.ram <= 8 &&
    requirements.tasks.some((t) =>
      ["Lập trình", "Thiết kế", "Máy ảo", "Chơi game"].includes(t),
    )
  ) {
    const siblings16 = relatedListings(catalog, currentListing).filter((s) => {
      const sev = listingEvidence(s);
      return (
        sev.ram !== null &&
        sev.ram >= 16 &&
        s.advertisedPrice !== null &&
        s.advertisedPrice <= requirements.budget
      );
    });
    return {
      signalType: "blind_spot",
      headline: `Lưu ý điểm mù cấu hình: RAM ${ev.ram} GB cho tác vụ nặng`,
      detail: siblings16[0]
        ? `Phiên bản cùng dòng ${siblings16[0].name} có RAM ${listingEvidence(siblings16[0]).ram} GB trong ngân sách (${siblings16[0].advertisedPrice!.toLocaleString("vi-VN")} ₫).`
        : `RAM ${ev.ram} GB dễ chạm trần bộ nhớ khi mở IDE/đồ họa; nên cân nhắc bản ≥ 16 GB.`,
      citedListingIds: siblings16[0]
        ? [currentListing.id, siblings16[0].id]
        : [currentListing.id],
      suggestedAction: siblings16[0] ? "compare" : "open_listing",
      mode: "offline_rules_nano",
    };
  }

  if (currentListing.advertisedPrice !== null) {
    const cheaperSameSpec = relatedListings(catalog, currentListing).find(
      (s) => {
        const sev = listingEvidence(s);
        return (
          sev.ram === ev.ram &&
          sev.storage === ev.storage &&
          s.advertisedPrice !== null &&
          currentListing.advertisedPrice! > s.advertisedPrice * 1.15
        );
      },
    );
    if (cheaperSameSpec) {
      return {
        signalType: "blind_spot",
        headline: "Có nơi bán cùng dòng cấu hình thấp hơn > 15%",
        detail: `${cheaperSameSpec.name} (${cheaperSameSpec.source}) ghi nhận mức ${cheaperSameSpec.advertisedPrice!.toLocaleString("vi-VN")} ₫ — đối chiếu ngay trước khi mua.`,
        citedListingIds: [currentListing.id, cheaperSameSpec.id],
        suggestedAction: "compare",
        mode: "offline_rules_nano",
      };
    }
  }

  return null;
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

function optionalNonNegInt(
  raw: string | undefined,
  max: number,
): number | null | "invalid" {
  const s = (raw ?? "").trim();
  if (!s) return null;
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(s)) return "invalid";
  const digits = s.replace(/\./g, "");
  const n = Number(digits);
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
