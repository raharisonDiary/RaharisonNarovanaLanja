namespace Census.Api.Contracts.PasswordRecovery;

public sealed record PasswordRecoveryVerificationResponse(
    string ResetToken,
    DateTimeOffset ExpiresAtUtc);
