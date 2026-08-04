using Census.Api.Contracts.System;
using Census.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Census.Api.Controllers;

[ApiController]
[Route("api/v1/system")]
public sealed class SystemController(
    IHostEnvironment environment,
    CensusDbContext dbContext) : ControllerBase
{
    [HttpGet("status")]
    [ProducesResponseType<SystemStatusResponse>(
        StatusCodes.Status200OK)]
    public ActionResult<SystemStatusResponse> GetStatus()
    {
        var response = new SystemStatusResponse(
            Application: "Census API",
            Environment: environment.EnvironmentName,
            Status: "Healthy",
            ServerTimeUtc: DateTimeOffset.UtcNow);

        return Ok(response);
    }

    [HttpGet("database")]
    [ProducesResponseType<DatabaseStatusResponse>(
        StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(
        StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<DatabaseStatusResponse>>
        GetDatabaseStatusAsync(
            CancellationToken cancellationToken)
    {
        var canConnect = await dbContext.Database.CanConnectAsync(
            cancellationToken);

        if (!canConnect)
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Base de données indisponible.",
                detail: "L’API ne parvient pas à se connecter à PostgreSQL.");
        }

        var response = new DatabaseStatusResponse(
            Database: "census_db",
            Provider: dbContext.Database.ProviderName
                ?? "Unknown",
            Status: "Connected");

        return Ok(response);
    }
}
