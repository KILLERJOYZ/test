import type { Reference } from "./reference.ts";
export type CatalogBundle = {
  schemaVersion: 1;
  market: "VN";
  catalogVersion: string;
  rows: Reference[];
};
const hosts: Record<string, string> = {
  apple: "www.apple.com",
  samsung: "samsungmobilepress.com",
  cellphones: "cellphones.com.vn",
  thegioididong: "www.thegioididong.com",
  dienmayxanh: "www.dienmayxanh.com",
  fptshop: "fptshop.com.vn",
};
export function validateReferenceBundle(value: unknown): CatalogBundle {
  const b = value as CatalogBundle;
  if (
    !b ||
    b.schemaVersion !== 1 ||
    b.market !== "VN" ||
    typeof b.catalogVersion !== "string" ||
    !/^[a-zA-Z0-9._-]{1,80}$/.test(b.catalogVersion) ||
    !Array.isArray(b.rows) ||
    b.rows.length < 1 ||
    b.rows.length > 5000
  )
    throw Error("Catalog không tương thích.");
  const ids = new Set<string>();
  for (const r of b.rows) {
    if (
      !r ||
      typeof r.id !== "string" ||
      !r.id ||
      r.id.length > 200 ||
      ids.has(r.id) ||
      typeof r.name !== "string" ||
      !r.name ||
      r.name.length > 500 ||
      !r.specs ||
      typeof r.specs !== "object" ||
      Array.isArray(r.specs)
    )
      throw Error("Định danh hoặc thông số không hợp lệ.");
    ids.add(r.id);
    if (
      !["phone", "tablet", "laptop", "desktop"].includes(
        r.category ?? "laptop",
      ) ||
      !["new", "used", "refurbished", "unknown"].includes(r.condition)
    )
      throw Error("Loại máy hoặc tình trạng không hợp lệ.");
    if (r.price !== null && (!Number.isSafeInteger(r.price) || r.price <= 0))
      throw Error("Giá không hợp lệ.");
    for (const n of [r.ramGiB, r.storageGiB, r.weightKg])
      if (n !== null && (!Number.isFinite(n) || n <= 0))
        throw Error("Đơn vị/thông số không hợp lệ.");
    if (!Number.isFinite(Date.parse(r.observedAt)))
      throw Error("Thời điểm quan sát không hợp lệ.");
    const u = new URL(r.url);
    if (
      u.protocol !== "https:" ||
      u.hostname !== hosts[r.source] ||
      u.username ||
      u.password
    )
      throw Error("Nguồn không được chấp nhận.");
  }
  return b;
}
export type Manifest = {
  schemaVersion: 1;
  market: "VN";
  catalogVersion: string;
  minAppVersion: number;
  bytes: number;
  sha256: string;
};
export function validateManifest(value: unknown): Manifest {
  const m = value as Manifest;
  if (
    !m ||
    m.schemaVersion !== 1 ||
    m.market !== "VN" ||
    !Number.isInteger(m.minAppVersion) ||
    m.minAppVersion < 1 ||
    m.minAppVersion > 1 ||
    !Number.isSafeInteger(m.bytes) ||
    m.bytes <= 0 ||
    m.bytes > 3000000 ||
    !/^[a-f0-9]{64}$/.test(m.sha256) ||
    !/^[a-zA-Z0-9._-]{1,80}$/.test(m.catalogVersion)
  )
    throw Error("Manifest không tương thích.");
  return m;
}
