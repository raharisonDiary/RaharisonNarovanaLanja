param(
    [string]$ApiBaseUrl = "https://localhost:7001/api/v1",
    [string]$Email = "admin@gmail.com",
    [Parameter(Mandatory = $true)]
    [string]$Password,
    [switch]$SkipFokontany
)

$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$sourceRoot = "https://raw.githubusercontent.com/julkwel/madagascar-map/master"
$tempRoot = Join-Path $env:TEMP "census-madagascar-geography"
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

function Get-JsonFile {
    param([string]$Name)

    $target = Join-Path $tempRoot $Name
    $url = "$sourceRoot/$Name"

    Write-Host "Téléchargement de $Name..." -ForegroundColor Cyan

    & curl.exe `
        -L `
        --fail `
        --silent `
        --show-error `
        --retry 3 `
        --connect-timeout 30 `
        $url `
        -o $target

    if ($LASTEXITCODE -ne 0) {
        throw "Échec du téléchargement de $Name depuis $url."
    }

    if (-not (Test-Path $target)) {
        throw "Le fichier $Name n'a pas été créé."
    }

    if ((Get-Item $target).Length -eq 0) {
        throw "Le fichier téléchargé $Name est vide."
    }

    $jsonText = [System.IO.File]::ReadAllText(
        $target,
        [System.Text.Encoding]::UTF8
    )

    return $jsonText | ConvertFrom-Json
}
function Normalize-Key {
    param([string]$Value)
    return $Value.Trim().ToUpperInvariant()
}

function New-AreaCode {
    param(
        [string]$Prefix,
        [string]$Seed
    )

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Seed)
        $hash = [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-', '')
        return "$Prefix-$($hash.Substring(0, 12))"
    }
    finally {
        $sha.Dispose()
    }
}

function Add-AreaToIndex {
    param($Area)

    $parent = if ($Area.parentId) { $Area.parentId } else { "ROOT" }
    $key = "$(Normalize-Key $Area.type)|$parent|$(Normalize-Key $Area.name)"
    $script:areaIndex[$key] = $Area
}

function Get-ApiErrorDetails {
    param($ErrorRecord)

    $response = $ErrorRecord.Exception.Response

    if ($null -eq $response) {
        return $ErrorRecord.Exception.Message
    }

    try {
        $stream = $response.GetResponseStream()

        if ($null -eq $stream) {
            return $ErrorRecord.Exception.Message
        }

        $reader = New-Object System.IO.StreamReader(
            $stream,
            [System.Text.Encoding]::UTF8
        )

        try {
            $details = $reader.ReadToEnd()

            if ([string]::IsNullOrWhiteSpace($details)) {
                return $ErrorRecord.Exception.Message
            }

            return $details
        }
        finally {
            $reader.Dispose()
        }
    }
    catch {
        return $ErrorRecord.Exception.Message
    }
}

function Add-FokontanyFailure {
    param(
        [string]$Name,
        [string]$ParentId,
        [string]$Code,
        [int]$StatusCode,
        [string]$Details
    )

    if ($null -eq $script:failedFokontany) {
        $script:failedFokontany =
            New-Object System.Collections.Generic.List[object]
    }

    $script:failedFokontany.Add(
        [pscustomobject]@{
            Name = $Name
            ParentId = $ParentId
            Code = $Code
            StatusCode = $StatusCode
            Details = $Details
        }
    )
}

