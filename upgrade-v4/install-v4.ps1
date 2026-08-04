$ErrorActionPreference = "Stop"

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v4-$timestamp"
$fileListPath = Join-Path $upgradeRoot "files-v4.txt"

if (-not (Test-Path $fileListPath)) {
    throw "La liste des fichiers V4 est introuvable."
}

$requiredFolders = @("back", "web", "mobile", "scripts")
foreach ($folder in $requiredFolders) {
    if (-not (Test-Path (Join-Path $projectRoot $folder))) {
        throw "Le dossier '$folder' est absent de la racine du projet : $projectRoot"
    }
}

$files = Get-Content $fileListPath |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
Write-Host "Installation de Census Flow V4..." -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkCyan

foreach ($relativePath in $files) {
    $source = Join-Path $upgradeRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier V4 manquant : $relativePath"
    }

    if (Test-Path $destination) {
        $backup = Join-Path $backupRoot $relativePath
        $backupFolder = Split-Path -Parent $backup
        New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
        Copy-Item $destination $backup -Force
    }

    $destinationFolder = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
    Copy-Item $source $destination -Force
    Unblock-File -Path $destination -ErrorAction SilentlyContinue
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Census Flow V4 est installé." -ForegroundColor Green
Write-Host "Le fichier .env, PostgreSQL, les volumes Docker et les zones administratives n'ont pas été modifiés." -ForegroundColor Yellow
Write-Host ""
Write-Host "Étapes suivantes :"
Write-Host "  1. .\scripts\start-backend.ps1"
Write-Host "  2. .\scripts\start-web.ps1"
Write-Host "  3. .\scripts\start-mobile.ps1"
Write-Host "  4. .\scripts\verify-all.ps1"
