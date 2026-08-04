namespace Census.Application.Authentication.PasswordRecovery.Models;

public sealed record PasswordRecoveryVerificationResult(
    string ResetToken,
    DateTimeOffset ExpiresAtUtc);
