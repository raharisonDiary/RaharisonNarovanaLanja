using Census.Application.Auditing.Models;
using Census.Application.Auditing.Queries;
using Census.Application.Common.Models;
using Census.Domain.Auditing;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Auditing;

public sealed class AuditLogQuery(
    CensusDbContext dbContext)
    : IAuditLogQuery
{
    public async Task<PagedResult<AuditLogDto>> GetAsync(
        AuditLogQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 200);

        IQueryable<AuditLog> source =
            dbContext.AuditLogs
                .AsNoTracking();

        if (query.FromUtc.HasValue)
        {
            source = source.Where(
                log => log.OccurredAtUtc >= query.FromUtc.Value);
        }

        if (query.ToUtc.HasValue)
        {
            source = source.Where(
                log => log.OccurredAtUtc <= query.ToUtc.Value);
        }

        if (query.ActorUserId.HasValue)
        {
            source = source.Where(
                log => log.ActorUserId == query.ActorUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.ActionName))
        {
            var action = query.ActionName.Trim();
            source = source.Where(
                log => EF.Functions.ILike(
                    log.ActionName,
                    $"%{action}%"));
        }

        if (query.WasSuccessful.HasValue)
        {
            source = source.Where(
                log => log.WasSuccessful == query.WasSuccessful.Value);
        }

        var totalCount = await source.CountAsync(
            cancellationToken);

        var items = await source
            .OrderByDescending(log => log.OccurredAtUtc)
            .ThenByDescending(log => log.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(log => new AuditLogDto(
                log.Id,
                log.OccurredAtUtc,
                log.ActorUserId,
                log.ActorEmail,
                log.ActorRole,
                log.HttpMethod,
                log.RequestPath,
                log.ActionName,
                log.EntityType,
                log.EntityId,
                log.StatusCode,
                log.WasSuccessful,
                log.IpAddress,
                log.UserAgent,
                log.TraceId,
                log.FailureType))
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>(
            items,
            page,
            pageSize,
            totalCount);
    }
}
