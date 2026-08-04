[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$payloadRoot = Join-Path $PSScriptRoot 'payload'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v5.2-$stamp"

$files = @(
  'mobile\app\(tabs)\map.tsx',
  'mobile\app\(tabs)\households.tsx',
  'mobile\src\screens\MapScreen.tsx',
  'mobile\src\screens\MapScreen.web.tsx',
  'mobile\src\screens\MapScreen.native.tsx',
  'mobile\src\storage\sessionStore.ts',
  'mobile\src\preferences\PreferencesContext.tsx',
  'mobile\src\styles\theme.ts'
)

Write-Host 'Installation du correctif Census Flow V5.2…' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relative in $files) {
  $source = Join-Path $payloadRoot $relative
  $target = Join-Path $projectRoot $relative
  $backup = Join-Path $backupRoot $relative

  if (-not (Test-Path $source)) {
    throw "Fichier du correctif introuvable : $relative"
  }

  if (Test-Path $target) {
    New-Item -ItemType Directory -Path (Split-Path $backup) -Force | Out-Null
    Copy-Item $target $backup -Force
  }

  New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
  Copy-Item $source $target -Force
  Write-Host "  OK  $relative" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Correctif V5.2 installé.' -ForegroundColor Green
Write-Host 'Il corrige SecureStore sur le Web, la résolution de la carte et le typage des ménages.'
Write-Host ''
Write-Host 'Vérification :'
Write-Host '  cd mobile'
Write-Host '  npm run typecheck'
Write-Host '  npx expo start -c'
