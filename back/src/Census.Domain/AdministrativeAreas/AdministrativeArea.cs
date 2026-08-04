using Census.Domain.Common;

namespace Census.Domain.AdministrativeAreas;

public sealed class AdministrativeArea : EntityBase
{
    private AdministrativeArea()
    {
    }

    public AdministrativeArea(
        string code,
        string name,
        AdministrativeAreaType type,
        Guid? parentId,
        DateTimeOffset createdAtUtc)
    {
        Code = NormalizeCode(code);
        Name = NormalizeName(name);
        Type = type;
        ParentId = parentId;
        CreatedAtUtc = createdAtUtc;
        IsActive = true;
    }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public AdministrativeAreaType Type { get; private set; }

    public Guid? ParentId { get; private set; }

    public AdministrativeArea? Parent { get; private set; }

    public ICollection<AdministrativeArea> Children { get; private set; } =
        new List<AdministrativeArea>();

    public bool IsActive { get; private set; }

    public void Update(
        string code,
        string name,
        DateTimeOffset updatedAtUtc)
    {
        Code = NormalizeCode(code);
        Name = NormalizeName(name);

        MarkAsUpdated(updatedAtUtc);
    }

    public void Activate(DateTimeOffset updatedAtUtc)
    {
        if (IsActive)
        {
            return;
        }

        IsActive = true;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Deactivate(DateTimeOffset updatedAtUtc)
    {
        if (!IsActive)
        {
            return;
        }

        IsActive = false;
        MarkAsUpdated(updatedAtUtc);
    }

    private static string NormalizeCode(string code)
    {
        return NormalizeRequiredValue(
            code,
            nameof(code),
            maximumLength: 30)
            .ToUpperInvariant();
    }

    private static string NormalizeName(string name)
    {
        return NormalizeRequiredValue(
            name,
            nameof(name),
            maximumLength: 150);
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
}
