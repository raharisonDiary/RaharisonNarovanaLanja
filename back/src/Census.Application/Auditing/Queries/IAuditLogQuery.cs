using Census.Application.Auditing.Models;
using Census.Application.Common.Models;

namespace Census.Application.Auditing.Queries;

public interface IAuditLogQuery
{
    Task<PagedResult<AuditLogDto>> GetAsync(
        AuditLogQueryModel query,
        CancellationToken cancellationToken);
}
