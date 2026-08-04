param(
    [Parameter(Mandatory = $false)]
    [string]$ApiBaseUrl = "https://localhost:7001"
)

$ErrorActionPreference = "Stop"

function Invoke-Json {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [hashtable]$Headers,

        [hashtable]$Body
    )

    $arguments = @{
        Method      = $Method
        Uri         = $Uri
        ErrorAction = "Stop"
    }

    if ($Headers) {
        $arguments.Headers = $Headers
    }

    if ($Body) {
        $json =
            $Body |
            ConvertTo-Json `
                -Compress `
                -Depth 8

        [byte[]]$bodyBytes =
            [System.Text.Encoding]::UTF8.GetBytes(
                $json
            )

        $arguments.ContentType =
            "application/json; charset=utf-8"

        $arguments.Body = $bodyBytes
    }

    try {
        return Invoke-RestMethod @arguments
    }
    catch {
        Write-Host ""
        Write-Host "ÉCHEC DE LA REQUÊTE"
        Write-Host "Méthode : $Method"
        Write-Host "Adresse : $Uri"

        if ($_.Exception.Response) {
            try {
                $statusCode =
                    [int]$_.Exception.Response.StatusCode

                Write-Host "Code HTTP : $statusCode"
            }
            catch {
                Write-Host "Code HTTP indisponible."
            }
        }

        if ($_.ErrorDetails.Message) {
            Write-Host ""
            Write-Host "Réponse détaillée de l’API :"
            Write-Host $_.ErrorDetails.Message
        }

        Write-Host ""
        throw
    }
}

Write-Host ""
Write-Host "======================================"
Write-Host " TEST COMPLET DU BACKEND CENSUS"
Write-Host "======================================"
Write-Host ""

Write-Host "1. Connexion administrateur..."

$securePassword = Read-Host `
    "Mot de passe administrateur" `
    -AsSecureString

$passwordPointer =
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
        $securePassword
    )

try {
    $plainPassword =
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
            $passwordPointer
        )

    $login = Invoke-Json `
        -Method "Post" `
        -Uri "$ApiBaseUrl/api/v1/auth/login" `
        -Body @{
            email    = "admin@gmail.com"
            password = $plainPassword
        }
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(
        $passwordPointer
    )

    Remove-Variable plainPassword `
        -ErrorAction SilentlyContinue
}

if (-not $login.accessToken) {
    throw "La connexion n’a retourné aucun jeton d’accès."
}

$headers = @{
    Authorization = "Bearer $($login.accessToken)"
}

$currentUser = Invoke-Json `
    -Method "Get" `
    -Uri "$ApiBaseUrl/api/v1/auth/me" `
    -Headers $headers

Write-Host "Connexion réussie : $($currentUser.email)"
Write-Host "Rôle : $($currentUser.role)"
Write-Host ""

$suffix =
    Get-Random `
        -Minimum 10000 `
        -Maximum 99999

$regionId =
    "c38f30bd-b3b5-474d-8e37-130aef72c388"

function New-AdministrativeArea {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Code,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Type,

        [Parameter(Mandatory = $true)]
        [Guid]$ParentId
    )

    return Invoke-Json `
        -Method "Post" `
        -Uri "$ApiBaseUrl/api/v1/administrative-areas" `
        -Headers $headers `
        -Body @{
            code     = $Code
            name     = $Name
            type     = $Type
            parentId = $ParentId
        }
}

Write-Host "2. Création de la hiérarchie territoriale..."

$district = New-AdministrativeArea `
    -Code "DIST-$suffix" `
    -Name "District test $suffix" `
    -Type "District" `
    -ParentId $regionId

Write-Host "District créé : $($district.code)"

$commune = New-AdministrativeArea `
    -Code "COM-$suffix" `
    -Name "Commune test $suffix" `
    -Type "Commune" `
    -ParentId $district.id

Write-Host "Commune créée : $($commune.code)"

$fokontany = New-AdministrativeArea `
    -Code "FKT-$suffix" `
    -Name "Fokontany test $suffix" `
    -Type "Fokontany" `
    -ParentId $commune.id

Write-Host "Fokontany créé : $($fokontany.code)"

$enumerationArea = New-AdministrativeArea `
    -Code "ZD-$suffix" `
    -Name "Zone de dénombrement $suffix" `
    -Type "EnumerationArea" `
    -ParentId $fokontany.id

Write-Host `
    "Zone de dénombrement créée : $($enumerationArea.code)"

Write-Host ""

Write-Host "3. Création de la campagne..."

$campaign = Invoke-Json `
    -Method "Post" `
    -Uri "$ApiBaseUrl/api/v1/campaigns" `
    -Headers $headers `
    -Body @{
        code =
            "CENSUS-CORE-$suffix"

        name =
            "Campagne fonctionnelle $suffix"

        description =
            "Test complet du backend de recensement."

        startDate =
            "2026-07-01"

        endDate =
            "2026-12-31"

        scopeAdministrativeAreaId =
            $regionId
    }

Write-Host "Campagne créée : $($campaign.code)"
Write-Host "Statut initial : $($campaign.status)"

