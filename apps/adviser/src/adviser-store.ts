import { validCatalog, validRequirements, validSaved } from "./catalog.ts";
import type { Catalog, Requirements, SavedDecision } from "./catalog.ts";

export type AdviserState = {
  schemaVersion: 1;
  requirements: Requirements;
  revision: number;
  saved: SavedDecision[];
  catalog: Catalog;
  endpoint: string;
  token: string;
};

const ALLOWED_STATE_KEYS = new Set([
  "schemaVersion",
  "requirements",
  "revision",
  "saved",
  "catalog",
  "endpoint",
  "token",
]);

/** Migrate legacy schema payloads while rejecting unknown or malformed state shapes (F-25). */
export function migrateAdviserState(raw: unknown, fallbackCatalog: Catalog): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (obj.schemaVersion === 0) {
    return {
      schemaVersion: 1,
      requirements: obj.requirements,
      revision: typeof obj.revision === "number" ? obj.revision : 0,
      saved: Array.isArray(obj.saved) ? obj.saved : [],
      catalog: validCatalog(obj.catalog) ? obj.catalog : fallbackCatalog,
      endpoint: typeof obj.endpoint === "string" ? obj.endpoint : "",
      token: typeof obj.token === "string" ? obj.token : "",
    };
  }
  return obj;
}

export function validState(x: any): x is AdviserState {
  return (
    !!x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    Object.keys(x).every((k) => ALLOWED_STATE_KEYS.has(k)) &&
    x.schemaVersion === 1 &&
    validRequirements(x.requirements) &&
    Number.isSafeInteger(x.revision) &&
    x.revision >= 0 &&
    Array.isArray(x.saved) &&
    x.saved.length <= 1000 &&
    x.saved.every(validSaved) &&
    new Set(x.saved.map((v: any) => v.id)).size === x.saved.length &&
    validCatalog(x.catalog) &&
    typeof x.endpoint === "string" &&
    typeof x.token === "string"
  );
}

export function createAdviserStore(
  initial: AdviserState,
  read: () => Promise<string | null>,
  write: (raw: string) => Promise<void>,
  changed: (s: AdviserState) => void,
) {
  let state = initial,
    ready = false,
    tail = Promise.resolve();
  return {
    current: () => state,
    ready: () => ready,
    async load() {
      try {
        const raw = await read();
        if (raw) {
          const parsed = JSON.parse(raw);
          const restored = migrateAdviserState(parsed, initial.catalog);
          if (!validState(restored)) throw Error("CORRUPT_STORAGE");
          state = restored;
        }
        ready = true;
        changed(state);
        return true;
      } catch {
        ready = false;
        return false;
      }
    },
    update(reduce: (s: AdviserState) => AdviserState, recovery = false) {
      const result = tail.then(async () => {
        if (!ready && !recovery) return false;
        try {
          const next = reduce(state);
          if (!validState(next)) throw Error("INVALID_STATE");
          await write(JSON.stringify(next));
          state = next;
          ready = true;
          changed(state);
          return true;
        } catch {
          return false;
        }
      });
      tail = result.then(() => {});
      return result;
    },
  };
}
