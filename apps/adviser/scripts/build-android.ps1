param([string]$Architectures = 'arm64-v8a,x86_64')
$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
if (-not $env:JAVA_HOME) {
    $jdkCandidates = @('C:\Program Files\Android\openjdk\jdk-21.0.8', 'C:\Program Files\Android\Android Studio\jbr')
    $jdk = $jdkCandidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'bin\java.exe') } | Select-Object -First 1
    if (-not $jdk) { throw 'Set JAVA_HOME to a supported JDK (17 or newer).' }
    $env:JAVA_HOME = $jdk
}
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not (Test-Path -LiteralPath (Join-Path $appRoot 'android\gradlew.bat'))) {
    Push-Location $appRoot
    try {
        & npx expo prebuild --platform android --no-install
        if ($LASTEXITCODE -ne 0) { throw 'Expo Android prebuild failed.' }
    } finally { Pop-Location }
}
Push-Location (Join-Path $appRoot 'android')
try {
    & .\gradlew.bat assembleRelease "-PreactNativeArchitectures=$Architectures" --max-workers=2 --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'Android release build failed.' }
} finally { Pop-Location }
