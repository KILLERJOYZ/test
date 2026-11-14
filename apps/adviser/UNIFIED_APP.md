# Unified Lựa adviser 0.5.1

Updated 14 November 2026. This is the active application contract and supersedes conflicting current-app claims in the older demo and connected-adviser records. The root for both Android and web is `src/AdviserApp.tsx`. Device Advisor is a feature of this existing M3 app, not its replacement.

## Host app and Device Advisor feature

The app opens its existing M3 adviser home, with Tư vấn, Khám phá, So sánh, Đã lưu and Cài đặt navigation. The “Mở Device Advisor” action opens the full device-selection feature inside the host; all five host tabs stay available, and “Trở về ứng dụng” returns without resetting the host search or selection state.

Inside the feature, personal recommendations use the Phone / Tablet / PC profile: exactly three ordered purposes, budget, three ordered priorities, relevant clarification, then explicit review. PC includes laptop and prebuilt desktop. It does not solve component-by-component PC builds.

`DeviceProfile` and `advisor-engine.ts` own selection and recommendation rules. Missing observations, shipping, fees, stock and workload evidence stay unknown. Soft priorities never waive hard constraints. Optional minimum RAM and storage, required OS/form, accessories and condition are evaluated in the same core.

The application reuses the M3 Expressive color system, dynamic Android theme adapter and animated/reduced-motion buttons. The shared catalog provides search/source/weight filtering, sorting, detail/source links, paired comparison, historical decisions, confirmed deletion and sharing. Structured manual laptop quotations reuse the connected app's validated quotation parser. Reports are explicitly submitted from detail and durably received by the API. Local explanations render checked facts; a ready native model can select those facts without generating new factual prose.

## Data and persistence

The bundled `reference-seed.json` has 75 dated records: 70 retailer laptop observations and five manufacturer references spanning phones, tablets and desktop. It remains an evidence-limited reference set, not a live purchasing feed. Manufacturer specification references often have no Vietnamese offer price or complete purchase cost.

The host retains its existing connected-adviser AsyncStorage state. The Device Advisor feature uses SQLite on Android for its reference catalog and its full-category profile/history. Web uses browser storage. Signed activation is transactional on Android; failed verification or import retains the active snapshot, and a previous catalog can be restored. Saving a decision retains its dated row and needs; reopening uses those historical needs. Current profile settings are not silently overwritten.

The connected 0.4 history in `lua-connected-adviser-v1` imports once into the shared history. Imported records retain old requirements and remain unconfirmed under the new ranked taxonomy. Original AsyncStorage bytes are retained. Old synthetic demo state remains separate and is not presented as real catalog data. A corrupt shared history blocks writes and retains original bytes for export/recovery.

On first migration, a missing full-category profile receives the old budget, RAM/storage minimums and an exactly supported OS as an unconfirmed draft. Purposes and priorities remain empty for the user to select; no ranked choices are invented.

## One active service

Use FastAPI on loopback port **8788**. It serves the signed device catalog, durable buyer reports and the earlier laptop API endpoints. The unified UI uses `/advisor/v1/manifest`, `/advisor/v1/catalogs/{version}/bundle`, and `/v1/reports`. Laptop-specific legacy advice/search endpoints remain for API compatibility; they do not replace the multi-category local recommendation core.

`ADVISER_CATALOG_SOURCE=repository` is the default and serves the bundled reference seed without PostgreSQL. Set `ADVISER_CATALOG_SOURCE=postgresql` to replace its laptop rows from the database while retaining the phone/tablet/desktop references. A selected database failure returns an error; it does not silently switch sources. The client continues using its last valid local catalog. Unsupported/invalid source data cannot be activated merely because it is signed.

