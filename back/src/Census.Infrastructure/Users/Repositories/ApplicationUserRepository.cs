using Census.Application.Users.Models;
using Census.Application.Users.Repositories;
using Census.Domain.Users;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Users.Repositories;

public sealed class ApplicationUserRepository(
    CensusDbContext dbContext)
    : IApplicationUserRepository
{
    public async Task<IReadOnlyList<ApplicationUser>> GetAllAsync(
        ApplicationUserQueryModel query,
        CancellationToken cancellationToken)
    {
        var users = dbContext.Users
            .AsNoTracking()
            .AsQueryable();

        if (query.Role.HasValue)
        {
            users = users.Where(
                user => user.Role == query.Role.Value);
        }

        if (query.AdministrativeAreaId.HasValue)
        {
            users = users.Where(
                user =>
                    user.AdministrativeAreaId ==
                    query.AdministrativeAreaId.Value);
        }

        if (query.IsActive.HasValue)
        {
            users = users.Where(
                user =>
                    user.IsActive ==
                    query.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = $"%{query.Search.Trim()}%";

            users = users.Where(
                user =>
                    EF.Functions.ILike(
                        user.FirstName,
                        search) ||
                    EF.Functions.ILike(
                        user.LastName,
                        search) ||
                    EF.Functions.ILike(
                        user.Email,
                        search));
        }

        return await users
            .OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<ApplicationUser?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                user => user.Id == id,
                cancellationToken);
    }

    public async Task<ApplicationUser?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(
                user => user.Id == id,
                cancellationToken);
    }

    public async Task<ApplicationUser?> GetByEmailForUpdateAsync(
        string normalizedEmail,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(
                user => user.Email == normalizedEmail,
                cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(
        string normalizedEmail,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .AnyAsync(
                user =>
                    user.Email == normalizedEmail &&
                    (!excludedId.HasValue ||
                     user.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task<bool> ExistsByEmailIncludingDeletedAsync(
        string normalizedEmail,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                user =>
                    user.Email == normalizedEmail &&
                    (!excludedId.HasValue ||
                     user.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task AddAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        await dbContext.Users.AddAsync(
            user,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
