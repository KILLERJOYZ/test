import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const local = path.join(
  root,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const result = spawnSync(
  existsSync(local) ? local : "python",
  [path.join(root, "tools/run_adviser.py"), ...process.argv.slice(2)],
  { stdio: "inherit", cwd: root },
);
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
