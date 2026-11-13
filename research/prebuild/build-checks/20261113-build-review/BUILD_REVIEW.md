# Build review — 13 November 2026

The current demo compiles into an Android release APK. Full production implementation and release remain pending the recorded scope/readiness decisions and the work below. This review is an additive build check, not gate approval or a replacement for the R14 evidence package.

## Executed checks

| Check | Observed result | Evidence |
|---|---|---|
| Full research unit packs | 17 packs; 158 required case IDs passed, none failed, skipped or unexecuted | `unit-packs.log` and the referenced runner JSON |
| Completed-artifact validation | Exit 0 | `artifacts.log` |
| G4 readiness validation | Exit 2: pending, not accepted | `gate-g4.log` |
| Demo AI HTTP integration | 2 tests passed with injected provider | `service-http.log` |
| Bounded spike HTTP integration | 3 tests passed | `spike-http.log` |
| TypeScript + Vite + standalone preview | `npm run build` passed | `web-build.log` |
| Expo Android export | Passed; current Hermes bundle generated | `expo-android-export.log` |
| Native Android release | Passed, ARM64 and x86-64; 1m 38s; 298 tasks, 28 executed and 270 up-to-date | `native-release.log`, `native-release.json` |
| APK signature and metadata | Signature verifies; signer is Android Debug; package vn.lua.adviser, version 0.3.0/code 1, min SDK 24/target 36 | `apk-signature.log`, `apk-badging.log` |
| Android target discovery | No devices attached; inspection-started ADB daemon stopped | `adb-devices.log` |
| Installed Expo dependency check | Exit 0, but CLI explicitly warns offline validation is unreliable | `dependency-check.log` |

Native compilation used cached dependencies with `--offline --no-daemon`; this does not establish clean-machine reproducibility. The initial Python wrapper invocation failed before Gradle started because Windows did not resolve the relative executable; the absolute-path retry succeeded. Both outcomes are retained. Nonfatal build warnings concern SDK XML tooling-version mismatch, deprecated Gradle features, and the web bundle's ignored `use client` directive. No dependency upgrades were made. No fresh online dependency/security audit, live AI call, device install, store bundle, publishing or deployment was performed.

New APK: `apps/adviser/android/app/build/outputs/apk/release/app-release.apk` (repository-relative).

SHA-256: `a35e955ceb16f6ca437a40dee22c685d587c9ed78d4df0b21f5f47a55690b9e2`.

The old native output was backed up as `previous-app-release.apk`; the separately distributed demo artifact was not overwritten. This rebuild closes the stale-local-APK observation only. R11/R14's older APK measurements remain historical; their device cases still have no current observations.

## Before starting the full production implementation

1. **Record the bounded scope and accountable gate decisions (P14).** G1–G4 have no acceptance references. Preserve Android-only guest scope, decide U06 quotation intake explicitly, and keep expansion outside the initial build. G3 requires its scoped native/demo/buyer/live-AI evidence, or an explicitly recorded applicable D1 deferral. G4 requires permitted data, workload coverage, operating ownership, capacity/budget and acceptance thresholds. Use the decision owners in `docs/planning/IMPLEMENTATION_PLAN.md`, section 2; passing this build cannot make those decisions.
2. **Validate this current APK on a named Android target (P09).** Execute D01–D08: native Back/IME/focus and modal behavior, save/restart/delete/reset, process death and recovery, offline/stale-response behavior, TalkBack, large text, keyboard and reduced motion. Collect the planned raw timing/memory samples on specified hardware. Compiler and Node tests do not cover those outcomes.
3. **Obtain production data and workload evidence (P01–P04).** Establish source-use/retention basis and accountable reviewers. Review exact configurations, stock, freshness, full payable costs and discount eligibility. The audit currently has 70 listings, zero independently reviewed exact variants and zero verified complete offers; 55 listings lack an identity field. Review real workload requirements/capabilities independently. Resolve coverage and acceptance thresholds before claiming recommendations are production-ready.
4. **Complete decision evidence (P08/P10/P12).** Run the prepared buyer/comprehension protocols with real participants. Run the 30-case live-AI protocol only with configured provider/model access, authorized numeric limits and dated cost assumptions, or record the applicable deferral. Establish operating cost/capacity assumptions and a measured estimate. Current buyer observations and live provider requests are zero, and complete cost totals remain unknown.

