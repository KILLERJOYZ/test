import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allowedClaims,
  renderClaims,
  validatePatch,
  explain,
  interpret,
} from "./ai.ts";
import { EMPTY_NEEDS } from "./picker.ts";
import { OFFERS } from "./domain.ts";
const needs = {
  ...EMPTY_NEEDS,
  tasks: ["code"],
  primaryUseOrder: ["code"],
  useOrderConfirmed: true,
  revision: 1,
};
test("valid fact ID with contradictory compatibility still fails", () => {
  const c = allowedClaims(needs).find(
    (c) => c.productId === "p6" && c.kind === "unknown",
  )!;
  assert.throws(() => renderClaims([{ ...c, kind: "fit" }], needs), /khớp/);
  assert.throws(
    () => renderClaims([{ ...c, wording: "totally fits" }], needs),
    /khớp/,
  );
  assert.match(renderClaims([c], needs), /16 GB/);
});
test("model patches cannot include prices, products, unauthorized fields or duplicate uses", () => {
  const valid = {
    primaryUseOrder: ["code"],
    additionalRequiredTaskIds: [],
    budget: 22000000,
    vm: "unknown",
    reason: "Coding",
  };
  assert.equal(validatePatch(valid, needs).budget, 22000000);
  assert.throws(() => validatePatch({ ...valid, price: 1 }, needs));
  assert.throws(() =>
    validatePatch({ ...valid, primaryUseOrder: ["code", "code"] }, needs),
  );
  assert.throws(() =>
    validatePatch({ ...valid, budget: Number.MAX_SAFE_INTEGER + 1 }, needs),
  );
});
test("provider absence is explicit and stale revisions rejected", async () => {
  await assert.rejects(explain("", "test", needs, OFFERS), /Chưa cấu hình/);
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ mode: "live", profileRevision: 0, claims: [] }),
      );
    await assert.rejects(
      explain("http://localhost", "test", needs, OFFERS),
      /phiên bản/,
    );
    await assert.rejects(
      interpret("http://localhost", "test", needs),
      /phiên bản/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
