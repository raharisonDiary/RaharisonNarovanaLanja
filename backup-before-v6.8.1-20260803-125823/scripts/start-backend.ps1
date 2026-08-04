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
            if ($parts.Count -eq 2) { $values[$parts[0].Trim()] = $parts[1].Trim() }
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
}
foreach ($entry in $optionalEnvironmentVariables.GetEnumerator()) {
    if ($config.ContainsKey($entry.Key)) {
        [Environment]::SetEnvironmentVariable(
            $entry.Value,
            $config[$entry.Key],
            'Process')
    }
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

Write-Host "API prête à démarrer sur https://localhost:7001" -ForegroundColor Green
dotnet run --project .\src\Census.Api\Census.Api.csproj --launch-profile https
