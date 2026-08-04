[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v6.7.1-$timestamp"

$files = @(
    "back\src\Census.Application\Persons\Repositories\IPersonRepository.cs",
    "back\src\Census.Application\Persons\Services\PersonService.cs",
    "back\src\Census.Infrastructure\Persons\Repositories\PersonRepository.cs",
    "V6.7.1-CHANGELOG.md"
)

Write-Host "Installation de Census Flow V6.7.1 - correction enregistrement citoyen..." -ForegroundColor Cyan
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
Write-Host "Census Flow V6.7.1 installe." -ForegroundColor Green
Write-Host "Le numero du citoyen est maintenant genere atomiquement par le serveur."
Write-Host "Aucune migration et aucune suppression de donnees ne sont necessaires."
Write-Host ""
Write-Host "Etapes suivantes :"
Write-Host "  1. Arreter le backend avec Ctrl+C"
Write-Host "  2. Relancer .\scripts\start-backend.ps1"
Write-Host "  3. Reessayer l'enregistrement du citoyen"
