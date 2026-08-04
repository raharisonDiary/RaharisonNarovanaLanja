using Census.Application.Campaigns.Models;
using Census.Domain.Campaigns;

namespace Census.Application.Campaigns.Services;

public interface ICensusCampaignService
{
    Task<IReadOnlyList<CensusCampaignDto>> GetAllAsync(
        CensusCampaignQueryModel query,
        CancellationToken cancellationToken);

    Task<CensusCampaignDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<CensusCampaignDto> CreateAsync(
        CreateCensusCampaignModel model,
        CancellationToken cancellationToken);

    Task<CensusCampaignDto> UpdateAsync(
        Guid id,
        UpdateCensusCampaignModel model,
        CancellationToken cancellationToken);

    Task<CensusCampaignDto> ChangeStatusAsync(
        Guid id,
        CensusCampaignStatus status,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken);
}
