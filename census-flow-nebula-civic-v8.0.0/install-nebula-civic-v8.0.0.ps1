param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$patchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $patchRoot 'payload'
$version = 'v8.0.0'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $ProjectRoot ("backup-before-nebula-civic-$version-$timestamp")
$manifestPath = Join-Path $backupRoot 'restore-manifest.txt'

function Get-NpmCommand {
    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($null -eq $npmCommand) {
        $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
    }
    if ($null -eq $npmCommand) {
        throw 'npm est introuvable dans le PATH.'
    }
    return $npmCommand.Source
}

function Restore-Installation {
    param(
        [string]$Root,
        [string]$Backup,
        [string[]]$Manifest
    )

    Write-Host ''
    Write-Host 'Echec de verification. Restauration automatique...' -ForegroundColor Yellow

    foreach ($line in $Manifest) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $parts = $line -split '\|', 2
        if ($parts.Count -ne 2) { continue }

        $state = $parts[0]
        $relativePath = $parts[1]
        $targetPath = Join-Path $Root $relativePath
        $backupPath = Join-Path $Backup $relativePath

        if ($state -eq 'existing') {
            $targetDirectory = Split-Path -Parent $targetPath
            if (-not (Test-Path -LiteralPath $targetDirectory)) {
                New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
            }
            Copy-Item -LiteralPath $backupPath -Destination $targetPath -Force
        }
        elseif ($state -eq 'new' -and (Test-Path -LiteralPath $targetPath)) {
            Remove-Item -LiteralPath $targetPath -Force
        }
    }
}

Write-Host 'Installation Census Flow Nebula Civic V8.0.0...' -ForegroundColor Cyan
Write-Host "Projet : $ProjectRoot"

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'web\package.json'))) {
    throw "Le dossier web est introuvable dans $ProjectRoot."
}
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'mobile\package.json'))) {
    throw "Le dossier mobile est introuvable dans $ProjectRoot."
}
if (-not (Test-Path -LiteralPath $payloadRoot)) {
    throw 'Le dossier payload du correctif est introuvable.'
}

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
$manifest = New-Object System.Collections.Generic.List[string]

try {
    $files = Get-ChildItem -LiteralPath $payloadRoot -Recurse -File

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($payloadRoot.Length).TrimStart('\', '/')
        $targetPath = Join-Path $ProjectRoot $relativePath
        $targetDirectory = Split-Path -Parent $targetPath

        if (-not (Test-Path -LiteralPath $targetDirectory)) {
            New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        }

        if (Test-Path -LiteralPath $targetPath) {
            $backupPath = Join-Path $backupRoot $relativePath
            $backupDirectory = Split-Path -Parent $backupPath
            if (-not (Test-Path -LiteralPath $backupDirectory)) {
                New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
            }
            Copy-Item -LiteralPath $targetPath -Destination $backupPath -Force
            $manifest.Add("existing|$relativePath")
        }
        else {
            $manifest.Add("new|$relativePath")
        }

        Copy-Item -LiteralPath $file.FullName -Destination $targetPath -Force
        Write-Host "  OK  $relativePath"
    }

    [System.IO.File]::WriteAllLines(
        $manifestPath,
        [string[]]$manifest,
        [System.Text.UTF8Encoding]::new($false)
    )

    $npm = Get-NpmCommand

    Write-Host ''
    Write-Host 'Verification TypeScript mobile...' -ForegroundColor Cyan
    Push-Location (Join-Path $ProjectRoot 'mobile')
    try {
        & $npm run typecheck
        if ($LASTEXITCODE -ne 0) {
            throw 'La verification TypeScript mobile a echoue.'
        }
    }
    finally {
        Pop-Location
    }

    Write-Host ''
    Write-Host 'Verification build web...' -ForegroundColor Cyan
    Push-Location (Join-Path $ProjectRoot 'web')
    try {
        & $npm run build
        if ($LASTEXITCODE -ne 0) {
            throw 'Le build web a echoue.'
        }
    }
    finally {
        Pop-Location
    }

    Write-Host ''
    Write-Host 'Nebula Civic V8.0.0 est installe.' -ForegroundColor Green
    Write-Host 'Web et mobile utilisent maintenant la meme palette ultraviolet, corail et menthe.' -ForegroundColor Green
    Write-Host 'La navigation, les formulaires, les API et les variables .env ne sont pas modifies.' -ForegroundColor Green
    Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray
    Write-Host ''
    Write-Host 'Demarrage web :' -ForegroundColor Cyan
    Write-Host "  Set-Location $ProjectRoot"
    Write-Host '  .\scripts\start-web.ps1'
    Write-Host ''
    Write-Host 'Demarrage mobile / Expo Web :' -ForegroundColor Cyan
    Write-Host "  Set-Location $ProjectRoot\mobile"
    Write-Host '  npx expo start -c'
}
catch {
    Restore-Installation -Root $ProjectRoot -Backup $backupRoot -Manifest ([string[]]$manifest)
    throw
}
