using Census.Application.AdministrativeAreas.Models;
using Census.Domain.AdministrativeAreas;

namespace Census.Application.AdministrativeAreas.Repositories;

public interface IAdministrativeAreaRepository
{
    Task<IReadOnlyList<AdministrativeArea>> GetAllAsync(
        AdministrativeAreaQueryModel query,
        CancellationToken cancellationToken);

    Task<AdministrativeArea?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<AdministrativeArea?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> ExistsByCodeAndTypeAsync(
        string code,
        AdministrativeAreaType type,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task<bool> HasChildrenAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task AddAsync(
        AdministrativeArea administrativeArea,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
