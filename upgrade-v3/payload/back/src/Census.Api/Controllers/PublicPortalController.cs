using Census.Domain.Campaigns;
using Census.Domain.Households;
using Census.Domain.Persons;
using Census.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Census.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/public")]
public sealed class PublicPortalController(CensusDbContext dbContext)
    : ControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult<PublicOverviewResponse>> GetOverviewAsync(
        CancellationToken cancellationToken)
    {
        var completedStatuses = new[]
        {
            CensusCampaignStatus.Closed,
            CensusCampaignStatus.Archived
        };

        var completed = dbContext.CensusCampaigns
            .AsNoTracking()
            .Where(campaign => completedStatuses.Contains(campaign.Status));

        var latest = await completed
            .OrderByDescending(campaign => campaign.EndDate)
            .Take(6)
            .Select(campaign => new PublicCampaignSummary(
                campaign.Id,
                campaign.Name,
                campaign.StartDate,
                campaign.EndDate,
                campaign.Status.ToString()))
            .ToListAsync(cancellationToken);

        var campaignIds = latest.Select(value => value.Id).ToArray();
        var households = await dbContext.Households
            .AsNoTracking()
            .CountAsync(value =>
                campaignIds.Contains(value.CampaignId) &&
                value.RecordStatus == HouseholdRecordStatus.Validated,
                cancellationToken);
        var persons = await dbContext.Persons
            .AsNoTracking()
            .CountAsync(value =>
                campaignIds.Contains(value.CampaignId) &&
                value.RecordStatus == PersonRecordStatus.Validated,
                cancellationToken);

        return Ok(new PublicOverviewResponse(
            await completed.CountAsync(cancellationToken),
            households,
            persons,
            latest));
    }

    public sealed record PublicOverviewResponse(
        int CompletedCampaigns,
        int ValidatedHouseholds,
        int ValidatedCitizens,
        IReadOnlyList<PublicCampaignSummary> Campaigns);

    public sealed record PublicCampaignSummary(
        Guid Id,
        string Name,
        DateOnly StartDate,
        DateOnly EndDate,
        string Status);
}
