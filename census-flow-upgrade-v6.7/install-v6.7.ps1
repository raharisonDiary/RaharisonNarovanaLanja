[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v6.7-$timestamp"

$files = @(
    "back\src\Census.Application\Persons\Repositories\IPersonRepository.cs",
    "back\src\Census.Application\Persons\Services\PersonService.cs",
    "back\src\Census.Infrastructure\Persons\Repositories\PersonRepository.cs",
    "mobile\app\persons.tsx",
    "mobile\app\households\new.tsx",
    "web\src\pages\PersonsPage.tsx",
    "web\src\i18n\translations.ts",
    "V6.7-CHANGELOG.md"
)

Write-Host "Installation de Census Flow V6.7 - controle des doublons..." -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot"

foreach ($relativePath in $files) {
    $sourcePath = Join-Path $upgradeRoot $relativePath
    $targetPath = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $sourcePath)) {
        throw "Fichier du correctif introuvable : $sourcePath"
    }

    if (Test-Path $targetPath) {
        $backupPath = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
        Copy-Item $targetPath $backupPath -Force
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $targetPath) -Force | Out-Null
    Copy-Item $sourcePath $targetPath -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Census Flow V6.7 installe." -ForegroundColor Green
Write-Host "Aucune donnee PostgreSQL, variable .env ou file locale n'a ete supprimee."
Write-Host ""
Write-Host "Verification :"
Write-Host "  cd back"
Write-Host "  dotnet build"
Write-Host "  cd ..\mobile"
Write-Host "  npm run typecheck"
Write-Host "  cd ..\web"
Write-Host "  npm run build"
