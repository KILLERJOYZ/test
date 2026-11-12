# Android implementation verification — 12 November 2026

The selected requirement source is lowercase [brd.md](../../brd.md), amended by the user's Android-only React Native and Expo decisions. The upstream base is `f7ec267`; the current release artifact was rebuilt from the committed Expo source in the primary `E:\test` checkout. This record reports engineering evidence, not a product-owner acceptance or production release decision.

## Deliverables and environment

- Expo SDK 54.0.38, React Native 0.81.5, React 19.1.0, Hermes and the new architecture.
- Android release APK: [lua-adviser-demo.apk](./artifacts/lua-adviser-demo.apk), containing `arm64-v8a` and `x86_64` libraries. Generated Android debug certificate; demo distribution only.
- Package `vn.lua.adviser`, version 0.3.0, min SDK 24 / target SDK 36. These are build settings; Android 24 and every intermediate version have not been tested.
- Tested emulator: `Resizable_Experimental`, `sdk_gphone16k_x86_64`, Android 17 / API 37, 1080×2400 at density 420.
- Windows build host, Node 24.18.0, Android build tools 36.0.0, Gradle 8.14.3, Expo-generated Android project, NDK 27.1.12297006. Local JDK 17 and the build script's installed JDK fallback are supported build paths used during this work.
- [Machine-readable manifest](./verification/android-demo-manifest.json) records the final APK hash and evidence limitations.
- Rebuilt in the primary checkout with Gradle 8.14.3; APK signature and package metadata were verified before publication in the repository.
- [Self-contained HTML/CSS preview](./dist/demo.html) is built from the same screen implementation. The older [browser verification record](./verification/BROWSER_VERIFICATION_2026-11-11.md) is preserved separately.

## Automated results

| Check | Observed result |
|---|---|
| TypeScript `npm run check` | Passed |
| `npm test` | 18 tests passed, zero failed |
| `npm run test:service` | 1 HTTP integration test passed, zero failed; injected controlled provider |
| `npx expo-doctor` | 18/18 checks passed |
| `npm run export:android` | Hermes Android bundle exported successfully |
| `npm run build` | HTML/CSS preview built and inlined successfully |
| Expo-generated Android `assembleRelease` | Passed for ARM64 and x86-64; APK installed on the emulator |
| APK signature verification | Passed; Android Debug certificate |

The tests independently cover exact budget/one-dong boundaries, conditional discounts, missing shipping, invalid/unsafe amounts, inactive offers, exact identity, mandatory VM checks, meaningful ordered-use reranking, filter-empty versus no-fit, unconfirmed/unknown profiles, legacy schema migration, corrupt-record isolation, invalid model fields, contradictory claims referencing valid fact IDs, stale AI revisions and provider failure. A separate regression covers null/malformed legacy records without losing healthy profile data.

## Android interaction evidence

The demo was exercised both in Expo Go and as the app-specific release package. The standalone APK contains its JavaScript and operates with Metro stopped. The ADB helper now verifies the foreground package and successful UI dump before interacting, preventing stale or wrong-app observations.

| Flow | Evidence / practical limit |
|---|---|
| Guest discovery and picker | Three-step task/budget/review journey exercised. Native release picker phase passed. |
| Android Back and exact numeric input | Hardware Back returns to the preceding picker step without losing answers. A one-dong ceiling produces no-fit; restoring VND 22 million restores recommendations. Standalone checks passed. |
| Filter recovery | A 1 kg filter produces filter-empty; clearing it restores the same confirmed profile and eligible set. Native release phase passed. |
| Save and restart | Local save, reopening and dated historical observations exercised; restore retains exact identity and task context. |
| Comparison | Two-product comparison passed in Expo Go and in the standalone Android package after restart/reopening a decision. |
| Exact variant and offers | P1 → P4 changes RAM/SSD, detail and offers; synthetic evidence and sample-only buying action exercised. |
| AI fallback | Missing-provider, invalid-output and timeout boundaries covered by contract/unit checks; native fallback UI and sample-only offer action passed the standalone smoke review. No real provider call is claimed. |
| Persistence failure and recovery | Failure injection is implemented; schema/recovery behavior has automated checks. Physical storage-failure and OS data-loss behavior are not certified. |

Screenshots and UI dumps live under `verification/`. Files prefixed `expo-` may be captured either in Expo Go or the release package; the manifest identifies final standalone smoke outcomes. They are visual evidence, not measurements of hardware suitability, current prices or representative user comprehension.

The final visual review found clipped labels after Android font-scale changes. Shared text/input components now apply the current OS font scale explicitly and keep sufficient line height; automatic second scaling is disabled. The rebuilt APK was visually checked at 1.3× with complete labels and navigation; the baseline expanded layout was also reviewed. Rapid configuration changes on the experimental emulator sometimes returned a transient splash/blank capture or null UI root. These attempts are excluded; broader configuration-transition/device coverage remains an acceptance gap. Earlier failing captures are kept under `verification/diagnostics/`; they are not accepted evidence. Emulator font/size/density settings were restored after checking.

ADB on the default port became unresponsive during a restart/install cycle. Verification continued through an isolated server on port 5038 and a direct emulator connection. Earlier interrupted smoke attempts are not counted as passes. The helper is a stateful review aid, not a general CI end-to-end suite.

## Acceptance boundaries

- The demo implements core U01–U05 and optional local U07/U08. Local fixture/workshop operations support the limited demo outcomes of A02/A03/A04/A06/A07/A09, not production roles/publication/audit or a production admin portal.
- The data set contains 12 fictional configurations, 18 offers and 3 sellers. Every monetary/capability conclusion is within the fixture model. New crawler/embedder data is not silently treated as reviewed production data.
- Material 3 Expressive is implemented through custom React Native components and shared tokens, including semantic colors, shape emphasis, readable hierarchy and reduced-motion-aware spring press feedback. It is not an official component certification. Device-derived dynamic color is not integrated; fallback light/dark palettes are available.
- Physical-phone validation, TalkBack/switch-access review, the full startup/input/performance distribution protocol and exploratory buyer sessions remain unperformed. The connected physical phone was unauthorized, and the user selected emulator testing.
- The AI adapter and controlled validation/failure checks are implemented. Provider credentials and model configuration are absent, so real-provider D1 evidence remains pending.
- G1/G2/G3 are not automatically marked accepted by implementation or a successful APK build. Product decisions, full evidence sets and the stated outstanding checks still govern acceptance.
- No production source rights, real-price accuracy, account service, unrestricted quotation crawler, alerts, PC solver, commercial integration or global rollout is claimed by this demo.
