[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$payloadRoot = Join-Path $PSScriptRoot 'payload\mobile'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-aurora-v7.0.2-$timestamp"

if (-not (Test-Path -LiteralPath $mobileRoot)) {
    throw "Le dossier mobile est introuvable : $mobileRoot"
}

Write-Host 'Installation du correctif Aurora Civic V7.0.2...' -ForegroundColor Cyan
Write-Host "Projet : $projectRoot"
Write-Host "Sauvegarde : $backupRoot"

$files = @(
    'app\index.tsx',
    'src\components\ProgressRing.web.tsx'
)

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$progressWebPreviouslyExisted = Test-Path -LiteralPath (Join-Path $mobileRoot 'src\components\ProgressRing.web.tsx')

foreach ($relativePath in $files) {
    $source = Join-Path $payloadRoot $relativePath
    $destination = Join-Path $mobileRoot $relativePath
    $backup = Join-Path $backupRoot $relativePath

    if (-not (Test-Path -LiteralPath $source)) {
        throw "Fichier du correctif introuvable : $source"
    }

    if (Test-Path -LiteralPath $destination) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
        Copy-Item -LiteralPath $destination -Destination $backup -Force
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
    Write-Host "  OK  mobile\$relativePath" -ForegroundColor Green
}

try {
    Write-Host ''
    Write-Host 'Verification TypeScript...' -ForegroundColor Cyan
    Push-Location $mobileRoot
    try {
        npm run typecheck
        if ($LASTEXITCODE -ne 0) {
            throw 'La verification TypeScript a echoue.'
        }
    }
    finally {
        Pop-Location
    }
}
catch {
    Write-Host ''
    Write-Host 'Echec de la verification. Restauration automatique...' -ForegroundColor Yellow

    $indexBackup = Join-Path $backupRoot 'app\index.tsx'
    if (Test-Path -LiteralPath $indexBackup) {
        Copy-Item -LiteralPath $indexBackup -Destination (Join-Path $mobileRoot 'app\index.tsx') -Force
    }

    $progressDestination = Join-Path $mobileRoot 'src\components\ProgressRing.web.tsx'
    $progressBackup = Join-Path $backupRoot 'src\components\ProgressRing.web.tsx'
    if ($progressWebPreviouslyExisted -and (Test-Path -LiteralPath $progressBackup)) {
        Copy-Item -LiteralPath $progressBackup -Destination $progressDestination -Force
    }
    elseif (Test-Path -LiteralPath $progressDestination) {
        Remove-Item -LiteralPath $progressDestination -Force
    }

    throw
}

Write-Host ''
Write-Host 'Aurora Civic V7.0.2 est installe.' -ForegroundColor Green
Write-Host 'Le cercle de progression fonctionne maintenant sur Expo Web.' -ForegroundColor Green
Write-Host 'Le bouton Connexion est visible en haut et dans le bouton principal.' -ForegroundColor Green
Write-Host ''
Write-Host 'Redemarrage :' -ForegroundColor Cyan
Write-Host '  Set-Location D:\projetmemoFF-complet\mobile'
Write-Host '  npx expo start -c'
