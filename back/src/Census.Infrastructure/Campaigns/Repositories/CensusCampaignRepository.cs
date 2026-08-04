using Census.Application.Campaigns.Models;
using Census.Application.Campaigns.Repositories;
using Census.Domain.Campaigns;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Campaigns.Repositories;

public sealed class CensusCampaignRepository(
    CensusDbContext dbContext)
    : ICensusCampaignRepository
{
    public async Task<IReadOnlyList<CensusCampaign>> GetAllAsync(
        CensusCampaignQueryModel query,
        CancellationToken cancellationToken)
    {
        var campaigns = dbContext.CensusCampaigns
            .AsNoTracking()
            .AsQueryable();

        if (query.Status.HasValue)
        {
            campaigns = campaigns.Where(
                campaign =>
                    campaign.Status ==
                    query.Status.Value);
        }

        if (query.ScopeAdministrativeAreaId.HasValue)
        {
            campaigns = campaigns.Where(
                campaign =>
                    campaign.ScopeAdministrativeAreaId ==
                    query.ScopeAdministrativeAreaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search =
                $"%{query.Search.Trim()}%";

            campaigns = campaigns.Where(
                campaign =>
                    EF.Functions.ILike(
                        campaign.Code,
                        search) ||
                    EF.Functions.ILike(
                        campaign.Name,
                        search) ||
                    (
                        campaign.Description != null &&
                        EF.Functions.ILike(
                            campaign.Description,
                            search)
                    ));
        }

        if (query.StartsOnOrAfter.HasValue)
        {
            campaigns = campaigns.Where(
                campaign =>
                    campaign.StartDate >=
                    query.StartsOnOrAfter.Value);
        }

        if (query.EndsOnOrBefore.HasValue)
        {
            campaigns = campaigns.Where(
                campaign =>
                    campaign.EndDate <=
                    query.EndsOnOrBefore.Value);
        }

        return await campaigns
            .OrderByDescending(
                campaign => campaign.StartDate)
            .ThenBy(campaign => campaign.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CensusCampaign?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.CensusCampaigns
            .AsNoTracking()
            .FirstOrDefaultAsync(
                campaign => campaign.Id == id,
                cancellationToken);
    }

    public async Task<CensusCampaign?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.CensusCampaigns
            .FirstOrDefaultAsync(
                campaign => campaign.Id == id,
                cancellationToken);
    }

    public async Task<bool> ExistsByCodeIncludingDeletedAsync(
        string code,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.CensusCampaigns
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                campaign =>
                    campaign.Code == code &&
                    (!excludedId.HasValue ||
                     campaign.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        CensusCampaign campaign,
        CancellationToken cancellationToken)
    {
        await dbContext.CensusCampaigns.AddAsync(
            campaign,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
