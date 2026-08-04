$ErrorActionPreference = 'Stop'

$patchRoot = $PSScriptRoot
$projectRoot = Split-Path -Parent $patchRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$payloadRoot = Join-Path $patchRoot 'payload'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-professional-v7.2.0-$timestamp"

if (-not (Test-Path -LiteralPath (Join-Path $mobileRoot 'package.json'))) {
    throw "Projet mobile introuvable : $mobileRoot"
}

Write-Host 'Installation de Census Flow Mobile Professional V7.2.0...' -ForegroundColor Cyan
Write-Host "Projet : $projectRoot"
Write-Host "Sauvegarde : $backupRoot"

$files = @(
    'mobile\app\(tabs)\profile.tsx',
    'mobile\app\_layout.tsx',
    'mobile\src\components\AuroraIcon.tsx',
    'mobile\src\components\AuroraSurface.tsx',
    'mobile\src\components\Brand.tsx',
    'mobile\src\components\CensusSidebar.tsx',
    'mobile\src\components\FormField.tsx',
    'mobile\src\components\GlobalThemeStyles.tsx',
    'mobile\src\components\MetricCard.tsx',
    'mobile\src\components\PrimaryButton.tsx',
    'mobile\src\components\ProgressRing.tsx',
    'mobile\src\components\ProgressRing.web.tsx',
    'mobile\src\components\ScreenHeader.tsx',
    'mobile\src\components\SelectField.tsx',
    'mobile\src\components\StatusPill.tsx',
    'mobile\src\preferences\PreferencesContext.tsx',
    'mobile\src\styles\censusTheme.ts',
    'mobile\src\styles\theme.ts'
)

$createdFiles = New-Object System.Collections.Generic.List[string]

try {
    foreach ($relativePath in $files) {
        $sourceRelative = $relativePath.Substring('mobile\'.Length)
        $source = Join-Path $payloadRoot $sourceRelative
        $destination = Join-Path $projectRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath

        if (-not (Test-Path -LiteralPath $source)) {
            throw "Fichier du correctif introuvable : $source"
        }

        if (Test-Path -LiteralPath $destination) {
            $backupDirectory = Split-Path -Parent $backup
            New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
            Copy-Item -LiteralPath $destination -Destination $backup -Force
        }
        else {
            $createdFiles.Add($destination)
        }

        $destinationDirectory = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        Copy-Item -LiteralPath $source -Destination $destination -Force
        Write-Host "  OK  $relativePath" -ForegroundColor Green
    }

    Write-Host ''
    Write-Host 'Verification TypeScript...' -ForegroundColor Cyan
    Push-Location $mobileRoot
    try {
        cmd.exe /d /c "npm run typecheck"
        if ($LASTEXITCODE -ne 0) {
            throw 'La verification TypeScript a echoue.'
        }
    }
    finally {
        Pop-Location
    }

    Write-Host ''
    Write-Host 'Professional UI V7.2.0 est installe.' -ForegroundColor Green
    Write-Host 'Le profil, la sidebar et les modes clair/sombre sont maintenant harmonises.' -ForegroundColor Green
    Write-Host 'Aucune fonctionnalite metier ni variable .env n a ete modifiee.' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Demarrage :' -ForegroundColor Cyan
    Write-Host "  Set-Location $mobileRoot"
    Write-Host '  npx expo start -c'
}
catch {
    Write-Host ''
    Write-Host 'Echec de la verification. Restauration automatique...' -ForegroundColor Yellow

    foreach ($relativePath in $files) {
        $destination = Join-Path $projectRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath
        if (Test-Path -LiteralPath $backup) {
            $destinationDirectory = Split-Path -Parent $destination
            New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
            Copy-Item -LiteralPath $backup -Destination $destination -Force
        }
    }

    foreach ($createdFile in $createdFiles) {
        if (Test-Path -LiteralPath $createdFile) {
            Remove-Item -LiteralPath $createdFile -Force
        }
    }

    throw
}
