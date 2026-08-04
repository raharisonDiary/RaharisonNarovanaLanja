using Census.Domain.Users;

namespace Census.Domain.Authentication;

public sealed class UserSession
{
    private UserSession()
    {
    }

    public UserSession(
        Guid userId,
        string tokenHash,
        DateTimeOffset createdAtUtc,
        DateTimeOffset expiresAtUtc,
        string? createdByIpAddress,
        string? userAgent,
        string? deviceName)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException(
                "L’identifiant utilisateur est obligatoire.",
                nameof(userId));
        }

        if (expiresAtUtc <= createdAtUtc)
        {
            throw new ArgumentException(
                "La date d’expiration doit être postérieure à la date de création.",
                nameof(expiresAtUtc));
        }

        Id = Guid.NewGuid();
        UserId = userId;

        TokenHash = NormalizeRequired(
            tokenHash,
            nameof(tokenHash),
            maximumLength: 64);

        CreatedAtUtc = createdAtUtc;
        ExpiresAtUtc = expiresAtUtc;

        CreatedByIpAddress = NormalizeOptional(
            createdByIpAddress,
            maximumLength: 64);

        UserAgent = NormalizeOptional(
            userAgent,
            maximumLength: 500);

        DeviceName = NormalizeOptional(
            deviceName,
            maximumLength: 100);

        ConcurrencyToken = Guid.NewGuid();
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public ApplicationUser? User { get; private set; }

    public string TokenHash { get; private set; } =
        string.Empty;

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset ExpiresAtUtc { get; private set; }

    public string? CreatedByIpAddress { get; private set; }

    public string? UserAgent { get; private set; }

    public string? DeviceName { get; private set; }

    public DateTimeOffset? RevokedAtUtc { get; private set; }

    public string? RevokedByIpAddress { get; private set; }

    public string? RevocationReason { get; private set; }

    public Guid? ReplacedBySessionId { get; private set; }

    public UserSession? ReplacedBySession { get; private set; }

    public Guid ConcurrencyToken { get; private set; }

    public bool IsActive(DateTimeOffset now)
    {
        return !RevokedAtUtc.HasValue &&
               ExpiresAtUtc > now;
    }

    public void Revoke(
        DateTimeOffset revokedAtUtc,
        string? revokedByIpAddress,
        string reason,
        Guid? replacedBySessionId = null)
    {
        if (RevokedAtUtc.HasValue)
        {
            return;
        }

        RevokedAtUtc = revokedAtUtc;

        RevokedByIpAddress = NormalizeOptional(
            revokedByIpAddress,
            maximumLength: 64);

        RevocationReason = NormalizeRequired(
            reason,
            nameof(reason),
            maximumLength: 200);

        ReplacedBySessionId = replacedBySessionId;
        ConcurrencyToken = Guid.NewGuid();
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

        return normalized.Length <= maximumLength
            ? normalized
            : normalized[..maximumLength];
    }
}
