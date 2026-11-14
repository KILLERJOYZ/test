import React, { createContext, useContext, useEffect, useState } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { useExpressiveTheme } from "./useExpressiveTheme";
import { EXPRESSIVE_LIGHT, type ExpressiveColors } from "./expressive-theme";

interface AdvisorThemeValue {
  colors: ExpressiveColors;
  reduceMotion: boolean;
  dark: boolean;
  /** true when colors come from Material You (wallpaper-derived). */
  isMaterialYou: boolean;
}

const Context = createContext<AdvisorThemeValue>({
  colors: EXPRESSIVE_LIGHT,
  reduceMotion: true,
  dark: false,
  isMaterialYou: false,
});

export function AdvisorTheme({ children }: { children: React.ReactNode }) {
  const dark = useColorScheme() === "dark";
  const colors = useExpressiveTheme(dark);
  const [reduceMotion, setReduceMotion] = useState(true);

  /* Detect whether Material You is active by comparing against static fallback. */
  const staticFallback = dark ? EXPRESSIVE_LIGHT : EXPRESSIVE_LIGHT; // same ref
  const isMaterialYou = colors.accent !== EXPRESSIVE_LIGHT.accent && colors.accent !== "#245f43";

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (active) setReduceMotion(v);
    });
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      listener.remove();
    };
  }, []);

  return (
    <Context.Provider value={{ colors, reduceMotion, dark, isMaterialYou }}>
      {children}
    </Context.Provider>
  );
}

export function useAdvisorTheme() {
  return useContext(Context);
}

export function legacyPalette(c: ExpressiveColors) {
  return {
    bg: c.bg,
    surface: c.card,
    container: c.container,
    primary: c.accent,
    onPrimary: c.onAccent,
    secondary: c.container,
    onSecondary: c.onContainer,
    text: c.text,
    muted: c.muted,
    line: c.line,
    error: c.error,
    success: c.accent,
  };
}
