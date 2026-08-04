namespace Census.Infrastructure.Authentication.PasswordRecovery;

public sealed class PasswordRecoveryOptions
{
    public const string SectionName = "PasswordRecovery";

    public int OtpLifetimeMinutes { get; init; } = 10;
    public int ResetTokenLifetimeMinutes { get; init; } = 15;
    public int MaximumVerificationAttempts { get; init; } = 5;

    public bool IsValid() =>
        OtpLifetimeMinutes is >= 2 and <= 30 &&
        ResetTokenLifetimeMinutes is >= 5 and <= 60 &&
        MaximumVerificationAttempts is >= 3 and <= 10;
}
