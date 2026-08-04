[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$ErrorActionPreference = 'Stop'
$root = Resolve-Path "$PSScriptRoot\.."
$mobile = Join-Path $root 'mobile'
$required = @(
  'app\campaigns.tsx', 'app\dwellings.tsx', 'app\persons.tsx',
  'app\users.tsx', 'app\territories.tsx', 'app\reports.tsx',
  'app\audit.tsx', 'app\statistics.tsx', 'app\(tabs)\more.tsx'
)
foreach ($relative in $required) {
  if (-not (Test-Path (Join-Path $mobile $relative))) { throw "Fichier manquant : $relative" }
}
if (Get-ChildItem "$mobile\src" -Recurse -File | Select-String -Pattern "from 'expo-sqlite'" -Quiet) {
  throw 'Un import expo-sqlite subsiste dans le code source mobile.'
}
Set-Location $mobile
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'Le contrôle TypeScript mobile a échoué.' }
Write-Host 'Parité mobile vérifiée : routes présentes, stockage Web compatible et TypeScript valide.' -ForegroundColor Green
