import React from "react";
import Svg, { Path } from "react-native-svg";
const paths: Record<string, string> = {
  advisor: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  explore: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6",
  compare: "M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4",
  saved: "M5 3h14v19l-7-5-7 5z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 2h6l1 4 4 1 2 5-2 5-4 1-1 4H9l-1-4-4-1-2-5 2-5 4-1z",
};
export function NavigationIcon({
  name,
  color,
}: {
  name: string;
  color: string;
}) {
  return (
    <Svg accessible={false} width={22} height={22} viewBox="0 0 24 24">
      <Path
        d={paths[name] ?? paths.advisor}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
