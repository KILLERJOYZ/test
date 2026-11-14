import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PUBLICATION_STATES = new Set([
  "draft",
  "reviewed",
  "published",
  "suspended",
  "archived",
]);

const ROLE_PERMISSIONS = {
  catalog_editor: new Set(["stage_listing", "triage_report"]),
  reviewer: new Set([
    "stage_listing",
    "review_listing",
    "publish_listing",
    "suspend_listing",
    "triage_report",
    "resolve_report",
    "withdraw_evidence",
    "view_audit",
  ]),
  ops_admin: new Set([
    "stage_listing",
    "review_listing",
    "publish_listing",
    "suspend_listing",
    "archive_listing",
    "manage_grants",
    "manage_roles",
    "triage_report",
    "resolve_report",
    "withdraw_evidence",
    "view_audit",
    "backup_restore",
  ]),
};

const SENSITIVE_KEYS =
  /^(token|authorization|apikey|api_key|openai_api_key|password|secret|prompt|message)$/i;

const ALLOWLISTED_RETAILER_HOSTS = {
  cellphones: "cellphones.com.vn",
  fptshop: "fptshop.com.vn",
  thegioididong: "thegioididong.com",
  dienmayxanh: "dienmayxanh.com",
  gearvn: "gearvn.com",
  phongvu: "phongvu.vn",
  hacom: "hacom.vn",
  laptopaz: "laptopaz.vn",
  trungtran: "trungtran.vn",
  apple: "apple.com",
  samsung: "samsungmobilepress.com",
};
const ALLOWED_HOST_SET = new Set(Object.values(ALLOWLISTED_RETAILER_HOSTS));
const KNOWN_BRANDS = [
  "lenovo",
  "asus",
  "acer",
  "dell",
  "hp",
  "apple",
  "msi",
  "gigabyte",
  "lg",
  "samsung",
  "huawei",
  "microsoft",
];
const QA_STOP_WORDS = new Set([
  "laptop",
  "máy",
  "tính",
  "xách",
  "tay",
  "chính",
  "hãng",
  "gaming",
  "mới",
]);

export function hashStaffToken(rawToken) {
  return crypto.createHash("sha256").update(String(rawToken), "utf8").digest("hex");
}

function timingSafeHexMatch(hexA, hexB) {
  if (typeof hexA !== "string" || typeof hexB !== "string") return false;
  if (hexA.length !== 64 || hexB.length !== 64) return false;
  const bufA = Buffer.from(hexA, "hex");
  const bufB = Buffer.from(hexB, "hex");
  if (bufA.length !== 32 || bufB.length !== 32) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function normalizeActorRecord(actor) {
  if (!actor || typeof actor !== "object" || !actor.id || !ROLE_PERMISSIONS[actor.role]) {
    throw Error("INVALID_ACTOR");
  }
  let tokenHash = "";
  if (typeof actor.tokenHash === "string" && /^[a-f0-9]{64}$/i.test(actor.tokenHash)) {
    tokenHash = actor.tokenHash.toLowerCase();
  } else if (typeof actor.token === "string" && actor.token.length > 0) {
    tokenHash = hashStaffToken(actor.token);
  } else {
    throw Error("INVALID_ACTOR");
  }
  const normalized = structuredClone(actor);
  delete normalized.token;
  normalized.tokenHash = tokenHash;
  normalized.revoked = !!normalized.revoked;
  return normalized;
}

function normalizeActorsMap(actorsObj) {
  const out = {};
  if (!actorsObj || typeof actorsObj !== "object") return out;
  for (const [key, actor] of Object.entries(actorsObj)) {
    out[key] = normalizeActorRecord(actor);
  }
  return out;
}

export function redactSensitive(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactSensitive);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SENSITIVE_KEYS.test(k) ? "[REDACTED]" : redactSensitive(v);
  }
  return out;
}

function inferQaBrand(brand, name = "") {
  if (typeof brand === "string" && brand.trim()) return brand.trim().toLowerCase();
  const low = String(name).toLowerCase();
  if (low.includes("macbook")) return "apple";
  for (const b of KNOWN_BRANDS) {
    if (new RegExp(`\\b${b}\\b`, "i").test(low)) return b;
  }
  return "unknown";
}

