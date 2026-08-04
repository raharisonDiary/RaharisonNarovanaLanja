$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "=== $Name ===" -ForegroundColor Cyan
    & $Action

    if ($LASTEXITCODE -ne 0) {
        throw "Échec de l'étape : $Name"
    }
}

Invoke-Step "Compilation du backend" {
    Push-Location (Join-Path $root "back")
    try {
        dotnet restore .\Census.sln
        dotnet build .\Census.sln --no-restore
    }
    finally {
        Pop-Location
    }
}

Invoke-Step "Compilation du frontend web" {
    Push-Location (Join-Path $root "web")
    try {
        npm ci
        npm run build
    }
    finally {
        Pop-Location
    }
}

Invoke-Step "Vérification TypeScript du mobile" {
    Push-Location (Join-Path $root "mobile")
    try {
        npm ci --legacy-peer-deps
        npm run typecheck
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "Toutes les vérifications locales ont réussi." -ForegroundColor Green
