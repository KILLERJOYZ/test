import AsyncStorage from "@react-native-async-storage/async-storage";

export const SHARED_SETTINGS_KEY = "lua-adviser-shared-settings";

export type SharedConnectionSettings = {
  endpoint: string;
  token: string;
  updatedAt: string;
};

type Listener = (settings: SharedConnectionSettings) => void;
const listeners = new Set<Listener>();

export async function loadSharedSettings(): Promise<SharedConnectionSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(SHARED_SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.endpoint !== "string" ||
      typeof parsed.token !== "string"
    ) {
      return null;
    }
    return {
      endpoint: parsed.endpoint,
      token: parsed.token,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveSharedSettings(
  endpoint: string,
  token: string,
): Promise<SharedConnectionSettings> {
  const next: SharedConnectionSettings = {
    endpoint: endpoint.trim(),
    token,
    updatedAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(SHARED_SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Storage adapter in lightweight tests may omit removeItem/setItem
  }
  for (const listener of listeners) {
    try {
      listener(next);
    } catch {
      // Ignore subscriber error
    }
  }
  return next;
}

export function subscribeSharedSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

