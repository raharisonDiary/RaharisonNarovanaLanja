using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Census.Api.Contracts.Authentication;
using Census.Application.Authentication.Models;
using Census.Application.Authentication.Services;
using Census.Application.Common.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthenticationController(
    IAuthenticationService authenticationService)
    : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType<LoginResponse>(
        StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>>
        LoginAsync(
            [FromBody] LoginRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await authenticationService.LoginAsync(
                new LoginModel(
                    request.Email,
                    request.Password),
                cancellationToken);

        return Ok(
            new LoginResponse(
                result.AccessToken,
                TokenType: "Bearer",
                result.ExpiresAtUtc,
                MapUser(result.User)));
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType<AuthenticatedUserResponse>(
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    public async Task<
        ActionResult<AuthenticatedUserResponse>>
        GetCurrentUserAsync(
            CancellationToken cancellationToken)
    {
        var subject =
            User.FindFirstValue(
                JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(
                subject,
                out var userId))
        {
            throw new AuthenticationFailedException(
                "Le jeton d’accès est invalide.");
        }

        var user =
            await authenticationService
                .GetCurrentUserAsync(
                    userId,
                    cancellationToken);

        return Ok(MapUser(user));
    }

    private static AuthenticatedUserResponse MapUser(
        AuthenticatedUserDto user)
    {
        return new AuthenticatedUserResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.AdministrativeAreaId,
            user.IsActive,
            user.LastLoginAtUtc);
    }
}
