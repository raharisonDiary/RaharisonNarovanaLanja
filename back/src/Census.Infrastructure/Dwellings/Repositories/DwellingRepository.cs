using Census.Application.Dwellings.Models;
using Census.Application.Dwellings.Repositories;
using Census.Domain.Dwellings;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Dwellings.Repositories;

public sealed class DwellingRepository(
    CensusDbContext dbContext)
    : IDwellingRepository
{
    public async Task<IReadOnlyList<Dwelling>> GetAllAsync(
        DwellingQueryModel query,
        CancellationToken cancellationToken)
    {
        var dwellings = dbContext.Set<Dwelling>()
            .AsNoTracking()
            .AsQueryable();

        if (query.CampaignId.HasValue)
        {
            dwellings = dwellings.Where(
                dwelling =>
                    dwelling.CampaignId ==
                    query.CampaignId.Value);
        }

        if (query.EnumerationAreaId.HasValue)
        {
            dwellings = dwellings.Where(
                dwelling =>
                    dwelling.EnumerationAreaId ==
                    query.EnumerationAreaId.Value);
        }

        if (query.RecordStatus.HasValue)
        {
            dwellings = dwellings.Where(
                dwelling =>
                    dwelling.RecordStatus ==
                    query.RecordStatus.Value);
        }

        if (query.OccupancyStatus.HasValue)
        {
            dwellings = dwellings.Where(
                dwelling =>
                    dwelling.OccupancyStatus ==
                    query.OccupancyStatus.Value);
        }

        if (query.CreatedByUserId.HasValue)
        {
            dwellings = dwellings.Where(
                dwelling =>
                    dwelling.CreatedByUserId ==
                    query.CreatedByUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = $"%{query.Search.Trim()}%";

            dwellings = dwellings.Where(
                dwelling =>
                    EF.Functions.ILike(
                        dwelling.ReferenceCode,
                        search) ||
                    (
                        dwelling.Address != null &&
                        EF.Functions.ILike(
                            dwelling.Address,
                            search)
                    ) ||
                    (
                        dwelling.LocalityName != null &&
                        EF.Functions.ILike(
                            dwelling.LocalityName,
                            search)
                    ));
        }

        return await dwellings
            .OrderByDescending(
                dwelling => dwelling.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dwelling?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Dwelling>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                dwelling => dwelling.Id == id,
                cancellationToken);
    }

    public async Task<Dwelling?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Dwelling>()
            .FirstOrDefaultAsync(
                dwelling => dwelling.Id == id,
                cancellationToken);
    }

    public async Task<bool>
        ExistsByReferenceIncludingDeletedAsync(
            Guid campaignId,
            string referenceCode,
            Guid? excludedId,
            CancellationToken cancellationToken)
    {
        return await dbContext.Set<Dwelling>()
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                dwelling =>
                    dwelling.CampaignId == campaignId &&
                    dwelling.ReferenceCode == referenceCode &&
                    (!excludedId.HasValue ||
                     dwelling.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        Dwelling dwelling,
        CancellationToken cancellationToken)
    {
        await dbContext.Set<Dwelling>().AddAsync(
            dwelling,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
