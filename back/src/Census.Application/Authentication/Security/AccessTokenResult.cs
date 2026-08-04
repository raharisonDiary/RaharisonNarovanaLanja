namespace Census.Application.Authentication.Security;

public sealed record AccessTokenResult(
    string Token,
    DateTimeOffset ExpiresAtUtc);
