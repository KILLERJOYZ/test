> Historical implementation/evidence record. The active unified 0.5.0 runtime, service setup and SDK matrix are defined in the [application contract](./UNIFIED_APP.md). Earlier startup and port instructions below describe their recorded release.

# Device Advisor system — current implementation

Updated 13 November 2026. This document describes the full-category Demo 2 implementation requested by the user. It extends the existing BRD journeys; production and model-quality gates retain their separate acceptance requirements.

The installed app opens the same `ReferenceExplorer` recommendation surface used after profile confirmation. Its guided intake has separate category, ranked purposes, budget, ranked priorities, clarification, and review screens. Review edits return to their corresponding screens; only confirmation replaces the active recommendation profile.

## Implemented options

| Area | Current behavior |
|---|---|
| Categories | Phone; Tablet; PC with Laptop or prebuilt Desktop |
| Phone purposes | Students, Elderly, Creators, Business, Basics, Gamers |
| Tablet purposes | Basics, Readers, Media, Student, Designer |
| PC purposes | Students, Basic uses, Software Programming, 2D Editing, 3D Editing, Music production, AI & Data, Hardware Engineering |
| Ordered selection | Exactly three distinct purposes and three distinct priorities; visible order, move up/down, category-dependent invalidation |
| Ten priorities | Compactness & Mobility, Performance, Strength, Battery Endurance, Built quality, Upgradability & Repairability, Security, Viewing experience, Form factors, OS |
| Applicability | Strength remains UNRATED without a rubric; upgrade/repair are separate internal dimensions; desktop mobility/battery and mandatory OS/form are removed from soft weights and weights are renormalized |
| OS | Phone Android/iOS; Tablet Android/iPadOS/Windows; PC Windows/macOS/Linux/ChromeOS; explicit mandatory or soft preference |
| Form | Classics; Phone Foldable; Tablet/PC 2-in-1; explicit mandatory or soft preference |
| Price bands | Phone/Tablet boundaries 0/8/16/24/32 million VND; PC 0/16/32/62/92 million; last band is open-ended |
| Money and condition | Desired band, optional target, hard total ceiling, required accessories (unknown differs from zero), new/used, warranty and optional minimum RAM |
| Clarification | One screen per selected purpose, free text or explicit UNKNOWN; no hardware inferred from persona labels |
| Result journey | Confirmed profile to real reference results, search/filter/sort, detail and sources, paired comparison, saved snapshots, reopen/delete/export; no failed mandatory candidate promoted by score |
| Persistence | Native SQLite catalog and separately owned SQLite profiles/saved decisions, versioned draft/confirmed keys, restoration, recoverable corrupt records |
| Optional intake | Deterministic category/explicit ceiling parsing; optional native Nano proposes those same bounded fields, independently checked and reviewed. Other fields are completed in the form |
| Catalog updates | Signed manifest, pinned RSA SHA256 public key, content SHA256/byte count/schema/source validation, SQLite transaction activation and previous-snapshot rollback |

`deviceProfile` is authoritative in the new flow. Compatibility fields in the old `Needs` adapter preserve the legacy app interfaces. Existing Demo 1 and legacy saved keys are retained. This profile uses a new schema/key rather than guessing a conversion from the old one/two-preference selections.

## Real reference database

The bundled database contains **75 observations from six sources**: 70 existing retailer laptop records, two manufacturer phone references, two tablet references and one desktop reference. Source URLs, observations, exact record IDs and units are retained. Missing prices, shipping, fees, stock, warranty, workload support and priority measurements remain unknown.

