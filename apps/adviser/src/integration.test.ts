import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE,
  UPDATE,
  validateCatalog,
  run,
  proposeBudget,
  applyProposal,
} from "./integration.ts";
import { EMPTY_NEEDS } from "./picker.ts";
const needs = {
  ...EMPTY_NEEDS,
  tasks: ["study", "code"],
  primaryUseOrder: ["study", "code"],
  useOrderConfirmed: true,
  revision: 1,
};
test("snapshot evaluation uses changed offers and rollback restores the result", () => {
  const before = run(needs, BASE),
    after = run(needs, UPDATE);
  assert.notEqual(before.key, after.key);
  assert.ok(after.eligible.length < before.eligible.length);
  assert.deepEqual(run(needs, BASE).visible, before.visible);
});
test("bad catalog identity or unsafe price is rejected before activation", () => {
  assert.throws(() =>
    validateCatalog({
      ...UPDATE,
      offers: UPDATE.offers.map((o, i) => (i ? o : { ...o, base: -1 })),
    }),
  );
  assert.throws(() =>
    validateCatalog({ ...BASE, products: BASE.products.slice(1) }),
  );
  assert.throws(() =>
    validateCatalog({
      ...BASE,
      offers: BASE.offers.map((o, i) =>
        i ? o : { ...o, productId: "invented" },
      ),
    }),
  );
});
test("clear ceiling is proposed without editing needs and ambiguous money abstains", () => {
  const p = proposeBudget("Không quá 20 triệu", needs, BASE);
  assert.equal(needs.budget, 22000000);
  assert.equal(applyProposal(p, needs, BASE).budget, 20000000);
  assert.throws(() => proposeBudget("Tầm 20 triệu", needs, BASE));
  assert.throws(() =>
    proposeBudget("Không quá 20 triệu nhưng tối đa 15 triệu", needs, BASE),
  );
});
test("proposal cannot cross profile or catalog revisions", () => {
  const p = proposeBudget("Tối đa 20 triệu", needs, BASE);
  assert.throws(() => applyProposal(p, { ...needs, revision: 2 }, BASE));
  assert.throws(() => applyProposal(p, needs, UPDATE));
});
