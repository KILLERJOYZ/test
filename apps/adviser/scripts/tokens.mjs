import { writeFileSync } from "node:fs";
import { LIGHT, DARK, SHAPE } from "../src/design-tokens.ts";
const rules = (values) =>
  Object.entries(values)
    .map(([k, v]) => `  --lua-${k}: ${v};`)
    .join("\n");
writeFileSync(
  new URL("../src/design-tokens.css", import.meta.url),
  `/* Generated from design-tokens.ts; run npm run tokens. */\n:root {\n${rules(LIGHT)}\n${rules(Object.fromEntries(Object.entries(SHAPE).map(([k, v]) => [`shape-${k}`, `${v}px`])))}\n}\n[data-lua-theme="dark"] {\n${rules(DARK)}\n}\n`,
);

import { EXPRESSIVE_LIGHT, EXPRESSIVE_DARK } from "../src/expressive-theme.ts";
const expressiveRules = (values) =>
  Object.entries(values)
    .map(([k, v]) => `  --adviser-${k}: ${v};`)
    .join("\n");
writeFileSync(
  new URL("../src/expressive-theme.css", import.meta.url),
  `/* Generated from expressive-theme.ts. */\n:root {\n${expressiveRules(EXPRESSIVE_LIGHT)}\n}\n@media (prefers-color-scheme: dark) {\n:root {\n${expressiveRules(EXPRESSIVE_DARK)}\n}\n}\n`,
);
