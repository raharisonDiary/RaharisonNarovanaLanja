using Census.Domain.AdministrativeAreas;
using Census.Domain.Campaigns;
using Census.Domain.Common;
using Census.Domain.Users;

namespace Census.Domain.Dwellings;

public sealed class Dwelling : EntityBase
{
    private Dwelling()
    {
    }

    public Dwelling(
        Guid campaignId,
        Guid enumerationAreaId,
        string referenceCode,
        string? address,
        string? localityName,
        decimal latitude,
        decimal longitude,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        EnsureRequiredId(campaignId, nameof(campaignId));
        EnsureRequiredId(
            enumerationAreaId,
            nameof(enumerationAreaId));

        EnsureRequiredId(
            createdByUserId,
            nameof(createdByUserId));

        ValidateCoordinates(latitude, longitude);

        CampaignId = campaignId;
        EnumerationAreaId = enumerationAreaId;

        ReferenceCode = NormalizeRequiredValue(
            referenceCode,
            nameof(referenceCode),
            maximumLength: 50)
            .ToUpperInvariant();

        Address = NormalizeOptionalValue(
            address,
            maximumLength: 250);

        LocalityName = NormalizeOptionalValue(
            localityName,
            maximumLength: 150);

        Latitude = latitude;
        Longitude = longitude;

        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;

        OccupancyStatus =
            DwellingOccupancyStatus.Unknown;

        RecordStatus =
            DwellingRecordStatus.Draft;
    }

    public Guid CampaignId { get; private set; }

    public CensusCampaign? Campaign { get; private set; }

    public Guid EnumerationAreaId { get; private set; }

    public AdministrativeArea? EnumerationArea
    {
        get;
        private set;
    }

    public string ReferenceCode { get; private set; } =
        string.Empty;

    public string? Address { get; private set; }

    public string? LocalityName { get; private set; }

    public decimal Latitude { get; private set; }

    public decimal Longitude { get; private set; }

    public DwellingOccupancyStatus OccupancyStatus
    {
        get;
        private set;
    }

    public DwellingRecordStatus RecordStatus
    {
        get;
        private set;
    }

    public string? Notes { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public ApplicationUser? CreatedByUser
    {
        get;
        private set;
    }

    public void UpdateDetails(
        string? address,
        string? localityName,
        decimal latitude,
        decimal longitude,
        DwellingOccupancyStatus occupancyStatus,
        string? notes,
        DateTimeOffset updatedAtUtc)
    {
        EnsureCanBeEdited();

        if (!Enum.IsDefined(occupancyStatus))
        {
            throw new ArgumentException(
                "Le statut d’occupation est invalide.",
                nameof(occupancyStatus));
        }

        ValidateCoordinates(latitude, longitude);

        Address = NormalizeOptionalValue(
            address,
            maximumLength: 250);

        LocalityName = NormalizeOptionalValue(
            localityName,
            maximumLength: 150);

        Notes = NormalizeOptionalValue(
            notes,
            maximumLength: 1000);

        Latitude = latitude;
        Longitude = longitude;
        OccupancyStatus = occupancyStatus;

        MarkAsUpdated(updatedAtUtc);
    }

    public void Submit(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus is not
            (DwellingRecordStatus.Draft or
             DwellingRecordStatus.Rejected))
        {
            throw new InvalidOperationException(
                "Seule une habitation en brouillon ou rejetée peut être soumise.");
        }

        RecordStatus = DwellingRecordStatus.Submitted;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Validate(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus !=
            DwellingRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seule une habitation soumise peut être validée.");
        }

        RecordStatus = DwellingRecordStatus.Validated;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Reject(
        string notes,
        DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus !=
            DwellingRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seule une habitation soumise peut être rejetée.");
        }

        Notes = NormalizeRequiredValue(
            notes,
            nameof(notes),
            maximumLength: 1000);

        RecordStatus = DwellingRecordStatus.Rejected;
        MarkAsUpdated(updatedAtUtc);
    }

    private void EnsureCanBeEdited()
    {
        if (RecordStatus is
            DwellingRecordStatus.Submitted or
            DwellingRecordStatus.Validated)
        {
            throw new InvalidOperationException(
                "Cette habitation ne peut plus être modifiée dans son état actuel.");
        }
    }

    private static void ValidateCoordinates(
        decimal latitude,
        decimal longitude)
    {
        if (latitude is < -90 or > 90)
        {
            throw new ArgumentOutOfRangeException(
                nameof(latitude),
                "La latitude doit être comprise entre -90 et 90.");
        }

        if (longitude is < -180 or > 180)
        {
            throw new ArgumentOutOfRangeException(
                nameof(longitude),
                "La longitude doit être comprise entre -180 et 180.");
        }
    }

    private static void EnsureRequiredId(
        Guid id,
        string parameterName)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException(
                "L’identifiant est obligatoire.",
                parameterName);
        }
    }

    private static string NormalizeRequiredValue(
        string value,
        string parameterName,
        int maximumLength)
    {
        ArgumentNullException.ThrowIfNull(value);

        var normalizedValue = value.Trim();

        if (normalizedValue.Length == 0)
        {
            throw new ArgumentException(
                "La valeur ne peut pas être vide.",
                parameterName);
        }

        if (normalizedValue.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur ne peut pas dépasser {maximumLength} caractères.",
                parameterName);
        }

        return normalizedValue;
    }

    private static string? NormalizeOptionalValue(
        string? value,
        int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalizedValue = value.Trim();

        if (normalizedValue.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur ne peut pas dépasser {maximumLength} caractères.");
        }

        return normalizedValue;
    }
}
