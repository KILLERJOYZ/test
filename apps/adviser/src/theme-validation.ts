import { EXPRESSIVE_LIGHT } from "./expressive-theme.ts";
export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = hex
      .slice(1)
      .match(/../g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function validTheme(value: unknown): value is typeof EXPRESSIVE_LIGHT {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, string>;
  if (
    !Object.keys(EXPRESSIVE_LIGHT).every(
      (k) => typeof c[k] === "string" && /^#[0-9a-f]{6}$/i.test(c[k]),
    )
  )
    return false;
  return (
    [
      ["text", "bg"],
      ["text", "card"],
      ["muted", "bg"],
      ["muted", "card"],
      ["onAccent", "accent"],
      ["onContainer", "container"],
    ].every(([a, b]) => contrast(c[a], c[b]) >= 4.5) &&
    ["bg", "card"].every((b) => contrast(c.line, c[b]) >= 3)
  );
}
