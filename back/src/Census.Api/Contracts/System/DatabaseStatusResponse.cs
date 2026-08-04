namespace Census.Api.Contracts.System;

public sealed record DatabaseStatusResponse(
    string Database,
    string Provider,
    string Status);
