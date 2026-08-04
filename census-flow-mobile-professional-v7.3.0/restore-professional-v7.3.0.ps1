$ErrorActionPreference = 'Stop'

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $patchRoot
$mobileRoot = Join-Path $projectRoot 'mobile'
$lastBackupFile = Join-Path $patchRoot 'last-backup.txt'

if (Test-Path -LiteralPath $lastBackupFile) {
    $backupRoot = (Get-Content -LiteralPath $lastBackupFile -Raw).Trim()
}
else {
    $backupRoot = Get-ChildItem -LiteralPath $projectRoot -Directory |
        Where-Object { $_.Name -like 'backup-before-professional-v7.3.0-*' } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1 -ExpandProperty FullName
}

if ([string]::IsNullOrWhiteSpace($backupRoot) -or -not (Test-Path -LiteralPath $backupRoot)) {
    throw 'Aucune sauvegarde V7.3.0 disponible.'
}

Get-ChildItem -LiteralPath $backupRoot -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($backupRoot.Length).TrimStart('\')
    $target = Join-Path $mobileRoot $relativePath
    $targetDirectory = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
}

Write-Host "Interface restauree depuis : $backupRoot" -ForegroundColor Green
