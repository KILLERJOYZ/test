# Adviser implementation check

User observation: the release remains the previous basic demo. Source and APK inspection support that observation.

The native entry `apps/adviser/index.js` registers `src/AndroidApp.tsx`. That component imports PRODUCTS/OFFERS from `src/domain.ts` and runs the local `picker.ts` evaluator. The home screen advertises 12 synthetic configurations. Its questionnaire, budget, local recommendations, detail/comparison, save and optional AI explanation are demo functionality. A production reviewed catalog/workload/offer decision service has not been connected to the Android application. Phone/PC advising is also not implemented in this Android laptop demo.

The R08 HTTP integration is isolated under `spikes/prebuild-contract`; passing its tests did not implement an Android production API adapter or durable production backend. R00–R14 automation completion refers to research tooling and readiness assessment. It must not be reported as completion of the production adviser.

Both the old handoff APK and the rebuilt native APK contain `start-picker`, `primaryUseOrder`, `confirm-profile` and `synthetic-v1` strings in their embedded Hermes bundles. The new bundle additionally contains the extracted persistence coordinator. This verifies bundled demo code and changed persistence code, not on-device behavior or a new adviser implementation.

The stale handoff was corrected separately: `artifacts/lua-adviser-demo.apk` now matches the native output SHA-256 `a35e955ceb16f6ca437a40dee22c685d587c9ed78d4df0b21f5f47a55690b9e2`. The previous handoff is backed up under artifacts. `scripts/build-android.ps1` now invokes `scripts/package-android.ps1` after successful assembly, copying and hash-verifying the handoff and writing a manifest. README installation guidance was corrected. These are packaging changes; they add no adviser capabilities.

Remaining product work is P01–P08 in `research/prebuild/14-production-backlog.json`: reviewed permitted data, exact variant identity, complete offer state, evidence-backed workload policy, durable historical decisions, Android API integration, measured retrieval and production AI boundaries. P09–P14 cover native acceptance, buyers, operations, costs, privacy and decisions. Scope and evidence gaps remain as recorded. No production gate was accepted by this check.

ADB discovery on this check returned no attached target. No device behavior was claimed or measured. The user observation is retained as the reported release experience.
