# Unified 0.5.0 verification

> Historical, superseded architecture. Version 0.5.1 restores the M3 app as host and makes Device Advisor a feature within it. This record verifies the earlier standalone-root build and must not be used as the current startup contract.

14 November 2026. See [results.json](./results.json), [native smoke record](./native-smoke.json), and the [artifact/source manifest](../../artifacts/lua-adviser-demo.manifest.json).

- TypeScript passed; 111 unit tests passed.
- The shipped `UnifiedAdvisorApp` root passed Phone, Tablet and PC component journeys, restart, unsupported-AI fallback and corrupt-draft preservation checks.
- 18 historical Demo 2 navigation/review checks passed after updating its adapter and confirming deletion explicitly.
- 11 signed catalog checks passed: real loopback HTTP, RSA and digest validation, actual SQLite through an Expo adapter, cancellation, injected write failure and rollback.
- Six FastAPI tests passed: repository health without a database, signed byte-exact multi-category catalog, immutable versions, authentication, explicit source outage, durable report receipt.
- Web production build passed. Browser inspection covered a narrow and a wide dark layout and successful signed refresh against FastAPI on temporary test port 8876. A dark input-background mismatch found during inspection was corrected and rechecked.
- Android release build/lint passed for ARM64 and x86-64. Final APK SHA-256: `527e1aefc4b30a3f7f26abf1ff459ec6c329fd455f85972a79fa683e536ac913`. APK signature and 16 KB ZIP alignment verification passed.
- The final APK was installed on emulator-5580 (Resizable Experimental / API 37.1 image), preserving existing app data, and passed launch/restart checks. [Launch image](./launch.png) and [restart image](./restart.png) show the shared root. This smoke test does not certify the complete native category or accessibility matrix.
- All 25 application TypeScript sources embedded in the Metro source map matched the current files at verification time. Original verification ran on a working tree based on `71dfdc6`. The delivery manifest now records the preserved source commit and whether its runtime files have further edits, separately from generated artifact changes.

The default catalog is 75 dated reference records with incomplete prices, stock, fees and compatibility evidence. No live PostgreSQL acceptance run, successful physical AICore inference, buyer study, physical accessibility certification, production signing or G0–G5 acceptance is implied. Existing module directives, bundle-size, deprecation and SDK lint warnings do not change the passing command exit statuses recorded above.
