namespace Census.Domain.Auditing;

public sealed class AuditLog
{
    private AuditLog()
    {
    }

    public AuditLog(
        DateTimeOffset occurredAtUtc,
        Guid? actorUserId,
        string? actorEmail,
        string? actorRole,
        string httpMethod,
        string requestPath,
        string actionName,
        string? entityType,
        string? entityId,
        int statusCode,
        string? ipAddress,
        string? userAgent,
        string traceId,
        string? failureType)
    {
        if (statusCode is < 100 or > 599)
        {
            throw new ArgumentOutOfRangeException(
                nameof(statusCode),
                "Le code HTTP doit être compris entre 100 et 599.");
        }

        Id = Guid.NewGuid();
        OccurredAtUtc = occurredAtUtc;
        ActorUserId = actorUserId;

        ActorEmail = NormalizeOptional(
            actorEmail,
            maximumLength: 254);

        ActorRole = NormalizeOptional(
            actorRole,
            maximumLength: 100);

        HttpMethod = NormalizeRequired(
            httpMethod,
            nameof(httpMethod),
            maximumLength: 10)
            .ToUpperInvariant();

        RequestPath = NormalizeRequired(
            requestPath,
            nameof(requestPath),
            maximumLength: 500);

        ActionName = NormalizeRequired(
            actionName,
            nameof(actionName),
            maximumLength: 250);

        EntityType = NormalizeOptional(
            entityType,
            maximumLength: 100);

        EntityId = NormalizeOptional(
            entityId,
            maximumLength: 100);

        StatusCode = statusCode;

        WasSuccessful =
            statusCode is >= 200 and < 400;

        IpAddress = NormalizeOptional(
            ipAddress,
            maximumLength: 64);

        UserAgent = NormalizeOptional(
            userAgent,
            maximumLength: 500);

        TraceId = NormalizeRequired(
            traceId,
            nameof(traceId),
            maximumLength: 100);

        FailureType = NormalizeOptional(
            failureType,
            maximumLength: 200);
    }

    public Guid Id { get; private set; }

    public DateTimeOffset OccurredAtUtc
    {
        get;
        private set;
    }

    public Guid? ActorUserId
    {
        get;
        private set;
    }

    public string? ActorEmail
    {
        get;
        private set;
    }

    public string? ActorRole
    {
        get;
        private set;
    }

    public string HttpMethod
    {
        get;
        private set;
    } = string.Empty;

    public string RequestPath
    {
        get;
        private set;
    } = string.Empty;

    public string ActionName
    {
        get;
        private set;
    } = string.Empty;

    public string? EntityType
    {
        get;
        private set;
    }

    public string? EntityId
    {
        get;
        private set;
    }

    public int StatusCode
    {
        get;
        private set;
    }

    public bool WasSuccessful
    {
        get;
        private set;
    }

    public string? IpAddress
    {
        get;
        private set;
    }

    public string? UserAgent
    {
        get;
        private set;
    }

    public string TraceId
    {
        get;
        private set;
    } = string.Empty;

    public string? FailureType
    {
        get;
        private set;
    }

    private static string NormalizeRequired(
        string value,
        string parameterName,
        int maximumLength)
    {
        ArgumentNullException.ThrowIfNull(value);

        var normalized = value.Trim();

        if (normalized.Length == 0)
        {
            throw new ArgumentException(
                "La valeur ne peut pas être vide.",
                parameterName);
        }

        if (normalized.Length > maximumLength)
        {
            normalized =
                normalized[..maximumLength];
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
