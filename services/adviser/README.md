# Connected adviser service

The Android 0.4.0 entry point uses 70 real, dated repository listings. This service reads `data/all_laptops_normalized.json` on every catalog request and before/after AI evaluation. Updating that file changes the served catalog revision without restarting the service. Android checks every 30 seconds when connected and refreshes on foreground/manual refresh. This is repository synchronization; no retailer crawler or live price feed is started.

From `E:\test`, with Node 24+:

```powershell
node --experimental-strip-types --env-file-if-exists=services/adviser/.env services/adviser/server.mjs
```

The service binds to loopback port 8788. For an attached Android target, replace the serial below with the intended target:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -s emulator-5580 reverse tcp:8788 tcp:8788
```

In app Settings, save `http://127.0.0.1:8788` as the service address. A remote service requires HTTPS. Development loopback/Android-emulator addresses are permitted by the client; arbitrary HTTP hosts are rejected. Public hosting, TLS termination, multiuser identity and distribution are separate deployment work. The service refuses a direct public bind.

Endpoints: `GET /health`, `GET /v1/catalog`, `POST /v1/advice`. Set `ADVISER_TOKEN` for a private installation and enter the matching service token in app Settings. Provider keys stay on the server. A shared local service token is not production per-user authentication.

## AI now runs on Android

The user selected local AI instead of an OpenAI API key. The current Android release invokes Gemini Nano through ML Kit and Android AICore, with a production-used native bridge and availability/download/cancel handling. No cloud provider is initialized by this service. Its catalog endpoint remains independent of AI, and no AI credential is needed here.

The server file retains the earlier controlled provider/budget adapter as research code and tests, but CLI startup explicitly passes no provider. Android no longer calls `/v1/advice`; it validates model-selected fact IDs and requirement proposals locally. The old paid-provider setup was superseded and should not be configured for this release.

See [Google's direct model access guide](https://developers.google.com/ml-kit/genai/prompt/android/get-started) for AICore setup and device availability. A compatible physical device is required to establish successful real inference. Emulator unsupported behavior is recorded separately from controlled bridge tests.

## Data and evidence limits

Source IDs and URLs remain distinct; missing identity/specification/capability stays unknown. All prices remain dated observations. Stock is not inferred from price. Shipping, mandatory fees, complete payable totals and affordability remain unknown. Hard known failures precede ordering; unknowns never become verified suitability. Saved decisions contain immutable historical listing snapshots and requirements.

No new collection was authorized or performed. The user requested use of the existing repo listings. Source publication permissions, reviewed variants, current checkout prices, independent workload evidence and accountable gate decisions remain unresolved. This implementation does not invent them.

## Checks

```powershell
npm.cmd --prefix apps/adviser test
node --experimental-strip-types --test services/adviser/server.test.mjs
npm.cmd --prefix apps/adviser run check
npm.cmd --prefix apps/adviser run catalog:import
npm.cmd --prefix apps/adviser run build:android
```

Import updates the bundled offline snapshot from the repository feed. Build after import to include new observations in the APK. Connected applications can receive repository-file changes through the service before the next APK build.