The new manufacturer records are specification references, not verified Vietnamese purchase offers. They do not establish current affordability or stock. Official references: [iPhone 16](https://www.apple.com/iphone-16/specs/), [Galaxy A56](https://samsungmobilepress.com/media-assets/galaxy-a56-5g?tab=specs), [iPad A16](https://www.apple.com/ipad-11/specs/), [iPad mini](https://www.apple.com/ipad-mini/specs/) and [Mac mini](https://www.apple.com/mac-mini/specs/). These were checked on 13 November 2026; current-page records should not be confused with older hardware generations.

The target/band are stored as preferences, while the ceiling is the hard affordability check. Preference scoring is a provisional deterministic policy, not a calibrated measure of product quality. Clarification answers are retained for review; unverified software compatibility remains UNKNOWN. All-source unknowns may therefore produce references to verify and no fully qualified purchase recommendation. This is intentional evidence behavior and requires richer reviewed data before a buying pilot.

Rebuild the normalized seed and inspectable SQLite export:

```powershell
cd C:\Users\luken\test\apps\adviser
npm run reference:database
```

The exporter checks SQLite integrity, foreign keys, invalid-price rejection and rollback. The native app imports the normalized records into its own database on first use; it does not silently replace them with synthetic products if import fails.

## Build and run

```powershell
cd C:\Users\luken\test\apps\adviser
npm ci
npx expo prebuild --platform android --no-install
npm run build:android
```

The native build requires Android API **26 or newer**. The durable Expo plugins configure Kotlin **2.3.21**, KSP **2.3.11**, ML Kit Prompt **1.0.0-beta5**, coroutines **1.11.0**, Expo SDK 54 / RN 0.81.5, Gradle 8.14.3 and the installed JDK 21. The Kotlin plugin is explicitly versioned in the generated root buildscript; changing only Expo's version catalog was insufficient. No dependency source is patched and metadata compatibility checks remain enabled. [ML Kit release notes](https://developers.google.com/ml-kit/release-notes) document Kotlin 2.3+; [known issues](https://developers.google.com/ml-kit/known-issues) document the older beta3/4 coroutines issue.

Expo Go can exercise the form, but it does not contain this app's native AI/signature module. Use the standalone APK/development build for native verification. The HTML export uses browser storage and WebCrypto; it cannot validate Android AICore behavior.

## Signed catalog publisher

```powershell
npm run catalog:prepare
npm run catalog:serve
```

The local publisher listens on `127.0.0.1:8788`. For an attached Android device, run `adb reverse tcp:8788 tcp:8788`, then use **Dữ liệu & AI → Đồng bộ catalog đã ký**. The app's default endpoint is `http://127.0.0.1:8788`. HTTPS is required for non-loopback servers; cleartext exceptions are limited to localhost and the Android emulator host. User needs are never uploaded by this catalog protocol.

`catalog:prepare` creates a publisher private key only if absent, under ignored `.expo/catalog-publisher/private.pem`, and writes the public pin to `src/catalog-trust.json`. The APK must be rebuilt after changing its public pin. Preserve the private key outside disposable build/cache folders for a real publisher; protect it and separate editorial/source authorization from signing. A signature authenticates the publisher and does not prove product claims. The local publisher is a test/reference service, not an operated production catalog service.

For an activation/rollback exercise with identical reference content but a different version, set `$env:ADVISOR_CATALOG_VERSION='verification-update-1'` before starting the publisher. Normal repeated activation of the same version is idempotent. Rollback requires a previously activated different version. Invalid signatures/hashes/schemas/imports retain the current catalog.

## Verification and remaining acceptance work

```powershell
npm run check
npm test
npm run test:device-system
npm run test:demo2
npm run test:catalog-system
npm run reference:database
npm run build
```

Domain tests cover taxonomy, exact selection counts, category invalidation, money boundaries, ambiguity/negation, stale proposals, applicability, cost/evidence checks and deterministic results. React component journeys cover all three device groups plus restart, unsupported AI and corrupt-draft retention. Catalog integration tests use real HTTP, RSA verification and SQLite through an Expo API adapter, including injected mid-import failure and rollback. They are distinct from Android runtime evidence.

See [build and native verification](./verification/device-system-build.json) for exact artifact hashes and observed native outcomes. CI is configured in `.github/workflows/device-advisor.yml`; configuration does not mean it has run remotely.

The core demo is usable offline. Successful Nano generation/download still requires supported physical hardware/AICore and Vietnamese quality evaluation; emulator capability checks do not establish that success. The attachment's held-out language/ranking sets, 5,000-SKU performance protocol, physical TalkBack/large-text/foldable matrix, full-disk/recreation fault matrix, source permissions/editorial operations, production hosting/key lifecycle, buyer comprehension study and G0–G5 signoffs remain acceptance work. Optional LiteRT-LM, cloud routing, AI reason organization and component-by-component PC solving are outside this implementation. No production or model-quality gate is automatically accepted by a passing APK build.

Verification completed for this build: **55 domain tests**, **three full category component journeys** plus restoration/corrupt-draft checks, **18 legacy Demo 2 flow checks**, and **10 signed-catalog integration checks** passed. The Android release built with release lint enabled; APK signature and 16 KB ZIP alignment checks passed. The final APK was reinstalled into the Android 17/API 37 emulator and verified for profile restoration, bundled catalog upgrade, native signed activation, rollback, real-reference detail and saved decisions. AICore reported unsupported; Nano generation remains unverified on supported physical hardware. Exact hashes and test boundaries are in the linked verification manifest.

Critical field edits retain FORM/USER_TEXT provenance and confirmation status; accepted text proposals retain their source text. Bundled catalog upgrades track the installed bundle separately from the active catalog, preserving remote versions and deliberate rollback choices. The local publisher and task-owned emulator used for verification were stopped after the checks.
