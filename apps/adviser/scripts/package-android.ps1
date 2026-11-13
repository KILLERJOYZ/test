$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'package-android.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Android artifact packaging failed.' }
