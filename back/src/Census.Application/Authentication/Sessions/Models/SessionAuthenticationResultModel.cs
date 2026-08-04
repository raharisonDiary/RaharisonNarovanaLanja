namespace Census.Application.Authentication.Sessions.Models;

public sealed record SessionAuthenticationResultModel(
    string AccessToken,
    string TokenType,
    DateTimeOffset AccessTokenExpiresAtUtc,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc,
    SessionUserDto User);
