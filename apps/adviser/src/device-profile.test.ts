import test from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES,
  PURPOSES,
  DEVICE_PRIORITIES,
  bands,
  newProfile,
  changeCategory,
  setPurposes,
  reorder,
  questions,
  profileErrors,
  validateRestoredProfile,
  parseDeviceText,
  applyDeviceText,
  type Category,
} from "./device-profile.ts";
import { recommendCandidates, dimensionWeights } from "./advisor-engine.ts";
const complete = (category: Category) => {
  const p = changeCategory(newProfile(), category);
  p.purposes = PURPOSES[category].slice(0, 3).map((x) => x.id);
  p.priorities = ["strength", "battery", "display"];
  p.bandId = bands(category)[1].id;
  p.ceilingVnd = 20000000;
  for (const q of questions(p))
    p.answers[q.id] = { value: "UNKNOWN", origin: "FORM", confirmed: true };
  return p;
};
test("taxonomy retains all 19 purposes and ten priorities with stable IDs", () => {
  assert.deepEqual(CATEGORIES, ["Phone", "Tablet", "PC"]);
  assert.deepEqual(
    CATEGORIES.map((c) => PURPOSES[c].length),
    [6, 5, 8],
  );
  assert.equal(DEVICE_PRIORITIES.length, 10);
  assert.equal(
    new Set(
      Object.values(PURPOSES)
        .flat()
        .map((p) => p.id),
    ).size,
    19,
  );
});
for (const category of CATEGORIES)
  test(`${category}: complete profile and all ranked selections validate`, () => {
    const p = complete(category);
    assert.deepEqual(profileErrors(p), []);
    assert.equal(
      profileErrors({ ...p, purposes: p.purposes.slice(0, 2) }).some((e) =>
        e.includes("ba mục đích"),
      ),
      true,
    );
    assert.equal(
      profileErrors({ ...p, priorities: ["strength", "battery"] }).length > 0,
      true,
    );
    assert.equal(
      profileErrors({
        ...p,
        purposes: [p.purposes[0], p.purposes[0], p.purposes[2]],
      }).length > 0,
      true,
    );
    assert.ok(
      Object.values(dimensionWeights(p.purposes, p.priorities)).every(
        Number.isFinite,
      ),
    );
  });
