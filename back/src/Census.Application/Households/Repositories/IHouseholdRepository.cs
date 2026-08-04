using Census.Application.Households.Models;
using Census.Domain.Households;

namespace Census.Application.Households.Repositories;

public interface IHouseholdRepository
{
    Task<IReadOnlyList<Household>> GetAllAsync(
        HouseholdQueryModel query,
        CancellationToken cancellationToken);

    Task<Household?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<Household?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> ExistsByReferenceIncludingDeletedAsync(
        Guid campaignId,
        string referenceCode,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task AddAsync(
        Household household,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
