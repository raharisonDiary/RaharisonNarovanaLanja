namespace Census.Application.Auditing.Models;

public sealed record AuditLogQueryModel(
    DateTimeOffset? FromUtc = null,
    DateTimeOffset? ToUtc = null,
    Guid? ActorUserId = null,
    string? ActionName = null,
    bool? WasSuccessful = null,
    int Page = 1,
    int PageSize = 50);
