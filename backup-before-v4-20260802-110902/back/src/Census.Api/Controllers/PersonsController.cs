using Census.Api.Common.Auth;
using Census.Api.Contracts.Common;
using Census.Api.Contracts.Persons;
using Census.Application.Authorization;
using Census.Application.FieldWork.Security;
using Census.Application.Persons.Models;
using Census.Application.Persons.Services;
using Census.Domain.Persons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(
    Policy = AuthorizationPolicies.AccessRegionalData)]
[Route("api/v1/persons")]
public sealed class PersonsController(
    IPersonService service)
    : ControllerBase
{
    private const string GetByIdRouteName =
        "GetPersonById";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PersonDto>>>
        GetAllAsync(
            [FromQuery] Guid? campaignId,
            [FromQuery] Guid? householdId,
            [FromQuery] PersonRecordStatus? recordStatus,
            [FromQuery] PersonSex? sex,
            [FromQuery] Guid? createdByUserId,
            [FromQuery] string? search,
            CancellationToken cancellationToken)
    {
        var query = new PersonQueryModel(
            campaignId,
            householdId,
            recordStatus,
            sex,
            createdByUserId,
            search);

        return Ok(
            await service.GetAllAsync(
                query,
                cancellationToken));
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    public async Task<ActionResult<PersonDto>>
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
    public async Task<ActionResult<PersonDto>>
        CreateAsync(
            [FromBody] CreatePersonRequest request,
            CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(
            new CreatePersonModel(
                request.HouseholdId!.Value,
                request.PersonNumber,
                request.FirstName,
                request.LastName,
                request.Sex,
                request.DateOfBirth,
                request.AgeYears,
                request.RelationshipToHead,
                request.MaritalStatus,
                request.Nationality,
                request.Occupation,
                request.PhoneNumber,
                request.NationalId),
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
    public async Task<ActionResult<PersonDto>>
        UpdateAsync(
            Guid id,
            [FromBody] UpdatePersonRequest request,
            CancellationToken cancellationToken)
    {
        return Ok(
            await service.UpdateAsync(
                id,
                new UpdatePersonModel(
                    request.FirstName,
                    request.LastName,
                    request.Sex,
                    request.DateOfBirth,
                    request.AgeYears,
                    request.RelationshipToHead,
                    request.MaritalStatus,
                    request.Nationality,
                    request.Occupation,
                    request.PhoneNumber,
                    request.NationalId,
                    request.Notes),
                CurrentUserId.GetRequired(User),
                cancellationToken));
    }

    [Authorize(
        Policy =
            FieldAuthorizationPolicies.ManageFieldData)]
    [HttpPatch("{id:guid}/submit")]
    public async Task<ActionResult<PersonDto>>
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
    public async Task<ActionResult<PersonDto>>
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
    public async Task<ActionResult<PersonDto>>
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
