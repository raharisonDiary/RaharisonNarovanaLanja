param(
    [string]$ProjectRoot = (Get-Location).Path,
    [string]$BackupPath = ''
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($BackupPath)) {
    $latestBackup = Get-ChildItem -LiteralPath $ProjectRoot -Directory -Filter 'backup-before-nebula-civic-v8.0.0-*' |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($null -eq $latestBackup) {
        throw 'Aucune sauvegarde Nebula Civic V8.0.0 n a ete trouvee.'
    }

    $BackupPath = $latestBackup.FullName
}

$manifestPath = Join-Path $BackupPath 'restore-manifest.txt'
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Manifest introuvable : $manifestPath"
}

Write-Host "Restauration depuis : $BackupPath" -ForegroundColor Cyan
$manifest = Get-Content -LiteralPath $manifestPath

foreach ($line in $manifest) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line -split '\|', 2
    if ($parts.Count -ne 2) { continue }

    $state = $parts[0]
    $relativePath = $parts[1]
    $targetPath = Join-Path $ProjectRoot $relativePath
    $backupFile = Join-Path $BackupPath $relativePath

    if ($state -eq 'existing') {
        $targetDirectory = Split-Path -Parent $targetPath
        if (-not (Test-Path -LiteralPath $targetDirectory)) {
            New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        }
        Copy-Item -LiteralPath $backupFile -Destination $targetPath -Force
        Write-Host "  RESTORE  $relativePath"
    }
    elseif ($state -eq 'new' -and (Test-Path -LiteralPath $targetPath)) {
        Remove-Item -LiteralPath $targetPath -Force
        Write-Host "  REMOVE   $relativePath"
    }
}

Write-Host ''
Write-Host 'Restauration terminee.' -ForegroundColor Green
