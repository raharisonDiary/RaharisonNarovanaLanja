namespace Census.Application.Auditing.Models;

public sealed record AuditLogDto(
    Guid Id,
    DateTimeOffset OccurredAtUtc,
    Guid? ActorUserId,
    string? ActorEmail,
    string? ActorRole,
    string HttpMethod,
    string RequestPath,
    string ActionName,
    string? EntityType,
    string? EntityId,
    int StatusCode,
    bool WasSuccessful,
    string? IpAddress,
    string? UserAgent,
    string TraceId,
    string? FailureType);
