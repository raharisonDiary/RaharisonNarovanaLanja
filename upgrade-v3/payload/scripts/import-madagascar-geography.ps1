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
    Write-Host "Téléchargement de $Name…" -ForegroundColor Cyan
    Invoke-WebRequest -Uri "$sourceRoot/$Name" -OutFile $target -UseBasicParsing
    return Get-Content $target -Raw | ConvertFrom-Json
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

function Get-OrCreateArea {
    param(
        [string]$Name,
        [string]$Type,
        [AllowNull()][string]$ParentId,
        [string]$CodeSeed
    )

    $parent = if ($ParentId) { $ParentId } else { "ROOT" }
    $key = "$(Normalize-Key $Type)|$parent|$(Normalize-Key $Name)"
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
    $payload = @{
        code = New-AreaCode $prefix $CodeSeed
        name = $Name.Trim()
        type = $Type
        parentId = if ($ParentId) { $ParentId } else { $null }
    } | ConvertTo-Json

    $created = Invoke-RestMethod `
        -Method Post `
        -Uri "$ApiBaseUrl/administrative-areas" `
        -Headers $script:headers `
        -ContentType "application/json" `
        -Body $payload
    Add-AreaToIndex $created
    return $created
}

Write-Host "Connexion à Census Flow…" -ForegroundColor Cyan
$session = Invoke-RestMethod `
    -Method Post `
    -Uri "$ApiBaseUrl/sessions/login" `
    -ContentType "application/json" `
    -Body (@{
        email = $Email
        password = $Password
        deviceName = "Import géographique Madagascar"
    } | ConvertTo-Json)
$script:headers = @{ Authorization = "Bearer $($session.accessToken)" }

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

$finalAreas = Invoke-RestMethod `
    -Method Get `
    -Uri "$ApiBaseUrl/administrative-areas?includeInactive=true" `
    -Headers $script:headers
$summary = @($finalAreas) | Group-Object type | Sort-Object Name
Write-Host "";
Write-Host "Import terminé." -ForegroundColor Green
$summary | Format-Table Name, Count -AutoSize
Write-Host "Source : julkwel/madagascar-map (licence MIT)."
