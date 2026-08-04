namespace Census.Application.Authentication.Sessions.Models;

public sealed record SessionAccessTokenResult(
    string Token,
    DateTimeOffset ExpiresAtUtc);
