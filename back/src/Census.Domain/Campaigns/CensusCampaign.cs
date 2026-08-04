using Census.Domain.AdministrativeAreas;
using Census.Domain.Common;

namespace Census.Domain.Campaigns;

public sealed class CensusCampaign : EntityBase
{
    private CensusCampaign()
    {
    }

    public CensusCampaign(
        string code,
        string name,
        string? description,
        DateOnly startDate,
        DateOnly endDate,
        Guid scopeAdministrativeAreaId,
        DateTimeOffset createdAtUtc)
    {
        ValidateDates(startDate, endDate);

        Code = NormalizeCode(code);
        Name = NormalizeRequiredValue(
            name,
            nameof(name),
            maximumLength: 150);

        Description = NormalizeOptionalValue(
            description,
            maximumLength: 1000);

        StartDate = startDate;
        EndDate = endDate;
        ScopeAdministrativeAreaId =
            scopeAdministrativeAreaId;

        Status = CensusCampaignStatus.Draft;
        CreatedAtUtc = createdAtUtc;
    }

    public string Code { get; private set; } =
        string.Empty;

    public string Name { get; private set; } =
        string.Empty;

    public string? Description { get; private set; }

    public DateOnly StartDate { get; private set; }

    public DateOnly EndDate { get; private set; }

    public CensusCampaignStatus Status { get; private set; }

    public Guid ScopeAdministrativeAreaId { get; private set; }

    public AdministrativeArea? ScopeAdministrativeArea
    {
        get;
        private set;
    }

    public void UpdateDetails(
        string code,
        string name,
        string? description,
        DateOnly startDate,
        DateOnly endDate,
        Guid scopeAdministrativeAreaId,
        DateTimeOffset updatedAtUtc)
    {
        ValidateDates(startDate, endDate);

        Code = NormalizeCode(code);

        Name = NormalizeRequiredValue(
            name,
            nameof(name),
            maximumLength: 150);

        Description = NormalizeOptionalValue(
            description,
            maximumLength: 1000);

        StartDate = startDate;
        EndDate = endDate;

        ScopeAdministrativeAreaId =
            scopeAdministrativeAreaId;

        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangeStatus(
        CensusCampaignStatus status,
        DateTimeOffset updatedAtUtc)
    {
        if (!Enum.IsDefined(status))
        {
            throw new ArgumentException(
                "Le statut de la campagne est invalide.",
                nameof(status));
        }

        if (Status == status)
        {
            return;
        }

        Status = status;
        MarkAsUpdated(updatedAtUtc);
    }

    private static void ValidateDates(
        DateOnly startDate,
        DateOnly endDate)
    {
        if (endDate < startDate)
        {
            throw new ArgumentException(
                "La date de fin doit être postérieure ou égale à la date de début.");
        }

        var maximumDuration =
            startDate.AddYears(5);

        if (endDate > maximumDuration)
        {
            throw new ArgumentException(
                "Une campagne ne peut pas dépasser cinq années.");
        }
    }

    private static string NormalizeCode(
        string code)
    {
        return NormalizeRequiredValue(
            code,
            nameof(code),
            maximumLength: 40)
            .ToUpperInvariant();
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
