param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$marker = Join-Path $ProjectRoot '.aurora-v7-last-backup.txt'

if (-not (Test-Path -LiteralPath $marker)) {
    throw 'Aucune sauvegarde Aurora V7.0 enregistrée dans ce projet.'
}

$backupRoot = (Get-Content -LiteralPath $marker -Raw).Trim()
if (-not (Test-Path -LiteralPath $backupRoot)) {
    throw "Sauvegarde introuvable : $backupRoot"
}

$files = Get-ChildItem -LiteralPath $backupRoot -File -Recurse
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($backupRoot.Length).TrimStart('\', '/')
    $destination = Join-Path $ProjectRoot $relativePath
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
    Write-Host "  RESTAURÉ  $relativePath"
}

Write-Host 'Ancien design restauré.' -ForegroundColor Green