function Get-OrCreateArea {
    param(
        [string]$Name,
        [string]$Type,
        [AllowNull()][string]$ParentId,
        [string]$CodeSeed
    )

    $normalizedName = if ($null -eq $Name) {
        ""
    }
    else {
        $Name.Trim()
    }

    if ([string]::IsNullOrWhiteSpace($normalizedName)) {
        if ($Type -eq "Fokontany") {
            Add-FokontanyFailure `
                -Name "" `
                -ParentId $ParentId `
                -Code "" `
                -StatusCode 0 `
                -Details "Nom de fokontany vide."

            return $null
        }

        throw "Le nom de la zone administrative est vide."
    }

    if ($normalizedName.Length -gt 150) {
        if ($Type -eq "Fokontany") {
            Add-FokontanyFailure `
                -Name $normalizedName `
                -ParentId $ParentId `
                -Code "" `
                -StatusCode 400 `
                -Details "Le nom dépasse 150 caractères."

            return $null
        }

        throw "Le nom '$normalizedName' dépasse 150 caractères."
    }

    $parent = if ($ParentId) {
        $ParentId
    }
    else {
        "ROOT"
    }

    $key = "$(Normalize-Key $Type)|$parent|$(Normalize-Key $normalizedName)"

    if ($script:areaIndex.ContainsKey($key)) {
        return $script:areaIndex[$key]
    }

    $prefix = switch ($Type) {
        "Country" { "CTY" }
        "Region" { "REG" }
        "District" { "DIS" }
        "Commune" { "COM" }
        "Fokontany" { "FKT" }
        default { "AREA" }
    }

    $code = New-AreaCode $prefix $CodeSeed

    $payloadJson = @{
        code = $code
        name = $normalizedName
        type = $Type
        parentId = if ($ParentId) {
            $ParentId
        }
        else {
            $null
        }
    } |
        ConvertTo-Json -Compress

    $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes(
        $payloadJson
    )

    for ($attempt = 1; $attempt -le 4; $attempt++) {
        try {
            $created = Invoke-RestMethod `
                -Method Post `
                -Uri "$ApiBaseUrl/administrative-areas" `
                -Headers $script:headers `
                -ContentType "application/json; charset=utf-8" `
                -Body $payloadBytes

            Add-AreaToIndex $created
            return $created
        }
        catch {
            $response = $_.Exception.Response

            $statusCode = if ($null -ne $response) {
                [int]$response.StatusCode
            }
            else {
                0
            }

            $details = Get-ApiErrorDetails $_

            if ($statusCode -eq 429 -and $attempt -lt 4) {
                Write-Warning (
                    "Limite API atteinte. Pause de 65 secondes " +
                    "avant la reprise..."
                )

                Start-Sleep -Seconds 65
                continue
            }

            if (
                $Type -eq "Fokontany" -and
                $statusCode -in @(400, 409)
            ) {
                Add-FokontanyFailure `
                    -Name $normalizedName `
                    -ParentId $ParentId `
                    -Code $code `
                    -StatusCode $statusCode `
                    -Details $details

                Write-Warning (
                    "Fokontany ignoré : '$normalizedName'. " +
                    "HTTP $statusCode."
                )

                return $null
            }

            throw (
                "Création impossible : Type=$Type ; " +
                "Nom='$normalizedName' ; " +
                "HTTP=$statusCode ; Réponse=$details"
            )
        }
    }

    return $null
}
Write-Host "Connexion à Census Flow…" -ForegroundColor Cyan
$loginJson = @{
    email = $Email
    password = $Password
    deviceName = "Import geographique Madagascar"
} | ConvertTo-Json -Compress

$loginBytes = [System.Text.Encoding]::UTF8.GetBytes(
    $loginJson
)

try {
    $session = Invoke-RestMethod `
        -Method Post `
        -Uri "$ApiBaseUrl/sessions/login" `
        -ContentType "application/json; charset=utf-8" `
        -Body $loginBytes
}
catch {
    $response = $_.Exception.Response

    if ($null -ne $response) {
        $stream = $response.GetResponseStream()

        if ($null -ne $stream) {
            $reader = New-Object System.IO.StreamReader(
                $stream,
                [System.Text.Encoding]::UTF8
            )

            try {
                $details = $reader.ReadToEnd()
            }
            finally {
                $reader.Dispose()
            }

            throw "Connexion API impossible. Réponse : $details"
        }
    }

    throw
}

$script:headers = @{
    Authorization = "Bearer $($session.accessToken)"
}

$script:areaIndex = @{}
$areas = Invoke-RestMethod `
    -Method Get `
    -Uri "$ApiBaseUrl/administrative-areas?includeInactive=true" `
    -Headers $script:headers
foreach ($area in @($areas)) {
    Add-AreaToIndex $area
}

$regionsData = Get-JsonFile "liste_region.json"
$districtsData = Get-JsonFile "liste_district_par_region.json"
$communesData = Get-JsonFile "liste_commune_par_district.json"
$fokontanyData = if ($SkipFokontany) {
    $null
}
else {
    Get-JsonFile "liste_fokontany_par_commune_data.json"
}

$country = Get-OrCreateArea `
    -Name "Madagascar" `
    -Type "Country" `
    -ParentId $null `
    -CodeSeed "Madagascar"

$regionByName = @{}
$districtByKey = @{}
$communeByKey = @{}

$regionNumber = 0
foreach ($regionName in @($regionsData.region)) {
    $regionNumber++
    Write-Progress `
        -Activity "Import des régions" `
        -Status $regionName `
        -PercentComplete (($regionNumber / $regionsData.region.Count) * 100)
    $region = Get-OrCreateArea `
        -Name $regionName `
        -Type "Region" `
        -ParentId $country.id `
        -CodeSeed "Madagascar|$regionName"
    $regionByName[(Normalize-Key $regionName)] = $region
}
Write-Progress -Activity "Import des régions" -Completed

$regionProperties = $districtsData.PSObject.Properties |
    Where-Object { $_.Name -ne "Region" }
