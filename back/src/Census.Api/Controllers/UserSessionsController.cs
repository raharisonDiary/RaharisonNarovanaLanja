using Census.Api.Common.Auth;
using Census.Api.Contracts.Sessions;
using Census.Application.Authentication.Sessions.Models;
using Census.Application.Authentication.Sessions.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[Route("api/v1/sessions")]
public sealed class UserSessionsController(
    IUserSessionService sessionService)
    : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<
        ActionResult<SessionAuthenticationResultModel>>
        LoginAsync(
            [FromBody] SessionLoginRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await sessionService.LoginAsync(
                request.Email,
                request.Password,
                CreateClientContext(
                    request.DeviceName),
                cancellationToken);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<
        ActionResult<SessionAuthenticationResultModel>>
        RefreshAsync(
            [FromBody] RefreshSessionRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await sessionService.RefreshAsync(
                request.RefreshToken,
                CreateClientContext(
                    request.DeviceName),
                cancellationToken);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync(
        [FromBody] LogoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        await sessionService.LogoutAsync(
            request.RefreshToken,
            CreateClientContext(
                deviceName: null),
            cancellationToken);

        return NoContent();
    }

    [Authorize]
    [HttpPost("logout-all")]
    public async Task<IActionResult> LogoutAllAsync(
        CancellationToken cancellationToken)
    {
        await sessionService.LogoutAllAsync(
            CurrentUserId.GetRequired(User),
            CreateClientContext(
                deviceName: null),
            cancellationToken);

        return NoContent();
    }

    private SessionClientContext CreateClientContext(
        string? deviceName)
    {
        var ipAddress =
            HttpContext.Connection
                .RemoteIpAddress?
                .ToString();

        var userAgent =
            Request.Headers.UserAgent.ToString();

        return new SessionClientContext(
            ipAddress,
            userAgent,
            deviceName);
    }
}
