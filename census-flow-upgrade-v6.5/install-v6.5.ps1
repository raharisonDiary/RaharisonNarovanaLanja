[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot

if (-not (Test-Path (Join-Path $projectRoot 'mobile\package.json'))) {
    throw "Le dossier mobile est introuvable dans : $projectRoot"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v6.5-$timestamp"

$relativeFiles = @(
    'V6.5-CHANGELOG.md',
    'mobile\app\(tabs)\households.tsx',
    'mobile\app\households\create.tsx',
    'mobile\app\persons.tsx'
)

Write-Host 'Installation de Census Flow V6.5 — saisie mobile des ménages...' -ForegroundColor Cyan
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
Write-Host 'Census Flow V6.5 installé.' -ForegroundColor Green
Write-Host 'La saisie mobile des ménages est maintenant séparée et reliée au formulaire citoyen.'
Write-Host 'Aucune donnée PostgreSQL, variable .env, dépendance npm ou file locale n’a été supprimée.'
Write-Host ''
Write-Host 'Vérification :'
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
