import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { URL } from "node:url";
import { localAdvice, localStatus } from "./local-ai.ts";
import { INITIAL_REQUIREMENTS, facts } from "./catalog.ts";
import type { LocalAiBridge } from "./local-ai.ts";
const catalog = JSON.parse(
  fs.readFileSync(new URL("./real-catalog.json", import.meta.url), "utf8"),
);
const listing = catalog.listings[0],
  context = {
    catalogRevision: catalog.revision,
    decisionRevision: 1,
    focusId: listing.id,
    requestId: "local-1",
  };
const bridge = (generate: LocalAiBridge["generate"]): LocalAiBridge => ({
  availability: async () => "available",
  download: async () => "available",
  generate,
  cancel: () => {},
});
test("NANO-01 missing bridge and unsupported status remain explicitly unavailable", async () => {
  assert.equal(await localStatus(), "unavailable");
  assert.equal(
    await localStatus({
      ...bridge(async () => ""),
      availability: async () => {
        throw Error("AICore");
      },
    }),
    "unavailable",
  );
  await assert.rejects(
    () =>
      localAdvice(
        undefined,
        context,
        listing,
        INITIAL_REQUIREMENTS,
        "",
        new AbortController().signal,
      ),
    /LOCAL_AI_UNAVAILABLE/,
  );
});
test("NANO-02 checked local facts are rendered without trusting generated prose", async () => {
  const value = await localAdvice(
    bridge(async (id, prompt) => {
      assert.equal(id, context.requestId);
      assert.match(prompt, /untrusted data/);
      return JSON.stringify({ factIds: ["cost"], proposal: null });
    }),
    context,
    listing,
    INITIAL_REQUIREMENTS,
    "Explain",
    new AbortController().signal,
  );
  assert.equal(value.text, facts(listing, INITIAL_REQUIREMENTS).cost);
  assert.equal(value.mode, "on_device");
  assert.deepEqual(value.context, context);
});
test("NANO-03 invented facts and malformed local output rejected", async () => {
  for (const raw of [
    "not JSON",
    '{"factIds":["gaming_fit"],"proposal":null}',
    '{"factIds":[],"proposal":{"budget":-1}}',
  ])
    await assert.rejects(() =>
      localAdvice(
        bridge(async () => raw),
        context,
        listing,
        INITIAL_REQUIREMENTS,
        "",
        new AbortController().signal,
      ),
    );
});
test("NANO-04 cancellation propagates to native request and rejects presentation immediately", async () => {
  let cancelId = "";
  const controller = new AbortController();
  const local = {
    ...bridge(async () => new Promise<string>(() => {})),
    cancel: (id: string) => {
      cancelId = id;
    },
  };
  const result = localAdvice(
    local,
    context,
    listing,
    INITIAL_REQUIREMENTS,
    "",
    controller.signal,
  );
  controller.abort();
  await assert.rejects(() => result, /ABORTED/);
  assert.equal(cancelId, context.requestId);
});
test("NANO-05 proposal stays separate from confirmed requirements", async () => {
  const proposal = { ...INITIAL_REQUIREMENTS, minRam: 32 };
  const result = await localAdvice(
    bridge(async () => JSON.stringify({ factIds: [], proposal })),
    context,
    listing,
    INITIAL_REQUIREMENTS,
    "",
    new AbortController().signal,
  );
  assert.equal(result.proposal?.minRam, 32);
  assert.equal(INITIAL_REQUIREMENTS.minRam, 0);
});
test("NANO-06 overlong input/output and pre-aborted requests fail without inference", async () => {
  let calls = 0;
  const local = bridge(async () => {
    calls++;
    return "x".repeat(16001);
  });
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(
    () =>
      localAdvice(
        local,
        context,
        listing,
        INITIAL_REQUIREMENTS,
        "",
        aborted.signal,
      ),
    /ABORTED/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    () =>
      localAdvice(
        local,
        context,
        listing,
        INITIAL_REQUIREMENTS,
        "x".repeat(2001),
        new AbortController().signal,
      ),
    /INPUT_TOO_LARGE/,
  );
  assert.equal(calls, 0);
  await assert.rejects(
    () =>
      localAdvice(
        local,
        context,
        listing,
        INITIAL_REQUIREMENTS,
        "",
        new AbortController().signal,
      ),
    /OUTPUT_TOO_LARGE/,
  );
});

test("NANO-07 extra factual fields in a proposed requirement object are rejected",async()=>{await assert.rejects(()=>localAdvice(bridge(async()=>JSON.stringify({factIds:[],proposal:{...INITIAL_REQUIREMENTS,price:1,productId:"invented"}})),context,listing,INITIAL_REQUIREMENTS,"",new AbortController().signal));});
