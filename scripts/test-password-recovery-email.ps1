param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$To
)

[Console]::OutputEncoding =
    [System.Text.UTF8Encoding]::new($false)

$OutputEncoding = [Console]::OutputEncoding
$ErrorActionPreference = 'Stop'

$projectRoot = (
    Resolve-Path (Join-Path $PSScriptRoot '..')
).Path

$envPath = Join-Path $projectRoot '.env'

if (-not (Test-Path -LiteralPath $envPath)) {
    throw "Le fichier .env est introuvable : $envPath"
}

function Remove-SurroundingQuotes {
    param(
        [AllowNull()]
        [string]$Value
    )

    if ($null -eq $Value) {
        return $null
    }

    $cleanValue = $Value.Trim()

    if ($cleanValue.Length -lt 2) {
        return $cleanValue
    }

    $firstCharacter = $cleanValue[0]
    $lastCharacter =
        $cleanValue[$cleanValue.Length - 1]

    $isDoubleQuoted =
        $firstCharacter -eq [char]34 -and
        $lastCharacter -eq [char]34

    $isSingleQuoted =
        $firstCharacter -eq [char]39 -and
        $lastCharacter -eq [char]39

    if ($isDoubleQuoted -or $isSingleQuoted) {
        return $cleanValue.Substring(
            1,
            $cleanValue.Length - 2
        ).Trim()
    }

    return $cleanValue
}

function Get-RequiredConfigValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $value = Remove-SurroundingQuotes `
        -Value $Configuration[$Key]

    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "Configuration manquante : $Key."
    }

    return $value
}

function ConvertTo-BooleanValue {
    param(
        [AllowNull()]
        [string]$Value,

        [bool]$DefaultValue,

        [string]$ConfigurationName
    )

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $DefaultValue
    }

    $normalizedValue =
        $Value.Trim().ToLowerInvariant()

    if (
        $normalizedValue -eq 'true' -or
        $normalizedValue -eq '1' -or
        $normalizedValue -eq 'yes' -or
        $normalizedValue -eq 'oui'
    ) {
        return $true
    }

    if (
        $normalizedValue -eq 'false' -or
        $normalizedValue -eq '0' -or
        $normalizedValue -eq 'no' -or
        $normalizedValue -eq 'non'
    ) {
        return $false
    }

    throw (
        "Valeur incorrecte pour {0} : {1}" -f
        $ConfigurationName,
        $Value
    )
}

# Lecture du fichier .env
$config = @{}

foreach ($rawLine in Get-Content -LiteralPath $envPath) {
    $line = $rawLine.Trim()

    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    if ($line.StartsWith('#')) {
        continue
    }

    $parts = $line -split '=', 2

    if ($parts.Count -ne 2) {
        continue
    }

    $key = $parts[0].Trim()
    $key = $key.TrimStart([char]0xFEFF)

    $value = Remove-SurroundingQuotes `
        -Value $parts[1]

    if (-not [string]::IsNullOrWhiteSpace($key)) {
        $config[$key] = $value
    }
}

$emailEnabled = ConvertTo-BooleanValue `
    -Value $config['PASSWORD_RECOVERY_EMAIL_ENABLED'] `
    -DefaultValue $false `
    -ConfigurationName 'PASSWORD_RECOVERY_EMAIL_ENABLED'

if (-not $emailEnabled) {
    throw (
        "L'envoi SMTP est desactive. " +
        "Definissez PASSWORD_RECOVERY_EMAIL_ENABLED=true."
    )
}

$hostName = Get-RequiredConfigValue `
    -Configuration $config `
    -Key 'PASSWORD_RECOVERY_EMAIL_HOST'

$username = Get-RequiredConfigValue `
    -Configuration $config `
    -Key 'PASSWORD_RECOVERY_EMAIL_USERNAME'

$password = Get-RequiredConfigValue `
    -Configuration $config `
    -Key 'PASSWORD_RECOVERY_EMAIL_PASSWORD'

$fromAddress = Get-RequiredConfigValue `
    -Configuration $config `
    -Key 'PASSWORD_RECOVERY_EMAIL_FROM_ADDRESS'

$fromName = Remove-SurroundingQuotes `
    -Value $config['PASSWORD_RECOVERY_EMAIL_FROM_NAME']

