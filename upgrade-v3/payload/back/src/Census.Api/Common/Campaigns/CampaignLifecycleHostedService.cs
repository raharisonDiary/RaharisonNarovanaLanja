using Census.Domain.Campaigns;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Api.Common.Campaigns;

public sealed class CampaignLifecycleHostedService(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<CampaignLifecycleHostedService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        await UpdateCampaignsAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await UpdateCampaignsAsync(stoppingToken);
        }
    }

    private async Task UpdateCampaignsAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var dbContext = scope.ServiceProvider
                .GetRequiredService<CensusDbContext>();
            var today = DateOnly.FromDateTime(
                timeProvider.GetUtcNow().UtcDateTime);
            var candidates = await dbContext.CensusCampaigns
                .Where(campaign =>
                    campaign.Status == CensusCampaignStatus.Scheduled ||
                    campaign.Status == CensusCampaignStatus.Active)
                .ToListAsync(cancellationToken);
            var now = timeProvider.GetUtcNow();
            var changed = false;

            foreach (var campaign in candidates)
            {
                if (campaign.Status == CensusCampaignStatus.Scheduled &&
                    today > campaign.EndDate)
                {
                    campaign.ChangeStatus(CensusCampaignStatus.Closed, now);
                    changed = true;
                }
                else if (campaign.Status == CensusCampaignStatus.Scheduled &&
                         today >= campaign.StartDate)
                {
                    campaign.ChangeStatus(CensusCampaignStatus.Active, now);
                    changed = true;
                }
                else if (campaign.Status == CensusCampaignStatus.Active &&
                         today > campaign.EndDate)
                {
                    campaign.ChangeStatus(CensusCampaignStatus.Closed, now);
                    changed = true;
                }
            }

            if (changed)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
            when (cancellationToken.IsCancellationRequested)
        {
            // Arrêt normal du service.
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "La mise à jour automatique des campagnes a échoué.");
        }
    }
}
