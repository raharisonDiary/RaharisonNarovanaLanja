using Census.Api.Contracts.AdministrativeAreas;
using Census.Application.AdministrativeAreas.Models;
using Census.Application.AdministrativeAreas.Services;
using Census.Application.Authorization;
using Census.Domain.AdministrativeAreas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/administrative-areas")]
public sealed class AdministrativeAreasController(
    IAdministrativeAreaService service) : ControllerBase
{
    private const string GetByIdRouteName =
        "GetAdministrativeAreaById";

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<AdministrativeAreaDto>>(
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<AdministrativeAreaDto>>>
        GetAllAsync(
            [FromQuery] AdministrativeAreaType? type,
            [FromQuery] Guid? parentId,
            [FromQuery] bool rootOnly = false,
            [FromQuery] bool includeInactive = false,
            CancellationToken cancellationToken = default)
    {
        var query = new AdministrativeAreaQueryModel(
            Type: type,
            ParentId: parentId,
            RootOnly: rootOnly,
            IncludeInactive: includeInactive);

        var areas = await service.GetAllAsync(
            query,
            cancellationToken);

        return Ok(areas);
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    [ProducesResponseType<AdministrativeAreaDto>(
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdministrativeAreaDto>>
        GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        var area = await service.GetByIdAsync(
            id,
            cancellationToken);

        return Ok(area);
    }

    [Authorize(
        Policy =
            AuthorizationPolicies.ManageAdministrativeAreas)]
    [HttpPost]
    [ProducesResponseType<AdministrativeAreaDto>(
        StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdministrativeAreaDto>>
        CreateAsync(
            [FromBody] CreateAdministrativeAreaRequest request,
            CancellationToken cancellationToken)
    {
        var model = new CreateAdministrativeAreaModel(
            request.Code,
            request.Name,
            request.Type,
            request.ParentId);

        var createdArea = await service.CreateAsync(
            model,
            cancellationToken);

        return CreatedAtRoute(
            GetByIdRouteName,
            new { id = createdArea.Id },
            createdArea);
    }

    [Authorize(
        Policy =
            AuthorizationPolicies.ManageAdministrativeAreas)]
    [HttpPut("{id:guid}")]
    [ProducesResponseType<AdministrativeAreaDto>(
        StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AdministrativeAreaDto>>
        UpdateAsync(
            Guid id,
            [FromBody] UpdateAdministrativeAreaRequest request,
            CancellationToken cancellationToken)
    {
        var model = new UpdateAdministrativeAreaModel(
            request.Code,
            request.Name);

        var updatedArea = await service.UpdateAsync(
            id,
            model,
            cancellationToken);

        return Ok(updatedArea);
    }

    [Authorize(
        Policy =
            AuthorizationPolicies.ManageAdministrativeAreas)]
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType<AdministrativeAreaDto>(
        StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdministrativeAreaDto>>
        SetStatusAsync(
            Guid id,
            [FromBody] SetAdministrativeAreaStatusRequest request,
            CancellationToken cancellationToken)
    {
        var updatedArea =
            await service.SetActiveStatusAsync(
                id,
                request.IsActive!.Value,
                cancellationToken);

        return Ok(updatedArea);
    }

    [Authorize(
        Policy =
            AuthorizationPolicies.ManageAdministrativeAreas)]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status409Conflict)]
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
