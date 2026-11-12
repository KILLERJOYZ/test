import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_NEEDS,
  EMPTY_FILTERS,
  INITIAL_STORE,
  evaluate,
  rank,
  restore,
  updateTasks,
  validOffers,
} from "./picker.ts";
import { OFFERS, bestOffer, total } from "./domain.ts";
const needs = {
  ...EMPTY_NEEDS,
  primaryUseOrder: ["study", "code"],
  tasks: ["study", "code"],
  useOrderConfirmed: true,
  revision: 1,
};
test("ordered task tradeoff changes ranking only within hard eligible set", () => {
  const a = rank(needs);
  const b = rank({ ...needs, primaryUseOrder: ["code", "study"] });
  assert.notEqual(a[0].id, b[0].id);
  for (const p of [...a, ...b])
    assert.ok(p.ram >= 16 && total(bestOffer(p.id)!)! <= 22000000);
});
test("mandatory extra VM survives ranking order and budget stays exact", () => {
  const vm = {
    ...needs,
    additionalRequiredTaskIds: ["vm"],
    tasks: ["study", "code", "vm"],
    vm: "many" as const,
  };
  for (const p of rank(vm)) assert.ok(p.ram >= 32);
  assert.equal(updateTasks(vm, ["code", "study"], ["vm"]).budget, 22000000);
  assert.equal(updateTasks(vm, ["study"], []).vm, "unknown");
});
test("filter empty differs from genuine no fit and clearing keeps profile", () => {
  assert.equal(
    evaluate(needs, { ...EMPTY_FILTERS, maxWeight: 1 }).state,
    "filterEmpty",
  );
  assert.equal(evaluate({ ...needs, budget: 1 }).state, "noEligible");
  assert.equal(evaluate(needs).state, "eligible");
  assert.equal(needs.budget, 22000000);
});
test("unknown VM and unconfirmed order do not produce suitable shortlist", () => {
  assert.equal(
    evaluate({ ...needs, useOrderConfirmed: false }).state,
    "needsClarification",
  );
  assert.equal(
    evaluate({
      ...needs,
      tasks: ["study", "code", "vm"],
      additionalRequiredTaskIds: ["vm"],
    }).state,
    "needsClarification",
  );
});
test("migration does not invent confirmed order and future schema is preserved", () => {
  const value = restore(
    JSON.stringify({
      version: 1,
      profile: {
        budget: 22000000,
        tasks: ["code", "vm"],
        priorities: [],
        vm: "one",
      },
      saved: [],
      offers: OFFERS,
    }),
  );
  assert.equal(value.store.needs.useOrderConfirmed, false);
  assert.equal(value.store.needs.budget, 22000000);
  assert.throws(() => restore('{"version":9}'), /chưa được hỗ trợ/);
});
test("corrupt saved record is isolated and offers cannot change variant identity", () => {
  const value = restore(
    JSON.stringify({ ...INITIAL_STORE, saved: [{ id: "bad" }] }),
  );
  assert.equal(value.store.saved.length, 0);
  assert.equal(value.warnings.length, 1);
  assert.equal(
    validOffers(OFFERS.map((o, i) => (i ? o : { ...o, productId: "p2" }))),
    false,
  );
});

test("malformed historic entries cannot crash healthy decision recovery", () => {
  const raw = {
    version: 1,
    profile: { budget: 22000000, tasks: ["code"], priorities: [], vm: "one" },
    saved: [
      null,
      {
        id: "bad",
        name: "Bad",
        profile: {
          budget: 22000000,
          tasks: ["code"],
          priorities: [],
          vm: "one",
        },
        productIds: ["unknown"],
        savedAt: "2026-11-12",
      },
    ],
    offers: OFFERS,
  };
  const result = restore(JSON.stringify(raw));
  assert.equal(result.store.saved.length, 0);
  assert.equal(result.store.needs.budget, 22000000);
  const v2 = restore(JSON.stringify({ ...INITIAL_STORE, saved: [null] }));
  assert.equal(v2.store.saved.length, 0);
  assert.equal(v2.warnings.length, 1);
  assert.equal(validOffers(OFFERS.map((o, i) => (i === 0 ? null : o))), false);
});
