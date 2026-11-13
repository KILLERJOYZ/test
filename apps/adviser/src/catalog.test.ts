import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { URL } from "node:url";
import { importCatalog } from "../scripts/import-catalog.mjs";
import {
  INITIAL_REQUIREMENTS as r,
  assess,
  checkedAdvice,
  facts,
  safeLink,
  sameContext,
  searchCatalog,
  validCatalog,
  validRequirements,
  validSaved,
} from "./catalog.ts";
const c = JSON.parse(
  fs.readFileSync(new URL("./real-catalog.json", import.meta.url), "utf8"),
);
const v = c.listings[0];
const raw = {
  generatedAt: c.importedAt,
  products: c.listings.map((l: any) => ({
    id: l.id.includes(":") ? l.id.split(":")[1] : l.id,
    source: l.source,
    name: l.name,
    url: l.url,
    condition: l.condition,
    pricing: { current: l.advertisedPrice },
    specs: { ram: `${l.ram}GB`, storage: `${l.storage}GB`, cpu: l.cpu },
    metadata: { crawledAt: l.observedAt },
  })),
};
test("REAL-01 repository import preserves 70 distinct source listings without inferred stock or costs", () => {
  assert.equal(c.listings.length, 70);
  assert.ok(validCatalog(c));
  assert.ok(
    c.listings.every(
      (x) => x.stock === "unknown" && x.shipping === null && x.fees === null,
    ),
  );
  assert.equal(new Set(c.listings.map((x) => x.id)).size, 70);
  assert.ok(c.listings.every((x) => !x.id.startsWith("p1")));
});
test("REAL-02 budget is checked before ordering; unknowns never become verified fit", () => {
  const x = { ...v, ram: 16, storage: 512, advertisedPrice: 25000000 };
  assert.equal(assess(x, r).state, "needs_verification");
  assert.equal(
    assess({ ...x, advertisedPrice: 25000001 }, r).state,
    "excluded",
  );
  assert.equal(
    assess({ ...x, advertisedPrice: null, ram: null }, { ...r, minRam: 16 })
      .state,
    "needs_verification",
  );
  assert.equal(assess(x, { ...r, minRam: 32 }).state, "excluded");
  assert.equal(assess(x, r).total, null);
});
test("REAL-03 invalid and boundary requirements rejected", () => {
  for (const patch of [
    { budget: 0 },
    { budget: -1 },
    { budget: 1.5 },
    { budget: Number.MAX_SAFE_INTEGER },
    { minRam: -1 },
    { minStorage: NaN },
    { tasks: ["x", "x"] },
  ])
    assert.equal(validRequirements({ ...r, ...patch }), false);
  assert.ok(validRequirements({ ...r, budget: 1 }));
});
test("REAL-04 search and source filters operate on real records deterministically", () => {
  const rows = searchCatalog(c, r, "", "fptshop");
  assert.ok(rows.length > 0);
  assert.ok(rows.every((x) => x.listing.source === "fptshop"));
  assert.equal(searchCatalog(c, r, "no-such-machine-zzz").length, 0);
  assert.deepEqual(
    searchCatalog(c, r).map((x) => x.listing.id),
    searchCatalog(c, r).map((x) => x.listing.id),
  );
});
test("REAL-05 listing identity, unsafe URLs, duplicate IDs and stock claims rejected", () => {
  for (const patch of [
    { url: "javascript:alert(1)" },
    { stock: "in_stock" },
    { ram: -1 },
    { observedAt: "bad" },
  ])
    assert.equal(validCatalog({ ...c, listings: [{ ...v, ...patch }] }), false);
  assert.equal(validCatalog({ ...c, listings: [v, v] }), false);
  assert.equal(safeLink("https://a:b@example.com"), false);
});
test("REAL-06 AI output selects only checked facts and valid unconfirmed proposals", () => {
  const allowed = facts(v, r);
  assert.equal(
    checkedAdvice({ factIds: ["cost"], proposal: null }, allowed).text,
    allowed.cost,
  );
  assert.throws(() =>
    checkedAdvice({ factIds: ["fake"], proposal: null }, allowed),
  );
  assert.throws(() =>
    checkedAdvice({ factIds: ["cost", "cost"], proposal: null }, allowed),
  );
  assert.throws(() =>
    checkedAdvice({ factIds: [], proposal: { ...r, budget: -1 } }, allowed),
  );
  assert.deepEqual(
    checkedAdvice({ factIds: [], proposal: r }, allowed).proposal,
    r,
  );
});
test("REAL-07 every context component invalidates a stale response", () => {
  const context = {
    catalogRevision: "a",
    decisionRevision: 1,
    focusId: "x",
    requestId: "1",
  };
  assert.ok(sameContext(context, { ...context }));
  for (const patch of [
    { catalogRevision: "b" },
    { decisionRevision: 2 },
    { focusId: "y" },
    { requestId: "2" },
  ])
    assert.equal(sameContext(context, { ...context, ...patch }), false);
});
test("REAL-08 saved configuration and price survive catalog replacement", () => {
  const snapshot = {
    id: "d",
    savedAt: "2026-11-13T00:00:00Z",
    catalogRevision: c.revision,
    requirements: r,
    listings: JSON.parse(JSON.stringify([v])),
  };
  assert.ok(validSaved(snapshot));
  const original = snapshot.listings[0].advertisedPrice;
  const updated = importCatalog({
    ...raw,
    products: raw.products.map((x: any, i: number) =>
      i === 0 ? { ...x, pricing: { ...x.pricing, current: 1 } } : x,
    ),
  });
  assert.notEqual(updated.revision, c.revision);
  assert.equal(snapshot.listings[0].advertisedPrice, original);
  assert.equal(validSaved({ ...snapshot, listings: [] }), false);
});

