import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCTS,
  OFFERS,
  SAMPLE_PROFILE,
  total,
  bestOffer,
  fit,
  recommend,
} from "./domain.ts";
test("fixture identities and references stay exact", () => {
  assert.equal(PRODUCTS.length, 12);
  assert.equal(OFFERS.length, 18);
  assert.equal(new Set(OFFERS.map((o) => o.id)).size, 18);
  assert.equal(new Set(OFFERS.map((o) => o.seller)).size, 3);
  for (const o of OFFERS) assert.ok(PRODUCTS.some((p) => p.id === o.productId));
});
test("exact budget passes, one dong less excludes it", () => {
  assert.equal(total(OFFERS[0]), 18900000);
  assert.ok(fit(PRODUCTS[0], { ...SAMPLE_PROFILE, budget: 18900000 }).eligible);
  assert.ok(
    !fit(PRODUCTS[0], { ...SAMPLE_PROFILE, budget: 18899999 }).eligible,
  );
});
test("conditional discount does not become a certain saving", () => {
  assert.equal(total(OFFERS[1]), 19100000);
  assert.equal(total({ ...OFFERS[1], eligible: true }), 18600000);
  assert.equal(bestOffer("p1")?.id, "o1");
});
test("missing shipping and invalid money cannot produce a full total", () => {
  assert.equal(total(OFFERS[9]), null);
  assert.equal(bestOffer("p7"), undefined);
  assert.equal(total({ ...OFFERS[0], fee: -1 }), null);
  assert.equal(
    total({ ...OFFERS[0], shipping: Number.MAX_SAFE_INTEGER }),
    null,
  );
});
test("expired and unavailable offers never count as current", () => {
  assert.equal(bestOffer("p8"), undefined);
  assert.equal(bestOffer("p9"), undefined);
});
test("many VMs require the fixture memory rule; unknown does not pass", () => {
  const p = { ...SAMPLE_PROFILE, tasks: ["code", "vm"], vm: "many" as const };
  assert.ok(!fit(PRODUCTS[0], p).eligible);
  assert.ok(fit(PRODUCTS[1], p).eligible);
  assert.equal(recommend({ ...p, vm: "unknown" }).length, 0);
});
test("no-fit does not relax the cap; soft weights do not override it", () => {
  assert.equal(recommend({ ...SAMPLE_PROFILE, budget: 1000000 }).length, 0);
  for (const priority of ["portable", "power", "value"])
    for (const p of recommend({ ...SAMPLE_PROFILE, priorities: [priority] }))
      assert.ok(total(bestOffer(p.id)!)! <= SAMPLE_PROFILE.budget);
});
test("ranking is deterministic and same-family variants keep separate offers", () => {
  assert.deepEqual(recommend(SAMPLE_PROFILE), recommend(SAMPLE_PROFILE));
  assert.equal(bestOffer("p4")?.productId, "p4");
  assert.ok(!recommend(SAMPLE_PROFILE).some((p) => p.id === "p4"));
});