$campaign = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/campaigns/$($campaign.id)/status" `
    -Headers $headers `
    -Body @{
        status = "Scheduled"
    }

Write-Host "Campagne programmée : $($campaign.status)"

$campaign = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/campaigns/$($campaign.id)/status" `
    -Headers $headers `
    -Body @{
        status = "Active"
    }

Write-Host "Campagne activée : $($campaign.status)"
Write-Host ""

Write-Host "4. Création de l’habitation..."

$dwelling = Invoke-Json `
    -Method "Post" `
    -Uri "$ApiBaseUrl/api/v1/dwellings" `
    -Headers $headers `
    -Body @{
        campaignId =
            $campaign.id

        enumerationAreaId =
            $enumerationArea.id

        referenceCode =
            "HAB-$suffix"

        address =
            "Adresse test"

        localityName =
            "Localité test"

        latitude =
            -23.350000

        longitude =
            47.600000
    }

Write-Host "Habitation créée : $($dwelling.referenceCode)"
Write-Host "Statut : $($dwelling.recordStatus)"

$dwelling = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/dwellings/$($dwelling.id)/submit" `
    -Headers $headers

Write-Host "Habitation soumise : $($dwelling.recordStatus)"

$dwelling = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/dwellings/$($dwelling.id)/validate" `
    -Headers $headers

Write-Host "Habitation validée : $($dwelling.recordStatus)"
Write-Host ""

Write-Host "5. Création du ménage..."

$household = Invoke-Json `
    -Method "Post" `
    -Uri "$ApiBaseUrl/api/v1/households" `
    -Headers $headers `
    -Body @{
        dwellingId =
            $dwelling.id

        referenceCode =
            "MEN-$suffix"

        householdType =
            "Ordinary"

        headFullName =
            "Chef Ménage Test"

        phoneNumber =
            "0340000000"
    }

Write-Host "Ménage créé : $($household.referenceCode)"
Write-Host "Statut : $($household.recordStatus)"

$household = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/households/$($household.id)/submit" `
    -Headers $headers

Write-Host "Ménage soumis : $($household.recordStatus)"

$household = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/households/$($household.id)/validate" `
    -Headers $headers

Write-Host "Ménage validé : $($household.recordStatus)"
Write-Host ""

Write-Host "6. Création de la personne..."

$person = Invoke-Json `
    -Method "Post" `
    -Uri "$ApiBaseUrl/api/v1/persons" `
    -Headers $headers `
    -Body @{
        householdId =
            $household.id

        personNumber =
            1

        firstName =
            "Faneva"

        lastName =
            "Test"

        sex =
            "Female"

        dateOfBirth =
            "1995-05-10"

        ageYears =
            31

        relationshipToHead =
            "Head"

        maritalStatus =
            "Single"

        nationality =
            "Malagasy"

        occupation =
            "Test"

        phoneNumber =
            "0340000001"

        nationalId =
            "TEST-$suffix"
    }

Write-Host "Personne créée : $($person.fullName)"
Write-Host "Statut : $($person.recordStatus)"

$person = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/persons/$($person.id)/submit" `
    -Headers $headers

Write-Host "Personne soumise : $($person.recordStatus)"

$person = Invoke-Json `
    -Method "Patch" `
    -Uri "$ApiBaseUrl/api/v1/persons/$($person.id)/validate" `
    -Headers $headers

Write-Host "Personne validée : $($person.recordStatus)"
Write-Host ""

Write-Host "7. Vérification du tableau de bord..."

$dashboard = Invoke-Json `
    -Method "Get" `
    -Uri "$ApiBaseUrl/api/v1/dashboard/campaigns/$($campaign.id)" `
    -Headers $headers

if ($dwelling.recordStatus -ne "Validated") {
    throw "Le statut final de l’habitation est incorrect."
}

if ($household.recordStatus -ne "Validated") {
    throw "Le statut final du ménage est incorrect."
}

if ($person.recordStatus -ne "Validated") {
    throw "Le statut final de la personne est incorrect."
}

if ($dashboard.totalDwellings -ne 1) {
    throw "Le tableau de bord devrait contenir une habitation."
}

if ($dashboard.totalHouseholds -ne 1) {
    throw "Le tableau de bord devrait contenir un ménage."
}

if ($dashboard.totalPersons -ne 1) {
    throw "Le tableau de bord devrait contenir une personne."
}

Write-Host ""
Write-Host "======================================"
Write-Host " TEST BACKEND RÉUSSI"
Write-Host "======================================"
Write-Host ""
Write-Host "Campagne : $($campaign.code)"
Write-Host "Statut campagne : $($campaign.status)"
Write-Host "Habitation : $($dwelling.recordStatus)"
Write-Host "Ménage : $($household.recordStatus)"
Write-Host "Personne : $($person.recordStatus)"
Write-Host ""
Write-Host "Total habitations : $($dashboard.totalDwellings)"
Write-Host "Total ménages : $($dashboard.totalHouseholds)"
Write-Host "Total personnes : $($dashboard.totalPersons)"
Write-Host ""
