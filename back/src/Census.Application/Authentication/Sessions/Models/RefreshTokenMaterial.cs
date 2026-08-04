namespace Census.Application.Authentication.Sessions.Models;

public sealed record RefreshTokenMaterial(
    string PlainTextToken,
    string TokenHash);
