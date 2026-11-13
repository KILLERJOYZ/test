# Lựa — connected Android adviser 0.4.0

The release now starts `src/AdviserApp.tsx`, using **70 real, dated retailer listings from the repository**. The old synthetic app remains in `AndroidApp.tsx` for historical regression tests. Its previous instructions are preserved in [README-demo-history.md](README-demo-history.md).

Implemented: confirmed budget/RAM/storage/OS/task requirements; reproducible safe-integer total cost when shipping and mandatory fees are known (`REAL-09`); real-name/specification search; source filtering; sorting; detail and retailer links; sibling configuration switching within the same model family (`U03`, `REAL-10`); neutral `+5.000.000 ₫` budget-ceiling upgrade reference and explicit observation age (`U04`, `U05`, `REAL-11`); verified task hardware strengths/caveats (`REAL-12`); external retailer link / manual quotation intake (`U06`, `REAL-13`); buyer listing discrepancy reporting (`U08`, `CLIENT-05`); two-listing comparison; save/restart/reopen/delete/export/share and keyword/date search across up to 1,000 saved decisions with immutable historical prices and configurations; repository-service refresh; on-device Gemini Nano with reviewed requirement proposals, stale-context rejection and abort; serialized persistence and explicit read-failure recovery. Stage gate decision packs for G1–G5 are documented in [docs/decisions/README.md](../../docs/decisions/README.md).

Prices were observed on 11 November 2026. They are not live retailer prices. Missing identity, stock, fees, total payable cost, affordability and workload capability stay unknown. No new crawl is performed. The source publication/use basis remains a recorded research gap.

From `E:\test\apps\adviser`:

```powershell
npm ci
npm run check
npm test
npm run test:adviser-service
npm start
npm run build:android
```

The build imports the repo catalog, assembles Android, copies the APK to `artifacts/lua-adviser-demo.apk` for compatibility with the existing handoff path, verifies its hash and writes an adjacent manifest. App label: **Lựa · Adviser**; version **0.4.0**, Android code **2**. Signing remains the development key; store signing/distribution is not configured.

`npm run build` creates the web preview of the same component. `npm run catalog:import` updates the bundled snapshot after repo data changes.

Follow [connected service setup](../../services/adviser/README.md) to run the backend on port 8788, use ADB reverse, and save `http://127.0.0.1:8788` in app Settings. The app checks the service every 30 seconds, on foreground and on manual refresh. The service rereads repository data without restarting. Remote endpoints require HTTPS; local cleartext exceptions are limited to explicit loopback/emulator addresses through the persisted Expo config plugin.

AI runs locally through Google ML Kit Prompt API and Android AICore. No OpenAI key, paid API budget or data-service endpoint is needed for inference. The app checks runtime availability, offers an explicit model download on supported devices and reports unsupported/unready devices. Model setup/download may require a network; inference uses the on-device model. The SDK requires Android API 26+, so the release minimum is Android 8.0. Expo Go and the browser do not contain this native bridge; use the standalone APK. Source refresh remains an independent service connection.

The optional data-service token is stored in private AsyncStorage rather than a hardware keystore. Public production identity remains future work. Android backup is disabled and obsolete storage/overlay permissions are blocked.

Current evidence: [implementation record](../../research/connected-adviser/IMPLEMENTATION.md) and [Stage Gate Decision Packs (G1–G5)](../../docs/decisions/README.md). Physical-phone acceptance, independent source/workload review, buyer research, successful local-model inference validation, production roles/operations, signing and gate decisions remain separate work. Phone/PC advising and automated OCR image extraction are outside this laptop release (structured HTTPS retailer link and manual quotation intake are supported via “Kiểm tra báo giá ngoài”).

To use local AI: open a real listing, select “Kiểm tra AI trên máy”, and use the model-download action if available. When ready, “Hỏi AI” runs locally. An unavailable status can reflect device/runtime support or AICore preparation; it does not trigger a cloud fallback.