if ([string]::IsNullOrWhiteSpace($fromName)) {
    $fromName = 'Census Flow'
}

# Port SMTP
$port = 587

$portValue = Remove-SurroundingQuotes `
    -Value $config['PASSWORD_RECOVERY_EMAIL_PORT']

if (-not [string]::IsNullOrWhiteSpace($portValue)) {
    $parsedPort = 0

    $portIsValid = [int]::TryParse(
        $portValue,
        [ref]$parsedPort
    )

    if (
        -not $portIsValid -or
        $parsedPort -lt 1 -or
        $parsedPort -gt 65535
    ) {
        throw (
            "PASSWORD_RECOVERY_EMAIL_PORT " +
            "doit contenir un port valide."
        )
    }

    $port = $parsedPort
}

# Activation de TLS
$enableSsl = ConvertTo-BooleanValue `
    -Value $config['PASSWORD_RECOVERY_EMAIL_ENABLE_SSL'] `
    -DefaultValue $true `
    -ConfigurationName 'PASSWORD_RECOVERY_EMAIL_ENABLE_SSL'

# Delai SMTP
$timeoutMilliseconds = 60000

$timeoutValue = Remove-SurroundingQuotes `
    -Value $config[
        'PASSWORD_RECOVERY_EMAIL_TIMEOUT_MILLISECONDS'
    ]

if (-not [string]::IsNullOrWhiteSpace($timeoutValue)) {
    $parsedTimeout = 0

    $timeoutIsValid = [int]::TryParse(
        $timeoutValue,
        [ref]$parsedTimeout
    )

    if (
        -not $timeoutIsValid -or
        $parsedTimeout -lt 1000
    ) {
        throw (
            "PASSWORD_RECOVERY_EMAIL_TIMEOUT_MILLISECONDS " +
            "doit etre superieur ou egal a 1000."
        )
    }

    $timeoutMilliseconds = $parsedTimeout
}

# Nettoyage compatible avec Windows PowerShell 5.1
$cleanUsername = $username.Trim()
$cleanUsername =
    $cleanUsername.Trim([char]34)
$cleanUsername =
    $cleanUsername.Trim([char]39)

$cleanPassword = $password.Trim()
$cleanPassword =
    $cleanPassword.Trim([char]34)
$cleanPassword =
    $cleanPassword.Trim([char]39)

$cleanFromAddress = $fromAddress.Trim()
$cleanFromAddress =
    $cleanFromAddress.Trim([char]34)
$cleanFromAddress =
    $cleanFromAddress.Trim([char]39)

$cleanRecipient = $To.Trim()
$cleanRecipient =
    $cleanRecipient.Trim([char]34)
$cleanRecipient =
    $cleanRecipient.Trim([char]39)

# Google affiche souvent les mots de passe
# d'application avec des espaces.
if ($hostName -match '(?i)(gmail|google)\.com$') {
    $cleanPassword =
        $cleanPassword -replace '\s+', ''
}

if ([string]::IsNullOrWhiteSpace($cleanPassword)) {
    throw "Le mot de passe SMTP est vide."
}

# Verification des adresses e-mail
try {
    $recipientMailAddress =
        [System.Net.Mail.MailAddress]::new(
            $cleanRecipient
        )
}
catch {
    throw (
        "Adresse destinataire invalide : {0}" -f
        $cleanRecipient
    )
}

try {
    $senderMailAddress =
        [System.Net.Mail.MailAddress]::new(
            $cleanFromAddress,
            $fromName,
            [System.Text.Encoding]::UTF8
        )
}
catch {
    throw (
        "Adresse expediteur invalide : {0}" -f
        $cleanFromAddress
    )
}

if (
    $hostName -match '(?i)(gmail|google)\.com$' -and
    $cleanFromAddress -ne $cleanUsername
) {
    Write-Warning (
        "Avec Gmail, FROM_ADDRESS devrait etre " +
        "identique a USERNAME."
    )
}

if (
    $hostName -match '(?i)(gmail|google)\.com$' -and
    $cleanPassword.Length -ne 16
) {
    Write-Warning (
        "Le mot de passe d'application Google " +
        "devrait normalement contenir 16 caracteres. " +
        "Longueur actuelle : $($cleanPassword.Length)."
    )
}

Write-Host (
    "Serveur SMTP : {0}:{1}" -f
    $hostName,
    $port
) -ForegroundColor Cyan

Write-Host (
    "Utilisateur : {0}" -f
    $cleanUsername
) -ForegroundColor DarkGray

Write-Host (
    "Expediteur : {0}" -f
    $cleanFromAddress
) -ForegroundColor DarkGray

Write-Host (
    "TLS/SSL : {0}" -f
    $enableSsl
) -ForegroundColor DarkGray

Write-Host (
    "Delai : {0} ms" -f
    $timeoutMilliseconds
) -ForegroundColor DarkGray

Write-Host (
    "Test TCP vers {0}:{1}..." -f
    $hostName,
    $port
) -ForegroundColor Cyan

$tcpOk = Test-NetConnection `
    -ComputerName $hostName `
    -Port $port `
    -InformationLevel Quiet

