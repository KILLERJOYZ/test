import test from "node:test";
import assert from "node:assert/strict";
import {
  purchaseCost,
  dimensionWeights,
  recommendCandidates,
  type Candidate,
  type Requirement,
} from "./advisor-engine.ts";
const now = Date.parse("2026-11-13T10:00:00Z");
const requirement: Requirement = {
  revision: 1,
  confirmed: true,
  category: "laptop",
  market: "VN",
  currency: "VND",
  ceiling: 22000000,
  purposes: ["study"],
  priorities: ["portable"],
  constraints: {},
  workloads: ["study"],
};
const candidate: Candidate = {
  id: "fixture-a",
  variantId: "variant-a",
  category: "laptop",
  market: "VN",
  condition: "new",
  currency: "VND",
  price: 21000000,
  shipping: 100000,
  fees: 0,
  accessories: 0,
  discount: null,
  ramGiB: 16,
  os: "Windows 11",
  stock: true,
  observedAt: "2026-11-13T09:00:00Z",
  workloadEvidence: { study: { supported: true, evidenceId: "review-study" } },
  utilities: {
    portability: { value: 0.9, evidenceId: "measured-weight" },
    display: { value: 0.8, evidenceId: "display-rubric" },
    battery: { value: 0.7, evidenceId: "same-battery-protocol" },
  },
  factPrefix: "fixture-a",
};
const run = (c: Candidate[] = [candidate], r: Requirement = requirement) =>
  recommendCandidates(c, r, "catalog-test", now);
test("complete charges and exact ceiling determine hard eligibility", () => {
  assert.equal(run().qualified.length, 1);
  assert.equal(run([{ ...candidate, price: 21900000 }]).qualified.length, 1);
  assert.equal(run([{ ...candidate, price: 21900001 }]).excluded.length, 1);
});
test("unknown mandatory accessory/shipping costs cannot pass", () => {
  for (const key of ["shipping", "fees", "accessories"] as const) {
    const result = run([{ ...candidate, [key]: null }]);
    assert.equal(result.qualified.length, 0);
    assert.equal(result.verify.length, 1);
    assert.equal(result.verify[0].total, null);
  }
});
test("conditional discount is used only when eligible; unsafe amounts fail", () => {
  assert.equal(
    purchaseCost({
      ...candidate,
      discount: { value: 1000000, eligible: false },
    }).total,
    21100000,
  );
  assert.equal(
    purchaseCost({ ...candidate, discount: { value: 1000000, eligible: null } })
      .total,
    21100000,
  );
  assert.equal(
    purchaseCost({ ...candidate, discount: { value: 1000000, eligible: true } })
      .total,
    20100000,
  );
  assert.equal(
    purchaseCost({ ...candidate, price: Number.MAX_SAFE_INTEGER }).invalid,
    true,
  );
  assert.equal(purchaseCost({ ...candidate, accessories: -1 }).invalid, true);
});
test("mandatory RAM, OS and workload failures cannot be compensated by utility", () => {
  const r = {
    ...requirement,
    constraints: { minimumRamGiB: 32, mandatoryOS: "Linux" },
  };
  const result = run(
    [
      {
        ...candidate,
        utilities: { portability: { value: 1, evidenceId: "a" } },
      },
    ],
    r,
  );
  assert.equal(result.excluded.length, 1);
  assert.equal(result.shortlist.length, 0);
  assert.ok(result.exclusions.some((e) => e.code === "RAM"));
  assert.ok(result.exclusions.some((e) => e.code === "OS"));
  assert.equal(
    run([
      {
        ...candidate,
        workloadEvidence: {
          study: { supported: false, evidenceId: "unsupported" },
        },
      },
    ]).excluded.length,
    1,
  );
});
test("missing compatibility stays unknown; old/future/invalid timestamps are not fresh", () => {
  assert.equal(run([{ ...candidate, workloadEvidence: {} }]).verify.length, 1);
  for (const observedAt of [
    "bad",
    "2026-11-11T10:00:00Z",
    "2026-11-14T10:00:00Z",
  ])
    assert.equal(run([{ ...candidate, observedAt }]).verify.length, 1);
});
test("unknown optional utilities preserve interval and cannot invent evidence coverage", () => {
  const a = run([{ ...candidate, utilities: {} }]).qualified[0];
  assert.equal(a.scoreLower, 0);
  assert.equal(a.scoreUpper, 100);
  assert.equal(a.evidenceCoverage, 0);
  assert.equal(
    run([
      {
        ...candidate,
        utilities: { portability: { value: 2, evidenceId: "invalid" } },
      },
    ]).qualified[0].evidenceCoverage,
    0,
  );
});
test("ordered purposes and priorities change normalized weights without duplicate dimensions", () => {
  const a = dimensionWeights(["study", "code"], ["portable", "power"]),
    b = dimensionWeights(["code", "study"], ["power", "portable"]);
  assert.ok(Math.abs(Object.values(a).reduce((x, y) => x + y, 0) - 1) < 1e-12);
  assert.notEqual(a.portability, b.portability);
  assert.notEqual(a.performance, b.performance);
});
test("invalid or unconfirmed profiles return clarification without an eligible verdict", () => {
  for (const r of [
    { ...requirement, confirmed: false },
    { ...requirement, ceiling: null },
    { ...requirement, purposes: ["study", "study"] },
    { ...requirement, constraints: { minimumRamGiB: -1 } },
  ])
    assert.equal(run([candidate], r).state, "needsClarification");
});
test("same variants collapse in shortlist and fewer than three results are not padded", () => {
  const b = { ...candidate, id: "fixture-b", price: 20000000 };
  const a = run([candidate, b]);
  assert.equal(a.shortlist.length, 1);
  assert.equal(a.shortlist[0].candidate.id, "fixture-b");
  assert.equal(run().shortlist.length, 1);
});
test("stable versions, input and tie-breaks produce reproducible runs", () => {
  const b = { ...candidate, id: "fixture-b", variantId: "variant-b" };
  assert.deepEqual(run([candidate, b]), run([candidate, b]));
  assert.notEqual(
    run().runKey,
    run([candidate], { ...requirement, revision: 2 }).runKey,
  );
  assert.notEqual(
    run().runKey,
    recommendCandidates([candidate], requirement, "catalog-2", now).runKey,
  );
  assert.throws(() => run([candidate, candidate]));
});
test("compromise proposals never change the requirement or waive other blocks", () => {
  const original = JSON.stringify(requirement);
  const result = run([{ ...candidate, price: 23000000, workloadEvidence: {} }]);
  assert.equal(result.compromises[0].proposedCeiling, 23100000);
  assert.ok(result.compromises[0].otherBlocks.includes("WORKLOAD_study"));
  assert.equal(JSON.stringify(requirement), original);
  assert.equal(result.shortlist.length, 0);
});
test("currency, market, category and unavailable stock remain hard exclusions", () => {
  for (const patch of [
    { currency: "USD" },
    { market: "US" },
    { category: "phone" },
    { stock: false },
  ])
    assert.equal(run([{ ...candidate, ...patch }]).excluded.length, 1);
});
