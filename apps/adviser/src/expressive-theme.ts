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
};
// Material expressive fast spatial: k=800, damping ratio=.6, mass=1.
// RN Animated uses damping coefficient c=2*zeta*sqrt(k*m).
export const EXPRESSIVE_SPRING = {
  stiffness: 800,
  damping: 33.9411255,
  mass: 1,
};
