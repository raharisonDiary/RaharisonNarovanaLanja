[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$mobileRoot = Resolve-Path "$PSScriptRoot\..\mobile"
Set-Location $mobileRoot

function Assert-NativeSuccess([string]$message) {
    if ($LASTEXITCODE -ne 0) { throw $message }
}

function Get-LanIPv4 {
    $candidate = Get-NetIPConfiguration -ErrorAction SilentlyContinue |
        Where-Object {
            $_.NetAdapter.Status -eq "Up" -and
            $_.IPv4DefaultGateway -ne $null -and
            $_.IPv4Address -ne $null
        } |
        ForEach-Object { $_.IPv4Address.IPAddress } |
        Where-Object {
            $_ -and
            $_ -notlike "127.*" -and
            $_ -notlike "169.254.*"
        } |
        Select-Object -First 1

    if (-not $candidate) {
        $candidate = Get-NetIPAddress `
            -AddressFamily IPv4 `
            -ErrorAction SilentlyContinue |
            Where-Object {
                $_.IPAddress -notlike "127.*" -and
                $_.IPAddress -notlike "169.254.*" -and
                $_.InterfaceAlias -notmatch "Loopback|vEthernet|Docker|WSL"
            } |
            Select-Object -ExpandProperty IPAddress -First 1
    }

    return $candidate
}

function Set-DotEnvValue(
    [string]$path,
    [string]$name,
    [string]$value
) {
    $content = ""
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
    }

    $escapedName = [Regex]::Escape($name)
    $pattern = "(?m)^$escapedName=.*$"
    $line = "$name=$value"

    if ($content -match $pattern) {
        $content = [Regex]::Replace(
            $content,
            $pattern,
            $line)
    }
    else {
        if ($content -and -not $content.EndsWith("`n")) {
            $content += "`r`n"
        }
        $content += "$line`r`n"
    }

    [System.IO.File]::WriteAllText(
        (Join-Path $mobileRoot $path),
        $content,
        [System.Text.UTF8Encoding]::new($false))
}

$expoCommand = Join-Path $mobileRoot "node_modules\.bin\expo.cmd"
if (-not (Test-Path $expoCommand)) {
    Write-Host "Installation des dependances mobiles..." -ForegroundColor Cyan
    npm install `
        --legacy-peer-deps `
        --registry=https://registry.npmjs.org/
    Assert-NativeSuccess "npm install a echoue pour l'application mobile."
}

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}

$lanIp = Get-LanIPv4
if (-not $lanIp) {
    throw "Impossible de detecter l'adresse IPv4 locale du PC."
}

$webApiUrl = "http://localhost:5001/api/v1"
$nativeApiUrl = "http://$lanIp`:5001/api/v1"

Set-DotEnvValue ".env" "EXPO_PUBLIC_API_URL_WEB" $webApiUrl
Set-DotEnvValue ".env" "EXPO_PUBLIC_API_URL_NATIVE" $nativeApiUrl
Set-DotEnvValue ".env" "EXPO_PUBLIC_API_URL" $nativeApiUrl

Write-Host "API Expo Web : $webApiUrl" -ForegroundColor DarkCyan
Write-Host "API telephone : $nativeApiUrl" -ForegroundColor DarkCyan
Write-Host "Demarrage d'Expo..." -ForegroundColor Green

npx expo start -c
Assert-NativeSuccess "Le demarrage d'Expo a echoue."
