# Install the Lựa Android demo

This guide covers two ways to run the app: Expo Go for quick development, or a standalone APK for normal Android installation. The app is Android-only and uses a fictional sample catalog.

## Option 1: Run with Expo Go

Use this when you want to try the latest source with Fast Refresh.

### Requirements

- Windows, macOS or Linux with Node.js 24 and npm.
- Expo Go compatible with Expo SDK 54, installed from [expo.dev/go](https://expo.dev/go).
- Either an Android emulator, or an Android phone with developer options and USB debugging enabled.

### Start the app

From the repository root:

```powershell
cd apps/adviser
npm ci
npm run android
```

Expo starts Metro and opens the app in Expo Go on the selected Android target. If target selection is not automatic, start an emulator in Android Studio Device Manager first, then run `npm run android` again. You can also run `npm start` and press **a** in the Expo terminal.

For a physical phone, install the SDK 54 compatible Expo Go app, connect the phone and computer to the same network, then scan the QR code shown by Expo. If the phone is connected by USB, accept its **Allow USB debugging** prompt and confirm it appears as `device` in `adb devices`.

## Option 2: Install a standalone APK

The standalone APK does not need Expo Go or Metro. On this development workspace, the built APK is at:

```text
apps/adviser/artifacts/lua-adviser-demo.apk
```

The APK is a local build artifact and is not checked into GitHub. To build it from a fresh clone, follow the next section.

### Install over USB or to an emulator

Install Android Platform Tools and connect an authorized phone or start an emulator. From the repository root, run:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb install -r .\apps\adviser\artifacts\lua-adviser-demo.apk
```

Replace the APK path with `apps\adviser\android\app\build\outputs\apk\release\app-release.apk` if you just built it and have not copied it into `artifacts`.

To remove the app:

```powershell
& $adb uninstall vn.lua.adviser
```

Uninstalling clears the app's locally saved demo decisions.

## Build the APK from source

### Requirements

- Node.js 24 and npm.
- JDK 17 or newer supported by the Android Gradle Plugin.
- Android Studio / Android SDK with Android SDK Platform 36, Build Tools, Platform Tools, and the NDK version requested by the project.
- Set `JAVA_HOME` to the JDK and `ANDROID_HOME` to your SDK folder. On a standard Windows setup, the SDK is usually `%LOCALAPPDATA%\Android\Sdk`.

### Build and install

```powershell
cd apps/adviser
npm ci
npm run build:android
```

The release APK is created at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Install it from the app directory with:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb install -r .\android\app\build\outputs\apk\release\app-release.apk
```

The build script generates the Expo Android project when it is absent. The first build can take longer while Gradle downloads dependencies and Android installs any required SDK/NDK components.

## Troubleshooting

- **No device listed:** start an emulator in Android Studio, or reconnect the phone and run `adb devices` again.
- **Device says `unauthorized`:** unlock the phone and accept the Android **Allow USB debugging** prompt. Reconnect USB if the prompt does not appear.
- **Expo Go reports an SDK mismatch:** update Expo Go using [expo.dev/go](https://expo.dev/go) and choose the SDK 54-compatible Android version.
- **The app cannot reach Metro:** make sure the phone and computer share a network; with an emulator, retry `npm run android` after the emulator is fully booted.
- **Gradle cannot find Java or Android SDK:** set `JAVA_HOME` and `ANDROID_HOME`, then open a new PowerShell window and retry the build.

## Demo limitations

All products, configurations, sellers and prices are fictional. The APK uses a debug signing key and is for development/demo use, not Play Store distribution. Optional live AI requires the separately configured server described in the [app README](./README.md#optional-live-ai); without it, the app uses its labelled deterministic fallback.
