import { useEffect, useMemo, useState } from "react";
import { AppState, NativeModules, Platform } from "react-native";
import { EXPRESSIVE_DARK, EXPRESSIVE_LIGHT } from "./expressive-theme";
import type { ExpressiveColors } from "./expressive-theme";
import { validTheme } from "./theme-validation";

/* ---------- Material You via @pchmn/expo-material3-theme ---------- */

let useMaterial3ThemeHook: typeof import("@pchmn/expo-material3-theme").useMaterial3Theme | null =
  null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m3 = require("@pchmn/expo-material3-theme");
  useMaterial3ThemeHook = m3.useMaterial3Theme;
} catch {
  /* library not installed or web — fall through */
}

/** Forest-green seed matching the static EXPRESSIVE palette. */
const SEED_COLOR = "#245f43";

/**
 * Map a Material 3 color scheme to the 11-token ExpressiveColors contract.
 *
 * The mapping preserves the semantic roles used everywhere in the app while
 * letting Material You dynamic colors flow through.
 */
function mapM3ToExpressive(
  scheme: Record<string, unknown>,
): ExpressiveColors | null {
  if (!scheme || typeof scheme !== "object") return null;
  const s = scheme as Record<string, string>;
  const mapped: ExpressiveColors = {
    bg: s.background ?? s.surface,
    card: s.surface ?? s.background,
    container: s.secondaryContainer,
    text: s.onBackground ?? s.onSurface,
    muted: s.onSurfaceVariant,
    accent: s.primary,
    onAccent: s.onPrimary,
    line: s.outlineVariant ?? s.outline,
    error: s.error,
    onContainer: s.onSecondaryContainer,
  };
  return mapped;
}

/* ---------- Legacy native-module path (AdviserThemeModule.kt) ---------- */

function useLegacyNativeTheme(dark: boolean): ExpressiveColors | null {
  const [dynamic, setDynamic] = useState<{
    dark: boolean;
    colors: ExpressiveColors;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (!NativeModules.AdviserTheme?.scheme) return;
      void NativeModules.AdviserTheme.scheme(dark)
        .then((colors: unknown) => {
          if (active) setDynamic(validTheme(colors) ? { dark, colors } : null);
        })
        .catch(() => {
          if (active) setDynamic(null);
        });
    };
    refresh();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, [dark]);

  return dynamic?.dark === dark ? dynamic.colors : null;
}

/* ---------- Public hook ---------- */

export function useExpressiveTheme(dark: boolean): ExpressiveColors {
  const fallback = dark ? EXPRESSIVE_DARK : EXPRESSIVE_LIGHT;

  /*
   * Strategy (ordered by preference):
   * 1. @pchmn/expo-material3-theme → full Material You palette from wallpaper
   * 2. Legacy AdviserThemeModule.kt → existing native extraction (Android 12+)
   * 3. Static EXPRESSIVE_LIGHT / EXPRESSIVE_DARK fallback
   *
   * Each candidate is validated through the WCAG contrast gate.
   */

  // --- Path 1: expo-material3-theme ---
  const m3Result = useMaterial3ThemeHook?.({
    fallbackSourceColor: SEED_COLOR,
  });
  const m3Colors = useMemo(() => {
    if (!m3Result) return null;
    const scheme = dark ? m3Result.theme.dark : m3Result.theme.light;
    return mapM3ToExpressive(scheme as unknown as Record<string, unknown>);
  }, [m3Result, dark]);

  // --- Path 2: legacy native module ---
  const legacyColors = useLegacyNativeTheme(dark);

  // --- Resolve ---
  if (m3Colors && validTheme(m3Colors)) return m3Colors;
  if (legacyColors) return legacyColors; // already validated
  return fallback;
}
