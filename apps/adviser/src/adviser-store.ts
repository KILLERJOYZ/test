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
export function validState(x: any): x is AdviserState {
  return (
    !!x &&
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
          const restored = JSON.parse(raw);
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
