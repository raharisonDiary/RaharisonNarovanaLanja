$ErrorActionPreference = 'Stop'

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $patchRoot 'payload'
$projectRoot = Split-Path -Parent $patchRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-solar-yellow-v7.4.0-$timestamp"

if (-not (Test-Path -LiteralPath (Join-Path $mobileRoot 'package.json'))) {
    throw "Projet mobile introuvable : $mobileRoot"
}

if (-not (Test-Path -LiteralPath $payloadRoot)) {
    throw "Dossier payload introuvable : $payloadRoot"
}

$payloadFiles = @(
    Get-ChildItem -LiteralPath $payloadRoot -Recurse -File |
    Sort-Object FullName
)

if ($payloadFiles.Count -eq 0) {
    throw 'Le correctif ne contient aucun fichier.'
}

Write-Host 'Installation Solar Yellow Motion V7.4.0...' -ForegroundColor Cyan
Write-Host "Projet : $projectRoot"
Write-Host "Sauvegarde : $backupRoot"

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$createdTargets = New-Object System.Collections.Generic.List[string]

try {
    foreach ($sourceFile in $payloadFiles) {
        $relativePath = $sourceFile.FullName.Substring($payloadRoot.Length).TrimStart('\', '/')
        $target = Join-Path $mobileRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath

        if (Test-Path -LiteralPath $target) {
            $backupDirectory = Split-Path -Parent $backup
            New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
            Copy-Item -LiteralPath $target -Destination $backup -Force
        }
        else {
            $createdTargets.Add($target)
        }

        $targetDirectory = Split-Path -Parent $target
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        Copy-Item -LiteralPath $sourceFile.FullName -Destination $target -Force
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
    Write-Host 'Echec : restauration automatique...' -ForegroundColor Red

    foreach ($sourceFile in $payloadFiles) {
        $relativePath = $sourceFile.FullName.Substring($payloadRoot.Length).TrimStart('\', '/')
        $target = Join-Path $mobileRoot $relativePath
        $backup = Join-Path $backupRoot $relativePath

        if (Test-Path -LiteralPath $backup) {
            $targetDirectory = Split-Path -Parent $target
            New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
            Copy-Item -LiteralPath $backup -Destination $target -Force
        }
    }

    foreach ($createdTarget in $createdTargets) {
        if (Test-Path -LiteralPath $createdTarget) {
            Remove-Item -LiteralPath $createdTarget -Force
        }
    }

    throw
}

Set-Content -LiteralPath (Join-Path $patchRoot 'last-backup.txt') -Value $backupRoot -Encoding UTF8

Write-Host ''
Write-Host 'Solar Yellow Motion V7.4.0 est installe.' -ForegroundColor Green
Write-Host 'La palette jaune, le dark mode et les animations sont actifs sur mobile et Expo Web.' -ForegroundColor Green
Write-Host 'Aucune API, donnee PostgreSQL, synchronisation ou variable .env n a ete modifiee.' -ForegroundColor Green
Write-Host ''
Write-Host 'Demarrage :' -ForegroundColor Cyan
Write-Host "  Set-Location $mobileRoot"
Write-Host '  npx expo start -c'
Write-Host '  Puis appuyez sur w pour Expo Web.'
