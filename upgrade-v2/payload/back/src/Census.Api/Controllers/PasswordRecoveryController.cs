using Census.Api.Contracts.PasswordRecovery;
using Census.Application.Authentication.PasswordRecovery.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Census.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/password-recovery")]
public sealed class PasswordRecoveryController(
    IPasswordRecoveryService passwordRecoveryService)
    : ControllerBase
{
    [HttpPost("request")]
    public async Task<ActionResult<PasswordRecoveryRequestResponse>> RequestAsync(
        [FromBody] RequestPasswordRecoveryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await passwordRecoveryService.RequestCodeAsync(
            request.Email,
            cancellationToken);

        return Ok(new PasswordRecoveryRequestResponse(
            result.Message,
            result.ExpiresAtUtc,
            result.DevelopmentOtp));
    }

    [HttpPost("verify")]
    public async Task<ActionResult<PasswordRecoveryVerificationResponse>> VerifyAsync(
        [FromBody] VerifyPasswordRecoveryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await passwordRecoveryService.VerifyCodeAsync(
            request.Email,
            request.Code,
            cancellationToken);

        return Ok(new PasswordRecoveryVerificationResponse(
            result.ResetToken,
            result.ExpiresAtUtc));
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetAsync(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await passwordRecoveryService.ResetPasswordAsync(
            request.Email,
            request.ResetToken,
            request.NewPassword,
            cancellationToken);

        return NoContent();
    }
}
