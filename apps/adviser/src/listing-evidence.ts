import type { Listing } from "./catalog.ts";

/** Detect explicit title/structured disagreements, without choosing either source. */
export function listingEvidence(v: Listing) {
  const pair = v.name.match(/(\d+)\s*GB\s*[,/]\s*(\d+)\s*(GB|TB)/i);
  const titleRam = pair ? Number(pair[1]) : null;
  const titleStorage = pair
    ? Number(pair[2]) * (pair[3].toUpperCase() === "TB" ? 1024 : 1)
    : null;
  const conflicts: string[] = [];
  const ramConflict = titleRam !== null && v.ram !== null && titleRam !== v.ram;
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
  return {
    ram: ramConflict ? null : v.ram,
    storage: storageConflict ? null : v.storage,
    conflicts,
  };
}
export function specification(v: Listing) {
  const e = listingEvidence(v);
  return `RAM: ${e.ram === null ? "chưa xác minh" : e.ram + " GB"} · ổ: ${e.storage === null ? "chưa xác minh" : e.storage + " GB"}`;
}
