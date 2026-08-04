using Census.Application.AdministrativeAreas.Models;
using Census.Application.AdministrativeAreas.Repositories;
using Census.Domain.AdministrativeAreas;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.AdministrativeAreas.Repositories;

public sealed class AdministrativeAreaRepository(
    CensusDbContext dbContext)
    : IAdministrativeAreaRepository
{
    public async Task<IReadOnlyList<AdministrativeArea>> GetAllAsync(
        AdministrativeAreaQueryModel query,
        CancellationToken cancellationToken)
    {
        var areas = dbContext.AdministrativeAreas
            .AsNoTracking()
            .AsQueryable();

        if (query.Type.HasValue)
        {
            areas = areas.Where(
                area => area.Type == query.Type.Value);
        }

        if (query.RootOnly)
        {
            areas = areas.Where(area => area.ParentId == null);
        }
        else if (query.ParentId.HasValue)
        {
            areas = areas.Where(
                area => area.ParentId == query.ParentId.Value);
        }

        if (!query.IncludeInactive)
        {
            areas = areas.Where(area => area.IsActive);
        }

        return await areas
            .OrderBy(area => area.Type)
            .ThenBy(area => area.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<AdministrativeArea?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.AdministrativeAreas
            .AsNoTracking()
            .FirstOrDefaultAsync(
                area => area.Id == id,
                cancellationToken);
    }

    public async Task<AdministrativeArea?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.AdministrativeAreas
            .FirstOrDefaultAsync(
                area => area.Id == id,
                cancellationToken);
    }

    public async Task<bool> ExistsByCodeAndTypeAsync(
        string code,
        AdministrativeAreaType type,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.AdministrativeAreas
            .AsNoTracking()
            .AnyAsync(
                area =>
                    area.Code == code &&
                    area.Type == type &&
                    (!excludedId.HasValue ||
                     area.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task<bool> HasChildrenAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.AdministrativeAreas
            .AsNoTracking()
            .AnyAsync(
                area => area.ParentId == id,
                cancellationToken);
    }

    public async Task AddAsync(
        AdministrativeArea administrativeArea,
        CancellationToken cancellationToken)
    {
        await dbContext.AdministrativeAreas.AddAsync(
            administrativeArea,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
