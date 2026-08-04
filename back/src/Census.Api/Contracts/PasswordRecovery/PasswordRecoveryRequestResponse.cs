using Census.Application.Authentication.PasswordRecovery.Models;

namespace Census.Api.Contracts.PasswordRecovery;

public sealed record PasswordRecoveryRequestResponse(
    string Message,
    DateTimeOffset? ExpiresAtUtc,
    PasswordRecoveryChannel Channel);
