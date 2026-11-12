import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "./server.mjs";
import { EMPTY_NEEDS } from "../../apps/adviser/src/picker.ts";
const needs = {
  ...EMPTY_NEEDS,
  tasks: ["code"],
  primaryUseOrder: ["code"],
  useOrderConfirmed: true,
  revision: 2,
};
test("HTTP service rejects contradictory output, preserves revision, supports provider failure", async () => {
  let mode = "valid";
  const server = createServer({
    provider: async (_, input) => {
      if (mode === "fail") throw Error("PROVIDER_UNAVAILABLE");
      return {
        claims:
          mode === "invalid"
            ? [
                {
                  productId: "p6",
                  kind: "fit",
                  factId: "synthetic-android-v2:p6:verdict",
                },
              ]
            : input.allowedClaims.filter(
                (c) => c.productId === "p1" && c.kind === "fit",
              ),
      };
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}/demo/advice/explain`;
    const post = () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs, text: "Vì sao?" }),
      });
    let r = await post();
    assert.equal(r.status, 200);
    assert.equal((await r.json()).profileRevision, 2);
    mode = "invalid";
    r = await post();
    assert.equal(r.status, 502);
    mode = "fail";
    r = await post();
    assert.equal(r.status, 503);
    r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    assert.equal(r.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
