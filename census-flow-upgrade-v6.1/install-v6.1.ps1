[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$payload = Join-Path $PSScriptRoot 'payload'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $projectRoot "backup-before-v6.1-$stamp"

New-Item -ItemType Directory -Path $backup -Force | Out-Null

Write-Host 'Installation du correctif Census Flow V6.1...' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backup"

Get-ChildItem $payload -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($payload.Length + 1)
    $target = Join-Path $projectRoot $relative
    $backupTarget = Join-Path $backup $relative

    if (Test-Path $target) {
        New-Item `
            -ItemType Directory `
            -Path (Split-Path $backupTarget) `
            -Force | Out-Null

        Copy-Item $target $backupTarget -Force
    }

    New-Item `
        -ItemType Directory `
        -Path (Split-Path $target) `
        -Force | Out-Null

    Copy-Item $_.FullName $target -Force
    Write-Host "  OK  $relative"
}

Write-Host ''
Write-Host 'Correctif V6.1 installé.' -ForegroundColor Green
Write-Host 'Aucune donnée PostgreSQL, variable .env ou file locale n’a été supprimée.'
Write-Host ''
Write-Host 'Vérification :'
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
