import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(
  root,
  "android/app/build/outputs/apk/release/app-release.apk",
);
const directory = path.join(root, "artifacts");
fs.mkdirSync(directory, { recursive: true });
const hash = (p) =>
  createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const sha256 = hash(source);
const config = JSON.parse(fs.readFileSync(path.join(root, "app.json"))).expo;
const git = (...args) =>
  execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
const names = ["lua-adviser-demo.apk", `lua-adviser-${config.version}.apk`, `lua-device-advisor-full-${config.version}.apk`];
for (const name of names) {
  const destination = path.join(directory, name);
  if (fs.existsSync(destination) && hash(destination) === sha256) continue;
  const temporary = path.join(directory, `package-${randomUUID()}.tmp`);
  fs.copyFileSync(source, temporary);
  if (hash(temporary) !== sha256) throw Error("Temporary APK hash mismatch");
  const previous = path.join(directory, `previous-${randomUUID()}.apk`);
  const replaced = fs.existsSync(destination);
  if (replaced) fs.renameSync(destination, previous);
  try {
    fs.renameSync(temporary, destination);
  } catch (error) {
    if (replaced) fs.renameSync(previous, destination);
    throw error;
  }
}
const sourcePaths = [
  "index.js",
  "src/AdviserApp.tsx",
  "src/UnifiedAdvisorApp.tsx",
  "src/DeviceAdvisorApp.tsx",
  "src/ReferenceExplorer.tsx",
  "src/reference.ts",
  "src/device-profile.ts",
  "src/advisor-engine.ts",
  "src/catalog-sync.ts",
  "src/catalog-trust.json",
  "src/AdvisorTheme.tsx",
  "src/ListingTools.tsx",
  "src/UnifiedComparison.tsx",
  "src/useExpressiveTheme.ts",
  "src/expressive-theme.ts",
  "src/demo-storage.ts",
  "src/catalog-database.ts",
  "src/catalog-contract.ts",
  "src/reference-seed.json",
  "src/device-ai.ts",
  "src/unified-adapters.ts",
  "native/adviser/LocalAiModule.kt",
  "app.json",
  "package-lock.json",
];
const manifest = {
  package: config.android.package,
  version: config.version,
  versionCode: config.android.versionCode,
  apk: names[0],
  versionedApk: names[1],
  fullDeviceAdvisorApk: names[2],
  sha256,
  bytes: fs.statSync(source).size,
  gitCommit: git("rev-parse", "HEAD"),
  sourceCommit: git("rev-parse", "HEAD"),
  sourceDirty: !!git("status", "--porcelain", "--", ...sourcePaths),
  dirtyWorkingTree: !!git("status", "--porcelain"),
  entryPoint: "src/AdviserApp.tsx",
  sourceSha256: Object.fromEntries(
    sourcePaths.map((p) => [p, hash(path.join(root, p))]),
  ),
  catalogVersion: JSON.parse(
    fs.readFileSync(path.join(root, "src/reference-seed.json")),
  ).version,
  scope:
    "M3 Adviser app with the complete Phone / Tablet / PC Device Advisor as an in-app feature.",
  nativeOutputModifiedAtUtc: fs.statSync(source).mtime.toISOString(),
  packagedAtUtc: new Date().toISOString(),
};
fs.writeFileSync(
  path.join(directory, "lua-adviser-demo.manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(`Packaged ${names[1]}\nSHA-256: ${sha256}`);