if (-not $tcpOk) {
    throw (
        "Le serveur SMTP {0}:{1} est inaccessible." -f
        $hostName,
        $port
    )
}

$message = $null
$client = $null

try {
    # Force TLS 1.2 pour Windows PowerShell 5.1.
    [System.Net.ServicePointManager]::SecurityProtocol =
        [System.Net.SecurityProtocolType]::Tls12

    $message =
        [System.Net.Mail.MailMessage]::new()

    $message.From = $senderMailAddress
    $message.To.Add($recipientMailAddress)

    $message.Subject =
        'Test SMTP Census Flow'

    $message.SubjectEncoding =
        [System.Text.Encoding]::UTF8

    $message.BodyEncoding =
        [System.Text.Encoding]::UTF8

    $message.IsBodyHtml = $false

    $message.Body = @"
Bonjour,

Ce message confirme que l'envoi SMTP de Census Flow fonctionne correctement.

Serveur utilise : $hostName
Port utilise : $port
Connexion securisee : $enableSsl

Vous pouvez maintenant tester l'envoi du code OTP depuis la page Mot de passe oublie.

Census Flow
"@

    $client =
        [System.Net.Mail.SmtpClient]::new(
            $hostName,
            $port
        )

    # L'ordre est important :
    # 1. desactiver les identifiants Windows ;
    # 2. fournir les identifiants Gmail ;
    # 3. activer TLS.
    $client.UseDefaultCredentials = $false

    $client.Credentials =
        [System.Net.NetworkCredential]::new(
            $cleanUsername,
            $cleanPassword
        )

    $client.EnableSsl = $enableSsl

    $client.DeliveryMethod =
        [System.Net.Mail.SmtpDeliveryMethod]::Network

    $client.Timeout =
        $timeoutMilliseconds

    Write-Host (
        "Envoi du message de test..."
    ) -ForegroundColor Cyan

    $client.Send($message)

    Write-Host (
        "SMTP valide : message envoye a {0}." -f
        $cleanRecipient
    ) -ForegroundColor Green
}
catch {
    $exception = $_.Exception
    $allMessages = @()

    while ($null -ne $exception) {
        if (
            -not [string]::IsNullOrWhiteSpace(
                $exception.Message
            )
        ) {
            $allMessages += $exception.Message
        }

        $exception = $exception.InnerException
    }

    Write-Host "Echec SMTP." -ForegroundColor Red

    foreach ($errorMessage in $allMessages) {
        Write-Host (
            "Detail : {0}" -f
            $errorMessage
        ) -ForegroundColor Red
    }

    $combinedMessage =
        $allMessages -join ' | '

    if (
        $combinedMessage -match
        '(?i)authentication|required|5\.7\.0|5\.7\.8|535'
    ) {
        Write-Host ""
        Write-Host (
            "Gmail a refuse l'authentification."
        ) -ForegroundColor Yellow

        Write-Host (
            "Utilisez un mot de passe d'application Google " +
            "de 16 caracteres, et non le mot de passe " +
            "habituel du compte Gmail."
        ) -ForegroundColor Yellow
    }

    throw
}
finally {
    if ($null -ne $message) {
        $message.Dispose()
    }

    if ($null -ne $client) {
        $client.Dispose()
    }
}