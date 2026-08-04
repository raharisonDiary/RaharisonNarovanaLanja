[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$filesRoot = Join-Path $upgradeRoot 'files'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v6.2-$timestamp"

$relativeFiles = @(
    'back\src\Census.Api\Controllers\AnalyticsController.cs',
    'mobile\src\api\client.ts',
    'mobile\src\auth\AuthContext.tsx',
    'mobile\src\auth\sessionEvents.ts',
    'mobile\src\storage\sessionStore.ts',
    'mobile\app\statistics.tsx'
)

Write-Host 'Installation du correctif Census Flow V6.2...' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relativePath in $relativeFiles) {
    $source = Join-Path $filesRoot $relativePath
    $target = Join-Path $projectRoot $relativePath
    $backup = Join-Path $backupRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif introuvable : $source"
    }

    if (Test-Path $target) {
        $backupDirectory = Split-Path -Parent $backup
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item $target $backup -Force
    }

    $targetDirectory = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    Copy-Item $source $target -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Copy-Item `
    (Join-Path $upgradeRoot 'V6.2-CHANGELOG.md') `
    (Join-Path $projectRoot 'V6.2-CHANGELOG.md') `
    -Force

Write-Host ''
Write-Host 'Correctif V6.2 installé.' -ForegroundColor Green
Write-Host 'Aucune donnée PostgreSQL, variable .env ou zone administrative n’a été supprimée.'
Write-Host ''
Write-Host 'Vérification :'
Write-Host '  1. Arrêter puis redémarrer le backend.'
Write-Host '  2. cd mobile'
Write-Host '  3. npm run typecheck'
Write-Host '  4. npx expo start -c'
