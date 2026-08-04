[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v6.6-$timestamp"

Write-Host "Installation de Census Flow V6.6 — saisie guidée des citoyens…" -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

$files = @(
    "mobile\app\persons.tsx",
    "mobile\app\households\new.tsx",
    "mobile\src\preferences\PreferencesContext.tsx",
    "V6.6-CHANGELOG.md"
)

foreach ($relativePath in $files) {
    $source = Join-Path $PSScriptRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif introuvable : $source"
    }

    if (Test-Path $destination) {
        $backupDestination = Join-Path $backupRoot $relativePath
        $backupDirectory = Split-Path $backupDestination -Parent
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item $destination $backupDestination -Force
    }

    $destinationDirectory = Split-Path $destination -Parent
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Census Flow V6.6 installé." -ForegroundColor Green
Write-Host "Aucune base PostgreSQL, variable .env, campagne ou donnée locale n’a été supprimée." -ForegroundColor DarkGray
Write-Host ""
Write-Host "Vérification :" -ForegroundColor Cyan
Write-Host "  cd mobile"
Write-Host "  npm run typecheck"
Write-Host "  npx expo start -c"
