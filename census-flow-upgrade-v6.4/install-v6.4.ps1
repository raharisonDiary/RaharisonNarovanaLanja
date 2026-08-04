[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot

if (-not (Test-Path (Join-Path $projectRoot 'mobile\package.json'))) {
    throw "Le dossier mobile est introuvable dans : $projectRoot"
}

if (-not (Test-Path (Join-Path $projectRoot 'web\package.json'))) {
    throw "Le dossier web est introuvable dans : $projectRoot"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v6.4-$timestamp"

$relativeFiles = @(
    'V6.4-CHANGELOG.md',
    'web\src\styles\tokens.css',
    'web\src\styles\base.css',
    'web\src\styles\layout.css',
    'web\src\styles\components.css',
    'web\src\styles\pages.css',
    'web\src\pages\DashboardPage.tsx',
    'web\src\pages\StatisticsPage.tsx',
    'mobile\src\styles\theme.ts',
    'mobile\src\styles\common.ts',
    'mobile\src\components\PrimaryButton.tsx',
    'mobile\src\components\MetricCard.tsx',
    'mobile\src\components\ScreenHeader.tsx',
    'mobile\app\(tabs)\index.tsx',
    'mobile\app\(tabs)\_layout.tsx',
    'mobile\app\statistics.tsx',
    'mobile\src\screens\MapScreen.web.tsx'
)

Write-Host 'Installation de Census Flow V6.4 — identité visuelle...' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relativePath in $relativeFiles) {
    $source = Join-Path $upgradeRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif manquant : $source"
    }

    if (Test-Path $destination) {
        $backup = Join-Path $backupRoot $relativePath
        $backupDirectory = Split-Path -Parent $backup
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item $destination $backup -Force
    }

    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Census Flow V6.4 installé.' -ForegroundColor Green
Write-Host 'Aucune donnée PostgreSQL, variable .env ou dépendance npm n’a été modifiée.'
Write-Host ''
Write-Host 'Vérification Web :'
Write-Host '  cd web'
Write-Host '  npm run build'
Write-Host ''
Write-Host 'Vérification Mobile :'
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
