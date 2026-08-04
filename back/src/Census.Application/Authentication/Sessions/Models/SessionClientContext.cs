namespace Census.Application.Authentication.Sessions.Models;

public sealed record SessionClientContext(
    string? IpAddress,
    string? UserAgent,
    string? DeviceName);
