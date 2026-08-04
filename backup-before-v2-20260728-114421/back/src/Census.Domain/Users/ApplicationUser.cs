using Census.Domain.AdministrativeAreas;
using Census.Domain.Common;

namespace Census.Domain.Users;

public sealed class ApplicationUser : EntityBase
{
    private ApplicationUser()
    {
    }

    public ApplicationUser(
        string firstName,
        string lastName,
        string email,
        string? phoneNumber,
        string passwordHash,
        UserRole role,
        Guid? administrativeAreaId,
        DateTimeOffset createdAtUtc)
    {
        FirstName = NormalizeRequiredValue(
            firstName,
            nameof(firstName),
            maximumLength: 100);

        LastName = NormalizeRequiredValue(
            lastName,
            nameof(lastName),
            maximumLength: 100);

        Email = NormalizeEmail(email);

        PhoneNumber = NormalizeOptionalValue(
            phoneNumber,
            maximumLength: 30);

        PasswordHash = NormalizeRequiredValue(
            passwordHash,
            nameof(passwordHash),
            maximumLength: 500);

        Role = role;
        AdministrativeAreaId = administrativeAreaId;
        CreatedAtUtc = createdAtUtc;
        IsActive = true;
    }

    public string FirstName { get; private set; } = string.Empty;

    public string LastName { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string? PhoneNumber { get; private set; }

    public string PasswordHash { get; private set; } = string.Empty;

    public UserRole Role { get; private set; }

    public Guid? AdministrativeAreaId { get; private set; }

    public AdministrativeArea? AdministrativeArea { get; private set; }

    public bool IsActive { get; private set; }

    public DateTimeOffset? LastLoginAtUtc { get; private set; }

    public string FullName =>
        $"{FirstName} {LastName}".Trim();

    public void UpdateProfile(
        string firstName,
        string lastName,
        string? phoneNumber,
        DateTimeOffset updatedAtUtc)
    {
        FirstName = NormalizeRequiredValue(
            firstName,
            nameof(firstName),
            maximumLength: 100);

        LastName = NormalizeRequiredValue(
            lastName,
            nameof(lastName),
            maximumLength: 100);

        PhoneNumber = NormalizeOptionalValue(
            phoneNumber,
            maximumLength: 30);

        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangeEmail(
        string email,
        DateTimeOffset updatedAtUtc)
    {
        Email = NormalizeEmail(email);
        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangePassword(
        string passwordHash,
        DateTimeOffset updatedAtUtc)
    {
        PasswordHash = NormalizeRequiredValue(
            passwordHash,
            nameof(passwordHash),
            maximumLength: 500);

        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangeRoleAndArea(
        UserRole role,
        Guid? administrativeAreaId,
        DateTimeOffset updatedAtUtc)
    {
        Role = role;
        AdministrativeAreaId = administrativeAreaId;

        MarkAsUpdated(updatedAtUtc);
    }

    public void RegisterSuccessfulLogin(
        DateTimeOffset loginAtUtc)
    {
        LastLoginAtUtc = loginAtUtc;
        MarkAsUpdated(loginAtUtc);
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

    private static string NormalizeEmail(string email)
    {
        var normalizedEmail = NormalizeRequiredValue(
            email,
            nameof(email),
            maximumLength: 254);

        return normalizedEmail.ToLowerInvariant();
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
