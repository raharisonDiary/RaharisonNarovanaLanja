using Census.Api.Common.Auth;
using Census.Api.Contracts.Common;
using Census.Api.Contracts.Households;
using Census.Application.Authorization;
using Census.Application.FieldWork.Security;
using Census.Application.Households.Models;
using Census.Application.Households.Services;
using Census.Domain.Households;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(
    Policy = AuthorizationPolicies.AccessRegionalData)]
[Route("api/v1/households")]
public sealed class HouseholdsController(
    IHouseholdService service)
    : ControllerBase
{
    private const string GetByIdRouteName =
        "GetHouseholdById";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<HouseholdDto>>>
        GetAllAsync(
            [FromQuery] Guid? campaignId,
            [FromQuery] Guid? dwellingId,
            [FromQuery] HouseholdRecordStatus? recordStatus,
            [FromQuery] HouseholdType? householdType,
            [FromQuery] Guid? createdByUserId,
            [FromQuery] string? search,
            CancellationToken cancellationToken)
    {
        var query = new HouseholdQueryModel(
            campaignId,
            dwellingId,
            recordStatus,
            householdType,
            createdByUserId,
            search);

        return Ok(
            await service.GetAllAsync(
                query,
                cancellationToken));
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    public async Task<ActionResult<HouseholdDto>>
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
    public async Task<ActionResult<HouseholdDto>>
        CreateAsync(
            [FromBody] CreateHouseholdRequest request,
            CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(
            new CreateHouseholdModel(
                request.DwellingId!.Value,
                request.ReferenceCode,
                request.HouseholdType,
                request.HeadFullName,
                request.PhoneNumber,
                request.Notes),
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
    public async Task<ActionResult<HouseholdDto>>
        UpdateAsync(
            Guid id,
            [FromBody] UpdateHouseholdRequest request,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.UpdateAsync(
                id,
                new UpdateHouseholdModel(
                    request.HouseholdType,
                    request.HeadFullName,
                    request.PhoneNumber,
                    request.Notes),
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpPatch("{id:guid}/submit")]
    public async Task<ActionResult<HouseholdDto>>
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
    public async Task<ActionResult<HouseholdDto>>
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
    public async Task<ActionResult<HouseholdDto>>
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
