// Diagnostic reproductions of current source behavior, not production acceptance tests.
// No React/native runtime, network, user storage, provider or real-time delay.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { INITIAL_STORE, EMPTY_NEEDS, restore, validateNeeds, evaluate, validOffers } from "../../../apps/adviser/src/picker.ts";
import { PRODUCTS } from "../../../apps/adviser/src/domain.ts";
import { explain, renderClaims, localExplanation } from "../../../apps/adviser/src/ai.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const require = createRequire(resolve(root, "apps/adviser/package.json"));
const ts = require("typescript");
const appPath = "apps/adviser/src/AndroidApp.tsx";
const appSource = readFileSync(resolve(root, appPath), "utf8");
const ast = ts.createSourceFile(appPath, appSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function find(predicate) {
  const matches = [];
  function visit(node) { if (predicate(node)) matches.push(node); ts.forEachChild(node, visit); }
  visit(ast);
  assert.equal(matches.length, 1, "Source selector must identify exactly one original handler");
  return matches[0];
}
const variable = name => find(n => ts.isVariableDeclaration(n) && n.name.getText(ast) === name).initializer;
const arrowContaining = text => find(n => ts.isArrowFunction(n) && n.getText(ast).includes(text));
function bind(node, dependencies) {
  const js = ts.transpileModule("const handler = " + node.getText(ast), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return new Function(...Object.keys(dependencies), js + "\nreturn handler;")(...Object.values(dependencies));
}
function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}
const clone = value => structuredClone(value);
const needs = { ...clone(EMPTY_NEEDS), primaryUseOrder: ["study"], tasks: ["study"],
  useOrderConfirmed: true, revision: 1, budget: 30000000 };
assert.deepEqual(validateNeeds(needs), []);
const base = { ...clone(INITIAL_STORE), needs };
const snapshot = id => ({ id, name: "Synthetic decision", needs: clone(needs), productIds: ["p1"],
  savedAt: "2026-11-13T00:00:00.000Z", datasetVersion: "synthetic-android-v2",
  policyVersion: "picker-experiment-3-2-1-v2",
  observations: [{ productId: "p1", total: 18900000, seller: "Synthetic seller" }] });
const facts = [];
function record(id, observed) { facts.push({ id, observed }); }
function persistence(storage, extra = {}) {
  let current = clone(base);
  const handler = bind(variable("persist"), {
    rawRecovery: "", notify() {}, saving: { current: Promise.resolve() }, fault: "none",
    AsyncStorage: storage, KEY: "isolated-test-key", setStore: x => { current = x; },
    setStorageError() {}, ...extra,
  });
  return { handler, current: () => current };
}

// Original persistence handler, two complete snapshots captured from the same state.
{
  let disk;
  const p = persistence({ async setItem(key, raw) { disk = JSON.parse(raw); } });
  const first = p.handler({ ...clone(base), dark: true });
  const second = p.handler({ ...clone(base), saved: [snapshot("new-decision")] });
  const acknowledgements = await Promise.all([first, second]);
  assert.deepEqual(acknowledgements, [true, true]);
  assert.equal(disk.dark, false);
  record("FLOW-01", { acknowledgements, finalDark: disk.dark, finalSavedCount: disk.saved.length,
    conclusion: "The acknowledged theme update is overwritten by the later stale whole-store snapshot." });
}

// Original bootstrap effect: rejected read does not set rawRecovery; persist then allows writing.
{
  let rawRecovery = "", storageError = "", ready = false;
  const done = deferred();
  const storage = { multiGet: async () => { throw Error("injected read failure"); },
    async setItem() {} };
  const bootstrap = find(n => ts.isCallExpression(n) && n.expression.getText(ast) === "useEffect"
    && n.arguments[0]?.getText(ast).includes("AsyncStorage.multiGet")).arguments[0];
  bind(bootstrap, { AsyncStorage: storage, KEY: "isolated-test-key", restore,
    setStore() {}, setServiceDraft() {}, revision: { current: 0 }, setNotice() {},
    setRawRecovery: x => { rawRecovery = x; }, setStorageError: x => { storageError = x; },
    setReady: x => { ready = x; done.resolve(); } })();
  await done.promise;
  const allowed = await persistence(storage, { rawRecovery }).handler(base);
  assert.equal(ready && !!storageError && allowed, true);
  record("FLOW-02", { ready, readErrorRecorded: !!storageError, rawRecoveryPresent: !!rawRecovery,
    subsequentWriteAllowed: allowed });
}

// Original delete-all bypasses the JS queue; even serial native writes cannot prevent a queued later write.
{
  const started = deferred(), release = deferred();
  let disk = clone(base);
  let writes = 0;
  const adapterOperationOrder = [];
  const storage = { async setItem(key, raw) {
      adapterOperationOrder.push("write" + (++writes));
      disk = JSON.parse(raw);
      if (writes === 1) { started.resolve(); await release.promise; }
    }, async multiRemove() { adapterOperationOrder.push("delete"); disk = null; } };
  const p = persistence(storage);
  const first = p.handler({ ...clone(base), dark: true });
  const queued = p.handler({ ...clone(base), saved: [snapshot("old-decision")] });
  await started.promise;
  const noOp = () => {};
  await bind(arrowContaining("await AsyncStorage.multiRemove"), {
    AsyncStorage: storage, KEY: "isolated-test-key", INITIAL_STORE,
    setStore: noOp, setRawRecovery: noOp, setStorageError: noOp, setSelected: noOp,
    setHistory: noOp, revision: { current: 1 }, requestId: { current: 0 }, notify: noOp,
  })();
  assert.equal(disk, null);
  release.resolve();
  await Promise.all([first, queued]);
  assert.equal(disk.saved[0].id, "old-decision");
  assert.deepEqual(adapterOperationOrder, ["write1", "delete", "write2"]);
  record("FLOW-03", { adapterOperationOrder, deletedBeforeQueuedWriteExecuted: true,
    savedIdsAfterPendingWrite: disk.saved.map(x => x.id) });
}

// Restore accepts inconsistent historical observation metadata and duplicate ordered uses.
{
  const bad = clone(base);
  bad.saved = [{ id: "snapshot", name: "Fixture", needs, productIds: ["p1"], savedAt: "invalid-date",
    observations: [{ productId: "not-a-selected-variant", total: -1, seller: 42 }] }];
  const result = restore(JSON.stringify(bad));
  assert.equal(result.store.saved.length, 1);
  const malformed = clone(base);
  malformed.needs.tasks = ["study", "code"];
  malformed.needs.primaryUseOrder = ["study", "study"];
  const restored = restore(JSON.stringify(malformed));
  assert.ok(validateNeeds(restored.store.needs).length > 0);
  record("FLOW-04", { acceptedInvalidSnapshot: result.store.saved[0], warnings: result.warnings,
    restoredConfirmedNeedsFailValidation: true });
}

// Fallback derives from catalog insertion order, while results use the ranking evaluator.
{
  const creative = { ...clone(needs), primaryUseOrder: ["creative"], tasks: ["creative"] };
  const ranked = evaluate(creative).visible.map(p => p.id);
  const text = localExplanation(creative);
  const mentioned = PRODUCTS.filter(p => text.includes(p.name + ":")).map(p => p.id);
  assert.notDeepEqual(mentioned, ranked.slice(0, 2));
  record("FLOW-05", { needs: creative, firstTwoRanked: ranked.slice(0, 2), fallbackMentioned: mentioned });
}

// Original ask + actual explain with only fetch replaced; original offer-edit handler commits while pending.
{
  const requestStarted = deferred(), response = deferred();
  const oldFetch = globalThis.fetch;
  let payload, displayed = "";
  globalThis.fetch = async (url, options) => {
    payload = JSON.parse(options.body); requestStarted.resolve(); return response.promise;
  };
  try {
    const store = { ...clone(base), serviceUrl: "https://isolated.invalid" };
    const writeStarted = deferred(), releaseWrite = deferred();
    const p = persistence({ async setItem() { writeStarted.resolve(); await releaseWrite.promise; } });
    const revision = { current: needs.revision }, requestId = { current: 0 };
    const noOp = () => {};
    const ask = bind(variable("ask"), {
      store, revision, requestId, setAiBusy: noOp, setPatch: noOp,
      setAnswer: x => { displayed = x; }, setAiMode: noOp, fault: "none", message: "",
      explain, interpret: () => { throw Error("unused"); }, localExplanation,
    });
    // Start a Settings price edit, then navigate/open AI while its storage promise is pending.
    const editing = bind(arrowContaining("const offers = store.offers.map"), {
      store, editOffer: "o1", editPrice: "29000000", validOffers, persist: p.handler, notify: noOp,
    })();
    await writeStarted.promise;
    const pending = ask("explain");
    await requestStarted.promise;
    releaseWrite.resolve();
    await editing;
    const claims = [{ productId: "p1", kind: "fit", factId: "synthetic-android-v2:p1:verdict" }];
    response.resolve({ ok: true, status: 200,
      text: async () => JSON.stringify({ mode: "live", profileRevision: needs.revision, claims }) });
    await pending;
    const currentText = renderClaims(claims, needs, p.current().offers);
    assert.notEqual(displayed, currentText);
    record("FLOW-06", { responseAcceptedAfterOfferEdit: true, displayed, currentText,
      eventOrder: ["offer edit started", "AI requested old offers", "offer edit committed", "AI response accepted"],
      requestFields: Object.keys(payload), selectionContextSent: "productId" in payload || "productIds" in payload,
      revisionGuardUnchanged: revision.current === needs.revision });
  } finally { globalThis.fetch = oldFetch; }
}
const hashedPaths = [appPath, "apps/adviser/src/picker.ts", "apps/adviser/src/domain.ts",
  "apps/adviser/src/ai.ts", "research/prebuild/flow-review/probe_current_flow.mjs"];
const report = {
  schemaVersion: 1, kind: "source_behavior_reproduction", reviewedDate: "2026-11-13",
  method: "Original exported functions and AST-extracted original closures, with injected in-memory dependencies.",
  limitations: ["No mounted React or native Android execution.", "Injected ordering proves permitted interleavings, not frequency.",
    "Passing diagnostic assertions confirm current flaws; they do not accept or fix them.", "No network or user storage access."],
  sourceHashes: Object.fromEntries(hashedPaths.map(path => [path,
    createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex")])),
  observations: facts,
};
writeFileSync(resolve(root, "research/prebuild/flow-review/current-flow-observations.json"),
  JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ observations: facts.map(x => ({ id: x.id, observed: x.observed })),
  report: "research/prebuild/flow-review/current-flow-observations.json" }, null, 2));
