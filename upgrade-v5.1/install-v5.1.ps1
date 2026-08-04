[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$payloadRoot = Join-Path $PSScriptRoot 'payload'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v5.1-$timestamp"

$files = @(
    'mobile\app\(tabs)\map.tsx',
    'mobile\app\(tabs)\households.tsx',
    'mobile\src\screens\MapScreen.native.tsx',
    'mobile\src\screens\MapScreen.web.tsx',
    'mobile\src\preferences\PreferencesContext.tsx',
    'mobile\src\styles\theme.ts'
)

Write-Host 'Installation du correctif Census Flow V5.1…' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relativePath in $files) {
    $source = Join-Path $payloadRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif introuvable : $source"
    }

    if (Test-Path $destination) {
        $backup = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Force -Path (Split-Path $backup -Parent) | Out-Null
        Copy-Item $destination $backup -Force
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Correctif V5.1 installé.' -ForegroundColor Green
Write-Host 'Aucune donnée, variable .env ou dépendance npm n’a été supprimée.'
Write-Host ''
Write-Host 'Vérification :' -ForegroundColor Cyan
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
