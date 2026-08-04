$ErrorActionPreference = "Stop"
$mobileRoot = Resolve-Path "$PSScriptRoot\..\mobile"
Set-Location $mobileRoot

function Assert-NativeSuccess([string]$message) {
    if ($LASTEXITCODE -ne 0) { throw $message }
}

$expoCommand = Join-Path $mobileRoot 'node_modules\.bin\expo.cmd'
if (-not (Test-Path $expoCommand)) {
    Write-Host "Installation des dépendances mobiles…" -ForegroundColor Cyan
    npm install --legacy-peer-deps --registry=https://registry.npmjs.org/
    Assert-NativeSuccess "npm install a échoué pour l'application mobile."
}

if (-not (Test-Path .env)) { Copy-Item .env.example .env }
Write-Host "Démarrage d'Expo…" -ForegroundColor Green
npx expo start -c