function normalizeQaModelLine(brandSlug, model, name = "") {
  const raw = String(model || name || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+\s*(gb|tb)\b/gi, " ");
  let tokens = raw
    .split(/[^a-z0-9à-ỹ-]+/i)
    .filter((t) => t && !QA_STOP_WORDS.has(t) && t !== brandSlug);
  if (
    tokens.length >= 3 &&
    /^[a-z0-9]{7,}$/i.test(tokens[tokens.length - 1]) &&
    /\d/.test(tokens[tokens.length - 1])
  ) {
    tokens = tokens.slice(0, -1);
  }
  return (tokens.slice(0, 3).join("-") || "generic").toLowerCase();
}

function normalizeQaCpu(cpu, name = "") {
  const s = `${cpu || ""} ${name || ""}`.toLowerCase();
  const patterns = [
    /core\s*ultra\s*[579]\s*\d{3}[a-z]*/,
    /core\s*i[3579][-\s]*\d{4,5}[a-z]*/,
    /core\s*[3579]\s*\d{3}[a-z]*/,
    /ryzen\s*[3579]\s*\d{4}[a-z]*/,
    /m[1-4](?:\s*(?:pro|max))?/,
    /snapdragon\s*x(?:\s*elite|\s*plus)?/,
    /core\s*i[3579]/,
    /ryzen\s*[3579]/,
  ];
  for (const pat of patterns) {
    const m = s.match(pat);
    if (m) return m[0].trim().replace(/[\s_-]+/g, "-");
  }
  if (typeof cpu === "string" && cpu.trim()) {
    return cpu.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "cpu-unknown";
  }
  return "cpu-unknown";
}

function normalizeQaGpu(gpu, name = "") {
  const s = `${gpu || ""} ${name || ""}`.toLowerCase();
  const m = s.match(/\b((?:rtx|gtx)\s*\d{4}(?:\s*ti)?|rx\s*\d{4}[a-z]*)\b/);
  if (m) return m[1].replace(/\s+/g, "");
  return "igpu";
}

function computeQaKeys(item) {
  const brandSlug = inferQaBrand(item.brand, item.name);
  const modelLine = normalizeQaModelLine(brandSlug, item.model, item.name);
  const familyKey = `${brandSlug}:${modelLine}`;
  const cpuSlug = normalizeQaCpu(item.cpu, item.name);
  const gpuSlug = normalizeQaGpu(item.gpu, item.name);
  const ramPart = Number.isFinite(item.ram) ? `${item.ram}gb` : "ram?";
  const ssdPart = Number.isFinite(item.storage) ? `${item.storage}gb` : "ssd?";
  const variantSku = `${cpuSlug}|${ramPart}|${ssdPart}|${gpuSlug}`;
  const specBucket = `${ramPart}|${ssdPart}|${gpuSlug}`;
  return { familyKey, variantSku, specBucket };
}

function checkRetailerLink(url, source = "") {
  try {
    const u = new URL(String(url || "").trim());
    if (u.protocol !== "https:") return "URL bắt buộc dùng giao thức https://.";
    if (u.username || u.password) return "URL không được chứa thông tin xác thực.";
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (!ALLOWED_HOST_SET.has(host)) {
      return `Tên miền '${host}' không nằm trong danh sách nhà bán lẻ được phép.`;
    }
    const srcKey = String(source || "").trim().toLowerCase();
    if (ALLOWLISTED_RETAILER_HOSTS[srcKey] && ALLOWLISTED_RETAILER_HOSTS[srcKey] !== host) {
      return `Tên miền '${host}' không khớp nguồn '${source}'.`;
    }
    return null;
  } catch {
    return "URL không hợp lệ.";
  }
}

