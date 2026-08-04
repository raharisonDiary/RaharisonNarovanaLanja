[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$upgradeRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $upgradeRoot

$requiredProjectPaths = @(
    'back',
    'web',
    'mobile',
    'scripts'
)

foreach ($path in $requiredProjectPaths) {
    if (-not (Test-Path (Join-Path $projectRoot $path))) {
        throw "Projet Census Flow introuvable. Placez le dossier census-flow-upgrade-v6.8.2 a la racine du projet."
    }
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $projectRoot "backup-before-v6.8.2-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$files = @(
    'V6.8.2-CHANGELOG.md',
    'back\src\Census.Infrastructure\Authentication\PasswordRecovery\PasswordRecoveryEmailOptions.cs',
    'back\src\Census.Infrastructure\Authentication\PasswordRecovery\SmtpClientFactory.cs',
    'back\src\Census.Infrastructure\Authentication\PasswordRecovery\PasswordRecoveryNotifier.cs',
    'back\src\Census.Api\Common\Notifications\CredentialEmailNotifier.cs',
    'back\src\Census.Api\appsettings.json',
    'scripts\start-backend.ps1',
    'scripts\test-password-recovery-email.ps1',
    '.env.example'
)

Write-Host 'Installation de Census Flow V6.8.2 - fiabilisation SMTP et OTP...' -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot" -ForegroundColor DarkGray

foreach ($relativePath in $files) {
    $source = Join-Path $upgradeRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier manquant dans le correctif : $relativePath"
    }

    if (Test-Path $destination) {
        $backupDestination = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Path (Split-Path -Parent $backupDestination) -Force | Out-Null
        Copy-Item $destination $backupDestination -Force
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Census Flow V6.8.2 installe.' -ForegroundColor Green
Write-Host 'Le fichier .env existant n a pas ete remplace.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Etapes obligatoires :' -ForegroundColor Cyan
Write-Host '  1. Verifier les valeurs SMTP dans .env'
Write-Host '  2. .\scripts\test-password-recovery-email.ps1 -To votre@email.com'
Write-Host '  3. cd back ; dotnet build'
Write-Host '  4. .\scripts\start-backend.ps1'
