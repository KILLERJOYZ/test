import { build } from "esbuild";
import fs from "node:fs";
const output = await build({
  entryPoints: ["src/qa.web.tsx"],
  bundle: true,
  write: false,
  outdir: "dist/qa",
  format: "iife",
  platform: "browser",
  target: "es2022",
  minify: true,
  alias: { "react-native": "react-native-web" },
  resolveExtensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".jsx", ".js"],
  define: { "process.env.NODE_ENV": '"production"' },
});
const js = output.outputFiles
  .find((f) => f.path.endsWith(".js"))
  .text.replaceAll("</script", "<\\/script");
const css = output.outputFiles.find((f) => f.path.endsWith(".css"))?.text || "";
for (const mode of [
  "flow",
  "storage-invalid",
  "storage-restore",
  "storage-denied",
  "layout-mobile",
]) {
  fs.writeFileSync(
    `dist/qa-${mode}.html`,
    `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>window.__LUA_QA_SCENARIO__=${JSON.stringify(mode)};</script><script>${js}</script></body></html>`,
  );
}
console.log("Built isolated DOM-check pages in dist/qa-*.html.");
