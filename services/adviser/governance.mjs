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
    "backup_restore",
  ]),
};

const SENSITIVE_KEYS =
  /^(token|authorization|apikey|api_key|openai_api_key|password|secret|prompt|message)$/i;

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

export function createGovernanceStore({
  clock = () => new Date().toISOString(),
  initialActors = {},
  initialGrants = {},
  persistenceFile = "",
} = {}) {
  let seq = 0;
  let state = {
    schemaVersion: 1,
    actors: structuredClone(initialActors),
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
    state = raw;
    seq = state.auditLog.length + state.reports.length;
  }

  function flushDisk() {
    if (!persistenceFile) return;
    fs.mkdirSync(path.dirname(persistenceFile), { recursive: true });
    fs.writeFileSync(persistenceFile + ".tmp", JSON.stringify(state));
    fs.renameSync(persistenceFile + ".tmp", persistenceFile);
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
    if (!bearerToken) throw Error("UNAUTHORIZED");
    const actor = Object.values(state.actors).find(
      (a) => a.token === bearerToken,
    );
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
      if (
        !actor?.id ||
        !actor?.token ||
        !ROLE_PERMISSIONS[actor.role]
      )
        throw Error("INVALID_ACTOR");
      state.actors[actor.id] = {
        id: actor.id,
        role: actor.role,
        token: actor.token,
        revoked: false,
        updatedAt: clock(),
      };
      appendAudit(admin.id, "register_actor", actor.id, { role: actor.role });
      return { id: actor.id, role: actor.role, revoked: false };
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
      const report = {
        id: `rep-${++seq}`,
        listingId: payload.listingId.trim(),
        category: payload.category,
        note: payload.note.trim(),
        status: "open",
        createdAt: clock(),
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
      state = structuredClone(snapshot);
      appendAudit(admin.id, "restore_backup", "governance", {});
      return true;
    },
  };
}

