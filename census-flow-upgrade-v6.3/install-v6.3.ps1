[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$mobileRoot = Join-Path $projectRoot 'mobile'

if (-not (Test-Path (Join-Path $mobileRoot 'package.json'))) {
    throw "Le dossier mobile est introuvable dans : $projectRoot"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v6.3-$timestamp"

$relativeFiles = @(
    'mobile\app\campaigns.tsx',
    'mobile\app\dwellings.tsx',
    'mobile\app\persons.tsx',
    'mobile\app\(tabs)\households.tsx',
    'mobile\src\preferences\PreferencesContext.tsx',
    'mobile\src\screens\MapScreen.web.tsx',
    'mobile\src\data\mapGeometry.ts',
    'mobile\src\utils\lifecycle.ts'
)

Write-Host 'Installation du correctif Census Flow V6.3...' -ForegroundColor Cyan
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
Write-Host 'Correctif V6.3 installé.' -ForegroundColor Green
Write-Host 'Aucune donnée PostgreSQL, variable .env ou dépendance npm n’a été modifiée.'
Write-Host ''
Write-Host 'Vérification :'
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
