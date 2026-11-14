import type { Listing } from "./catalog.ts";

export type EvidenceResult = {
  ram: number | null;
  storage: number | null;
  conflicts: string[];
};

const evidenceCache = new Map<string, EvidenceResult>();

function parseTitleSpecs(name: string): {
  titleRam: number | null;
  titleStorage: number | null;
} {
  // Strip discrete GPU VRAM mentions (e.g., "RTX 4050 6GB", "RTX 4060 8GB") so VRAM is never mistaken for system RAM
  const cleaned = name.replace(
    /\b(?:RTX|GTX|RX|Radeon|GeForce|Arc|VRAM)\s*[A-Za-z0-9-]*\s*\d+\s*GB\b/gi,
    " ",
  );
  const pair = cleaned.match(
    /(\d+)\s*GB\s*(?:[,/|+-]|\s+SSD\s*|\s+ROM\s*)\s*(\d+)\s*(GB|TB)/i,
  );
  if (pair) {
    return {
      titleRam: Number(pair[1]),
      titleStorage:
        Number(pair[2]) * (pair[3].toUpperCase() === "TB" ? 1024 : 1),
    };
  }
  const explicitRam = cleaned.match(/\bRAM\s*(\d+)\s*GB\b/i);
  const explicitStorage = cleaned.match(
    /\b(?:SSD|Ổ\s*cứng|ROM)\s*(\d+)\s*(GB|TB)\b/i,
  );
  return {
    titleRam: explicitRam ? Number(explicitRam[1]) : null,
    titleStorage: explicitStorage
      ? Number(explicitStorage[1]) *
        (explicitStorage[2].toUpperCase() === "TB" ? 1024 : 1)
      : null,
  };
}

/** Detect explicit title/structured disagreements, without choosing either source. Memoized for 5,000-SKU scale. */
export function listingEvidence(
  v: Pick<Listing, "name" | "ram" | "storage">,
): EvidenceResult {
  const cacheKey = `${v.name}\u0000${v.ram ?? ""}\u0000${v.storage ?? ""}`;
  const cached = evidenceCache.get(cacheKey);
  if (cached) return cached;

  const { titleRam, titleStorage } = parseTitleSpecs(v.name);
  const conflicts: string[] = [];
  const ramConflict =
    titleRam !== null && v.ram !== null && titleRam !== v.ram;
  const storageConflict =
    titleStorage !== null && v.storage !== null && titleStorage !== v.storage;
  if (ramConflict)
    conflicts.push(
      `RAM mâu thuẫn: tiêu đề ${titleRam} GB, dữ liệu ${v.ram} GB`,
    );
  if (storageConflict)
    conflicts.push(
      `Ổ lưu trữ mâu thuẫn: tiêu đề ${titleStorage} GB, dữ liệu ${v.storage} GB`,
    );
  const result: EvidenceResult = {
    ram: ramConflict ? null : v.ram,
    storage: storageConflict ? null : v.storage,
    conflicts,
  };
  if (evidenceCache.size > 6000) evidenceCache.clear();
  evidenceCache.set(cacheKey, result);
  return result;
}

export function specification(v: Listing) {
  const e = listingEvidence(v);
  return `RAM: ${e.ram === null ? "chưa xác minh" : e.ram + " GB"} · ổ: ${e.storage === null ? "chưa xác minh" : e.storage + " GB"}`;
}

function compactSpec(text: string | null | undefined, fallback: string, maxLen = 28): string {
  if (!text || !text.trim()) return fallback;
  const firstClause = text
    .split(/[,;(•]/)[0]
    .replace(/\s+/g, " ")
    .trim();
  if (!firstClause) return fallback;
  return firstClause.length > maxLen
    ? firstClause.slice(0, maxLen - 1).trimEnd() + "…"
    : firstClause;
}

/** Distinct 4-pill hardware summary for product cards (UI-02, UI-13). */
export function specChips(v: Listing): {
  cpu: string;
  gpu: string;
  ram: string;
  ssd: string;
} {
  const e = listingEvidence(v);
  const ssdLabel =
    e.storage === null
      ? "Chưa rõ"
      : e.storage >= 1024 && e.storage % 1024 === 0
        ? `${e.storage / 1024} TB SSD`
        : `${e.storage} GB SSD`;
  return {
    cpu: compactSpec(v.cpu, "CPU chưa rõ", 30),
    gpu: compactSpec(v.gpu, "GPU tích hợp / chưa rõ", 28),
    ram: e.ram === null ? "RAM chưa rõ" : `${e.ram} GB RAM`,
    ssd: ssdLabel,
  };
}