foreach ($regionProperty in $regionProperties) {
    $regionName = $regionProperty.Name
    $region = $regionByName[(Normalize-Key $regionName)]
    if (-not $region) {
        Write-Warning "Région introuvable pour les districts : $regionName"
        continue
    }

    foreach ($districtName in @($regionProperty.Value)) {
        $district = Get-OrCreateArea `
            -Name $districtName `
            -Type "District" `
            -ParentId $region.id `
            -CodeSeed "Madagascar|$regionName|$districtName"
        $districtByKey["$(Normalize-Key $regionName)|$(Normalize-Key $districtName)"] = $district
    }
}

$communeCount = 0
$communeTotal = 0
foreach ($regionProperty in ($communesData.PSObject.Properties | Where-Object { $_.Name -ne "Region" })) {
    foreach ($districtProperty in $regionProperty.Value.PSObject.Properties) {
        $communeTotal += @($districtProperty.Value).Count
    }
}

foreach ($regionProperty in ($communesData.PSObject.Properties | Where-Object { $_.Name -ne "Region" })) {
    $regionName = $regionProperty.Name
    foreach ($districtProperty in $regionProperty.Value.PSObject.Properties) {
        $districtName = $districtProperty.Name
        $districtKey = "$(Normalize-Key $regionName)|$(Normalize-Key $districtName)"
        $district = $districtByKey[$districtKey]
        if (-not $district) {
            Write-Warning "District introuvable pour les communes : $districtKey"
            continue
        }

        foreach ($communeName in @($districtProperty.Value)) {
            $communeCount++
            Write-Progress `
                -Activity "Import des communes" `
                -Status "$regionName / $districtName / $communeName" `
                -PercentComplete (($communeCount / [Math]::Max($communeTotal, 1)) * 100)
            $commune = Get-OrCreateArea `
                -Name $communeName `
                -Type "Commune" `
                -ParentId $district.id `
                -CodeSeed "Madagascar|$regionName|$districtName|$communeName"
            $communeKey = "$(Normalize-Key $regionName)|$(Normalize-Key $districtName)|$(Normalize-Key $communeName)"
            $communeByKey[$communeKey] = $commune
        }
    }
}
Write-Progress -Activity "Import des communes" -Completed

if (-not $SkipFokontany) {
    $fokontanyRows = New-Object System.Collections.Generic.List[object]
    foreach ($regionProperty in $fokontanyData.PSObject.Properties) {
        foreach ($communeProperty in $regionProperty.Value.PSObject.Properties) {
            foreach ($row in @($communeProperty.Value)) {
                $fokontanyRows.Add($row)
            }
        }
    }

    for ($index = 0; $index -lt $fokontanyRows.Count; $index++) {
        $row = $fokontanyRows[$index]
        Write-Progress `
            -Activity "Import des fokontany" `
            -Status "$($row.region) / $($row.district) / $($row.commune) / $($row.fokontany)" `
            -PercentComplete ((($index + 1) / [Math]::Max($fokontanyRows.Count, 1)) * 100)
        $communeKey = "$(Normalize-Key $row.region)|$(Normalize-Key $row.district)|$(Normalize-Key $row.commune)"
        $commune = $communeByKey[$communeKey]
        if (-not $commune) {
            continue
        }

        Get-OrCreateArea `
            -Name $row.fokontany `
            -Type "Fokontany" `
            -ParentId $commune.id `
            -CodeSeed "Madagascar|$($row.region)|$($row.district)|$($row.commune)|$($row.fokontany)" | Out-Null
    }
    Write-Progress -Activity "Import des fokontany" -Completed
}

if (
    $null -ne $script:failedFokontany -and
    $script:failedFokontany.Count -gt 0
) {
    $projectRoot = Split-Path $PSScriptRoot -Parent

    $errorLogPath = Join-Path `
        $projectRoot `
        "import-fokontany-errors.csv"

    $script:failedFokontany |
        Export-Csv `
            -Path $errorLogPath `
            -NoTypeInformation `
            -Encoding UTF8

    Write-Warning (
        "$($script:failedFokontany.Count) fokontany " +
        "n'ont pas été importés."
    )

    Write-Host (
        "Rapport des erreurs : $errorLogPath"
    ) -ForegroundColor Yellow
}
$finalAreas = Invoke-RestMethod `
    -Method Get `
    -Uri "$ApiBaseUrl/administrative-areas?includeInactive=true" `
    -Headers $script:headers
$summary = @($finalAreas) | Group-Object type | Sort-Object Name
Write-Host "";
Write-Host "Import terminé." -ForegroundColor Green
$summary | Format-Table Name, Count -AutoSize
Write-Host "Source : julkwel/madagascar-map (licence MIT)."
