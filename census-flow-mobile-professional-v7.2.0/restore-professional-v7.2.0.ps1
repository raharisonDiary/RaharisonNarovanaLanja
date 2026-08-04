$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backup = Get-ChildItem -LiteralPath $projectRoot -Directory -Filter 'backup-before-professional-v7.2.0-*' |
    Sort-Object Name -Descending |
    Select-Object -First 1

if ($null -eq $backup) {
    throw 'Aucune sauvegarde Professional V7.2.0 trouvee.'
}

$backupMobile = Join-Path $backup.FullName 'mobile'
if (-not (Test-Path -LiteralPath $backupMobile)) {
    throw "Sauvegarde mobile incomplete : $($backup.FullName)"
}

Get-ChildItem -LiteralPath $backupMobile -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($backup.FullName.Length + 1)
    $destination = Join-Path $projectRoot $relative
    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

$newThemeFile = Join-Path $projectRoot 'mobile\src\styles\censusTheme.ts'
if (Test-Path -LiteralPath $newThemeFile) {
    Remove-Item -LiteralPath $newThemeFile -Force
}

Write-Host "Interface restauree depuis : $($backup.FullName)" -ForegroundColor Green
