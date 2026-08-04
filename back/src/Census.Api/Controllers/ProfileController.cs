using Census.Api.Common.Auth;
using Census.Api.Contracts.Users;
using Census.Application.Users.Models;
using Census.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/profile")]
public sealed class ProfileController(IApplicationUserService service)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApplicationUserDto>> GetAsync(
        CancellationToken cancellationToken)
    {
        return Ok(await service.GetByIdAsync(
            CurrentUserId.GetRequired(User),
            cancellationToken));
    }

    [HttpPut]
    public async Task<ActionResult<ApplicationUserDto>> UpdateAsync(
        [FromBody] UpdateApplicationUserProfileRequest request,
        CancellationToken cancellationToken)
    {
        var model = new UpdateApplicationUserProfileModel(
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber);
        return Ok(await service.UpdateProfileAsync(
            CurrentUserId.GetRequired(User),
            model,
            cancellationToken));
    }
}
