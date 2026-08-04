using Census.Application.Dashboard;
using Census.Application.FieldWork.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(
    Policy =
        FieldAuthorizationPolicies.ViewCensusDashboard)]
[Route("api/v1/dashboard")]
public sealed class CensusDashboardController(
    ICensusDashboardQuery dashboardQuery)
    : ControllerBase
{
    [HttpGet("campaigns/{campaignId:guid}")]
    public async Task<ActionResult<CensusDashboardDto>>
        GetCampaignDashboardAsync(
            Guid campaignId,
            CancellationToken cancellationToken)
    {
        return Ok(
            await dashboardQuery.GetAsync(
                campaignId,
                cancellationToken));
    }
}
