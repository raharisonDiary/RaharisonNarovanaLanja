[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$payloadRoot = Join-Path $PSScriptRoot 'payload\mobile'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-aurora-sidebar-v7.1.0-$timestamp"

if (-not (Test-Path -LiteralPath $mobileRoot)) {
    throw "Le dossier mobile est introuvable : $mobileRoot"
}

$files = @(
    'app\_layout.tsx',
    'app\index.tsx',
    'app\(tabs)\_layout.tsx',
    'src\components\CensusSidebar.tsx',
    'src\components\GlobalThemeStyles.tsx',
    'src\components\ProgressRing.web.tsx'
)

Write-Host 'Installation Aurora Sidebar V7.1.0...' -ForegroundColor Cyan
Write-Host "Projet : $projectRoot"
Write-Host "Sauvegarde : $backupRoot"

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$createdFiles = New-Object System.Collections.Generic.List[string]

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
    else {
        $createdFiles.Add($relativePath)
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

    foreach ($relativePath in $files) {
        $destination = Join-Path $mobileRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath

        if (Test-Path -LiteralPath $backup) {
            Copy-Item -LiteralPath $backup -Destination $destination -Force
        }
        elseif ($createdFiles.Contains($relativePath) -and (Test-Path -LiteralPath $destination)) {
            Remove-Item -LiteralPath $destination -Force
        }
    }

    throw
}

Write-Host ''
Write-Host 'Aurora Sidebar V7.1.0 est installe.' -ForegroundColor Green
Write-Host 'Navigation laterale, dark mode et acces aux modules sont actifs.' -ForegroundColor Green
Write-Host 'Aucune API, donnee PostgreSQL, route metier ou variable .env n a ete modifiee.' -ForegroundColor Green
Write-Host ''
Write-Host 'Demarrage :' -ForegroundColor Cyan
Write-Host '  Set-Location D:\projetmemoFF-complet\mobile'
Write-Host '  npx expo start -c'
