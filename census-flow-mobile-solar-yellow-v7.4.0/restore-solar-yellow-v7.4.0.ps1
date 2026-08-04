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
        Where-Object { $_.Name -like 'backup-before-solar-yellow-v7.4.0-*' } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1 -ExpandProperty FullName
}

if ([string]::IsNullOrWhiteSpace($backupRoot) -or -not (Test-Path -LiteralPath $backupRoot)) {
    throw 'Aucune sauvegarde Solar Yellow Motion V7.4.0 n a ete trouvee.'
}

$files = @(Get-ChildItem -LiteralPath $backupRoot -Recurse -File)
foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($backupRoot.Length).TrimStart('\', '/')
    $target = Join-Path $mobileRoot $relativePath
    $targetDirectory = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $target -Force
    Write-Host "  RESTORE  $relativePath" -ForegroundColor DarkYellow
}

Write-Host ''
Write-Host 'Interface precedente restauree.' -ForegroundColor Green
