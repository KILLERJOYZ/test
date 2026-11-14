# G4 Decision Pack — Source Governance, Catalog Audit & Operations Readiness (`REAL-01`, `REAL-02`)

| Document control | Value |
|---|---|
| Date | 13 November 2026 |
| Gate | G4 — Source-use permissions, starter catalog audit, staff governance & operations readiness (`REAL-01`, `REAL-02`) |
| Governing baseline | [brd.md](../../brd.md) v3.2 · [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md) v3.2 |
| Prebuild records | [03-source-register.json](../../research/prebuild/03-source-register.json) · [04-catalog-audit.json](../../research/prebuild/04-catalog-audit.json) · [12-operations-and-data-handling.md](../../research/prebuild/12-operations-and-data-handling.md) · [13-cost-results.json](../../research/prebuild/13-cost-results.json) |
| Current status | Governance engine, RBAC, report triage, backup/restore & cost/audit validators implemented and passing (`GOV-01`–`GOV-04`); external commercial source agreements (`P01`) and named ops rates (`P12`) remain pending |

---

## 1. Delivered Governance & Operations Architecture (`REAL-01`, `REAL-02`)

1. **Per-Purpose Source-Use Grant Enforcement (`P01`, `BR-09`, `BR-13`, `T-R01`):**
   - Implemented in [governance.mjs](../../services/adviser/governance.mjs) and [server.mjs](../../services/adviser/server.mjs).
   - `canPublishSource(source, nowIso)` requires an active, non-revoked, non-expired grant with `catalog_display` purpose before any listing from that source can be published or served when `enforceSourceGrants` is enabled (`GOV-01`).
   - Revoking or expiring a grant immediately suspends active listings for that source without deleting historical observations or audit records.
2. **Staff Role-Based Access Control & Publication Lifecycle (`P02`, `P11`, `A01`–`A09`, `T-P03`):**
   - Enforces three distinct staff roles (`catalog_editor`, `reviewer`, `ops_admin`) across HTTP admin endpoints (`POST /v1/admin/grants`, `/v1/admin/listings/stage`, `/v1/admin/listings/transition`, `/v1/admin/reports/resolve`, `/v1/admin/backup/restore`, `GET /v1/admin/audit`).
   - Enforces strict state transitions (`draft` → `reviewed` → `published` → `suspended` → `archived`), immediate staff token revocation (`FORBIDDEN_REVOKED`), evidence withdrawal cascading (`upsertEvidence`), and archived variant tombstones (`GOV-02`, `GOV-04`).
3. **User Discrepancy Triage, Durable Backup/Restore & Redacted Telemetry (`P11`, `P13`, `T-P04`, `T-P06`, `T-P08`):**
   - Guest discrepancy reports submitted via `POST /v1/reports` (`submitListingReport` in [adviser-client.ts](../../apps/adviser/src/adviser-client.ts)) enter the staff triage queue and can atomically patch or suspend affected listings on resolution (`GOV-03`).
   - Governance state persists atomically via `.tmp` write + rename (`persistenceFile`) and supports validated snapshot export/restore (`exportBackup` / `restoreBackup`).
   - `redactSensitive()` strips `token`, `authorization`, `apiKey`, `password`, `secret`, `prompt`, and `message` fields from all audit log payloads (`GOV-03`).

---

## 2. Verification Summary (`T-R01`, `T-R02`, `T-P03`, `T-P04`, `T-P06`, `T-P08`)

| Suite | Command | Result |
|---|---|---|
| Service & Governance HTTP Suite | `npm.cmd --prefix apps/adviser run test:adviser-service` | **16 / 16 passed** (`HTTP-REAL-01`–`07`, `BUDGET-01`–`02`, `PROVIDER-01`–`02`, `GOV-01`–`04`, `PILOT-01`) |
| Source Register & Retention Pack | `python -m unittest discover -s research/prebuild/tools -p test_source_register.py` | **Passed** |
| Catalog Audit & Deduplication Pack | `python -m unittest discover -s research/prebuild/tools -p test_audit_catalog.py` | **Passed** |
| Operations & Rollback Sandbox | `python -m unittest discover -s research/prebuild/tools -p test_operations_evidence.py` | **Passed** (`OPS-01`–`OPS-06`) |
| Cost & Capacity Model Pack | `python -m unittest discover -s research/prebuild/tools -p test_cost_model.py` | **Passed** |
| Gate G4 Validator Check | `python research/prebuild/tools/validate.py --gate G4` | **Exit `2` (`pending`)** — honest gate state preserved until external source contracts (`P01`) and first-party rate cards (`P12`) are signed |

---

## 3. External Prerequisites Before G4 `accept` Sign-Off

Per [14-build-readiness.json](../../research/prebuild/14-build-readiness.json), the validator keeps G4 at `pending` (exit `2`) until the sponsor supplies:
1. Signed source-use agreements or permitted feed terms recorded in [03-source-register.json](../../research/prebuild/03-source-register.json) (`P01`).
2. Human reviewer adjudication of the 30–50 starter exact variants and complete shipping/fee totals (`P02`, `P03`).
3. Named production operations owner, RPO/RTO targets, and dated vendor rate inputs in [13-cost-inputs.json](../../research/prebuild/13-cost-inputs.json) (`P11`, `P12`).

