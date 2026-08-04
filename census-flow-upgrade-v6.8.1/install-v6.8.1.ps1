[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$backupRoot = Join-Path $projectRoot (
    "backup-before-v6.8.1-" +
    (Get-Date -Format "yyyyMMdd-HHmmss"))

$files = @(
    "V6.8.1-CHANGELOG.md",
    "scripts\start-backend.ps1",
    "scripts\start-mobile.ps1",
    "back\src\Census.Api\Program.cs",
    "back\src\Census.Api\Properties\launchSettings.json",
    "mobile\.env.example",
    "mobile\src\api\client.ts"
)

Write-Host "Installation de Census Flow V6.8.1..." -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot"

foreach ($relativePath in $files) {
    $source = Join-Path $PSScriptRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif introuvable : $relativePath"
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
Write-Host "Census Flow V6.8.1 installe." -ForegroundColor Green
Write-Host "Aucune migration PostgreSQL n'est requise."
Write-Host "Le fichier mobile\.env sera actualise au prochain lancement."
Write-Host ""
Write-Host "Redemarrage :"
Write-Host "  .\scripts\start-backend.ps1"
Write-Host "  .\scripts\start-mobile.ps1"
