export const EXPRESSIVE_LIGHT = {
  bg: "#f3f6ee",
  card: "#ffffff",
  container: "#dcebdd",
  text: "#193127",
  muted: "#50675b",
  accent: "#245f43",
  onAccent: "#ffffff",
  line: "#687d70",
  error: "#a32932",
  onContainer: "#173c27",
};
export const EXPRESSIVE_DARK = {
  bg: "#101b18",
  card: "#1d2d27",
  container: "#304e3b",
  text: "#e3eee7",
  muted: "#a5b9ac",
  accent: "#9ed6b1",
  onAccent: "#163323",
  line: "#8ba394",
  error: "#ffb3b9",
  onContainer: "#d2f0da",
};
export type ExpressiveColors = typeof EXPRESSIVE_LIGHT;
export const EXPRESSIVE_SHAPE = {
  card: 28,
  hero: 36,
  button: 24,
  selected: 16,
  field: 14,
  dialog: 28,
};
export const EXPRESSIVE_SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
export const EXPRESSIVE_TYPE = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "900" as const },
  headline: { fontSize: 28, lineHeight: 36, fontWeight: "800" as const },
  title: { fontSize: 22, lineHeight: 30, fontWeight: "800" as const },
  section: { fontSize: 20, lineHeight: 28, fontWeight: "800" as const },
  body: { fontSize: 16, lineHeight: 25, fontWeight: "400" as const },
  label: { fontSize: 15, lineHeight: 22, fontWeight: "700" as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
};
export const EXPRESSIVE_ELEVATION = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
};
// Material expressive fast spatial: k=800, damping ratio=.6, mass=1.
// RN Animated uses damping coefficient c=2*zeta*sqrt(k*m).
export const EXPRESSIVE_SPRING = {
  stiffness: 800,
  damping: 33.9411255,
  mass: 1,
};
