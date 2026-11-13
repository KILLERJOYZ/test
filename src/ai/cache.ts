import type { NudgeResult } from "./schemas/nudge.js";

export interface NudgeCacheEntry {
  value: NudgeResult;
  expires_at: number;
}

export interface NudgeCache {
  get(key: string): NudgeCacheEntry | undefined;
  set(key: string, entry: NudgeCacheEntry): void;
  delete(key: string): void;
  clear(): void;
}

/** In-memory default. Production can pass Redis or another shared cache. */
export function createMemoryNudgeCache(): NudgeCache {
  const store = new Map<string, NudgeCacheEntry>();
  return {
    get(key: string): NudgeCacheEntry | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expires_at <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry;
    },
    set(key: string, entry: NudgeCacheEntry): void {
      store.set(key, entry);
    },
    delete(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  };
}
