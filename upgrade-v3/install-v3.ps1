[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot
$payloadRoot = Join-Path $upgradeRoot "payload"

if (-not (Test-Path (Join-Path $projectRoot "back")) -or
    -not (Test-Path (Join-Path $projectRoot "web")) -or
    -not (Test-Path (Join-Path $projectRoot "mobile"))) {
    throw "Placez le dossier upgrade-v3 directement dans la racine du projet, à côté de back, web et mobile."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $projectRoot "backup-before-v3-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$files = Get-ChildItem -Path $payloadRoot -Recurse -File
Write-Host "Installation de Census Flow V3…" -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($payloadRoot.Length).TrimStart('\', '/')
    $target = Join-Path $projectRoot $relativePath
    $backup = Join-Path $backupRoot $relativePath

    if (Test-Path $target) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
        Copy-Item -Path $target -Destination $backup -Force
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -Path $file.FullName -Destination $target -Force
    Write-Host "  OK  $relativePath"
}

Write-Host ""
Write-Host "Census Flow V3 est installé." -ForegroundColor Green
Write-Host "Le fichier .env, les volumes Docker et les données PostgreSQL n'ont pas été supprimés."
Write-Host ""
Write-Host "Étapes suivantes :"
Write-Host "  1. .\scripts\start-backend.ps1"
Write-Host "  2. .\scripts\import-madagascar-geography.ps1 -Email admin@gmail.com -Password VOTRE_MOT_DE_PASSE"
Write-Host "  3. .\scripts\start-web.ps1"
Write-Host "  4. .\scripts\start-mobile.ps1"
Write-Host "  5. .\scripts\verify-all.ps1"
