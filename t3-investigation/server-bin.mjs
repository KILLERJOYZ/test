#!/usr/bin/env node

import * as NodeModule from "node:module";
import * as NodeSea from "node:sea";
import * as NodeURL from "node:url";
import * as NodeFS from "node:fs";
// src/entrypoint.ts
/** Fallback for supported Node 22.16, 22.17 and 23.11, where import.meta.main is undefined. */
const isEntrypoint = (input) => {
	if (input.runtimeMain !== void 0) return input.runtimeMain;
	if (input.entryPath === void 0 || input.entryPath === "") return false;
	if (input.moduleUrl === NodeURL.pathToFileURL(input.entryPath).href) return true;
	try {
		return input.moduleUrl === NodeURL.pathToFileURL(NodeFS.realpathSync(input.entryPath)).href;
	} catch {
		return false;
	}
};
// src/bin.ts
async function loadCliMain() {
	if (!NodeSea.isSea()) return import("./binMain-Cbi71SjY.mjs");
	const require = NodeModule.createRequire(import.meta.url);
	const cliUrl = NodeURL.pathToFileURL(require.resolve(process.execPath)).href;
	const hook = NodeModule.registerHooks({ load(url, context, next) {
		if (url !== cliUrl) return next(url, context);
		return {
			format: "module",
			source: new Uint8Array(NodeSea.getRawAsset("binMain.mjs")),
			shortCircuit: true
		};
	} });
	try {
		return require(process.execPath);
	} finally {
		hook.deregister();
	}
}
if (isEntrypoint({
	moduleUrl: import.meta.url,
	entryPath: process.argv[1],
	runtimeMain: import.meta.main
})) {
	if (process.argv[2] === "__service-launcher" && process.argv.length === 3) {
		const { runServiceLauncherCli } = await import("./serviceLauncher-4xV7Fv9M.mjs");
		await runServiceLauncherCli();
	} else {
		const { runCliCommand } = await loadCliMain();
		await runCliCommand();
	}
}
export {};

//# sourceMappingURL=bin.mjs.map