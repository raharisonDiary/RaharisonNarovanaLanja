using Census.Application.Campaigns.Models;
using Census.Domain.Campaigns;

namespace Census.Application.Campaigns.Repositories;

public interface ICensusCampaignRepository
{
    Task<IReadOnlyList<CensusCampaign>> GetAllAsync(
        CensusCampaignQueryModel query,
        CancellationToken cancellationToken);

    Task<CensusCampaign?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<CensusCampaign?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> ExistsByCodeIncludingDeletedAsync(
        string code,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task AddAsync(
        CensusCampaign campaign,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
