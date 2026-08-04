using Census.Api.Contracts.Campaigns;
using Census.Application.Authorization;
using Census.Application.Campaigns.Models;
using Census.Application.Campaigns.Services;
using Census.Domain.Campaigns;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(
    Policy = AuthorizationPolicies.AccessRegionalData)]
[Route("api/v1/campaigns")]
public sealed class CensusCampaignsController(
    ICensusCampaignService service)
    : ControllerBase
{
    private const string GetByIdRouteName =
        "GetCensusCampaignById";

    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyList<CensusCampaignDto>>>
        GetAllAsync(
            [FromQuery] CensusCampaignStatus? status,
            [FromQuery] Guid? scopeAdministrativeAreaId,
            [FromQuery] string? search,
            [FromQuery] DateOnly? startsOnOrAfter,
            [FromQuery] DateOnly? endsOnOrBefore,
            CancellationToken cancellationToken)
    {
        var query = new CensusCampaignQueryModel(
            status,
            scopeAdministrativeAreaId,
            search,
            startsOnOrAfter,
            endsOnOrBefore);

        var campaigns = await service.GetAllAsync(
            query,
            cancellationToken);

        return Ok(campaigns);
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    public async Task<ActionResult<CensusCampaignDto>>
        GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        var campaign = await service.GetByIdAsync(
            id,
            cancellationToken);

        return Ok(campaign);
    }

    [Authorize(
        Policy = AuthorizationPolicies.ManageCampaigns)]
    [HttpPost]
    public async Task<ActionResult<CensusCampaignDto>>
        CreateAsync(
            [FromBody] CreateCensusCampaignRequest request,
            CancellationToken cancellationToken)
    {
        var model = new CreateCensusCampaignModel(
            request.Code,
            request.Name,
            request.Description,
            request.StartDate!.Value,
            request.EndDate!.Value,
            request.ScopeAdministrativeAreaId!.Value);

        var campaign = await service.CreateAsync(
            model,
            cancellationToken);

        return CreatedAtRoute(
            GetByIdRouteName,
            new { id = campaign.Id },
            campaign);
    }

    [Authorize(
        Policy = AuthorizationPolicies.ManageCampaigns)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CensusCampaignDto>>
        UpdateAsync(
            Guid id,
            [FromBody] UpdateCensusCampaignRequest request,
            CancellationToken cancellationToken)
    {
        var model = new UpdateCensusCampaignModel(
            request.Code,
            request.Name,
            request.Description,
            request.StartDate!.Value,
            request.EndDate!.Value,
            request.ScopeAdministrativeAreaId!.Value);

        var campaign = await service.UpdateAsync(
            id,
            model,
            cancellationToken);

        return Ok(campaign);
    }

    [Authorize(
        Policy = AuthorizationPolicies.ManageCampaigns)]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<CensusCampaignDto>>
        ChangeStatusAsync(
            Guid id,
            [FromBody] ChangeCensusCampaignStatusRequest request,
            CancellationToken cancellationToken)
    {
        var campaign = await service.ChangeStatusAsync(
            id,
            request.Status!.Value,
            cancellationToken);

        return Ok(campaign);
    }

    [Authorize(
        Policy = AuthorizationPolicies.ManageCampaigns)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        await service.DeleteAsync(
            id,
            cancellationToken);

        return NoContent();
    }
}
