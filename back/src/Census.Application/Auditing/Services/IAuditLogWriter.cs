using Census.Application.Auditing.Models;

namespace Census.Application.Auditing.Services;

public interface IAuditLogWriter
{
    Task WriteAsync(
        AuditRecordModel record,
        CancellationToken cancellationToken);
}
