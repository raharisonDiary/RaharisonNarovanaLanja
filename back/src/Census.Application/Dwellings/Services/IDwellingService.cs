using Census.Application.Dwellings.Models;

namespace Census.Application.Dwellings.Services;

public interface IDwellingService
{
    Task<IReadOnlyList<DwellingDto>> GetAllAsync(
        DwellingQueryModel query,
        CancellationToken cancellationToken);

    Task<DwellingDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<DwellingDto> CreateAsync(
        CreateDwellingModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<DwellingDto> UpdateAsync(
        Guid id,
        UpdateDwellingModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<DwellingDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<DwellingDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<DwellingDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);
}
