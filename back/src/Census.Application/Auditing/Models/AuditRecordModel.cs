namespace Census.Application.Auditing.Models;

public sealed record AuditRecordModel(
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
    string? IpAddress,
    string? UserAgent,
    string TraceId,
    string? FailureType);
