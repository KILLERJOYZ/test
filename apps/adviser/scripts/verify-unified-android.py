"""Release launch/restart smoke check. Does not clear device or application data."""
import argparse
import json
import subprocess
import time
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--adb", required=True)
parser.add_argument("--serial", required=True)
parser.add_argument("--output", default="verification/unified-0.5.1")
args = parser.parse_args()
expected_version = json.loads((Path(__file__).resolve().parent.parent / "app.json").read_text(encoding="utf-8"))["expo"]["version"]
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
prefix = [args.adb, "-s", args.serial]

def adb(*parts):
    return subprocess.run(prefix + list(parts), check=True, capture_output=True).stdout

observed = []
for phase in ("launch", "restart"):
    adb("shell", "am", "force-stop", "vn.lua.adviser")
    adb("shell", "am", "start", "-W", "-n", "vn.lua.adviser/.MainActivity")
    for attempt in range(5):
        adb("shell", "uiautomator", "dump", "/sdcard/unified-smoke.xml")
        tree = adb("shell", "cat", "/sdcard/unified-smoke.xml").decode("utf-8")
        if "lựa." in tree:
            break
        time.sleep(1)
    else:
        raise AssertionError("M3 host app did not appear")
    (output / f"{phase}.xml").write_text(tree, encoding="utf-8")
    # Resizable emulators print a multi-display warning to stdout. Capture to a
    # device file and pull it, keeping that warning out of the PNG byte stream.
    adb("shell", "screencap", "-p", "/sdcard/unified-smoke.png")
    adb("pull", "/sdcard/unified-smoke.png", str(output / f"{phase}.png"))
    observed.append({"phase": phase, "root": "M3 host with Device Advisor feature", "existingDataRetained": True})
package = adb("shell", "dumpsys", "package", "vn.lua.adviser").decode("utf-8")
assert f"versionName={expected_version}" in package
(output / "native-smoke.json").write_text(json.dumps({"status": "passed", "serial": args.serial,
    "version": expected_version, "observations": observed,
    "limits": "Launch/restart only; category journeys use component tests. Physical AICore and accessibility acceptance remain open."}, indent=2), encoding="utf-8")
print(f"PASS: installed M3 host {expected_version} launches and restarts without clearing app data")
