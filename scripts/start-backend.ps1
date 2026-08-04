[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path "$PSScriptRoot\.."
Set-Location $projectRoot

function Assert-NativeSuccess([string]$message) {
    if ($LASTEXITCODE -ne 0) { throw $message }
}

function Import-DotEnv([string]$path) {
    if (-not (Test-Path $path)) {
        throw "Le fichier .env est introuvable. Copiez .env.example vers .env puis complétez les valeurs."
    }

    $values = @{}
    Get-Content $path | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()

                if (
                    $value.Length -ge 2 -and
                    (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                     ($value.StartsWith("'") -and $value.EndsWith("'")))
                ) {
                    $value = $value.Substring(1, $value.Length - 2)
                }

                $values[$key] = $value
            }
        }
    }
    return $values
}

$config = Import-DotEnv (Join-Path $projectRoot '.env')
$required = @('POSTGRES_DB','POSTGRES_USER','POSTGRES_PASSWORD','POSTGRES_PORT','JWT_SIGNING_KEY_BASE64','BOOTSTRAP_ADMIN_EMAIL','BOOTSTRAP_ADMIN_PASSWORD')
foreach ($key in $required) {
    if ([string]::IsNullOrWhiteSpace($config[$key]) -or $config[$key] -like 'replace_with*' -or $config[$key] -like 'VOTRE_*') {
        throw "La valeur $key est absente ou encore fictive dans .env."
    }
}

try {
    $decodedKey = [Convert]::FromBase64String($config['JWT_SIGNING_KEY_BASE64'])
    if ($decodedKey.Length -lt 64) { throw "La clé doit contenir au moins 64 octets." }
} catch {
    throw "JWT_SIGNING_KEY_BASE64 n'est pas une clé Base64 valide d'au moins 64 octets."
}

$env:ConnectionStrings__CensusDatabase = "Host=localhost;Port=$($config['POSTGRES_PORT']);Database=$($config['POSTGRES_DB']);Username=$($config['POSTGRES_USER']);Password=$($config['POSTGRES_PASSWORD'])"
$env:Jwt__SigningKeyBase64 = $config['JWT_SIGNING_KEY_BASE64']
$env:BootstrapAdmin__Email = $config['BOOTSTRAP_ADMIN_EMAIL']
$env:BootstrapAdmin__Password = $config['BOOTSTRAP_ADMIN_PASSWORD']
$env:ASPNETCORE_ENVIRONMENT = 'Development'

$optionalEnvironmentVariables = @{
    'WHATSAPP_ENABLED' = 'WhatsApp__Enabled'
    'WHATSAPP_GRAPH_API_VERSION' = 'WhatsApp__GraphApiVersion'
    'WHATSAPP_PHONE_NUMBER_ID' = 'WhatsApp__PhoneNumberId'
    'WHATSAPP_ACCESS_TOKEN' = 'WhatsApp__AccessToken'
    'WHATSAPP_TEMPLATE_NAME' = 'WhatsApp__TemplateName'
    'WHATSAPP_TEMPLATE_LANGUAGE' = 'WhatsApp__TemplateLanguage'
    'WHATSAPP_OTP_TEMPLATE_NAME' = 'WhatsApp__OtpTemplateName'
    'WHATSAPP_OTP_TEMPLATE_LANGUAGE' = 'WhatsApp__OtpTemplateLanguage'
    'PASSWORD_RECOVERY_EMAIL_ENABLED' = 'PasswordRecoveryEmail__Enabled'
    'PASSWORD_RECOVERY_EMAIL_HOST' = 'PasswordRecoveryEmail__Host'
    'PASSWORD_RECOVERY_EMAIL_PORT' = 'PasswordRecoveryEmail__Port'
    'PASSWORD_RECOVERY_EMAIL_ENABLE_SSL' = 'PasswordRecoveryEmail__EnableSsl'
    'PASSWORD_RECOVERY_EMAIL_USERNAME' = 'PasswordRecoveryEmail__Username'
    'PASSWORD_RECOVERY_EMAIL_PASSWORD' = 'PasswordRecoveryEmail__Password'
    'PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS' = 'PasswordRecoveryEmail__FromAddress'
    'PASSWORD_RECOVERY_EMAIL_FROM_NAME' = 'PasswordRecoveryEmail__FromName'
    'PASSWORD_RECOVERY_EMAIL_TIMEOUT_MILLISECONDS' = 'PasswordRecoveryEmail__TimeoutMilliseconds'
}
foreach ($entry in $optionalEnvironmentVariables.GetEnumerator()) {
    if ($config.ContainsKey($entry.Key)) {
        $value = $config[$entry.Key]

        if (
            $entry.Key -eq 'PASSWORD_RECOVERY_EMAIL_PASSWORD' -and
            $config['PASSWORD_RECOVERY_EMAIL_HOST'] -match '(?i)(gmail|google)\.com'
        ) {
            $value = $value -replace '\s', ''
        }

        [Environment]::SetEnvironmentVariable(
            $entry.Value,
            $value,
            'Process')
    }
}

