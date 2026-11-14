import { referenceSeed } from "./reference";
import { storage } from "./demo-storage.web";
import { validateReferenceBundle } from "./catalog-contract";
export const referenceStorageKind = "Bản xem trước · dữ liệu xuất SQLite";
const KEY = "advisor-catalog-web-v1";
export async function loadReferences() {
  const raw = await storage.getItem(KEY);
  const b = raw
    ? validateReferenceBundle(JSON.parse(raw))
    : { catalogVersion: referenceSeed.version, rows: referenceSeed.rows };
  return b.rows.map((r) => ({ ...r, catalogVersion: b.catalogVersion }));
}
export async function activateReferences(value: unknown) {
  const b = validateReferenceBundle(value);
  const old =
    (await storage.getItem(KEY)) ??
    JSON.stringify({
      schemaVersion: 1,
      market: "VN",
      catalogVersion: referenceSeed.version,
      rows: referenceSeed.rows,
    });
  if (old) await storage.setItem(KEY + "-previous", old);
  await storage.setItem(KEY, JSON.stringify(b));
}
export async function rollbackReferences() {
  const old = await storage.getItem(KEY + "-previous");
  if (!old) throw Error("Chưa có bản trước.");
  await activateReferences(JSON.parse(old));
}
