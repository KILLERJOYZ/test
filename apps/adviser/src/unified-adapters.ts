import { listingEvidence } from "./listing-evidence.ts";
import {
  safeLink,
  validSaved,
  validRequirements,
  type Listing,
  type Requirements,
} from "./catalog.ts";
import type { Reference } from "./reference.ts";
import { EMPTY_NEEDS, validStoredNeeds, type Needs } from "./picker.ts";
import {
  validateRestoredProfile,
  newProfile,
  bands,
  OS_OPTIONS,
} from "./device-profile.ts";
export function connectedDraft(raw: string | null) {
  if (!raw) return null;
  const old = JSON.parse(raw);
  if (!validRequirements(old.requirements))
    throw Error("Yêu cầu cũ không hợp lệ; bản gốc được giữ.");
  const r = old.requirements as Requirements;
  return {
    ...newProfile(),
    category: "PC" as const,
    ceilingVnd: r.budget,
    bandId:
      bands("PC").find(
        (b) => r.budget >= b.min && (b.max === null || r.budget < b.max),
      )?.id ?? null,
    minimumRamGiB: r.minRam || null,
    minimumStorageGiB: r.minStorage || null,
    os: OS_OPTIONS.PC.includes(r.os) ? r.os : null,
    osMandatory: OS_OPTIONS.PC.includes(r.os),
    confirmed: false,
  };
}
export function listingReference(v: Listing): Reference {
  const evidence = listingEvidence(v);
  return {
    id: v.id,
    name: v.name,
    brand: v.brand ?? "",
    source: v.source,
    url: v.url,
    condition: v.condition,
    availability: "unknown",
    price: v.advertisedPrice,
    ramGiB: evidence.ram,
    storageGiB: evidence.storage,
    weightKg: null,
    observedAt: v.observedAt,
    category: "laptop",
    shipping: v.shipping,
    fees: v.fees,
    specs: {
      ram: evidence.ram,
      storage: evidence.storage,
      cpu: v.cpu,
      os: v.os,
      screen: v.screen,
      gpu: v.gpu ?? null,
    },
  };
}
export type UnifiedSaved = {
  id: string;
  row: Reference;
  needs: Needs;
  date: string;
  legacyRequirements?: Requirements;
  recommendationSnapshot?: unknown;
};
export function validUnifiedSaved(value: unknown): value is UnifiedSaved {
  const x = value as UnifiedSaved;
  if (
    !x ||
    typeof x.id !== "string" ||
    !x.id ||
    !x.row ||
    typeof x.row.name !== "string" ||
    typeof x.row.id !== "string" ||
    !x.row.specs ||
    typeof x.row.specs !== "object" ||
    typeof x.row.source !== "string" ||
    !safeLink(x.row.url) ||
    !Number.isFinite(Date.parse(x.row.observedAt)) ||
    !Number.isFinite(Date.parse(x.date)) ||
    !validStoredNeeds(x.needs)
  )
    return false;
  for (const n of [x.row.price, x.row.ramGiB, x.row.storageGiB, x.row.weightKg])
    if (n !== null && (!Number.isFinite(n) || n <= 0)) return false;
  if (x.needs.deviceProfile) {
    try {
      validateRestoredProfile(x.needs.deviceProfile);
    } catch {
      return false;
    }
  }
  return true;
}
export function importConnectedHistory(raw: string | null): UnifiedSaved[] {
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value.saved) || !value.saved.every(validSaved))
    throw Error("Lịch sử cũ không hợp lệ. Dữ liệu gốc được giữ.");
  return value.saved.flatMap((decision: import("./catalog.ts").SavedDecision) =>
    decision.listings.map((listing, i) => ({
      id: `connected:${decision.id}:${i}`,
      row: {
        ...listingReference(listing),
        catalogVersion: decision.catalogRevision,
      },
      needs: { ...EMPTY_NEEDS, budget: decision.requirements.budget },
      date: decision.savedAt,
      legacyRequirements: decision.requirements,
    })),
  );
}
