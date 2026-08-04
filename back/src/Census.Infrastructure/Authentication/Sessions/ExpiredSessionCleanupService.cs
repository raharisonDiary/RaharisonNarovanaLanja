using Census.Domain.Authentication;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Census.Infrastructure.Authentication.Sessions;

public sealed class ExpiredSessionCleanupService(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<ExpiredSessionCleanupService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval =
        TimeSpan.FromHours(6);

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        await CleanupAsync(stoppingToken);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await CleanupAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException)
            when (stoppingToken.IsCancellationRequested)
        {
            // Arrêt normal de l'application.
        }
    }

    private async Task CleanupAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var dbContext = scope.ServiceProvider
                .GetRequiredService<CensusDbContext>();

            var now = timeProvider.GetUtcNow();
            var expiredBefore = now.AddDays(-30);
            var revokedBefore = now.AddDays(-90);

            var deleted = await dbContext
                .Set<UserSession>()
                .IgnoreQueryFilters()
                .Where(session =>
                    (session.ExpiresAtUtc < expiredBefore ||
                     (session.RevokedAtUtc != null &&
                      session.RevokedAtUtc < revokedBefore)) &&
                    !dbContext.Set<UserSession>()
                        .IgnoreQueryFilters()
                        .Any(other =>
                            other.ReplacedBySessionId == session.Id))
                .ExecuteDeleteAsync(cancellationToken);

            if (deleted > 0)
            {
                logger.LogInformation(
                    "{DeletedCount} session(s) expirée(s) supprimée(s).",
                    deleted);
            }
        }
        catch (OperationCanceledException)
            when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Échec du nettoyage automatique des sessions.");
        }
    }
}
