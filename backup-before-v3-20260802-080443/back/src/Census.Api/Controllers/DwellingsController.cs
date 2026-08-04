using Census.Api.Common.Auth;
using Census.Api.Contracts.Common;
using Census.Api.Contracts.Dwellings;
using Census.Application.Authorization;
using Census.Application.Dwellings.Models;
using Census.Application.Dwellings.Services;
using Census.Application.FieldWork.Security;
using Census.Domain.Dwellings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(
    Policy = AuthorizationPolicies.AccessRegionalData)]
[Route("api/v1/dwellings")]
public sealed class DwellingsController(
    IDwellingService service)
    : ControllerBase
{
    private const string GetByIdRouteName =
        "GetDwellingById";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DwellingDto>>>
        GetAllAsync(
            [FromQuery] Guid? campaignId,
            [FromQuery] Guid? enumerationAreaId,
            [FromQuery] DwellingRecordStatus? recordStatus,
            [FromQuery] DwellingOccupancyStatus? occupancyStatus,
            [FromQuery] Guid? createdByUserId,
            [FromQuery] string? search,
            CancellationToken cancellationToken)
    {
        var query = new DwellingQueryModel(
            campaignId,
            enumerationAreaId,
            recordStatus,
            occupancyStatus,
            createdByUserId,
            search);

        return Ok(
            await service.GetAllAsync(
                query,
                cancellationToken));
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    public async Task<ActionResult<DwellingDto>>
        GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.GetByIdAsync(
                id,
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpPost]
    public async Task<ActionResult<DwellingDto>>
        CreateAsync(
            [FromBody] CreateDwellingRequest request,
            CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(
            new CreateDwellingModel(
                request.CampaignId!.Value,
                request.EnumerationAreaId!.Value,
                request.ReferenceCode,
                request.Address,
                request.LocalityName,
                request.Latitude,
                request.Longitude),
            CurrentUserId.GetRequired(User),
            cancellationToken);

        return CreatedAtRoute(
            GetByIdRouteName,
            new { id = result.Id },
            result);
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DwellingDto>>
        UpdateAsync(
            Guid id,
            [FromBody] UpdateDwellingRequest request,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.UpdateAsync(
                id,
                new UpdateDwellingModel(
                    request.Address,
                    request.LocalityName,
                    request.Latitude,
                    request.Longitude,
                    request.OccupancyStatus,
                    request.Notes),
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpPatch("{id:guid}/submit")]
    public async Task<ActionResult<DwellingDto>>
        SubmitAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.SubmitAsync(
                id,
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ValidateFieldData)]
    [HttpPatch("{id:guid}/validate")]
    public async Task<ActionResult<DwellingDto>>
        ValidateAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.ValidateAsync(
                id,
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ValidateFieldData)]
    [HttpPatch("{id:guid}/reject")]
    public async Task<ActionResult<DwellingDto>>
        RejectAsync(
            Guid id,
            [FromBody] RejectRecordRequest request,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.RejectAsync(
                id,
                request.Reason,
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        await service.DeleteAsync(
            id,
            CurrentUserId.GetRequired(User),
            cancellationToken);

        return NoContent();
    }
}
