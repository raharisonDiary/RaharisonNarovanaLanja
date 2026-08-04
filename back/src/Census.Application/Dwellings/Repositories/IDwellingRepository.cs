using Census.Application.Dwellings.Models;
using Census.Domain.Dwellings;

namespace Census.Application.Dwellings.Repositories;

public interface IDwellingRepository
{
    Task<IReadOnlyList<Dwelling>> GetAllAsync(
        DwellingQueryModel query,
        CancellationToken cancellationToken);

    Task<Dwelling?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<Dwelling?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> ExistsByReferenceIncludingDeletedAsync(
        Guid campaignId,
        string referenceCode,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Dwelling dwelling,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