test("category change clears dependent choices including minimumStorageGiB but preserves budget", () => {
  const old = {
    ...complete("Tablet"),
    os: "iPadOS",
    formFactor: "2-in-1",
    minimumRamGiB: 16,
    minimumStorageGiB: 512,
  };
  const next = changeCategory(old, "Phone");
  assert.equal(next.ceilingVnd, old.ceilingVnd);
  assert.deepEqual(next.answers, {});
  assert.deepEqual(next.purposes, []);
  assert.equal(next.os, null);
  assert.equal(next.minimumRamGiB, null);
  assert.equal(next.minimumStorageGiB, null);
  assert.ok(
    profileErrors({ ...complete("PC"), ceilingVnd: 2_000_000_000 }).length > 0,
  );
  assert.ok(
    profileErrors({ ...complete("PC"), minimumRamGiB: 2048 }).length > 0,
  );
  assert.ok(
    profileErrors({ ...complete("PC"), minimumStorageGiB: 200000 }).length > 0,
  );
});
test("tier boundaries exactly match the attachment, including PC 62/92M", () => {
  assert.deepEqual(
    bands("PC").map((b) => b.min),
    [0, 16000000, 32000000, 62000000, 92000000],
  );
  assert.deepEqual(bands("Phone"), bands("Tablet"));
  for (const c of CATEGORIES) {
    const list = bands(c);
    for (let i = 0; i < 4; i++) assert.equal(list[i].max, list[i + 1].min);
    assert.equal(list[4].max, null);
  }
});
test("OS and form factor are category-specific and require explicit choices", () => {
  const p = complete("Phone");
  p.priorities = ["operating_system", "form_factor", "strength"];
  assert.ok(profileErrors(p).length);
  assert.ok(
    profileErrors({ ...p, os: "Windows", formFactor: "2-in-1" }).length,
  );
  assert.deepEqual(
    profileErrors({ ...p, os: "Android", formFactor: "Foldable" }),
    [],
  );
});
test("questions stay attached to purpose IDs and dependent answers are cleared", () => {
  const p = complete("PC");
  const next = setPurposes(p, [
    p.purposes[1],
    p.purposes[2],
    PURPOSES.PC[3].id,
  ]);
  assert.ok(!next.answers[p.purposes[0]]);
  assert.ok(next.answers[p.purposes[1]]);
  assert.ok(profileErrors(next).length);
  assert.equal(reorder([1, 2, 3], 2, -1).join(","), "1,3,2");
});
test("unknown accessory costs do not become zero; invalid budgets and future schema are rejected", () => {
  assert.deepEqual(
    profileErrors({ ...complete("Tablet"), accessoriesVnd: null }),
    [],
  );
  assert.ok(profileErrors({ ...complete("Phone"), ceilingVnd: null }).length);
  assert.ok(
    profileErrors({ ...complete("Phone"), targetVnd: 30000000 }).length,
  );
  assert.throws(() =>
    validateRestoredProfile({ ...complete("PC"), schema: 2 }),
  );
  assert.throws(() =>
    validateRestoredProfile({ ...complete("PC"), category: "bad" }),
  );
});
test("text changes remain proposed, preserve omitted fields and reject old revisions", () => {
  const p = complete("PC");
  const proposal = parseDeviceText("Phone tối đa 20 triệu", p);
  assert.equal(p.category, "PC");
  const next = applyDeviceText(p, proposal);
  assert.equal(next.category, "Phone");
  assert.equal(next.ceilingVnd, 20000000);
  assert.deepEqual(next.purposes, []);
  assert.throws(() =>
    applyDeviceText({ ...p, revision: p.revision + 1 }, proposal),
  );
  assert.throws(() => parseDeviceText("Tầm 20 triệu", p));
  assert.throws(() => parseDeviceText("Tối đa 20 triệu và tối đa 30 triệu", p));
});
test("every planned purpose and priority is accepted by the engine, with missing evidence explicit", () => {
  for (const category of CATEGORIES)
    for (const purpose of PURPOSES[category]) {
      const result = recommendCandidates(
        [],
        {
          revision: 1,
          confirmed: true,
          category: category.toLowerCase(),
          market: "VN",
          currency: "VND",
          ceiling: 20000000,
          purposes: [purpose.id],
          priorities: DEVICE_PRIORITIES.map((p) => p.id).slice(0, 3),
          constraints: {},
          workloads: [],
        },
        "test",
      );
      assert.equal(result.errors.length, 0);
    }
});

test("ambiguous and negated text abstains instead of silently choosing a category", () => {
  const p = complete("PC");
  assert.throws(() => parseDeviceText("Phone hay Tablet tối đa 20 triệu", p));
  assert.throws(() => parseDeviceText("Không cần phone tối đa 20 triệu", p));
});
test("desktop applicability is renormalized consistently in ranking and explanation", () => {
  const r = {
    revision: 1,
    confirmed: true,
    category: "desktop",
    market: "VN",
    currency: "VND",
    ceiling: 20000000,
    purposes: ["pc.student"],
    priorities: ["battery", "portability", "performance"],
    constraints: {},
    workloads: [],
    notApplicable: ["battery", "portability"] as const,
  };
  const result = recommendCandidates(
    [],
    { ...r, notApplicable: [...r.notApplicable] },
    "test",
  );
  assert.equal(result.weights.battery, undefined);
  assert.equal(result.weights.portability, undefined);
  assert.ok(
    Math.abs(Object.values(result.weights).reduce((a, b) => a + b, 0) - 1) <
      1e-10,
  );
});
test("invalid restored answer types and unknown warranty cannot be confirmed", () => {
  assert.throws(() =>
    validateRestoredProfile({
      ...complete("PC"),
      answers: { "pc.student": { value: 3 } },
    }),
  );
  assert.throws(() =>
    validateRestoredProfile({ ...complete("PC"), purposes: [{}] }),
  );
  assert.ok(profileErrors({ ...complete("PC"), warranty: "bogus" }).length);
});

test("accepted text patch retains source text and unconfirmed provenance", () => {
  const p = complete("PC");
  const next = applyDeviceText(p, parseDeviceText("Phone tối đa 20 triệu", p));
  assert.equal(next.provenance?.ceilingVnd?.origin, "USER_TEXT");
  assert.equal(next.provenance?.category?.evidence, "Phone tối đa 20 triệu");
  assert.equal(next.provenance?.ceilingVnd?.confirmed, false);
});
