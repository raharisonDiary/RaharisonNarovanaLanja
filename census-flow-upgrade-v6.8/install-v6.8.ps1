[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$backupRoot = Join-Path $projectRoot ("backup-before-v6.8-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

$files = @(
    ".env.example",
    "V6.8-CHANGELOG.md",
    "scripts\start-backend.ps1",
    "back\src\Census.Api\Program.cs",
    "back\src\Census.Api\appsettings.json",
    "back\src\Census.Api\Common\Notifications\CredentialEmailNotifier.cs",
    "back\src\Census.Api\Common\Notifications\WhatsAppCredentialNotifier.cs",
    "back\src\Census.Api\Controllers\ManagedUsersController.cs",
    "back\src\Census.Api\Controllers\PasswordRecoveryController.cs",
    "back\src\Census.Api\Contracts\Users\ProvisionApplicationUserRequest.cs",
    "back\src\Census.Api\Contracts\Users\ProvisionedApplicationUserResponse.cs",
    "back\src\Census.Api\Contracts\PasswordRecovery\RequestPasswordRecoveryRequest.cs",
    "back\src\Census.Api\Contracts\PasswordRecovery\PasswordRecoveryRequestResponse.cs",
    "back\src\Census.Application\Authentication\PasswordRecovery\Models\PasswordRecoveryChannel.cs",
    "back\src\Census.Application\Authentication\PasswordRecovery\Models\PasswordRecoveryRequestResult.cs",
    "back\src\Census.Application\Authentication\PasswordRecovery\Notifications\IPasswordRecoveryNotifier.cs",
    "back\src\Census.Application\Authentication\PasswordRecovery\Services\IPasswordRecoveryService.cs",
    "back\src\Census.Infrastructure\Authentication\PasswordRecovery\PasswordRecoveryNotifier.cs",
    "back\src\Census.Infrastructure\Authentication\PasswordRecovery\PasswordRecoveryOptions.cs",
    "back\src\Census.Infrastructure\Authentication\PasswordRecovery\PasswordRecoveryService.cs",
    "back\src\Census.Infrastructure\SessionSecurityExtensions.cs",
    "web\src\api\resources.ts",
    "web\src\pages\ForgotPasswordPage.tsx",
    "web\src\pages\UsersPage.tsx",
    "web\src\styles\pages.css",
    "web\src\types\api.ts",
    "mobile\app\forgot-password.tsx",
    "mobile\app\users.tsx",
    "mobile\src\api\resources.ts",
    "mobile\src\types\api.ts"
)

Write-Host "Installation de Census Flow V6.8..." -ForegroundColor Cyan
Write-Host "Sauvegarde : $backupRoot"

foreach ($relativePath in $files) {
    $source = Join-Path $PSScriptRoot $relativePath
    $destination = Join-Path $projectRoot $relativePath

    if (-not (Test-Path $source)) {
        throw "Fichier du correctif introuvable : $relativePath"
    }

    if (Test-Path $destination) {
        $backupDestination = Join-Path $backupRoot $relativePath
        $backupDirectory = Split-Path $backupDestination -Parent
        New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
        Copy-Item $destination $backupDestination -Force
    }

    $destinationDirectory = Split-Path $destination -Parent
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item $source $destination -Force
    Write-Host "  OK  $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Census Flow V6.8 installe." -ForegroundColor Green
Write-Host "Aucune migration PostgreSQL n'est requise."
Write-Host "Le fichier .env existant n'a pas ete modifie."
Write-Host "Consultez V6.8-CHANGELOG.md pour configurer SMTP et WhatsApp."
Write-Host ""
Write-Host "Verification :"
Write-Host "  cd back"
Write-Host "  dotnet build"
Write-Host "  cd ..\web"
Write-Host "  npm run build"
Write-Host "  cd ..\mobile"
Write-Host "  npm run typecheck"
