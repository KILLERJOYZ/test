# Lựa — Device Advisor Android app

Demo 2 now opens the full **Phone / Tablet / PC** advisor with all **19 purposes and ten priorities**, exactly three ordered selections of each, separate screens, complete review and the same result surface at first launch and after confirmation. It uses a **75-record real reference SQLite catalog**, supports signed catalog activation/rollback, and includes the optional native ML Kit module.

See [current system, build and test instructions](./DEVICE_ADVISOR_SYSTEM.md) and [verification manifest](./verification/device-system-build.json). Install [the full-system APK](./artifacts/lua-device-advisor-full.apk). Missing source prices, stock and compatibility evidence remain visible as unknown. Supported physical Nano inference and production/data-quality acceptance are still pending.

Demo 1 and earlier Demo 2 records below describe their historical scope. Expo Go does not contain the custom native AI/signature module; use the APK or app-specific development build for those features.

Vietnamese laptop decision demo built with **Expo SDK 54, React Native 0.81.5 and TypeScript**. The installed app uses React Native screens. HTML/CSS provides a design preview of those same screens through React Native Web. Material 3 Expressive is expressed through semantic colors, contrasting shapes, emphasized typography, grouped surfaces, adaptive layouts and spring press feedback with reduced-motion support.

Requirements: the user-supplied lowercase [brd.md](../../brd.md), its hackathon priorities, the confirmed Android-only scope and the [implementation plan](../../docs/planning/IMPLEMENTATION_PLAN.md). The different uppercase planning BRD is an upstream historical reference. This work continues from upstream `f7ec267`.

## Fast Expo debugging

Node 24 and npm are tested. Install the SDK 54-compatible Expo Go Android build from [expo.dev/go](https://expo.dev/go), then:

```powershell
cd C:\Users\luken\test\apps\adviser
npm ci
npm start
```

Choose the emulator in Expo's Android device picker. `npm run android` opens Expo Go automatically when only the intended Android target is available. If another phone is attached but unauthorized, use the device picker.

For an explicit emulator connection:

```powershell
npx expo start --go --localhost --port 8082
# In another terminal:
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -s emulator-5554 reverse tcp:8082 tcp:8082
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -s emulator-5554 shell am start -a android.intent.action.VIEW -d exp://127.0.0.1:8082 -p host.exp.exponent
```

Expo Fast Refresh works in normal development mode. SDK 54 matches the existing RN 0.81 application; the lockfile pins the tested dependencies.

## Standalone APK

```powershell
# Configure JAVA_HOME (JDK 17+ compatible with the toolchain) and ANDROID_HOME.
npm run build:android
```

The script generates the Android host with Expo prebuild if needed, then assembles ARM64/x86-64. Output: `android/app/build/outputs/apk/release/app-release.apk`. Handoff copy: `artifacts/lua-adviser-demo.apk`. The APK runs without Expo Go or Metro.

This demo release uses the generated debug signing key; it is not a production/store signing setup. Generated native directories are ignored. Initial builds can download Gradle/Maven dependencies and licensed SDK/NDK components. `npm run android:native -- --device emulator-5554` provides app-specific native debugging. Delivery remains Android-only.

## Implemented journey

- Guest discovery and direct catalog search.
- Three-step picker: 1–3 ordered uses, additional mandatory tasks, exact VND ceiling, VM clarification, up to two soft preferences, and explicit review/confirmation.
- Mandatory checks before ranking; task-level reasons, exact variants, complete price context, limitations, three initial results and more results.
- Independent screen/weight filters, draft apply/cancel, distinct filter-empty/no-fit/clarification states, and user-requested compromise exploration.
- Variant-specific detail and evidence, conditional discounts, unknown shipping, expired/unavailable offers, and local sample-offer summaries.
- Two-device comparison; optional local save, restart/reopen, deletion, dated price snapshots and native summary sharing.
- Light/dark themes, safe areas, Android Back, labelled controls, minimum 48 dp touch targets, scaling and reduced-motion behavior.
- Bounded AI client/server with reviewed needs proposals, fact-bound explanation claims, revision checks and truthful deterministic fallback.
- Local sample-data workshop, fixture price validation/rollback, a deliberately invalid-candidate check, and labelled persistence/AI fault injection.
- Versioned persistence, v1 migration with unconfirmed historic task order, original-data recovery/export and corrupt-record isolation.

All **12 configurations, 18 offers and 3 sellers are fictional**. Capability mappings and preference quality are illustrative fixtures, not hardware measurements. Observation time is fixed and visible. Buying actions never open a real seller or record a purchase. The newly pulled crawler/embedder data remains separate from the synthetic acceptance dataset.

Future BRD features such as general quotation extraction, alerts, PC solving and production staff access are not exposed as working destinations. Demo administration uses local maintenance and validation rather than a production portal.

## Optional live AI

Copy [services/demo-ai/.env.example](../../services/demo-ai/.env.example) to `.env` beside it. Set server-only `OPENAI_API_KEY` and `OPENAI_MODEL` for a model available to your account. From the app directory:

```powershell
npm run ai
```

The service binds to `127.0.0.1:8787`. In Expo Go app Settings, use `http://10.0.2.2:8787` on the emulator, or use `adb reverse tcp:8787 tcp:8787` with `http://127.0.0.1:8787`. An app-specific release should use a controlled HTTPS endpoint; it does not broadly enable cleartext traffic.

Endpoints: `POST /demo/needs/interpret`, `POST /demo/advice/explain`, `GET /health`. The server bounds input/output size, timeout, concurrency and request count; validates allowed fields and claim/fact semantics; and never logs credentials or raw requests. Provider transmission happens only after an explicit user send action and the UI notice.

Without a configured key/model, the service returns `503 PROVIDER_UNAVAILABLE` and the app uses labelled deterministic fallback. Contract tests inject a controlled provider; they do not establish a live provider call. No real provider call has been verified here.

## Verification

```powershell
npm run check
npm test
npm run test:service
npx expo-doctor
npm run export:android
npm run build
```

`npm run build` generates the self-contained [HTML/CSS preview](./dist/demo.html). `npm run tokens` generates preview CSS variables from the same TypeScript color/shape tokens used by the app. Android evidence is recorded separately in [VERIFICATION.md](./VERIFICATION.md).

The explicit ADB smoke helper operates on an already-running emulator, uses UIAutomator text/bounds and assumes the state described by each phase:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SERIAL = 'emulator-5554'
python scripts/android-smoke.py inspect
```

## Source map

| Source | Responsibility |
|---|---|
| `src/AndroidApp.tsx` | Current app/screens/components and persistence actions |
| `src/design-tokens.ts` | Shared theme, shape and motion tokens |
| `src/domain.ts` | Exact fixtures, integer money and mandatory eligibility |
| `src/picker.ts` | Ordered uses, ranking, refinement, validation and migration |
| `src/ai.ts` | Validated AI contracts and fallback |
| `services/demo-ai/server.mjs` | Server-only provider adapter and HTTP service |
| `app.json`, `metro.config.cjs`, `babel.config.cjs` | Expo project configuration |
| `src/App.tsx`, `src/qa.web.tsx` | Retained historical browser prototype/checks; not the current entry |

The custom React Native design-system layer is not Compose or official component certification. Dynamic device-color extraction is not implemented; the app uses fallback palettes. Physical-phone/TalkBack certification, the full performance sampling protocol, exploratory user research, production source/data readiness and live-provider acceptance require their own evidence.