function medianOf(nums) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function evaluateListingsQa(candidates, referenceListings = []) {
  if (!Array.isArray(candidates) || candidates.length === 0 || candidates.length > 200) {
    throw Error("INVALID_INPUT");
  }

  const seenSpecsById = new Map();
  const refByVariant = new Map();
  const refBySpecBucket = new Map();
  const batchByVariant = new Map();
  const batchBySpecBucket = new Map();

  for (const ref of referenceListings) {
    if (!ref || typeof ref !== "object") continue;
    if (ref.id) seenSpecsById.set(ref.id, { ram: ref.ram ?? null, storage: ref.storage ?? null });
    if (Number.isFinite(ref.advertisedPrice) && ref.advertisedPrice > 0) {
      const k = computeQaKeys(ref);
      if (!refByVariant.has(k.variantSku)) refByVariant.set(k.variantSku, []);
      refByVariant.get(k.variantSku).push(ref.advertisedPrice);
      if (Number.isFinite(ref.ram) && Number.isFinite(ref.storage)) {
        if (!refBySpecBucket.has(k.specBucket)) refBySpecBucket.set(k.specBucket, []);
        refBySpecBucket.get(k.specBucket).push(ref.advertisedPrice);
      }
    }
  }

  const working = candidates.map((item) => {
    if (!item || typeof item.id !== "string" || !item.id.trim() || typeof item.name !== "string" || !item.name.trim()) {
      throw Error("INVALID_INPUT");
    }
    const keys = computeQaKeys(item);
    if (Number.isFinite(item.advertisedPrice) && item.advertisedPrice > 0) {
      if (!batchByVariant.has(keys.variantSku)) batchByVariant.set(keys.variantSku, []);
      batchByVariant.get(keys.variantSku).push(item.advertisedPrice);
      if (Number.isFinite(item.ram) && Number.isFinite(item.storage)) {
        if (!batchBySpecBucket.has(keys.specBucket)) batchBySpecBucket.set(keys.specBucket, []);
        batchBySpecBucket.get(keys.specBucket).push(item.advertisedPrice);
      }
    }
    return {
      item,
      ...keys,
      flags: [],
      reasons: [],
      siblingMedianPrice: null,
      deviationRatio: null,
    };
  });

  for (const entry of working) {
    const { item, flags, reasons } = entry;
    const linkErr = checkRetailerLink(item.url, item.source);
    if (linkErr) {
      if (!flags.includes("invalid_link")) flags.push("invalid_link");
      reasons.push(linkErr);
    }

    const pair = item.name.match(/(\d+)\s*GB\s*[,/]\s*(\d+)\s*(GB|TB)/i);
    let titleRam = pair ? Number(pair[1]) : null;
    let titleStorage = pair ? Number(pair[2]) * (pair[3].toUpperCase() === "TB" ? 1024 : 1) : null;
    if (titleRam === null) {
      const mRam = item.name.match(/(?:\bram\s*(\d+)\s*gb\b|\b(\d+)\s*gb\s*ram\b)/i);
      if (mRam) titleRam = Number(mRam[1] || mRam[2]);
    }
    if (titleStorage === null) {
      const mSsd = item.name.match(/(?:\bssd\s*(\d+)\s*(gb|tb)\b|\b(\d+)\s*(gb|tb)\s*ssd\b)/i);
      if (mSsd) {
        const n = Number(mSsd[1] || mSsd[3]);
        const u = String(mSsd[2] || mSsd[4]).toUpperCase();
        titleStorage = u === "TB" ? n * 1024 : n;
      }
    }

    if (titleRam !== null && Number.isFinite(item.ram) && titleRam !== item.ram) {
      if (!flags.includes("spec_conflict")) flags.push("spec_conflict");
      reasons.push(`RAM mâu thuẫn: tiêu đề ${titleRam} GB, dữ liệu ${item.ram} GB.`);
    }
    if (titleStorage !== null && Number.isFinite(item.storage) && titleStorage !== item.storage) {
      if (!flags.includes("spec_conflict")) flags.push("spec_conflict");
      reasons.push(`Ổ lưu trữ mâu thuẫn: tiêu đề ${titleStorage} GB, dữ liệu ${item.storage} GB.`);
    }

    if (seenSpecsById.has(item.id)) {
      const prev = seenSpecsById.get(item.id);
      if (
        (Number.isFinite(prev.ram) && Number.isFinite(item.ram) && prev.ram !== item.ram) ||
        (Number.isFinite(prev.storage) && Number.isFinite(item.storage) && prev.storage !== item.storage)
      ) {
        if (!flags.includes("spec_conflict")) flags.push("spec_conflict");
        reasons.push(`Xung đột cấu hình cùng mã tin '${item.id}'.`);
      }
    } else {
      seenSpecsById.set(item.id, { ram: item.ram ?? null, storage: item.storage ?? null });
    }

    if (!Number.isFinite(item.advertisedPrice) || item.advertisedPrice <= 0) {
      if (!flags.includes("price_anomaly")) flags.push("price_anomaly");
      reasons.push("Giá niêm yết bị thiếu hoặc <= 0.");
    } else {
      let pool = [];
      if ((refByVariant.get(entry.variantSku) || []).length > 0) {
        pool = [...refByVariant.get(entry.variantSku)];
      } else if ((refBySpecBucket.get(entry.specBucket) || []).length > 0) {
        pool = [...refBySpecBucket.get(entry.specBucket)];
      } else {
        const rawBatch = [
          ...(batchByVariant.get(entry.variantSku) || batchBySpecBucket.get(entry.specBucket) || []),
        ];
        if (rawBatch.length >= 2) {
          const idx = rawBatch.indexOf(item.advertisedPrice);
          if (idx !== -1) rawBatch.splice(idx, 1);
        }
        pool = rawBatch.length >= 2 ? rawBatch : [];
      }
      const med = medianOf(pool);
      if (med && med > 0) {
        const dev = Math.abs(item.advertisedPrice - med) / med;
        entry.siblingMedianPrice = Math.round(med);
        entry.deviationRatio = Number(dev.toFixed(4));
        if (dev > 0.25) {
          if (!flags.includes("price_anomaly")) flags.push("price_anomaly");
          reasons.push(
            `Giá ${item.advertisedPrice} lệch ${(dev * 100).toFixed(1)}% (> 25%) so với trung vị cùng cấu hình (${Math.round(med)}).`,
          );
        }
      }
    }
  }

  const readyForBatchApprove = [];
  const flaggedForReview = [];
  for (const entry of working) {
    const outItem = {
      id: entry.item.id,
      name: entry.item.name,
      source: entry.item.source,
      url: entry.item.url,
      familyKey: entry.familyKey,
      variantSku: entry.variantSku,
      flags: entry.flags,
      reasons: entry.reasons,
      siblingMedianPrice: entry.siblingMedianPrice,
      deviationRatio: entry.deviationRatio,
    };
    if (entry.flags.length > 0) flaggedForReview.push(outItem);
    else readyForBatchApprove.push(outItem);
  }

  return {
    readyForBatchApprove,
    flaggedForReview,
    mode: "offline_rules_nano",
  };
}