These are evidence and scope prerequisites. The engineering packages below are work for the resulting approved production scope; requiring them all before authorizing their implementation would create a circular dependency.

## Engineering still needed for the production build

| Priority / backlog | Concrete work | Completion evidence |
|---|---|---|
| First: P01–P04 | Permitted ingestion/staging, canonical exact variants, provenance, review/publication state, offer freshness/stock/complete costs and supported workload rules | Reviewed real fixtures; unknown evidence remains unknown; hard requirements and budget precede ranking |
| Next: P05/P06 | Production durable repositories and Android API adapters; retain draft/confirmed/current/history distinctions, migration/recovery and removed-variant history | Current APK completes needs → results → detail → compare → offer → save → restart → reopen against the reviewed API; concurrency, outage and stale-context tests pass |
| Next: P07/P08 | Real retrieval evaluation and bounded production AI service with authentication and durable usage accounting | Independent labels and controlled heldout use; real provider failure/limits/quality evidence; no unsupported fact claims |
| Before release: P11/P13 | Restricted staff review/correction tools, access revocation, audit logs, backup/restore, monitoring/support, retention/deletion and redacted telemetry | Real role/restore/failure exercises with owners and measured RPO/RTO |
| Before release: P09/P12/P14 | Release/device acceptance, cost/capacity reconciliation and scoped final review | Named build/device observations, accepted thresholds and actual decision references |

The application currently imports synthetic catalog data from `apps/adviser/src/domain.ts`. The isolated R08 spike uses injected local storage and a Map-derived index. Its successful HTTP tests do not establish that Android is connected to a production catalog/database. The demo AI service has in-memory request/concurrency counters and no production service authentication; production access control and durable budgets remain work, not proven capabilities.

## Build and release plumbing found in this review

- **Default test coverage:** `apps/adviser/package.json` explicitly lists only domain, picker and AI tests. `src/decision-state.test.ts` is missing from `npm test`. Add it to the ordinary test entry point and make CI run the full research packs and both integration suites. This review ran the full packs, so the persistence regressions were executed here.
- **Production signing/configuration:** generated `android/app/build.gradle` signs `release` with `signingConfigs.debug`. Define secure release signing, versioning and distribution configuration, persisted through Expo generation. The app is still labelled Demo, version code 1. No production AAB has been built or assessed.
- **Reproducible builds:** no tracked `.github` workflow was found. Establish the chosen CI/build system, pinned toolchain, clean dependency installation, tests, native packaging and artifact/source hash manifest. The native directory is ignored, so required native customization must survive prebuild. Current success uses existing Gradle/SDK caches.
- **Artifact handoff:** `scripts/build-android.ps1` assembles the APK but does not copy it to the README's `artifacts/lua-adviser-demo.apk` handoff location. Make packaging/copying plus hash/manifest generation explicit so an old handoff APK cannot be mistaken for a new build.
- **Toolchain maintenance:** investigate the SDK XML and Gradle deprecation warnings before a toolchain upgrade; these did not block the pinned build. Run a network-enabled dependency health/security review in the chosen release process; the offline Expo check is limited evidence.

The review did not edit application code, dependencies, task statuses or gate decisions. Generated CSS line-ending churn was restored after confirming identical content. Existing checkout changes were preserved. Logs, metadata and source hashes are retained alongside this file and in `manifest.json`.

## Resume commands

From `E:\test`:

```powershell
python research/prebuild/tools/run_unit_packs.py --all
python research/prebuild/tools/validate.py --all
python research/prebuild/tools/validate.py --gate G4 # expected 2 while pending
npm.cmd --prefix apps/adviser run build
npm.cmd --prefix apps/adviser run build:android
```

For device evidence, select a specifically authorized connected target and follow `research/prebuild/11-android-cases.json` and the native verification protocol. Do not treat the build command as device validation. The complete proposed work items and acceptance scenarios remain in `research/prebuild/14-production-backlog.json`.
