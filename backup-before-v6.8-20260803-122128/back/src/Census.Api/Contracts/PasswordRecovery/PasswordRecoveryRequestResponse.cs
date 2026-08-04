namespace Census.Api.Contracts.PasswordRecovery;

public sealed record PasswordRecoveryRequestResponse(
    string Message,
    DateTimeOffset? ExpiresAtUtc,
    string? DevelopmentOtp);
