using Census.Application.Auditing.Models;
using Census.Application.Auditing.Services;
using Census.Domain.Auditing;
using Census.Infrastructure.Persistence;

namespace Census.Infrastructure.Auditing;

public sealed class AuditLogWriter(
    CensusDbContext dbContext)
    : IAuditLogWriter
{
    public async Task WriteAsync(
        AuditRecordModel record,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(record);

        var auditLog =
            new AuditLog(
                record.OccurredAtUtc,
                record.ActorUserId,
                record.ActorEmail,
                record.ActorRole,
                record.HttpMethod,
                record.RequestPath,
                record.ActionName,
                record.EntityType,
                record.EntityId,
                record.StatusCode,
                record.IpAddress,
                record.UserAgent,
                record.TraceId,
                record.FailureType);

        await dbContext
            .Set<AuditLog>()
            .AddAsync(
                auditLog,
                cancellationToken);

        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
