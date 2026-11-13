$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $appRoot 'android\app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path -LiteralPath $source)) { throw 'Build the Android release APK before packaging.' }
$artifactDir = Join-Path $appRoot 'artifacts'
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$destination = Join-Path $artifactDir 'lua-adviser-demo.apk'
$sourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
function Publish-Apk([string]$target) {
    if ((Test-Path -LiteralPath $target) -and (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -eq $sourceHash) { return }
    $suffix = [Guid]::NewGuid().ToString('N')
    $temporary = Join-Path $artifactDir "package-$suffix.tmp"
    $previous = Join-Path $artifactDir "previous-$suffix.apk"
    try {
        Copy-Item -LiteralPath $source -Destination $temporary
        if ((Get-FileHash -LiteralPath $temporary -Algorithm SHA256).Hash.ToLowerInvariant() -ne $sourceHash) { throw 'Temporary APK hash mismatch.' }
        if (Test-Path -LiteralPath $target) { Move-Item -LiteralPath $target -Destination $previous }
        try { Move-Item -LiteralPath $temporary -Destination $target }
        catch {
            if ((Test-Path -LiteralPath $previous) -and -not (Test-Path -LiteralPath $target)) { Move-Item -LiteralPath $previous -Destination $target }
            throw
        }
    } finally { if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary } }
}
Publish-Apk $destination
if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -ne $sourceHash) {
    throw 'Packaged APK hash differs from the native build output.'
}
$config = Get-Content -LiteralPath (Join-Path $appRoot 'app.json') -Raw | ConvertFrom-Json
$versionedName = "lua-adviser-$($config.expo.version).apk"
Publish-Apk (Join-Path $artifactDir $versionedName)
$sourceInfo = Get-Item -LiteralPath $source
[ordered]@{
    package = $config.expo.android.package
    version = $config.expo.version
    versionCode = $config.expo.android.versionCode
    apk = 'lua-adviser-demo.apk'
    versionedApk = $versionedName
    sha256 = $sourceHash
    bytes = $sourceInfo.Length
    nativeOutputModifiedAtUtc = $sourceInfo.LastWriteTimeUtc.ToString('o')
    packagedAtUtc = [DateTime]::UtcNow.ToString('o')
    scope = 'Repository real-listing adviser; dated observations; device evidence recorded separately.'
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $artifactDir 'lua-adviser-demo.manifest.json') -Encoding UTF8
Write-Output "Packaged APK: $destination"
Write-Output "SHA-256: $sourceHash"