Setup from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
npm.cmd --prefix apps/adviser ci
npm.cmd --prefix apps/adviser run catalog:prepare
npm.cmd --prefix apps/adviser run service:adviser
```

`run-api.mjs` uses the root `.venv` when present. Publisher preparation creates a local signing identity only when absent and writes its public pin into the app. Rebuild the app after a deliberate key change. The private key is ignored under `.expo`; `ADVISER_SIGNING_KEY` can select a maintained key path. Never run preparation as automatic key rotation on an installed release.

In the app's Data & AI screen, use `http://127.0.0.1:8788` with ADB reverse on Android:

```powershell
adb -s YOUR_TEST_SERIAL reverse tcp:8788 tcp:8788
```

Remote endpoints require HTTPS. `ADVISER_TOKEN`, if set server-side, must match the service key entered in the app. This optional key is stored in private app storage, not a hardware keystore. Manual synchronization is the default. Optional 30-second/foreground refresh uploads no needs profile. Buyer reports are sent only after an explicit action. A configured address is not displayed as a successful connection.

The Node repository/governance service remains available for historical tooling via `service:legacy`, default **8789**. The old standalone signed publisher defaults to **8790** for protocol regression work. Neither is required by the unified app's default setup. Synthetic/cloud-provider demos remain regression/research source and are not shipped routes.

## One native bridge and SDK matrix

The app uses tracked `native/adviser/LocalAiModule.kt`, installed by `with-local-ai.cjs`, for Nano availability/download/generation/cancellation and RSA/SHA-256. Both intake and checked-fact explanations use `AdviserLocalAi`. The broken, source-less `DeviceAdvisorNative` registration was removed. Signing does not depend on AICore model availability.

The declared/locked application stack is Expo 54, React 19.1, RN 0.81.5, SQLite 16, Reanimated 4.1 and Worklets 0.5.1. Current native configuration uses Kotlin 2.2.10, Prompt beta4 and minimum API 26. Old SDK 58 declarations and the alternate beta5/KSP module notes are not the current build contract. Successful model inference still needs supported physical hardware/AICore; unsupported devices retain form and deterministic explanation access. Expo Go and web cannot validate the custom native bridge.

## Build and verify

```powershell
npm.cmd --prefix apps/adviser run check
npm.cmd --prefix apps/adviser test
npm.cmd --prefix apps/adviser run test:host-feature
npm.cmd --prefix apps/adviser run test:device-system
npm.cmd --prefix apps/adviser run test:catalog-system
.\.venv\Scripts\python.exe -m unittest backend.tests.test_unified_api
npm.cmd --prefix apps/adviser run build
npm.cmd --prefix apps/adviser run build:android
```

The host/feature integration test enters `AdviserApp`, verifies that the host opens first, opens Device Advisor, returns with search state intact, and exercises the host tabs. Separate component journeys exercise the complete Device Advisor flow. They still use controlled native boundaries and do not establish physical-device acceptance. Catalog tests exercise real HTTP, signatures and SQLite through an adapter. Backend tests verify its signatures/bytes, immutable versions, auth, source-failure behavior and report persistence.

The release output is `artifacts/lua-adviser-0.5.1.apk`, with `lua-adviser-demo.apk` as a compatibility copy. The adjacent manifest records the entry, source hashes, catalog version, commit, dirty-tree state and exact APK SHA-256. Version code is 4, preserving package `vn.lua.adviser` for upgrades. Development signing remains in use. A passing build does not approve production data rights, physical accessibility, model quality or G0–G5.

`artifacts/lua-device-advisor-full-0.5.1.apk` is the explicitly named full-category handoff, byte-identical to the versioned APK. These release files are tracked in the artifact commit. `sourceCommit` names the integration source commit; `sourceDirty` distinguishes runtime edits from artifact packaging changes. The source commit precedes the artifact commit to avoid a manifest that tries to contain its own commit hash.

Historical evidence is retained in `DEVICE_ADVISOR_SYSTEM.md`, `README-demo-history.md`, frontend verification records, and the root-cause audit. Their captured screenshots/APKs describe their recorded revisions, rather than automatically verifying this app.
