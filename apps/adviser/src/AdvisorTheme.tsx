import React, { createContext, useContext, useEffect, useState } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { useExpressiveTheme } from "./useExpressiveTheme";
import { EXPRESSIVE_LIGHT, type ExpressiveColors } from "./expressive-theme";
const Context = createContext({
  colors: EXPRESSIVE_LIGHT,
  reduceMotion: true,
  dark: false,
});
export function AdvisorTheme({ children }: { children: React.ReactNode }) {
  const dark = useColorScheme() === "dark";
  const colors = useExpressiveTheme(dark);
  const [reduceMotion, setReduceMotion] = useState(true);
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
    <Context.Provider value={{ colors, reduceMotion, dark }}>
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
