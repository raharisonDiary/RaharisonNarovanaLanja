using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Census.Api.Contracts.Users;
using Census.Application.Authorization;
using Census.Application.Common.Exceptions;
using Census.Application.Users.Models;
using Census.Application.Users.Services;
using Census.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.ManageUsers)]
[Route("api/v1/users")]
public sealed class ApplicationUsersController(
    IApplicationUserService service)
    : ControllerBase
{
    private const string GetByIdRouteName =
        "GetApplicationUserById";

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ApplicationUserDto>>>
        GetAllAsync(
            [FromQuery] UserRole? role,
            [FromQuery] Guid? administrativeAreaId,
            [FromQuery] bool? isActive,
            [FromQuery] string? search,
            CancellationToken cancellationToken)
    {
        var query = new ApplicationUserQueryModel(
            role,
            administrativeAreaId,
            isActive,
            search);

        var users = await service.GetAllAsync(
            query,
            cancellationToken);

        return Ok(users);
    }

    [HttpGet("{id:guid}", Name = GetByIdRouteName)]
    public async Task<ActionResult<ApplicationUserDto>>
        GetByIdAsync(
            Guid id,
            CancellationToken cancellationToken)
    {
        var user = await service.GetByIdAsync(
            id,
            cancellationToken);

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationUserDto>>
        CreateAsync(
            [FromBody] CreateApplicationUserRequest request,
            CancellationToken cancellationToken)
    {
        var model = new CreateApplicationUserModel(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber,
            request.Password,
            request.Role,
            request.AdministrativeAreaId);

        var user = await service.CreateAsync(
            model,
            cancellationToken);

        return CreatedAtRoute(
            GetByIdRouteName,
            new { id = user.Id },
            user);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApplicationUserDto>>
        UpdateProfileAsync(
            Guid id,
            [FromBody] UpdateApplicationUserProfileRequest request,
            CancellationToken cancellationToken)
    {
        var model = new UpdateApplicationUserProfileModel(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber);

        var user = await service.UpdateProfileAsync(
            id,
            model,
            cancellationToken);

        return Ok(user);
    }

    [HttpPatch("{id:guid}/access")]
    public async Task<ActionResult<ApplicationUserDto>>
        UpdateAccessAsync(
            Guid id,
            [FromBody] UpdateApplicationUserAccessRequest request,
            CancellationToken cancellationToken)
    {
        var model = new UpdateApplicationUserAccessModel(
            request.Role,
            request.AdministrativeAreaId);

        var user = await service.UpdateAccessAsync(
            id,
            model,
            GetCurrentUserId(),
            cancellationToken);

        return Ok(user);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApplicationUserDto>>
        SetStatusAsync(
            Guid id,
            [FromBody] SetApplicationUserStatusRequest request,
            CancellationToken cancellationToken)
    {
        var user = await service.SetActiveStatusAsync(
            id,
            request.IsActive!.Value,
            GetCurrentUserId(),
            cancellationToken);

        return Ok(user);
    }

    [HttpPatch("{id:guid}/password")]
    public async Task<IActionResult> ResetPasswordAsync(
        Guid id,
        [FromBody] ResetApplicationUserPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await service.ResetPasswordAsync(
            id,
            request.NewPassword,
            cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        await service.DeleteAsync(
            id,
            GetCurrentUserId(),
            cancellationToken);

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var subject = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(subject, out var userId))
        {
            throw new AuthenticationFailedException(
                "Le jeton d’accès est invalide.");
        }

        return userId;
    }
}
