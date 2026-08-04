namespace Census.Infrastructure.Authentication.Sessions;

public sealed class UserSessionOptions
{
    public const string SectionName =
        "AuthenticationSessions";

    public int RefreshTokenLifetimeDays { get; init; } =
        30;

    public int MaximumActiveSessionsPerUser
    {
        get;
        init;
    } = 5;

    public bool IsValid()
    {
        return RefreshTokenLifetimeDays is >= 1 and <= 365 &&
               MaximumActiveSessionsPerUser is >= 1 and <= 50;
    }
}
