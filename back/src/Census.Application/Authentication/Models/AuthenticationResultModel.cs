namespace Census.Application.Authentication.Models;

public sealed record AuthenticationResultModel(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    AuthenticatedUserDto User);
