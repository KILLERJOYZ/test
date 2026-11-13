import * as SQLite from "expo-sqlite";
import { referenceSeed, type Reference } from "./reference";
import {
  validateReferenceBundle,
  type CatalogBundle,
} from "./catalog-contract";
import schema from "./reference-schema.json";
let loading: Promise<Reference[]> | undefined;
export const referenceStorageKind = "SQLite · catalog có phiên bản";
async function database() {
  const db = await SQLite.openDatabaseAsync("lua-reference.db");
  await db.execAsync(
    schema.sql +
      " CREATE TABLE IF NOT EXISTS reference_snapshot(version TEXT PRIMARY KEY,payload TEXT NOT NULL);",
  );
  return db;
}
export function loadReferences(): Promise<Reference[]> {
  if (!loading)
    loading = load().catch((e) => {
      loading = undefined;
      throw e;
    });
  return loading;
}
async function load() {
  const db = await database();
  let meta = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM reference_meta WHERE key=?",
    "version",
  );
  const bundled = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM reference_meta WHERE key=?",
    "bundledVersion",
  );
  const knownBundled = [
    "dea729f33a3e087a",
    "472cc87d5c7918d8",
    "9d2055abff9bcf99",
  ];
  if (
    !meta ||
    (meta.value !== referenceSeed.version &&
      (meta.value === bundled?.value ||
        (!bundled && knownBundled.includes(meta.value))))
  ) {
    await activateReferences({
      schemaVersion: 1,
      market: "VN",
      catalogVersion: referenceSeed.version,
      rows: referenceSeed.rows,
    });
    meta = { value: referenceSeed.version };
  }
  await db.runAsync(
    "INSERT OR REPLACE INTO reference_meta(key,value) VALUES (?,?)",
    "bundledVersion",
    referenceSeed.version,
  );
  const rows = await db.getAllAsync<{ raw_json: string }>(
    "SELECT raw_json FROM reference_listing ORDER BY id",
  );
  return rows.map((r) => ({
    ...JSON.parse(r.raw_json),
    catalogVersion: meta!.value,
  }));
}
export async function activateReferences(value: unknown) {
  const b = validateReferenceBundle(value);
  const db = await database();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync("PRAGMA foreign_keys=ON;");
    const old = await tx.getFirstAsync<{ value: string }>(
      "SELECT value FROM reference_meta WHERE key=?",
      "version",
    );
    if (old?.value === b.catalogVersion) return;
    if (old) {
      const rows = await tx.getAllAsync<{ raw_json: string }>(
        "SELECT raw_json FROM reference_listing ORDER BY id",
      );
      const previous: CatalogBundle = {
        schemaVersion: 1,
        market: "VN",
        catalogVersion: old.value,
        rows: rows.map((r) => JSON.parse(r.raw_json)),
      };
      await tx.runAsync(
        "INSERT OR REPLACE INTO reference_snapshot(version,payload) VALUES (?,?)",
        old.value,
        JSON.stringify(previous),
      );
      await tx.runAsync(
        "INSERT OR REPLACE INTO reference_meta(key,value) VALUES (?,?)",
        "previous",
        old.value,
      );
    }
    await tx.execAsync(
      "DELETE FROM reference_fact; DELETE FROM reference_offer; DELETE FROM reference_listing; DELETE FROM reference_source;",
    );
    for (const source of [...new Set(b.rows.map((r) => r.source))])
      await tx.runAsync("INSERT INTO reference_source(id) VALUES (?)", source);
    for (const r of b.rows) {
      await tx.runAsync(
        "INSERT INTO reference_listing(id,source_id,name,condition,raw_json) VALUES (?,?,?,?,?)",
        r.id,
        r.source,
        r.name,
        r.condition,
        JSON.stringify(r),
      );
      await tx.runAsync(
        "INSERT INTO reference_offer(listing_id,price_vnd,observed_at,url) VALUES (?,?,?,?)",
        r.id,
        r.price,
        r.observedAt,
        r.url,
      );
      for (const [key, value] of Object.entries(r.specs))
        if (value !== null)
          await tx.runAsync(
            "INSERT INTO reference_fact(listing_id,key,value_json) VALUES (?,?,?)",
            r.id,
            key,
            JSON.stringify(value),
          );
    }
    await tx.runAsync(
      "INSERT OR REPLACE INTO reference_meta(key,value) VALUES (?,?)",
      "version",
      b.catalogVersion,
    );
    await tx.runAsync(
      "DELETE FROM reference_snapshot WHERE version != (SELECT value FROM reference_meta WHERE key=?)",
      "previous",
    );
  });
  loading = undefined;
}
export async function rollbackReferences() {
  const db = await database();
  const p = await db.getFirstAsync<{ payload: string }>(
    "SELECT payload FROM reference_snapshot WHERE version=(SELECT value FROM reference_meta WHERE key=?)",
    "previous",
  );
  if (!p) throw Error("Chưa có snapshot trước để khôi phục.");
  await activateReferences(JSON.parse(p.payload));
}
