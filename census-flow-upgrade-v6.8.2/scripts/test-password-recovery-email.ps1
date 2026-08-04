param(
    [Parameter(Mandatory = $true)]
    [string]$To
)

[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$envPath = Join-Path $projectRoot '.env'

if (-not (Test-Path $envPath)) {
    throw "Le fichier .env est introuvable."
}

$config = @{}
Get-Content $envPath | ForEach-Object {
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
            $config[$key] = $value
        }
    }
}

$hostName = $config['PASSWORD_RECOVERY_EMAIL_HOST']
$port = [int]$config['PASSWORD_RECOVERY_EMAIL_PORT']
$username = $config['PASSWORD_RECOVERY_EMAIL_USERNAME']
$password = $config['PASSWORD_RECOVERY_EMAIL_PASSWORD']
$from = $config['PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS']
$fromName = $config['PASSWORD_RECOVERY_EMAIL_FROM_NAME']
$ssl = $config['PASSWORD_RECOVERY_EMAIL_ENABLE_SSL'] -eq 'true'

if ($hostName -match '(?i)(gmail|google)\.com') {
    $password = $password -replace '\s', ''
}

$required = @{
    Host = $hostName
    Username = $username
    Password = $password
    FromAddress = $from
}

foreach ($entry in $required.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($entry.Value)) {
        throw "Configuration manquante : $($entry.Key)."
    }
}

Write-Host "Test TCP vers $hostName`:$port..." -ForegroundColor Cyan
$tcpOk = Test-NetConnection `
    -ComputerName $hostName `
    -Port $port `
    -InformationLevel Quiet

if (-not $tcpOk) {
    throw "Le serveur SMTP $hostName`:$port est inaccessible depuis ce PC."
}

Add-Type -AssemblyName System.Net.Mail

$message = [System.Net.Mail.MailMessage]::new()
$client = [System.Net.Mail.SmtpClient]::new($hostName, $port)

try {
    $message.From = [System.Net.Mail.MailAddress]::new(
        $from,
        $(if ($fromName) { $fromName } else { 'Census Flow' })
    )
    $message.To.Add($To)
    $message.Subject = 'Test SMTP Census Flow'
    $message.Body = @"
Bonjour,

Ce message confirme que l'envoi SMTP de Census Flow fonctionne.

Vous pouvez maintenant tester le code OTP.
"@

    $client.EnableSsl = $ssl
    $client.UseDefaultCredentials = $false
    $client.Credentials = [System.Net.NetworkCredential]::new(
        $username,
        $password
    )
    $client.DeliveryMethod = [System.Net.Mail.SmtpDeliveryMethod]::Network
    $client.Timeout = 60000

    Write-Host "Envoi du message de test..." -ForegroundColor Cyan
    $client.Send($message)
    Write-Host "SMTP valide : message envoye a $To." -ForegroundColor Green
}
catch {
    Write-Host "Echec SMTP : $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "Detail : $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }
    throw
}
finally {
    $message.Dispose()
    $client.Dispose()
}
