using Census.Application.Households.Models;
using Census.Application.Households.Repositories;
using Census.Domain.Households;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Households.Repositories;

public sealed class HouseholdRepository(
    CensusDbContext dbContext)
    : IHouseholdRepository
{
    public async Task<IReadOnlyList<Household>> GetAllAsync(
        HouseholdQueryModel query,
        CancellationToken cancellationToken)
    {
        var households = dbContext.Set<Household>()
            .AsNoTracking()
            .AsQueryable();

        if (query.CampaignId.HasValue)
        {
            households = households.Where(
                household =>
                    household.CampaignId ==
                    query.CampaignId.Value);
        }

        if (query.DwellingId.HasValue)
        {
            households = households.Where(
                household =>
                    household.DwellingId ==
                    query.DwellingId.Value);
        }

        if (query.RecordStatus.HasValue)
        {
            households = households.Where(
                household =>
                    household.RecordStatus ==
                    query.RecordStatus.Value);
        }

        if (query.HouseholdType.HasValue)
        {
            households = households.Where(
                household =>
                    household.HouseholdType ==
                    query.HouseholdType.Value);
        }

        if (query.CreatedByUserId.HasValue)
        {
            households = households.Where(
                household =>
                    household.CreatedByUserId ==
                    query.CreatedByUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = $"%{query.Search.Trim()}%";

            households = households.Where(
                household =>
                    EF.Functions.ILike(
                        household.ReferenceCode,
                        search) ||
                    (
                        household.HeadFullName != null &&
                        EF.Functions.ILike(
                            household.HeadFullName,
                            search)
                    ) ||
                    (
                        household.PhoneNumber != null &&
                        EF.Functions.ILike(
                            household.PhoneNumber,
                            search)
                    ));
        }

        return await households
            .OrderByDescending(
                household => household.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Household?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Household>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                household => household.Id == id,
                cancellationToken);
    }

    public async Task<Household?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Household>()
            .FirstOrDefaultAsync(
                household => household.Id == id,
                cancellationToken);
    }

    public async Task<bool>
        ExistsByReferenceIncludingDeletedAsync(
            Guid campaignId,
            string referenceCode,
            Guid? excludedId,
            CancellationToken cancellationToken)
    {
        return await dbContext.Set<Household>()
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                household =>
                    household.CampaignId == campaignId &&
                    household.ReferenceCode == referenceCode &&
                    (!excludedId.HasValue ||
                     household.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        Household household,
        CancellationToken cancellationToken)
    {
        await dbContext.Set<Household>().AddAsync(
            household,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
