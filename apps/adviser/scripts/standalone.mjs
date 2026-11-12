import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("dist");
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
html = html.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, file) =>
    `<script type="module">${fs.readFileSync(path.join(dir, file), "utf8").replaceAll("</script", "<\\/script")}</script>`,
);
html = html.replace(
  /<link[^>]*href="([^"]+\.css)"[^>]*>/g,
  (_, file) =>
    `<style>${fs.readFileSync(path.join(dir, file), "utf8")}</style>`,
);
fs.writeFileSync(path.join(dir, "demo.html"), html);
console.log("Self-contained demo: dist/demo.html");
