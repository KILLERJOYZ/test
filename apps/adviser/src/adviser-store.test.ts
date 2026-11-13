import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { URL } from "node:url";
import { INITIAL_REQUIREMENTS } from "./catalog.ts";
import { createAdviserStore, validState } from "./adviser-store.ts";
import type { AdviserState } from "./adviser-store.ts";
const catalog = JSON.parse(
  fs.readFileSync(new URL("./real-catalog.json", import.meta.url), "utf8"),
);
const initial: AdviserState = {
  schemaVersion: 1,
  requirements: INITIAL_REQUIREMENTS,
  revision: 0,
  saved: [],
  catalog,
  endpoint: "",
  token: "",
};
test("STORE-01 failed initial read blocks writes until explicit recovery", async () => {
  let writes = 0;
  const store = createAdviserStore(
    initial,
    async () => {
      throw Error("read");
    },
    async () => {
      writes++;
    },
    () => {},
  );
  assert.equal(await store.load(), false);
  assert.equal(await store.update((s) => ({ ...s, revision: 1 })), false);
  assert.equal(writes, 0);
  assert.equal(await store.update(() => initial, true), true);
  assert.equal(writes, 1);
});
test("STORE-02 malformed restore preserves bytes and blocks mutation", async () => {
  const store = createAdviserStore(
    initial,
    async () => "{}",
    async () => assert.fail("write"),
    () => {},
  );
  assert.equal(await store.load(), false);
  assert.equal(store.ready(), false);
});
test("STORE-03 queued updates reduce latest committed state", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  let n = 0;
  const store = createAdviserStore(
    initial,
    async () => null,
    async () => {
      if (++n === 1) await gate;
    },
    () => {},
  );
  await store.load();
  const a = store.update((s) => ({ ...s, revision: s.revision + 1 })),
    b = store.update((s) => ({ ...s, revision: s.revision + 1 }));
  release();
  assert.ok(await a);
  assert.ok(await b);
  assert.equal(store.current().revision, 2);
});
test("STORE-04 failed write and throwing reducer preserve prior state and usable queue", async () => {
  let fail = true;
  const store = createAdviserStore(
    initial,
    async () => null,
    async () => {
      if (fail) throw Error("disk");
    },
    () => {},
  );
  await store.load();
  assert.equal(await store.update((s) => ({ ...s, revision: 9 })), false);
  assert.equal(store.current().revision, 0);
  fail = false;
  assert.equal(
    await store.update(() => {
      throw Error("reducer");
    }),
    false,
  );
  assert.ok(await store.update((s) => ({ ...s, revision: 1 })));
});
test("STORE-05 delete serializes after save and restart restores final state", async () => {
  let raw: string | null = null;
  const store = createAdviserStore(
    initial,
    async () => null,
    async (s) => {
      raw = s;
    },
    () => {},
  );
  await store.load();
  const saved = {
    id: "1",
    savedAt: new Date().toISOString(),
    catalogRevision: catalog.revision,
    requirements: INITIAL_REQUIREMENTS,
    listings: [catalog.listings[0]],
  };
  await Promise.all([
    store.update((s) => ({ ...s, saved: [saved] })),
    store.update((s) => ({ ...s, saved: [] })),
  ]);
  const reopened = createAdviserStore(
    initial,
    async () => raw,
    async () => {},
    () => {},
  );
  assert.ok(await reopened.load());
  assert.deepEqual(reopened.current().saved, []);
  assert.ok(validState(reopened.current()));
});
