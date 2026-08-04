[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v6.7.2-$stamp"

Write-Host "Installation de Census Flow V6.7.2 - correction des sessions..." -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot"

$files = @(
    "mobile\src\api\client.ts",
    "mobile\src\auth\sessionEvents.ts",
    "web\src\api\http.ts",
    "back\src\Census.Infrastructure\Persons\Repositories\PersonRepository.cs",
    "V6.7.2-CHANGELOG.md"
)

foreach ($relativePath in $files) {
    $source = Join-Path $upgradeRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier source introuvable : $source"
    }

    if (Test-Path $destination) {
        $backup = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $backup) | Out-Null
        Copy-Item $destination $backup -Force
    }

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Census Flow V6.7.2 installe." -ForegroundColor Green
Write-Host "Aucune donnee PostgreSQL, variable .env ou file locale n'a ete supprimee."
Write-Host ""
Write-Host "Verification :"
Write-Host "  cd back"
Write-Host "  dotnet build"
Write-Host "  cd ..\mobile"
Write-Host "  npm run typecheck"
Write-Host "  cd ..\web"
Write-Host "  npm run build"
