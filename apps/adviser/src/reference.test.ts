import test from "node:test";
import assert from "node:assert/strict";
import {
  referenceSeed,
  referenceAssessment,
  selectReferences,
  referenceUrl,
} from "./reference.ts";
import { EMPTY_NEEDS } from "./picker.ts";
const needs = {
  ...EMPTY_NEEDS,
  tasks: ["code"],
  primaryUseOrder: ["code"],
  useOrderConfirmed: true,
};
test("collected records retain exact source identities and timestamps", () => {
  assert.equal(referenceSeed.rows.length, 75);
  assert.equal(new Set(referenceSeed.rows.map((r) => r.id)).size, 75);
  for (const r of referenceSeed.rows) {
    assert.ok(r.observedAt);
    assert.ok(referenceUrl(r).startsWith("https://"));
  }
});
test("reference offers never claim verified suitability or complete total", () => {
  for (const r of referenceSeed.rows) {
    const a = referenceAssessment(r, needs);
    assert.ok(a.unknowns.length);
    assert.ok(["provisional", "excluded"].includes(a.state));
  }
});
test("body price above ceiling is excluded without relaxing needs", () => {
  const r = {
    ...referenceSeed.rows[0],
    condition: "new",
    price: 22000001,
    ramGiB: 16,
  };
  assert.equal(
    referenceAssessment(r, { ...needs, budget: 22000000 }).state,
    "excluded",
  );
  assert.equal(
    referenceAssessment(
      { ...r, price: 22000000 },
      { ...needs, budget: 22000000 },
    ).state,
    "provisional",
  );
});
test("missing RAM remains unknown and used records remain excluded", () => {
  assert.ok(
    referenceAssessment(
      { ...referenceSeed.rows[0], ramGiB: null },
      needs,
    ).unknowns.some((s) => s.includes("RAM")),
  );
  assert.equal(
    referenceAssessment({ ...referenceSeed.rows[0], condition: "used" }, needs)
      .state,
    "excluded",
  );
});
test("filter removal restores same provisional pool and unknown weight cannot pass", () => {
  const base = selectReferences(referenceSeed.rows, needs);
  const narrowed = selectReferences(referenceSeed.rows, needs, "", "1");
  assert.ok(
    narrowed.visible.every((r) => r.weightKg !== null && r.weightKg <= 1),
  );
  assert.equal(
    selectReferences(referenceSeed.rows, needs).visible.length,
    base.visible.length,
  );
  assert.equal(
    selectReferences(referenceSeed.rows, needs, "NO-MATCH-UNIQUE").visible
      .length,
    0,
  );
});
test("external source handoff rejects substituted hosts or protocols", () => {
  assert.throws(() =>
    referenceUrl({ ...referenceSeed.rows[0], url: "https://evil.example/a" }),
  );
  assert.throws(() =>
    referenceUrl({ ...referenceSeed.rows[0], url: "javascript:alert(1)" }),
  );
});
