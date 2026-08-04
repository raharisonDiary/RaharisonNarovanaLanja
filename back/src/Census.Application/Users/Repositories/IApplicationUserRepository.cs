using Census.Application.Users.Models;
using Census.Domain.Users;

namespace Census.Application.Users.Repositories;

public interface IApplicationUserRepository
{
    Task<IReadOnlyList<ApplicationUser>> GetAllAsync(
        ApplicationUserQueryModel query,
        CancellationToken cancellationToken);

    Task<ApplicationUser?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<ApplicationUser?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<ApplicationUser?> GetByEmailForUpdateAsync(
        string normalizedEmail,
        CancellationToken cancellationToken);

    Task<bool> ExistsByEmailAsync(
        string normalizedEmail,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task<bool> ExistsByEmailIncludingDeletedAsync(
        string normalizedEmail,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task AddAsync(
        ApplicationUser user,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
