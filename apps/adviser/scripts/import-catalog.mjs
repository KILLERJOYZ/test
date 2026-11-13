import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { validCatalog } from "../src/catalog.ts";
export function importCatalog(raw) {
  if (!raw || !Array.isArray(raw.products)) throw Error("INVALID_FEED");
  const hash = (x) =>
    crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
  const quantity = (s, storage = false) => {
    if (typeof s !== "string") return null;
    const m = s.match(/(\d+(?:\.\d+)?)\s*(GB|TB)/i);
    if (!m) return null;
    const n =
      Number(m[1]) * (storage && m[2].toUpperCase() === "TB" ? 1024 : 1);
    return Number.isSafeInteger(n) ? n : null;
  };
  const listings = raw.products.map((v) => ({
    id: `${v.source}:${v.id}`,
    name: v.name,
    source: v.source,
    url: v.url,
    condition: ["new", "used"].includes(v.condition) ? v.condition : "unknown",
    observedAt: v.metadata?.crawledAt,
    ram: quantity(v.specs?.ram),
    storage: quantity(v.specs?.storage, true),
    cpu: v.specs?.cpu ?? null,
    os: v.specs?.os ?? null,
    screen: v.specs?.screen ?? null,
    weight: v.specs?.weight ?? null,
    advertisedPrice:
      Number.isSafeInteger(v.pricing?.current) && v.pricing.current > 0
        ? v.pricing.current
        : null,
    shipping: null,
    fees: null,
    stock: "unknown",
    identity: "unreviewed",
    rawHash: hash(v),
  }));
  const result = {
    schemaVersion: 1,
    revision: hash(listings),
    importedAt: raw.generatedAt,
    listings,
  };
  if (!validCatalog(result)) throw Error("INVALID_IMPORTED_CATALOG");
  return result;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raw = JSON.parse(
    fs.readFileSync(
      new URL("../../../data/all_laptops_normalized.json", import.meta.url),
      "utf8",
    ),
  );
  const result = importCatalog(raw);
  fs.writeFileSync(
    new URL("../src/real-catalog.json", import.meta.url),
    JSON.stringify(result, null, 2),
  );
  console.log(
    `Imported ${result.listings.length} dated real listings; revision ${result.revision}`,
  );
}
