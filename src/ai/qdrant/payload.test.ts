import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import {
  allowEvidencePayload,
  approvedEvidenceFilter,
  buildChunkPayload,
  pointId,
} from "./payload.js";

const approved = {
  evidence_id: "e1",
  model_id: "m1",
  variant_id: "v1",
  sku_code: "SKU",
  source_url: "https://example.test/review",
  measured_at: "2026-03-01",
  status: "approved",
  claim: "pin 6 giờ",
  source_label: "Relab",
};

test("draft payloads stay out and approved payloads need every identity field", () => {
  const draft = buildChunkPayload({ ...approved, status: "draft" });
  assert.equal(draft.status, "draft");
  assert.equal(allowEvidencePayload(draft, ["v1"]), false);

  const ready = buildChunkPayload(approved);
  assert.equal(allowEvidencePayload(ready, ["v1"]), true);
  assert.equal(allowEvidencePayload(ready, ["v1"], ["SKU"]), true);
  assert.equal(allowEvidencePayload(ready, ["v1"], ["OTHER"]), false);
  assert.equal(allowEvidencePayload({ ...ready, source_url: "" }, ["v1"]), false);
  assert.equal(allowEvidencePayload(ready, ["other"]), false);
  assert.throws(() => buildChunkPayload({ ...approved, source_url: "" }), /source_url/);
});

test("approved filter matches variant ids, exact sku codes and status", () => {
  assert.deepEqual(approvedEvidenceFilter(["v1", "v2"]), {
    must: [
      { key: "variant_id", match: { any: ["v1", "v2"] } },
      { key: "status", match: { value: "approved" } },
    ],
  });
  assert.deepEqual(approvedEvidenceFilter(["v1"], ["SKU-1", "SKU-1", "SKU-2"]), {
    must: [
      { key: "variant_id", match: { any: ["v1"] } },
      { key: "status", match: { value: "approved" } },
      { key: "sku_code", match: { any: ["SKU-1", "SKU-2"] } },
    ],
  });
});

test("point ids match Python uuid5", () => {
  const expected = execFileSync(
    "python",
    [
      "-c",
      "import uuid; print(uuid.uuid5(uuid.UUID('6f0c1a2e-4b7d-4e5a-9c1f-8a2b3c4d5e6f'), 'evidence-1'))",
    ],
    { encoding: "utf8" },
  ).trim();
  assert.equal(pointId("evidence-1"), expected);
});