test("EVIDENCE-01 conflicting imported attributes cannot become trusted constraints or AI facts", () => {
  const bad = c.listings.find((x: any) => x.id === "fptshop:1f1dd132e6326e76")!;
  assert.ok(bad);
  const assessment = assess(bad, { ...r, minRam: 32 });
  assert.ok(assessment.unknown.some((x) => x.includes("RAM mâu thuẫn")));
  assert.ok(!assessment.failed.includes("RAM dưới yêu cầu"));
  assert.ok(facts(bad, r).spec.includes("chưa xác minh"));
  assert.ok(!facts(bad, r).spec.includes("RAM: 256 GB"));
  assert.equal(bad.ram, 256, "raw observation is retained for source review");
  const saved = {
    id: "conflict-history",
    savedAt: new Date().toISOString(),
    catalogRevision: c.revision,
    requirements: r,
    listings: [bad],
  };
  assert.ok(validSaved(saved));
  assert.deepEqual(JSON.parse(JSON.stringify(saved)).listings[0], bad);
});
test("EVIDENCE-02 title storage conflict remains unresolved without guessing a replacement", () => {
  const bad = c.listings.find((x: any) => x.id === "dienmayxanh:8566430c8f1ff31e")!;
  assert.ok(
    assess(bad, { ...r, minStorage: 1024 }).unknown.some((x) =>
      x.includes("Ổ lưu trữ mâu thuẫn"),
    ),
  );
  assert.ok(facts(bad, r).spec.includes("ổ: chưa xác minh"));
  assert.equal(bad.storage, 2048);
});


test("THEME-01 fallback themes preserve text and essential-control contrast",async()=>{
 const {validTheme}=await import('./theme-validation.ts');
 const {EXPRESSIVE_DARK,EXPRESSIVE_LIGHT}=await import('./expressive-theme.ts');
 assert.ok(validTheme(EXPRESSIVE_DARK));assert.ok(validTheme(EXPRESSIVE_LIGHT));
 assert.equal(validTheme({...EXPRESSIVE_DARK,line:EXPRESSIVE_DARK.bg}),false);
 assert.equal(validTheme({...EXPRESSIVE_LIGHT,text:'#ffffff'}),false);
 assert.equal(validTheme({}),false);
});
