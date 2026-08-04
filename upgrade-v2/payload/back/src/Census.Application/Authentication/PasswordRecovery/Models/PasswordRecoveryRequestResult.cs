namespace Census.Application.Authentication.PasswordRecovery.Models;

public sealed record PasswordRecoveryRequestResult(
    string Message,
    DateTimeOffset? ExpiresAtUtc,
    string? DevelopmentOtp);
