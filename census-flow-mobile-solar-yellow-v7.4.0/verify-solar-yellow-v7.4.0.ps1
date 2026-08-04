$ErrorActionPreference = 'Stop'
$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $patchRoot
$mobileRoot = Join-Path $projectRoot 'mobile'

Push-Location $mobileRoot
try {
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript a echoue.' }

    $checkOutput = Join-Path $mobileRoot '.solar-yellow-web-check'
    if (Test-Path -LiteralPath $checkOutput) {
        Remove-Item -LiteralPath $checkOutput -Recurse -Force
    }

    npx expo export --platform web --output-dir $checkOutput
    if ($LASTEXITCODE -ne 0) { throw 'L export Expo Web a echoue.' }

    Remove-Item -LiteralPath $checkOutput -Recurse -Force
}
finally {
    Pop-Location
}

Write-Host 'TypeScript et Expo Web sont valides.' -ForegroundColor Green