export function createGovernanceStore({
  clock = () => new Date().toISOString(),
  initialActors = {},
  initialGrants = {},
  persistenceFile = "",
} = {}) {
  let seq = 0;
  let state = {
    schemaVersion: 1,
    actors: normalizeActorsMap(initialActors),
    grants: structuredClone(initialGrants),
    records: {},
    tombstones: {},
    evidence: {},
    reports: [],
    auditLog: [],
  };
  if (persistenceFile && fs.existsSync(persistenceFile)) {
    const raw = JSON.parse(fs.readFileSync(persistenceFile, "utf8"));
    if (
      !raw ||
      raw.schemaVersion !== 1 ||
      typeof raw.records !== "object" ||
      !Array.isArray(raw.auditLog) ||
      !Array.isArray(raw.reports)
    )
      throw Error("INVALID_GOVERNANCE_FILE");
    raw.actors = normalizeActorsMap(raw.actors);
    state = raw;
    seq = state.auditLog.length + state.reports.length;
  }

  function flushDisk() {
    if (!persistenceFile) return;
    fs.mkdirSync(path.dirname(persistenceFile), { recursive: true });
    fs.writeFileSync(persistenceFile + ".tmp", JSON.stringify(state));
    fs.renameSync(persistenceFile + ".tmp", persistenceFile);
  }

  if (persistenceFile && !fs.existsSync(persistenceFile) && Object.keys(state.actors).length > 0) {
    flushDisk();
  }

  function appendAudit(actorId, action, targetId, details = {}) {
    const entry = {
      id: `audit-${++seq}`,
      at: clock(),
      actorId,
      action,
      targetId,
      details: redactSensitive(details),
    };
    state.auditLog.push(entry);
    flushDisk();
    return entry;
  }

  function authenticate(bearerToken, requiredPermission) {
    if (!bearerToken || typeof bearerToken !== "string") throw Error("UNAUTHORIZED");
    const candidateHash = hashStaffToken(bearerToken);
    let actor = null;
    for (const candidate of Object.values(state.actors)) {
      if (timingSafeHexMatch(candidate.tokenHash, candidateHash)) {
        actor = candidate;
      }
    }
    if (!actor) throw Error("UNAUTHORIZED");
    if (actor.revoked) throw Error("FORBIDDEN_REVOKED");
    const perms = ROLE_PERMISSIONS[actor.role];
    if (!perms || (requiredPermission && !perms.has(requiredPermission))) {
      throw Error("FORBIDDEN_ROLE");
    }
    return actor;
  }

  function canPublishSource(source, nowIso = clock()) {
    const grant = state.grants[source];
    if (!grant) return false;
    if (grant.status !== "permitted" || grant.revoked) return false;
    if (
      !Array.isArray(grant.purposes) ||
      !grant.purposes.includes("catalog_display")
    )
      return false;
    if (grant.expiresAt) {
      const exp = Date.parse(grant.expiresAt);
      const now = Date.parse(nowIso);
      if (!Number.isFinite(exp) || !Number.isFinite(now) || now > exp)
        return false;
    }
    return true;
  }

  return {
    authenticate,
    canPublishSource,
    registerActor(adminToken, actor) {
      const admin = authenticate(adminToken, "manage_roles");
      const normalized = normalizeActorRecord({
        id: actor?.id,
        role: actor?.role,
        token: actor?.token,
        tokenHash: actor?.tokenHash,
        revoked: false,
        updatedAt: clock(),
      });
      state.actors[normalized.id] = normalized;
      appendAudit(admin.id, "register_actor", normalized.id, { role: normalized.role });
      return { id: normalized.id, role: normalized.role, revoked: false };
    },
    revokeActor(adminToken, targetActorId) {
      const admin = authenticate(adminToken, "manage_roles");
      const target = state.actors[targetActorId];
      if (!target) throw Error("NOT_FOUND");
      target.revoked = true;
      target.revokedAt = clock();
      appendAudit(admin.id, "revoke_actor", targetActorId, {});
      return { id: target.id, revoked: true };
    },
    upsertGrant(adminToken, grant) {
      const admin = authenticate(adminToken, "manage_grants");
      if (
        !grant?.source ||
        !["permitted", "unresolved", "revoked"].includes(grant.status)
      )
        throw Error("INVALID_GRANT");
      state.grants[grant.source] = {
        source: grant.source,
        status: grant.status,
        purposes: Array.isArray(grant.purposes) ? [...grant.purposes] : [],
        expiresAt: grant.expiresAt ?? null,
        revoked: grant.status === "revoked",
        evidenceRef: grant.evidenceRef ?? null,
        updatedAt: clock(),
      };
      if (!canPublishSource(grant.source)) {
        for (const rec of Object.values(state.records)) {
          if (
            rec.listing.source === grant.source &&
            rec.publicationState === "published"
          ) {
            rec.publicationState = "suspended";
            rec.suspendedReason = "source_grant_inactive";
            rec.updatedAt = clock();
          }
        }
      }
      appendAudit(admin.id, "upsert_grant", grant.source, {
        status: grant.status,
        expiresAt: grant.expiresAt ?? null,
      });
      return structuredClone(state.grants[grant.source]);
    },
    stageListing(staffToken, listing, evidenceRefs = []) {
      const actor = authenticate(staffToken, "stage_listing");
      if (!listing?.id || !listing?.source || !listing?.name)
        throw Error("INVALID_LISTING");
      const existing = state.records[listing.id];
      const next = {
        listing: structuredClone(listing),
        publicationState: "draft",
        evidenceRefs: [...evidenceRefs],
        reviewedBy: null,
        publishedBy: null,
        updatedAt: clock(),
        history: existing ? [...existing.history] : [],
      };
      next.history.push({
        at: clock(),
        actorId: actor.id,
        state: "draft",
        rawHash:
          listing.rawHash ??
          crypto
            .createHash("sha256")
            .update(JSON.stringify(listing))
            .digest("hex"),
      });
      state.records[listing.id] = next;
      appendAudit(actor.id, "stage_listing", listing.id, {
        source: listing.source,
      });
      return structuredClone(next);
    },
    qaStageListings(staffToken, candidates, referenceListings = [], autoStage = false) {
      const actor = authenticate(staffToken, "stage_listing");
      const existingPublished = Object.values(state.records)
        .filter((r) => r.publicationState === "published")
        .map((r) => r.listing);
      const mergedRefs = [...referenceListings, ...existingPublished];
      const verdict = evaluateListingsQa(candidates, mergedRefs);
      if (autoStage) {
        const byId = new Map(candidates.map((c) => [c.id, c]));
        for (const ok of verdict.readyForBatchApprove) {
          const raw = byId.get(ok.id);
          if (raw) {
            this.stageListing(staffToken, raw, []);
          }
        }
      }
      appendAudit(actor.id, "qa_stage_listings", "batch", {
        readyCount: verdict.readyForBatchApprove.length,
        flaggedCount: verdict.flaggedForReview.length,
        autoStage: !!autoStage,
      });
      return verdict;
    },
    transitionListing(staffToken, listingId, targetState, reason = "") {
      if (!PUBLICATION_STATES.has(targetState)) throw Error("INVALID_STATE");
      const perm =
        targetState === "reviewed"
          ? "review_listing"
          : targetState === "published"
            ? "publish_listing"
            : targetState === "suspended"
              ? "suspend_listing"
              : "archive_listing";
      const actor = authenticate(staffToken, perm);
      const rec = state.records[listingId];
      if (!rec) throw Error("NOT_FOUND");
      if (targetState === "published") {
        if (rec.publicationState !== "reviewed")
          throw Error("PUBLISH_REQUIRES_REVIEW");
        if (!canPublishSource(rec.listing.source))
          throw Error("SOURCE_GRANT_REQUIRED");
      }
      rec.publicationState = targetState;
      if (targetState === "reviewed") rec.reviewedBy = actor.id;
      if (targetState === "published") rec.publishedBy = actor.id;
      if (targetState === "archived") {
        state.tombstones[listingId] = {
          id: listingId,
          name: rec.listing.name,
          source: rec.listing.source,
          archivedAt: clock(),
          reason: reason || "archived",
        };
      }
      rec.updatedAt = clock();
      rec.history.push({
        at: clock(),
        actorId: actor.id,
        state: targetState,
        reason,
      });
      appendAudit(actor.id, `transition_${targetState}`, listingId, { reason });
      return structuredClone(rec);
    },
    upsertEvidence(staffToken, item) {
      const actor = authenticate(staffToken, "withdraw_evidence");
      if (!item?.id) throw Error("INVALID_EVIDENCE");
      state.evidence[item.id] = {
        id: item.id,
        claim: item.claim ?? "",
        withdrawn: !!item.withdrawn,
        updatedAt: clock(),
      };
      if (item.withdrawn) {
        for (const rec of Object.values(state.records)) {
          if (rec.evidenceRefs.includes(item.id)) {
            rec.evidenceRefs = rec.evidenceRefs.filter((x) => x !== item.id);
            rec.listing.identity = "unreviewed";
            if (rec.publicationState === "published") {
              rec.publicationState = "suspended";
              rec.suspendedReason = `evidence_withdrawn:${item.id}`;
            }
          }
        }
      }
      appendAudit(actor.id, "upsert_evidence", item.id, {
        withdrawn: !!item.withdrawn,
      });
      return structuredClone(state.evidence[item.id]);
    },
    submitReport(payload) {
      if (
        !payload ||
        typeof payload.listingId !== "string" ||
        !payload.listingId.trim() ||
        typeof payload.category !== "string" ||
        !["price", "spec", "stock", "link"].includes(payload.category) ||
        typeof payload.note !== "string" ||
        payload.note.length > 500
      )
        throw Error("INVALID_REPORT");

      const listingId = payload.listingId.trim();
      const category = payload.category;
      const note = payload.note.trim();
      const nowIso = clock();
      const nowMs = Date.parse(nowIso);

      // F-20: Reject duplicate open reports within 5 minutes
      const duplicate = state.reports.find((r) => {
        if (r.status !== "open") return false;
        if (r.listingId !== listingId || r.category !== category || r.note !== note) {
          return false;
        }
        const createdMs = Date.parse(r.createdAt);
        if (Number.isFinite(nowMs) && Number.isFinite(createdMs)) {
          return nowMs - createdMs >= 0 && nowMs - createdMs < 5 * 60 * 1000;
        }
        return true;
      });
      if (duplicate) throw Error("DUPLICATE_REPORT");

      const report = {
        id: `rep-${++seq}`,
        listingId,
        category,
        note,
        status: "open",
        createdAt: nowIso,
        resolution: null,
      };
      state.reports.push(report);
      appendAudit("guest", "submit_report", report.listingId, {
        reportId: report.id,
        category: report.category,
      });
      return structuredClone(report);
    },
    resolveReport(staffToken, reportId, action) {
      const actor = authenticate(staffToken, "resolve_report");
      const report = state.reports.find((r) => r.id === reportId);
      if (!report) throw Error("NOT_FOUND");
      const rec = state.records[report.listingId];
      if (rec) {
        if (action?.suspend) {
          rec.publicationState = "suspended";
          rec.suspendedReason = `report:${reportId}`;
          rec.updatedAt = clock();
        }
        if (action?.patch && typeof action.patch === "object") {
          for (const k of ["advertisedPrice", "shipping", "fees", "ram", "storage", "cpu", "os"]) {
            if (Object.hasOwn(action.patch, k)) {
              rec.listing[k] = action.patch[k];
            }
          }
          rec.updatedAt = clock();
        }
      }
      report.status = "resolved";
      report.resolvedAt = clock();
      report.resolvedBy = actor.id;
      report.resolution = action?.note ?? "resolved";
      appendAudit(actor.id, "resolve_report", report.id, {
        listingId: report.listingId,
        suspend: !!action?.suspend,
      });
      return structuredClone(report);
    },
    filterPublishedCatalog(catalog, enforceGrants = false) {
      const nowIso = clock();
      const listings = catalog.listings.filter((v) => {
        if (state.tombstones[v.id]) return false;
        const managed = state.records[v.id];
        if (managed && managed.publicationState !== "published") return false;
        if (enforceGrants && !canPublishSource(v.source, nowIso)) return false;
        return true;
      });
      return {
        ...catalog,
        listings,
      };
    },
    tombstone(id) {
      return state.tombstones[id] ? structuredClone(state.tombstones[id]) : null;
    },
    reports() {
      return structuredClone(state.reports);
    },
    auditLog() {
      return structuredClone(state.auditLog);
    },
    exportBackup(adminToken) {
      const admin = authenticate(adminToken, "backup_restore");
      appendAudit(admin.id, "export_backup", "governance", {});
      return structuredClone(state);
    },
    restoreBackup(adminToken, snapshot) {
      const admin = authenticate(adminToken, "backup_restore");
      if (
        !snapshot ||
        snapshot.schemaVersion !== 1 ||
        typeof snapshot.records !== "object" ||
        !Array.isArray(snapshot.auditLog) ||
        !Array.isArray(snapshot.reports)
      )
        throw Error("INVALID_BACKUP_SCHEMA");
      const next = structuredClone(snapshot);
      next.actors = normalizeActorsMap(next.actors);
      state = next;
      appendAudit(admin.id, "restore_backup", "governance", {});
      return true;
    },
  };
}
