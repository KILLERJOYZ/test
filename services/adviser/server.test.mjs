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
import { createGovernanceStore, redactSensitive } from "./governance.mjs";
import { evaluatePilotSnapshot } from "./pilot-eval.mjs";
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
test("GOV-01 source-use grants enforce per-purpose publication and suspend listings on revocation", async () => {
  const gov = createGovernanceStore({
    clock: () => "2026-11-13T00:00:00Z",
    initialActors: {
      admin: { id: "admin", role: "ops_admin", token: "adm-tok", revoked: false },
    },
  });
  await withServer(
    { readFeed: fixture, governance: gov, enforceSourceGrants: true },
    async (url) => {
      const blocked = await (await fetch(url + "/v1/catalog")).json();
      assert.equal(blocked.catalog.listings.length, 0);
      gov.upsertGrant("adm-tok", {
        source: "retailer",
        status: "permitted",
        purposes: ["catalog_display"],
        expiresAt: "2026-12-31T00:00:00Z",
      });
      const permitted = await (await fetch(url + "/v1/catalog")).json();
      assert.equal(permitted.catalog.listings.length, 1);
      gov.upsertGrant("adm-tok", {
        source: "retailer",
        status: "revoked",
        purposes: ["catalog_display"],
      });
      const afterRevoke = await (await fetch(url + "/v1/catalog")).json();
      assert.equal(afterRevoke.catalog.listings.length, 0);
    },
  );
});
test("GOV-02 staff RBAC, token revocation, staging->review->publish->archive tombstones and evidence withdrawal", () => {
  const gov = createGovernanceStore({
    clock: () => "2026-11-13T00:00:00Z",
    initialActors: {
      admin: { id: "admin", role: "ops_admin", token: "adm-tok", revoked: false },
    },
    initialGrants: {
      retailer: {
        source: "retailer",
        status: "permitted",
        purposes: ["catalog_display"],
        expiresAt: "2026-12-31T00:00:00Z",
        revoked: false,
      },
    },
  });
  gov.registerActor("adm-tok", {
    id: "ed1",
    role: "catalog_editor",
    token: "ed-tok",
  });
  gov.registerActor("adm-tok", {
    id: "rev1",
    role: "reviewer",
    token: "rev-tok",
  });
  const item = importCatalog(fixture()).listings[0];
  gov.stageListing("ed-tok", item, ["EV-1"]);
  assert.throws(
    () => gov.transitionListing("ed-tok", item.id, "published"),
    /FORBIDDEN_ROLE/,
  );
  assert.throws(
    () => gov.transitionListing("rev-tok", item.id, "published"),
    /PUBLISH_REQUIRES_REVIEW/,
  );
  gov.transitionListing("rev-tok", item.id, "reviewed");
  const pub = gov.transitionListing("rev-tok", item.id, "published");
  assert.equal(pub.publicationState, "published");
  gov.upsertEvidence("rev-tok", { id: "EV-1", withdrawn: true });
  assert.equal(
    gov.filterPublishedCatalog(importCatalog(fixture())).listings.length,
    0,
  );
  gov.transitionListing("adm-tok", item.id, "archived", "superseded");
  assert.equal(gov.tombstone(item.id)?.reason, "superseded");
  gov.revokeActor("adm-tok", "ed1");
  assert.throws(
    () => gov.stageListing("ed-tok", item),
    /FORBIDDEN_REVOKED/,
  );
});
test("GOV-03 user report -> staff resolution -> backup/restore and sensitive telemetry redaction", async () => {
  const gov = createGovernanceStore({
    clock: () => "2026-11-13T00:00:00Z",
    initialActors: {
      admin: { id: "admin", role: "ops_admin", token: "adm-tok", revoked: false },
    },
  });
  const redacted = redactSensitive({
    token: "secret-123",
    nested: { authorization: "Bearer xyz", prompt: "private question", safe: 42 },
  });
  assert.equal(redacted.token, "[REDACTED]");
  assert.equal(redacted.nested.authorization, "[REDACTED]");
  assert.equal(redacted.nested.prompt, "[REDACTED]");
  assert.equal(redacted.nested.safe, 42);
  await withServer({ readFeed: fixture, governance: gov }, async (url) => {
    const res = await fetch(url + "/v1/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: "retailer:1",
        category: "price",
        note: "Giá thực tế tại cửa hàng đã tăng",
      }),
    });
    assert.equal(res.status, 201);
    const { report } = await res.json();
    const resolved = gov.resolveReport("adm-tok", report.id, {
      suspend: true,
      note: "Đã tạm ẩn để kiểm tra giá",
    });
    assert.equal(resolved.status, "resolved");
    const backup = gov.exportBackup("adm-tok");
    gov.submitReport({
      listingId: "retailer:1",
      category: "stock",
      note: "Out of stock",
    });
    assert.equal(gov.reports().length, 2);
    gov.restoreBackup("adm-tok", backup);
    assert.equal(gov.reports().length, 1);
    const auditRes = await fetch(url + "/v1/admin/audit", {
      headers: { Authorization: "Bearer adm-tok" },
    });
    assert.equal(auditRes.status, 200);
  });
});
test("GOV-04 HTTP admin endpoints enforce RBAC and persist governance state across restarts", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adviser-gov-"));
  try {
    const file = path.join(dir, "gov.json");
    const gov1 = createGovernanceStore({
      clock: () => "2026-11-13T00:00:00Z",
      persistenceFile: file,
      initialActors: {
        admin: { id: "admin", role: "ops_admin", token: "adm-tok", revoked: false },
        editor: { id: "editor", role: "catalog_editor", token: "ed-tok", revoked: false },
      },
    });
    await withServer({ readFeed: fixture, governance: gov1, enforceSourceGrants: true }, async (url) => {
      const forbidden = await fetch(url + "/v1/admin/grants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ed-tok",
        },
        body: JSON.stringify({
          source: "retailer",
          status: "permitted",
          purposes: ["catalog_display"],
        }),
      });
      assert.equal(forbidden.status, 403);
      const ok = await fetch(url + "/v1/admin/grants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer adm-tok",
        },
        body: JSON.stringify({
          source: "retailer",
          status: "permitted",
          purposes: ["catalog_display"],
          expiresAt: "2026-12-31T00:00:00Z",
        }),
      });
      assert.equal(ok.status, 200);
    });
    const gov2 = createGovernanceStore({
      clock: () => "2026-11-13T00:00:00Z",
      persistenceFile: file,
    });
    assert.equal(gov2.canPublishSource("retailer"), true);
    assert.ok(gov2.auditLog().some((e) => e.action === "upsert_grant"));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test("PILOT-01 fixed-snapshot evaluation across 70 real listings enforces zero hard violations and verifies upgrade/task arms", () => {
  const realRaw = JSON.parse(
    fs.readFileSync(
      new URL("../../data/all_laptops_normalized.json", import.meta.url),
      "utf8",
    ),
  );
  const realCatalog = importCatalog(realRaw);
  const report = evaluatePilotSnapshot(realCatalog);
  assert.equal(report.listingCount, 70);
  assert.equal(report.profileCount, 8);
  assert.equal(report.hardConstraintViolations, 0);
  assert.equal(report.unresolvedConflictPromotions, 0);
  assert.equal(report.quotationIntakeVerified, true);
  const noFit = report.profiles.find((p) => p.id === "PROF-05-TIGHT-NO-FIT");
  assert.equal(noFit?.eligibleCount, 0);
  const dev = report.profiles.find((p) => p.id === "PROF-02-DEV-MAINSTREAM");
  assert.ok(dev && dev.eligibleCount > 0 && dev.taskStrengthMatchCount > 0);
});



