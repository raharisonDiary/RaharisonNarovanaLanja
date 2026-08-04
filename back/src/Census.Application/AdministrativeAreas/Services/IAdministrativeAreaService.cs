using Census.Application.AdministrativeAreas.Models;

namespace Census.Application.AdministrativeAreas.Services;

public interface IAdministrativeAreaService
{
    Task<IReadOnlyList<AdministrativeAreaDto>> GetAllAsync(
        AdministrativeAreaQueryModel query,
        CancellationToken cancellationToken);

    Task<AdministrativeAreaDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<AdministrativeAreaDto> CreateAsync(
        CreateAdministrativeAreaModel model,
        CancellationToken cancellationToken);

    Task<AdministrativeAreaDto> UpdateAsync(
        Guid id,
        UpdateAdministrativeAreaModel model,
        CancellationToken cancellationToken);

    Task<AdministrativeAreaDto> SetActiveStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken);
}
