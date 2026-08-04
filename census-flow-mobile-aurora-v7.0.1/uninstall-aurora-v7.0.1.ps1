param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$marker = Join-Path $ProjectRoot '.aurora-v7.0.1-last-backup.txt'

if (-not (Test-Path -LiteralPath $marker)) {
    throw 'Aucune sauvegarde Aurora Civic V7.0.1 trouvee.'
}

$backupRoot = (Get-Content -LiteralPath $marker -Raw).Trim()
if (-not (Test-Path -LiteralPath $backupRoot)) {
    throw "Sauvegarde introuvable : $backupRoot"
}

$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifest = Get-Content -LiteralPath (Join-Path $patchRoot 'AURORA-V7-MANIFEST.txt') | Where-Object {
    -not [string]::IsNullOrWhiteSpace($_) -and -not $_.StartsWith('#')
}

foreach ($relativePath in $manifest) {
    $backup = Join-Path $backupRoot $relativePath
    $destination = Join-Path $ProjectRoot $relativePath

    if (Test-Path -LiteralPath $backup) {
        $destinationDirectory = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        Copy-Item -LiteralPath $backup -Destination $destination -Force
        Write-Host "  RESTORE  $relativePath"
    }
}

Write-Host 'Aurora Civic V7.0.1 a ete restaure depuis la sauvegarde.' -ForegroundColor Green
