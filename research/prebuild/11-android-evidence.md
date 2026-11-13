# Android evidence assessment

## Conclusion

PhysicalDeviceValidated=false. D01-D08 remain not_run. The installed SDK supplies ADB even though PATH did not; its devices list was empty. The inspection-started daemon was stopped afterward.

## Observed results

Current APK hash is recorded in JSON and preserves historical emulator provenance from VERIFICATION.md/manifest. App source changed during R06/R10, so that APK is not evidence for current behavior. No device was installed, modified or exercised. The smoke helper requires a selected serial and correct foreground package; those preconditions were absent.

## Changes/decisions

Prepare current-build journeys for guest round trip, Back/IME, focus/scaling, exact offers, TalkBack, background/cancellation, corrupt storage/reset/restart and dated history. New release build and target selection precede execution. ADB inspect cannot establish any journey or accessibility pass. Initial timing protocol requires thirty raw samples per case with failures, build/device/OS context and recomputable percentiles.

## Checks

U11 checks false physical acceptance, inspect-only claims, incomplete timings, unsupported percentiles, stale build hashes and valid partial evidence. Read-only target enumeration is recorded separately.

## Gaps and next action

Build current release from apps/adviser, select an authorized named phone and execute D01-D08 including TalkBack/switch/keyboard and reduced motion. No target means no meaningful device test now; no historical screenshot substitutes for it. Supported minSdk/targetSdk are build settings, not a verified device support matrix.
