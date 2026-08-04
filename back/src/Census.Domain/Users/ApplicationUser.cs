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
        FirstName = NormalizeRequiredValue(firstName, nameof(firstName), 100);
        LastName = NormalizeRequiredValue(lastName, nameof(lastName), 100);
        Email = NormalizeEmail(email);
        PhoneNumber = NormalizeOptionalValue(phoneNumber, 30);
        PasswordHash = NormalizeRequiredValue(passwordHash, nameof(passwordHash), 500);
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

    // Une seule rÃ©cupÃ©ration active par utilisateur. Les secrets ne sont jamais stockÃ©s en clair.
    public string? PasswordRecoveryCodeHash { get; private set; }
    public string? PasswordRecoveryCodeSalt { get; private set; }
    public DateTimeOffset? PasswordRecoveryCodeExpiresAtUtc { get; private set; }
    public int PasswordRecoveryAttemptCount { get; private set; }
    public string? PasswordRecoveryTokenHash { get; private set; }
    public DateTimeOffset? PasswordRecoveryTokenExpiresAtUtc { get; private set; }
    public DateTimeOffset? PasswordRecoveryVerifiedAtUtc { get; private set; }

    public string FullName => $"{FirstName} {LastName}".Trim();

    public void UpdateProfile(
        string firstName,
        string lastName,
        string? phoneNumber,
        DateTimeOffset updatedAtUtc)
    {
        FirstName = NormalizeRequiredValue(firstName, nameof(firstName), 100);
        LastName = NormalizeRequiredValue(lastName, nameof(lastName), 100);
        PhoneNumber = NormalizeOptionalValue(phoneNumber, 30);
        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangeEmail(string email, DateTimeOffset updatedAtUtc)
    {
        Email = NormalizeEmail(email);
        ClearPasswordRecovery(updatedAtUtc);
        MarkAsUpdated(updatedAtUtc);
    }

    public void ChangePassword(string passwordHash, DateTimeOffset updatedAtUtc)
    {
        PasswordHash = NormalizeRequiredValue(passwordHash, nameof(passwordHash), 500);
        ClearPasswordRecovery(updatedAtUtc);
        MarkAsUpdated(updatedAtUtc);
    }

    public void BeginPasswordRecovery(
        string codeHash,
        string codeSalt,
        DateTimeOffset expiresAtUtc,
        DateTimeOffset updatedAtUtc)
    {
        PasswordRecoveryCodeHash = NormalizeRequiredValue(codeHash, nameof(codeHash), 128);
        PasswordRecoveryCodeSalt = NormalizeRequiredValue(codeSalt, nameof(codeSalt), 128);
        PasswordRecoveryCodeExpiresAtUtc = expiresAtUtc;
        PasswordRecoveryAttemptCount = 0;
        PasswordRecoveryTokenHash = null;
        PasswordRecoveryTokenExpiresAtUtc = null;
        PasswordRecoveryVerifiedAtUtc = null;
        MarkAsUpdated(updatedAtUtc);
    }

    public void RegisterPasswordRecoveryFailure(DateTimeOffset updatedAtUtc)
    {
        PasswordRecoveryAttemptCount++;
        MarkAsUpdated(updatedAtUtc);
    }

    public void VerifyPasswordRecovery(
        string tokenHash,
        DateTimeOffset tokenExpiresAtUtc,
        DateTimeOffset verifiedAtUtc)
    {
        PasswordRecoveryTokenHash = NormalizeRequiredValue(tokenHash, nameof(tokenHash), 128);
        PasswordRecoveryTokenExpiresAtUtc = tokenExpiresAtUtc;
        PasswordRecoveryVerifiedAtUtc = verifiedAtUtc;
        PasswordRecoveryCodeHash = null;
        PasswordRecoveryCodeSalt = null;
        PasswordRecoveryCodeExpiresAtUtc = null;
        PasswordRecoveryAttemptCount = 0;
        MarkAsUpdated(verifiedAtUtc);
    }

    public void ClearPasswordRecovery(DateTimeOffset updatedAtUtc)
    {
        PasswordRecoveryCodeHash = null;
        PasswordRecoveryCodeSalt = null;
        PasswordRecoveryCodeExpiresAtUtc = null;
        PasswordRecoveryAttemptCount = 0;
        PasswordRecoveryTokenHash = null;
        PasswordRecoveryTokenExpiresAtUtc = null;
        PasswordRecoveryVerifiedAtUtc = null;
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

    public void RegisterSuccessfulLogin(DateTimeOffset loginAtUtc)
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
        ClearPasswordRecovery(updatedAtUtc);
        MarkAsUpdated(updatedAtUtc);
    }

    private static string NormalizeEmail(string email)
    {
        var normalizedEmail = NormalizeRequiredValue(email, nameof(email), 254);
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
            throw new ArgumentException("La valeur ne peut pas Ãªtre vide.", parameterName);
        }
        if (normalizedValue.Length > maximumLength)
        {
            throw new ArgumentException($"La valeur ne peut pas dÃ©passer {maximumLength} caractÃ¨res.", parameterName);
        }
        return normalizedValue;
    }

    private static string? NormalizeOptionalValue(string? value, int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }
        var normalizedValue = value.Trim();
        if (normalizedValue.Length > maximumLength)
        {
            throw new ArgumentException($"La valeur ne peut pas dÃ©passer {maximumLength} caractÃ¨res.");
        }
        return normalizedValue;
    }
}
