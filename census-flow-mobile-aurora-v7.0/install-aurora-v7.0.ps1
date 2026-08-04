param(
    [string]$ProjectRoot = (Get-Location).Path,
    [switch]$SkipTypecheck
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $patchRoot 'payload'
$mobileRoot = Join-Path $ProjectRoot 'mobile'
$packagePath = Join-Path $mobileRoot 'package.json'

if (-not (Test-Path -LiteralPath $packagePath)) {
    throw "Projet Census Flow introuvable. Lancez ce script depuis D:\projetmemoFF-complet ou utilisez -ProjectRoot."
}

$package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
if ($package.name -ne 'census-mobile') {
    throw "Le dossier mobile détecté ne correspond pas à Census Flow."
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $ProjectRoot "backup-before-aurora-v7.0-$timestamp"
$manifestPath = Join-Path $patchRoot 'AURORA-V7-MANIFEST.txt'
$manifest = Get-Content -LiteralPath $manifestPath | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_) -and -not $_.StartsWith('#')
}

Write-Host 'Installation du design mobile Aurora Civic V7.0...' -ForegroundColor Cyan
Write-Host "Projet : $ProjectRoot" -ForegroundColor DarkGray
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relativePath in $manifest) {
    $source = Join-Path $payloadRoot $relativePath
    $destination = Join-Path $ProjectRoot $relativePath
    $backup = Join-Path $backupRoot $relativePath

    if (-not (Test-Path -LiteralPath $source)) {
        throw "Fichier du correctif introuvable : $relativePath"
    }

    if (Test-Path -LiteralPath $destination) {
        $backupDirectory = Split-Path -Parent $backup
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item -LiteralPath $destination -Destination $backup -Force
    }

    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
    Unblock-File -LiteralPath $destination -ErrorAction SilentlyContinue

    Write-Host "  OK  $relativePath"
}

$backupMarker = Join-Path $ProjectRoot '.aurora-v7-last-backup.txt'
[System.IO.File]::WriteAllText(
    $backupMarker,
    $backupRoot,
    [System.Text.UTF8Encoding]::new($false)
)

if (-not $SkipTypecheck) {
    Write-Host ''
    Write-Host 'Vérification TypeScript...' -ForegroundColor Cyan

    Push-Location $mobileRoot
    try {
        & npm run typecheck
        if ($LASTEXITCODE -ne 0) {
            throw "La vérification TypeScript a échoué."
        }
    }
    catch {
        Write-Host ''
        Write-Host 'Échec de la vérification. Restauration automatique...' -ForegroundColor Red

        foreach ($relativePath in $manifest) {
            $backup = Join-Path $backupRoot $relativePath
            $destination = Join-Path $ProjectRoot $relativePath

            if (Test-Path -LiteralPath $backup) {
                Copy-Item -LiteralPath $backup -Destination $destination -Force
            }
            elseif (Test-Path -LiteralPath $destination) {
                Remove-Item -LiteralPath $destination -Force
            }
        }

        throw
    }
    finally {
        Pop-Location
    }
}

Write-Host ''
Write-Host 'Aurora Civic V7.0 est installé.' -ForegroundColor Green
Write-Host 'Aucune API, donnée PostgreSQL, route métier ou variable .env n’a été modifiée.' -ForegroundColor Green
Write-Host ''
Write-Host 'Démarrage :' -ForegroundColor Cyan
Write-Host '  Set-Location D:\projetmemoFF-complet\mobile'
Write-Host '  npx expo start -c'
