using Census.Domain.Campaigns;
using Census.Domain.Common;
using Census.Domain.Dwellings;
using Census.Domain.Users;

namespace Census.Domain.Households;

public sealed class Household : EntityBase
{
    private Household()
    {
    }

    public Household(
        Guid campaignId,
        Guid dwellingId,
        string referenceCode,
        HouseholdType householdType,
        string? headFullName,
        string? phoneNumber,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        EnsureRequiredId(campaignId, nameof(campaignId));
        EnsureRequiredId(dwellingId, nameof(dwellingId));
        EnsureRequiredId(createdByUserId, nameof(createdByUserId));

        if (!Enum.IsDefined(householdType))
        {
            throw new ArgumentException(
                "Le type de ménage est invalide.",
                nameof(householdType));
        }

        CampaignId = campaignId;
        DwellingId = dwellingId;
        ReferenceCode = NormalizeRequired(
            referenceCode,
            nameof(referenceCode),
            50).ToUpperInvariant();

        HouseholdType = householdType;
        HeadFullName = NormalizeOptional(headFullName, 200);
        PhoneNumber = NormalizeOptional(phoneNumber, 30);
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;
        RecordStatus = HouseholdRecordStatus.Draft;
    }

    public Guid CampaignId { get; private set; }
    public CensusCampaign? Campaign { get; private set; }
    public Guid DwellingId { get; private set; }
    public Dwelling? Dwelling { get; private set; }
    public string ReferenceCode { get; private set; } = string.Empty;
    public HouseholdType HouseholdType { get; private set; }
    public string? HeadFullName { get; private set; }
    public string? PhoneNumber { get; private set; }
    public string? Notes { get; private set; }

    public HouseholdRecordStatus RecordStatus
    {
        get;
        private set;
    }

    public Guid CreatedByUserId { get; private set; }

    public ApplicationUser? CreatedByUser
    {
        get;
        private set;
    }

    public void UpdateDetails(
        HouseholdType householdType,
        string? headFullName,
        string? phoneNumber,
        string? notes,
        DateTimeOffset updatedAtUtc)
    {
        EnsureEditable();

        if (!Enum.IsDefined(householdType))
        {
            throw new ArgumentException(
                "Le type de ménage est invalide.",
                nameof(householdType));
        }

        HouseholdType = householdType;
        HeadFullName = NormalizeOptional(headFullName, 200);
        PhoneNumber = NormalizeOptional(phoneNumber, 30);
        Notes = NormalizeOptional(notes, 1000);
        MarkAsUpdated(updatedAtUtc);
    }

    public void Submit(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus is not
            (HouseholdRecordStatus.Draft or
             HouseholdRecordStatus.Rejected))
        {
            throw new InvalidOperationException(
                "Seul un ménage en brouillon ou rejeté peut être soumis.");
        }

        RecordStatus = HouseholdRecordStatus.Submitted;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Validate(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus != HouseholdRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seul un ménage soumis peut être validé.");
        }

        RecordStatus = HouseholdRecordStatus.Validated;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Reject(
        string reason,
        DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus != HouseholdRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seul un ménage soumis peut être rejeté.");
        }

        Notes = NormalizeRequired(
            reason,
            nameof(reason),
            1000);

        RecordStatus = HouseholdRecordStatus.Rejected;
        MarkAsUpdated(updatedAtUtc);
    }

    private void EnsureEditable()
    {
        if (RecordStatus is
            HouseholdRecordStatus.Submitted or
            HouseholdRecordStatus.Validated)
        {
            throw new InvalidOperationException(
                "Ce ménage ne peut plus être modifié dans son état actuel.");
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

    private static string NormalizeRequired(
        string value,
        string parameterName,
        int maximumLength)
    {
        ArgumentNullException.ThrowIfNull(value);

        var normalized = value.Trim();

        if (normalized.Length == 0 ||
            normalized.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur doit contenir entre 1 et {maximumLength} caractères.",
                parameterName);
        }

        return normalized;
    }

    private static string? NormalizeOptional(
        string? value,
        int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value.Trim();

        if (normalized.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur ne peut pas dépasser {maximumLength} caractères.");
        }

        return normalized;
    }
}