if ($config['PASSWORD_RECOVERY_EMAIL_ENABLED'] -eq 'true') {
    $smtpRequired = @(
        'PASSWORD_RECOVERY_EMAIL_HOST',
        'PASSWORD_RECOVERY_EMAIL_PORT',
        'PASSWORD_RECOVERY_EMAIL_USERNAME',
        'PASSWORD_RECOVERY_EMAIL_PASSWORD',
        'PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS'
    )

    foreach ($key in $smtpRequired) {
        if ([string]::IsNullOrWhiteSpace($config[$key])) {
            throw "SMTP active mais $key est vide dans .env."
        }
    }

    if (
        $config['PASSWORD_RECOVERY_EMAIL_HOST'] -match '(?i)(gmail|google)\.com' -and
        $config['PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS'] -ne
            $config['PASSWORD_RECOVERY_EMAIL_USERNAME']
    ) {
        Write-Warning (
            "Avec Gmail, FROM_ADDRESS doit etre le compte SMTP ou un alias " +
            "autorise. Utilisez la meme adresse pour le premier test."
        )
    }

    Write-Host (
        "SMTP OTP : " +
        $config['PASSWORD_RECOVERY_EMAIL_HOST'] + ":" +
        $config['PASSWORD_RECOVERY_EMAIL_PORT'] +
        " | utilisateur=" +
        $config['PASSWORD_RECOVERY_EMAIL_USERNAME'] +
        " | expediteur=" +
        $config['PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS']
    ) -ForegroundColor Green
}

Write-Host "Démarrage de PostgreSQL…" -ForegroundColor Cyan
docker compose up -d database
Assert-NativeSuccess "Docker n'a pas pu démarrer PostgreSQL. Vérifiez Docker Desktop."

$healthy = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
    $status = docker inspect --format='{{.State.Health.Status}}' census-database 2>$null
    if ($status -eq 'healthy') { $healthy = $true; break }
    Start-Sleep -Seconds 2
}
if (-not $healthy) {
    docker compose ps
    throw "PostgreSQL n'est pas devenu sain dans le délai prévu."
}

Set-Location (Join-Path $projectRoot 'back')
dotnet tool restore
Assert-NativeSuccess "La restauration des outils .NET a échoué."

dotnet ef database update `
  --project .\src\Census.Infrastructure\Census.Infrastructure.csproj `
  --startup-project .\src\Census.Api\Census.Api.csproj `
  --context CensusDbContext
Assert-NativeSuccess "L'application des migrations a échoué."

$lanIp = Get-NetIPConfiguration -ErrorAction SilentlyContinue |
    Where-Object {
        $_.NetAdapter.Status -eq 'Up' -and
        $_.IPv4DefaultGateway -ne $null -and
        $_.IPv4Address -ne $null
    } |
    ForEach-Object { $_.IPv4Address.IPAddress } |
    Where-Object {
        $_ -and
        $_ -notlike '127.*' -and
        $_ -notlike '169.254.*'
    } |
    Select-Object -First 1

Write-Host "API Web locale : https://localhost:7001" -ForegroundColor Green
Write-Host "API HTTP locale : http://localhost:5001" -ForegroundColor Green
if ($lanIp) {
    Write-Host "API telephone : http://$lanIp`:5001" -ForegroundColor Green
}

dotnet run --project .\src\Census.Api\Census.Api.csproj --launch-profile https
