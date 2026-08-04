using Census.Application.Auditing.Models;
using Census.Application.Auditing.Queries;
using Census.Application.Authorization;
using Census.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.AccessNationalData)]
[Route("api/v1/audit-logs")]
public sealed class AuditLogsController(
    IAuditLogQuery query)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AuditLogDto>>>
        GetAsync(
            [FromQuery] DateTimeOffset? fromUtc,
            [FromQuery] DateTimeOffset? toUtc,
            [FromQuery] Guid? actorUserId,
            [FromQuery] string? actionName,
            [FromQuery] bool? wasSuccessful,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
    {
        var result = await query.GetAsync(
            new AuditLogQueryModel(
                fromUtc,
                toUtc,
                actorUserId,
                actionName,
                wasSuccessful,
                page,
                pageSize),
            cancellationToken);

        return Ok(result);
    }
}
