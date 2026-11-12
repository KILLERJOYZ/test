# Lựa — Vietnam-first device adviser

An Expo Android implementation demo and the research/planning package for a needs-based laptop, phone and PC buying adviser.

- [Open the self-contained frontend demo](./apps/adviser/dist/demo.html)
- [Expo Android source, debug/build instructions and limitations](./apps/adviser/README.md)
- [Business requirements document](./brd.md)
- [Demo-first implementation plan](./docs/planning/IMPLEMENTATION_PLAN.md)
- [Research index](./research/README.md)

The app uses Expo / React Native Android with Material 3 Expressive design, fictional products/prices, deterministic recommendations and an optional bounded server-side AI adapter. HTML/CSS provides a design preview. See the app verification record for tested Android artifacts and remaining live-provider/physical-device evidence. The uppercase planning BRD is retained as an upstream historical reference; the selected requirement source is lowercase brd.md.

## Install and run the Android demo

Choose Expo Go for quick development with Fast Refresh, or build/install a standalone APK. This app targets Android only.

### Run with Expo Go

Install Node.js 24 and npm, an Android emulator (recommended) or Android phone, and the Expo Go version compatible with Expo SDK 54 from [expo.dev/go](https://expo.dev/go). From the repository root:

```powershell
cd apps/adviser
npm ci
npm run android
```

Start an emulator in Android Studio Device Manager before running the command. You can also use `npm start` and press **a** in the Expo terminal. For a phone, install the SDK 54-compatible Expo Go app, connect the phone and computer to the same network, and scan Expo's QR code. If using USB, enable USB debugging, accept the phone's **Allow USB debugging** prompt, and confirm the phone appears as `device` in `adb devices`.

### Install the existing APK

The release APK is checked into GitHub at `apps/adviser/artifacts/lua-adviser-demo.apk`. With Android Platform Tools installed and an authorized phone or running emulator, use this from the repository root:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb install -r .\apps\adviser\artifacts\lua-adviser-demo.apk
```

If you have just built the APK and have not copied it into `artifacts`, use `apps\adviser\android\app\build\outputs\apk\release\app-release.apk` instead. To uninstall the app and clear its locally saved demo decisions:

```powershell
& $adb uninstall vn.lua.adviser
```

### Build the APK from source

Install Node.js 24/npm, JDK 17 or newer supported by the Android Gradle Plugin, and Android Studio / Android SDK. The build needs Android SDK Platform 36, Build Tools, Platform Tools, and the NDK version requested by the project. Set `JAVA_HOME` to your JDK and `ANDROID_HOME` to your SDK (usually `%LOCALAPPDATA%\Android\Sdk` on Windows). Then, from the repository root:

```powershell
cd apps/adviser
npm ci
npm run build:android
```

The release APK is created at `android/app/build/outputs/apk/release/app-release.apk`. Install it from the app directory with:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

The build script generates the Expo Android project when needed. The first build can take longer while Gradle downloads dependencies and Android installs required SDK/NDK components.

### Troubleshooting and limitations

- If `adb devices` shows no device, start an emulator or reconnect the phone. If it shows `unauthorized`, unlock the phone and accept the **Allow USB debugging** prompt.
- If Expo Go reports an SDK mismatch, install the SDK 54-compatible Android version from [expo.dev/go](https://expo.dev/go).
- If the app cannot reach Metro, put the phone and computer on the same network or wait for the emulator to finish booting before retrying.
- If Gradle cannot find Java or Android SDK, set `JAVA_HOME` and `ANDROID_HOME`, open a new PowerShell window, and retry the build.
- The APK uses a debug signing key and is for development/demo use, not Play Store distribution. All products, configurations, sellers and prices are fictional. Optional live AI requires the separate server described in the [app README](./apps/adviser/README.md#optional-live-ai); without it, the app uses its labelled deterministic fallback.
