$ErrorActionPreference = 'Stop'

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $patchRoot 'payload'
$projectRoot = Split-Path -Parent $patchRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-professional-v7.3.0-$timestamp"

if (-not (Test-Path -LiteralPath (Join-Path $mobileRoot 'package.json'))) {
    throw "Projet mobile introuvable : $mobileRoot"
}

Write-Host 'Installation Professional UI V7.3.0...' -ForegroundColor Cyan
Write-Host "Projet : $projectRoot"
Write-Host "Sauvegarde : $backupRoot"

$files = @(
    'app\_layout.tsx',
    'app\(tabs)\_layout.tsx',
    'app\(tabs)\profile.tsx',
    'src\styles\censusTheme.ts',
    'src\styles\theme.ts',
    'src\preferences\PreferencesContext.tsx',
    'src\components\AuroraIcon.tsx',
    'src\components\AuroraSurface.tsx',
    'src\components\Brand.tsx',
    'src\components\CensusSidebar.tsx',
    'src\components\FormField.tsx',
    'src\components\GlobalThemeStyles.tsx',
    'src\components\MetricCard.tsx',
    'src\components\PrimaryButton.tsx',
    'src\components\ProgressRing.tsx',
    'src\components\ProgressRing.web.tsx',
    'src\components\ScreenHeader.tsx',
    'src\components\SelectField.tsx',
    'src\components\StatusPill.tsx'
)

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

try {
    foreach ($relativePath in $files) {
        $source = Join-Path $payloadRoot $relativePath
        $target = Join-Path $mobileRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath

        if (-not (Test-Path -LiteralPath $source)) {
            throw "Fichier du correctif introuvable : $source"
        }

        if (Test-Path -LiteralPath $target) {
            $backupDirectory = Split-Path -Parent $backup
            New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
            Copy-Item -LiteralPath $target -Destination $backup -Force
        }

        $targetDirectory = Split-Path -Parent $target
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        Copy-Item -LiteralPath $source -Destination $target -Force
        Write-Host "  OK  $relativePath" -ForegroundColor DarkGreen
    }

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
    Write-Host 'Echec : restauration automatique des fichiers sauvegardes...' -ForegroundColor Red

    foreach ($relativePath in $files) {
        $backup = Join-Path $backupRoot $relativePath
        $target = Join-Path $mobileRoot $relativePath

        if (Test-Path -LiteralPath $backup) {
            $targetDirectory = Split-Path -Parent $target
            New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
            Copy-Item -LiteralPath $backup -Destination $target -Force
        }
    }

    throw
}

Set-Content -LiteralPath (Join-Path $patchRoot 'last-backup.txt') -Value $backupRoot -Encoding UTF8

Write-Host ''
Write-Host 'Professional UI V7.3.0 est installe.' -ForegroundColor Green
Write-Host 'Contraste sombre et navigation entre toutes les pages sont corriges.' -ForegroundColor Green
Write-Host 'Aucune fonction metier ni variable .env n a ete modifiee.' -ForegroundColor Green
Write-Host ''
Write-Host 'Demarrage :' -ForegroundColor Cyan
Write-Host "  Set-Location $mobileRoot"
Write-Host '  npx expo start -c'
