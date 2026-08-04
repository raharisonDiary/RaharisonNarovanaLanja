$ErrorActionPreference = "Stop"
$webRoot = Resolve-Path "$PSScriptRoot\..\web"
Set-Location $webRoot

function Assert-NativeSuccess([string]$message) {
    if ($LASTEXITCODE -ne 0) { throw $message }
}

$viteCommand = Join-Path $webRoot 'node_modules\.bin\vite.cmd'
if (-not (Test-Path $viteCommand)) {
    Write-Host "Installation des dépendances web…" -ForegroundColor Cyan
    npm install --registry=https://registry.npmjs.org/
    Assert-NativeSuccess "npm install a échoué. Supprimez node_modules et relancez le script."
}

if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
Write-Host "Interface web : http://localhost:5174" -ForegroundColor Green
npm run dev
