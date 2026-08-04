namespace Census.Api.Contracts.System;

public sealed record SystemStatusResponse(
    string Application,
    string Environment,
    string Status,
    DateTimeOffset ServerTimeUtc);
