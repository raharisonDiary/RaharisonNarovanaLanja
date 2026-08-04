using Census.Application.AdministrativeAreas.Models;
using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.Common.Exceptions;
using Census.Domain.AdministrativeAreas;

namespace Census.Application.AdministrativeAreas.Services;

public sealed class AdministrativeAreaService(
    IAdministrativeAreaRepository repository,
    TimeProvider timeProvider)
    : IAdministrativeAreaService
{
    public async Task<IReadOnlyList<AdministrativeAreaDto>> GetAllAsync(
        AdministrativeAreaQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        if (query.RootOnly && query.ParentId.HasValue)
        {
            throw new BusinessValidationException(
                "RootOnly et ParentId ne peuvent pas être utilisés ensemble.");
        }

        var areas = await repository.GetAllAsync(
            query,
            cancellationToken);

        return areas
            .Select(MapToDto)
            .ToList();
    }

    public async Task<AdministrativeAreaDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var area = await repository.GetByIdAsync(
            id,
            cancellationToken);

        return area is null
            ? throw CreateNotFoundException(id)
            : MapToDto(area);
    }

    public async Task<AdministrativeAreaDto> CreateAsync(
        CreateAdministrativeAreaModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var normalizedCode = NormalizeCode(model.Code);

        await EnsureCodeIsAvailableAsync(
            normalizedCode,
            model.Type,
            excludedId: null,
            cancellationToken);

        await ValidateParentAsync(
            model.Type,
            model.ParentId,
            cancellationToken);

        var area = new AdministrativeArea(
            normalizedCode,
            model.Name,
            model.Type,
            model.ParentId,
            timeProvider.GetUtcNow());

        await repository.AddAsync(area, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return MapToDto(area);
    }

    public async Task<AdministrativeAreaDto> UpdateAsync(
        Guid id,
        UpdateAdministrativeAreaModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var area = await repository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var normalizedCode = NormalizeCode(model.Code);

        await EnsureCodeIsAvailableAsync(
            normalizedCode,
            area.Type,
            excludedId: area.Id,
            cancellationToken);

        area.Update(
            normalizedCode,
            model.Name,
            timeProvider.GetUtcNow());

        await repository.SaveChangesAsync(cancellationToken);

        return MapToDto(area);
    }

    public async Task<AdministrativeAreaDto> SetActiveStatusAsync(
        Guid id,
        bool isActive,
        CancellationToken cancellationToken)
    {
        var area = await repository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var now = timeProvider.GetUtcNow();

        if (isActive)
        {
            area.Activate(now);
        }
        else
        {
            area.Deactivate(now);
        }

        await repository.SaveChangesAsync(cancellationToken);

        return MapToDto(area);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var area = await repository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var hasChildren = await repository.HasChildrenAsync(
            id,
            cancellationToken);

        if (hasChildren)
        {
            throw new ConflictException(
                "Cette zone ne peut pas être supprimée car elle possède des sous-zones.");
        }

        area.Delete(timeProvider.GetUtcNow());

        await repository.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCodeIsAvailableAsync(
        string code,
        AdministrativeAreaType type,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        var exists = await repository.ExistsByCodeAndTypeAsync(
            code,
            type,
            excludedId,
            cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"Une zone de type {type} utilise déjà le code '{code}'.");
        }
    }

    private async Task ValidateParentAsync(
        AdministrativeAreaType type,
        Guid? parentId,
        CancellationToken cancellationToken)
    {
        var expectedParentType = GetExpectedParentType(type);

        if (expectedParentType is null)
        {
            if (parentId.HasValue)
            {
                throw new BusinessValidationException(
                    "Un pays ne peut pas posséder de zone parente.");
            }

            return;
        }

        if (!parentId.HasValue)
        {
            throw new BusinessValidationException(
                $"Une zone de type {type} doit avoir un parent de type {expectedParentType}.");
        }

        var parent = await repository.GetByIdAsync(
            parentId.Value,
            cancellationToken)
            ?? throw new EntityNotFoundException(
                $"La zone parente '{parentId}' est introuvable.");

        if (parent.Type != expectedParentType)
        {
            throw new BusinessValidationException(
                $"Une zone de type {type} doit avoir un parent de type {expectedParentType}.");
        }

        if (!parent.IsActive)
        {
            throw new BusinessValidationException(
                "La zone parente sélectionnée est inactive.");
        }
    }

    private static AdministrativeAreaType? GetExpectedParentType(
        AdministrativeAreaType type)
    {
        return type switch
        {
            AdministrativeAreaType.Country => null,
            AdministrativeAreaType.Region =>
                AdministrativeAreaType.Country,
            AdministrativeAreaType.District =>
                AdministrativeAreaType.Region,
            AdministrativeAreaType.Commune =>
                AdministrativeAreaType.District,
            AdministrativeAreaType.Fokontany =>
                AdministrativeAreaType.Commune,
            AdministrativeAreaType.EnumerationArea =>
                AdministrativeAreaType.Fokontany,
            _ => throw new BusinessValidationException(
                "Le type de zone administrative est invalide.")
        };
    }

    private static AdministrativeAreaDto MapToDto(
        AdministrativeArea area)
    {
        return new AdministrativeAreaDto(
            area.Id,
            area.Code,
            area.Name,
            area.Type,
            area.ParentId,
            area.IsActive,
            area.CreatedAtUtc,
            area.UpdatedAtUtc);
    }

    private static string NormalizeCode(string code)
    {
        ArgumentNullException.ThrowIfNull(code);

        var normalizedCode = code.Trim().ToUpperInvariant();

        if (normalizedCode.Length == 0)
        {
            throw new BusinessValidationException(
                "Le code de la zone est obligatoire.");
        }

        return normalizedCode;
    }

    private static EntityNotFoundException CreateNotFoundException(
        Guid id)
    {
        return new EntityNotFoundException(
            $"La zone administrative '{id}' est introuvable.");
    }
}
