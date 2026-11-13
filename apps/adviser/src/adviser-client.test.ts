import test from "node:test";
import assert from "node:assert/strict";
import {
  endpointUrl,
  fetchAdvice,
  fetchCatalog,
  submitListingReport,
} from "./adviser-client.ts";
import { INITIAL_REQUIREMENTS } from "./catalog.ts";
const context = {
  catalogRevision: "rev",
  decisionRevision: 1,
  focusId: "x",
  requestId: "request",
};
test("CLIENT-01 endpoint allows HTTPS and explicit local development only", () => {
  assert.equal(
    endpointUrl("https://api.example.com", "/v1/catalog"),
    "https://api.example.com/v1/catalog",
  );
  assert.equal(
    endpointUrl("http://127.0.0.1:8788", "/health"),
    "http://127.0.0.1:8788/health",
  );
  for (const url of [
    "http://example.com",
    "https://user:pass@example.com",
    "https://api.example.com/path",
    "file:///tmp",
    "https://api.example.com?token=secret",
  ])
    assert.throws(() => endpointUrl(url, "/health"));
});
test("CLIENT-02 stale, failed and malformed catalog responses are explicit failures", async () => {
  for (const [status, body] of [
    [409, "{}"],
    [503, "{}"],
    [200, "{}"],
    [200, "not-json"],
  ] as const) {
    const transport = (async () =>
      new Response(body, { status })) as typeof fetch;
    await assert.rejects(() =>
      fetchCatalog(
        "https://example.com",
        "",
        new AbortController().signal,
        transport,
      ),
    );
  }
});
test("CLIENT-03 advice transmits originating context and propagates signal/token", async () => {
  const controller = new AbortController();
  const transport = (async (url: any, options: any) => {
    assert.equal(options.signal, controller.signal);
    assert.equal(options.headers.Authorization, "Bearer service-token");
    assert.deepEqual(JSON.parse(options.body).context, context);
    return new Response(
      JSON.stringify({
        context,
        text: "Checked fact",
        proposal: null,
        mode: "provider",
      }),
    );
  }) as typeof fetch;
  const value = await fetchAdvice(
    "https://example.com",
    "service-token",
    context,
    INITIAL_REQUIREMENTS,
    "hello",
    controller.signal,
    transport,
  );
  assert.equal(value.text, "Checked fact");
});
test("CLIENT-04 stale advice, malformed proposals and aborted responses rejected", async () => {
  for (const patch of [
    { context: { ...context, focusId: "other" } },
    { proposal: { budget: -1 } },
    { mode: "fallback" },
  ]) {
    const transport = (async () =>
      new Response(
        JSON.stringify({
          context,
          text: "x",
          proposal: null,
          mode: "provider",
          ...patch,
        }),
      )) as typeof fetch;
    await assert.rejects(() =>
      fetchAdvice(
        "https://example.com",
        "",
        context,
        INITIAL_REQUIREMENTS,
        "",
        new AbortController().signal,
        transport,
      ),
    );
  }
  const controller = new AbortController();
  const transport = (async () => {
    controller.abort();
    return new Response("{}");
  }) as typeof fetch;
  await assert.rejects(
    () => fetchCatalog("https://example.com", "", controller.signal, transport),
    /ABORTED/,
  );
});
test("CLIENT-05 submitListingReport validates report submission envelope", async () => {
  const transport = (async (_url: any, options: any) => {
    const sent = JSON.parse(options.body);
    assert.equal(sent.listingId, "fptshop:1");
    assert.equal(sent.category, "price");
    return new Response(
      JSON.stringify({
        report: {
          id: "rep-1",
          listingId: "fptshop:1",
          category: "price",
          status: "open",
        },
      }),
      { status: 201 },
    );
  }) as typeof fetch;
  const out = await submitListingReport(
    "https://example.com",
    "tok",
    { listingId: "fptshop:1", category: "price", note: "Price changed" },
    new AbortController().signal,
    transport,
  );
  assert.equal(out.id, "rep-1");
});

