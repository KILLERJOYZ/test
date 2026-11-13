import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createAdviserServer,
  createBudget,
  configuredProvider,
} from "./server.mjs";
import { importCatalog } from "../../apps/adviser/scripts/import-catalog.mjs";
const fixture = () => ({
  generatedAt: "2026-11-13T00:00:00Z",
  products: [
    {
      id: "1",
      source: "retailer",
      name: "Exact listing",
      url: "https://example.com/item",
      condition: "new",
      pricing: { current: 20000000 },
      specs: { ram: "16 GB", storage: "1 TB" },
      metadata: { crawledAt: "2026-11-12T00:00:00Z" },
    },
  ],
});
const r = {
  budget: 25000000,
  minRam: 16,
  minStorage: 512,
  os: "",
  tasks: ["code"],
};
async function withServer(options, fn) {
  const server = createAdviserServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
function body(raw = fixture()) {
  return {
    requirements: r,
    message: "Explain",
    context: {
      catalogRevision: importCatalog(raw).revision,
      decisionRevision: 1,
      focusId: "retailer:1",
      requestId: "1",
    },
  };
}
const post = (url, data) =>
  fetch(url + "/v1/advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
test("HTTP-REAL-01 catalog reflects changed repository feed without service restart", () =>
  withServer({ readFeed: () => raw }, async (url) => {
    var unused;
    const first = await (await fetch(url + "/v1/catalog")).json();
    raw = fixture();
    raw.products[0].pricing.current = 21000000;
    const second = await (await fetch(url + "/v1/catalog")).json();
    assert.notEqual(first.catalog.revision, second.catalog.revision);
    assert.equal(second.catalog.listings[0].advertisedPrice, 21000000);
  }));
let raw = fixture();
test("HTTP-REAL-02 failure is distinct from successful empty source", async () => {
  await withServer(
    {
      readFeed: () => {
        throw Error("source");
      },
    },
    async (url) => assert.equal((await fetch(url + "/v1/catalog")).status, 503),
  );
  await withServer(
    { readFeed: () => ({ ...fixture(), products: [] }) },
    async (url) =>
      assert.deepEqual(
        (await (await fetch(url + "/v1/catalog")).json()).catalog.listings,
        [],
      ),
  );
});
test("HTTP-REAL-03 AI uses checked facts and echoes full originating context", () =>
  withServer(
    {
      readFeed: fixture,
      provider: async () => ({ factIds: ["cost", "price"], proposal: r }),
    },
    async (url) => {
      const data = body();
      const response = await post(url, data);
      assert.equal(response.status, 200);
      const out = await response.json();
      assert.deepEqual(out.context, data.context);
      assert.match(out.text, /20\.000\.000/);
      assert.deepEqual(out.proposal, r);
    },
  ));
test("HTTP-REAL-04 stale catalog and unknown focus rejected before provider", () =>
  withServer(
    { readFeed: fixture, provider: async () => assert.fail("provider") },
    async (url) => {
      assert.equal(
        (
          await post(url, {
            ...body(),
            context: { ...body().context, catalogRevision: "old" },
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await post(url, {
            ...body(),
            context: { ...body().context, focusId: "fake" },
          })
        ).status,
        400,
      );
    },
  ));
test("HTTP-REAL-05 replacement during provider rejects stale response", async () => {
  let feed = fixture();
  await withServer(
    {
      readFeed: () => feed,
      provider: async () => {
        feed = { ...feed, products: [] };
        return { factIds: ["cost"], proposal: null };
      },
    },
    async (url) => assert.equal((await post(url, body())).status, 409),
  );
});
test("HTTP-REAL-06 unavailable AI and invented facts remain failures", async () => {
  await withServer({ readFeed: fixture }, async (url) =>
    assert.equal((await post(url, body())).status, 503),
  );
  await withServer(
    {
      readFeed: fixture,
      provider: async () => ({
        factIds: ["perfect_for_gaming"],
        proposal: null,
      }),
    },
    async (url) => assert.equal((await post(url, body())).status, 502),
  );
});
test("HTTP-REAL-07 token prevents unauthorized access", () =>
  withServer({ readFeed: fixture, token: "secret" }, async (url) => {
    assert.equal((await fetch(url + "/v1/catalog")).status, 401);
    assert.equal(
      (
        await fetch(url + "/v1/catalog", {
          headers: { Authorization: "Bearer secret" },
        })
      ).status,
      200,
    );
  }));
test("BUDGET-01 durable reserves bound retries and survive restart", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adviser-budget-"));
  try {
    const file = path.join(dir, "usage.json"),
      limits = { maxRequests: 3, maxVnd: 100, reserveVnd: 60 };
    const a = createBudget(file, limits);
    a.reserve();
    const b = createBudget(file, limits);
    assert.deepEqual(b.status(), { requests: 1, reservedVnd: 60 });
    assert.throws(() => b.reserve(), /AI_LIMIT/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test("BUDGET-02 invalid limits and corrupt ledger fail closed", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adviser-budget-"));
  try {
    const file = path.join(dir, "usage.json");
    assert.throws(() =>
      createBudget(file, {
        maxRequests: 0,
        maxVnd: 10,
        reserveVnd: 1,
      }).reserve(),
    );
    fs.writeFileSync(file, "{}");
    assert.throws(() => createBudget(file, {}), /INVALID_USAGE_LEDGER/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test("PROVIDER-01 no configuration never enables live calls", () =>
  assert.equal(configuredProvider({}), null));
test("PROVIDER-02 Responses adapter parses bounded output and forwards abort", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adviser-provider-"));
  try {
    const env = {
      OPENAI_API_KEY: "test-not-real",
      OPENAI_MODEL: "configured-test-model",
      AI_AUTHORIZATION_REF: "test",
      AI_PRICE_EVIDENCE_REF: "test",
      AI_LEDGER_PATH: path.join(dir, "usage"),
      AI_MAX_REQUESTS: "1",
      AI_MAX_VND: "10",
      AI_RESERVE_PER_REQUEST_VND: "10",
    };
    const controller = new AbortController();
    const provider = configuredProvider(env, async (url, opts) => {
      assert.equal(opts.signal, controller.signal);
      const sent = JSON.parse(opts.body);
      assert.equal(sent.store, false);
      assert.equal(sent.max_output_tokens, 700);
      return new Response(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({ factIds: ["cost"], proposal: null }),
                },
              ],
            },
          ],
        }),
      );
    });
    assert.deepEqual(await provider({}, controller.signal), {
      factIds: ["cost"],
      proposal: null,
    });
    await assert.rejects(() => provider({}, controller.signal), /AI_LIMIT/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
