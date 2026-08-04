$ErrorActionPreference = 'Stop'

$upgradeDirectory = $PSScriptRoot
$projectRoot = Split-Path $upgradeDirectory -Parent
$payloadRoot = Join-Path $upgradeDirectory 'payload'
$manifestPath = Join-Path $upgradeDirectory 'manifest.txt'

if (-not (Test-Path (Join-Path $projectRoot 'back')) -or
    -not (Test-Path (Join-Path $projectRoot 'web')) -or
    -not (Test-Path (Join-Path $projectRoot 'mobile'))) {
    throw "Le dossier upgrade-v2 doit être placé à la racine du projet, à côté de back, web et mobile."
}

if (-not (Test-Path $manifestPath)) {
    throw "Le manifeste de mise à niveau est introuvable."
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v2-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$files = Get-Content $manifestPath | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

Write-Host "Sauvegarde des fichiers existants dans : $backupRoot" -ForegroundColor Cyan

foreach ($relativePath in $files) {
    $source = Join-Path $payloadRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath
    $backup = Join-Path $backupRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier de mise à niveau manquant : $relativePath"
    }

    if (Test-Path $destination) {
        $backupDirectory = Split-Path $backup -Parent
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item $destination $backup -Force
    }

    $destinationDirectory = Split-Path $destination -Parent
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item $source $destination -Force
    Unblock-File $destination -ErrorAction SilentlyContinue
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Mise à niveau Census Flow V2 installée." -ForegroundColor Green
Write-Host "Le fichier .env et la base PostgreSQL n'ont pas été modifiés." -ForegroundColor Yellow
Write-Host "Étapes suivantes :" -ForegroundColor Cyan
Write-Host "  1. Arrêter puis relancer le backend : .\scripts\start-backend.ps1"
Write-Host "  2. Dans web : npm run dev"
Write-Host "  3. Dans mobile : npx expo start -c"
