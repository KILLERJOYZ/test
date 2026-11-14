import { Text } from "react-native";

export function Icon({
  name,
  size = 20,
  color = "#214c40",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const glyphs: Record<string, string> = {
    right: "→",
    left: "←",
    up: "↗",
    x: "×",
    check: "✓",
    plus: "+",
    bookmark: "◇",
    compare: "⇄",
    search: "⌕",
    down: "⌄",
    more: "···",
    sparkles: "✦",
    store: "⌂",
    swap: "⇄",
    cpu: "⊞",
    tag: "◈",
  };
  return (
    <Text accessible={false} style={{ fontSize: size, color }}>
      {glyphs[name] || "◈"}
    </Text>
  );
}
