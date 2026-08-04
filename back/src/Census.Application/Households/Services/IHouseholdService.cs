using Census.Application.Households.Models;

namespace Census.Application.Households.Services;

public interface IHouseholdService
{
    Task<IReadOnlyList<HouseholdDto>> GetAllAsync(
        HouseholdQueryModel query,
        CancellationToken cancellationToken);

    Task<HouseholdDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<HouseholdDto> CreateAsync(
        CreateHouseholdModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<HouseholdDto> UpdateAsync(
        Guid id,
        UpdateHouseholdModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<HouseholdDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<HouseholdDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<HouseholdDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);
}
