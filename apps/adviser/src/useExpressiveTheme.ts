import { useEffect, useState } from "react";
import { AppState, NativeModules } from "react-native";
import { EXPRESSIVE_DARK, EXPRESSIVE_LIGHT } from "./expressive-theme";
import type { ExpressiveColors } from "./expressive-theme";
import { validTheme } from "./theme-validation";
export function useExpressiveTheme(dark: boolean) {
  const fallback = dark ? EXPRESSIVE_DARK : EXPRESSIVE_LIGHT;
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
  return dynamic?.dark === dark ? dynamic.colors : fallback;
}
