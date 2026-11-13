import { test } from "node:test";
import assert from "node:assert/strict";
import {
  importConnectedHistory,
  listingReference,
  connectedDraft,
} from "./unified-adapters.ts";
import { referenceCandidate } from "./reference.ts";
import {
  selectReferences,
  referenceSeed,
  referenceRequirement,
} from "./reference.ts";
import { newProfile } from "./device-profile.ts";
test("legacy requirements migrate as a draft without guessing ranked purposes or priorities", () => {
  const draft = connectedDraft(
    JSON.stringify({
      requirements: {
        budget: 30000000,
        minRam: 16,
        minStorage: 1024,
        os: "Windows",
        tasks: ["Lập trình"],
      },
    }),
  )!;
  assert.equal(draft.ceilingVnd, 30000000);
  assert.equal(draft.minimumRamGiB, 16);
  assert.equal(draft.minimumStorageGiB, 1024);
  assert.equal(draft.confirmed, false);
  assert.deepEqual(draft.purposes, []);
  assert.deepEqual(draft.priorities, []);
});
import { assessCandidate } from "./advisor-engine.ts";
import { EMPTY_NEEDS } from "./picker.ts";
import data from "./real-catalog.json" with { type: "json" };
import type { Listing } from "./catalog.ts";
test("connected history preserves dated snapshots without inventing ranked profile confirmation", () => {
  const row = data.listings[0] as Listing;
  const old = {
    saved: [
      {
        id: "old",
        savedAt: "2026-11-11T12:00:00Z",
        catalogRevision: "old-revision",
        requirements: {
          budget: 25000000,
          minRam: 16,
          minStorage: 512,
          tasks: [],
          os: "",
        },
        listings: [row],
      },
    ],
  };
  const imported = importConnectedHistory(JSON.stringify(old));
  assert.equal(imported[0].row.id, row.id);
  assert.equal(imported[0].row.catalogVersion, "old-revision");
  assert.equal(imported[0].date, old.saved[0].savedAt);
  assert.equal(imported[0].needs.useOrderConfirmed, false);
  assert.equal(imported[0].legacyRequirements?.minStorage, 512);
  assert.equal(imported[0].needs.deviceProfile, undefined);
});
test("malformed legacy history cannot overwrite a healthy store", () => {
  assert.throws(() => importConnectedHistory('{"saved":[{}]}'));
  assert.deepEqual(importConnectedHistory(null), []);
});
test("quotation charges survive adapter and unknown charges remain unknown", () => {
  const row = data.listings[0] as Listing;
  const known = listingReference({ ...row, shipping: 0, fees: 100000 });
  const candidate = referenceCandidate(known, EMPTY_NEEDS);
  assert.equal(candidate.shipping, 0);
  assert.equal(candidate.fees, 100000);
  assert.equal(
    referenceCandidate(
      listingReference({ ...row, shipping: null, fees: null }),
      EMPTY_NEEDS,
    ).shipping,
    null,
  );
});
test("conflicting title specifications cannot become trusted reference RAM", () => {
  const row = data.listings[0] as Listing;
  const converted = listingReference({
    ...row,
    name: "Laptop 8GB/512GB SSD",
    ram: 16,
    storage: 512,
  });
  assert.equal(converted.ramGiB, null);
});
test("first launch supports direct catalog discovery without inventing a confirmed profile", () => {
  const needs = { ...EMPTY_NEEDS, deviceProfile: newProfile() };
  const result = selectReferences(referenceSeed.rows, needs, "iPad");
  assert.ok(result.visible.length > 0);
  assert.equal(result.run.qualified.length, 0);
});
test("minimum storage is a hard full-category constraint", () => {
  const needs = {
    ...EMPTY_NEEDS,
    deviceProfile: { ...newProfile(), minimumStorageGiB: 1024 },
  };
  const row = { ...referenceSeed.rows[0], storageGiB: 512 };
  const a = assessCandidate(
    referenceCandidate(row, needs),
    referenceRequirement(needs),
    Date.now(),
  );
  assert.equal(a.checks.find((c) => c.code === "STORAGE")?.state, "FAIL");
});
