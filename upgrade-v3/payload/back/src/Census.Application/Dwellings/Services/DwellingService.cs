using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.Campaigns.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.Dwellings.Models;
using Census.Application.Dwellings.Repositories;
using Census.Application.FieldWork.Security;
using Census.Domain.AdministrativeAreas;
using Census.Domain.Campaigns;
using Census.Domain.Dwellings;

namespace Census.Application.Dwellings.Services;

public sealed class DwellingService(
    IDwellingRepository dwellingRepository,
    ICensusCampaignRepository campaignRepository,
    IAdministrativeAreaRepository administrativeAreaRepository,
    IAreaHierarchyQuery areaHierarchyQuery,
    IFieldAuthorizationService fieldAuthorizationService,
    TimeProvider timeProvider)
    : IDwellingService
{
    public async Task<IReadOnlyList<DwellingDto>> GetAllAsync(
        DwellingQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var dwellings = await dwellingRepository.GetAllAsync(
            query,
            cancellationToken);

        return dwellings.Select(MapToDto).ToList();
    }

    public async Task<DwellingDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var dwelling = await dwellingRepository.GetByIdAsync(
            id,
            cancellationToken);

        return dwelling is null
            ? throw CreateNotFoundException(id)
            : MapToDto(dwelling);
    }

    public async Task<DwellingDto> CreateAsync(
        CreateDwellingModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var campaign = await GetActiveCampaignAsync(
            model.CampaignId,
            cancellationToken);

        await ValidateEnumerationAreaAsync(
            model.EnumerationAreaId,
            campaign.ScopeAdministrativeAreaId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            model.EnumerationAreaId,
            recordOwnerId: null,
            cancellationToken);

        var referenceCode = NormalizeReferenceCode(
            model.ReferenceCode);

        var exists =
            await dwellingRepository
                .ExistsByReferenceIncludingDeletedAsync(
                    model.CampaignId,
                    referenceCode,
                    excludedId: null,
                    cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"Une habitation utilise déjà la référence '{referenceCode}' dans cette campagne.");
        }

        var now = timeProvider.GetUtcNow();
        var dwelling = new Dwelling(
            model.CampaignId,
            model.EnumerationAreaId,
            referenceCode,
            model.Address,
            model.LocalityName,
            model.Latitude,
            model.Longitude,
            actingUserId,
            now);

        if (!string.IsNullOrWhiteSpace(model.Notes))
        {
            dwelling.UpdateDetails(
                model.Address,
                model.LocalityName,
                model.Latitude,
                model.Longitude,
                DwellingOccupancyStatus.Unknown,
                model.Notes,
                now);
        }

        await dwellingRepository.AddAsync(
            dwelling,
            cancellationToken);

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(dwelling);
    }

    public async Task<DwellingDto> UpdateAsync(
        Guid id,
        UpdateDwellingModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var dwelling = await GetForUpdateAsync(
            id,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            dwelling.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            dwelling.CreatedByUserId,
            cancellationToken);

        if (dwelling.RecordStatus is
            DwellingRecordStatus.Submitted or
            DwellingRecordStatus.Validated)
        {
            throw new ConflictException(
                "Cette habitation ne peut plus être modifiée dans son état actuel.");
        }

        dwelling.UpdateDetails(
            model.Address,
            model.LocalityName,
            model.Latitude,
            model.Longitude,
            model.OccupancyStatus,
            model.Notes,
            timeProvider.GetUtcNow());

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(dwelling);
    }

    public async Task<DwellingDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var dwelling = await GetForUpdateAsync(
            id,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            dwelling.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            dwelling.CreatedByUserId,
            cancellationToken);

        if (dwelling.RecordStatus is not
            (DwellingRecordStatus.Draft or
             DwellingRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seule une habitation en brouillon ou rejetée peut être soumise.");
        }

        dwelling.Submit(timeProvider.GetUtcNow());

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(dwelling);
    }

    public async Task<DwellingDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var dwelling = await GetForUpdateAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            cancellationToken);

        if (dwelling.RecordStatus !=
            DwellingRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seule une habitation soumise peut être validée.");
        }

        dwelling.Validate(timeProvider.GetUtcNow());

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(dwelling);
    }

    public async Task<DwellingDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var dwelling = await GetForUpdateAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            cancellationToken);

        if (dwelling.RecordStatus !=
            DwellingRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seule une habitation soumise peut être rejetée.");
        }

        dwelling.Reject(
            reason,
            timeProvider.GetUtcNow());

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(dwelling);
    }

    public async Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var dwelling = await GetForUpdateAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            dwelling.CreatedByUserId,
            cancellationToken);

        if (dwelling.RecordStatus is not
            (DwellingRecordStatus.Draft or
             DwellingRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seule une habitation en brouillon ou rejetée peut être supprimée.");
        }

        dwelling.Delete(timeProvider.GetUtcNow());

        await dwellingRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task<CensusCampaign> GetActiveCampaignAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(
            campaignId,
            cancellationToken)
            ?? throw new EntityNotFoundException(
                $"La campagne '{campaignId}' est introuvable.");

        if (campaign.Status != CensusCampaignStatus.Active)
        {
            throw new ConflictException(
                "La campagne doit être active pour enregistrer des données de terrain.");
        }

        return campaign;
    }

    private async Task EnsureCampaignIsActiveAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        _ = await GetActiveCampaignAsync(
            campaignId,
            cancellationToken);
    }

    private async Task ValidateEnumerationAreaAsync(
        Guid enumerationAreaId,
        Guid campaignScopeId,
        CancellationToken cancellationToken)
    {
        var area =
            await administrativeAreaRepository.GetByIdAsync(
                enumerationAreaId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"La zone de dénombrement '{enumerationAreaId}' est introuvable.");

        if (!area.IsActive ||
            area.Type is not
                (AdministrativeAreaType.Fokontany or
                 AdministrativeAreaType.EnumerationArea))
        {
            throw new BusinessValidationException(
                "Le territoire sélectionné doit être un fokontany ou une zone de dénombrement active.");
        }

        var isInsideCampaign =
            await areaHierarchyQuery.IsDescendantOrSelfAsync(
                enumerationAreaId,
                campaignScopeId,
                cancellationToken);

        if (!isInsideCampaign)
        {
            throw new BusinessValidationException(
                "La zone de dénombrement se trouve en dehors du périmètre de la campagne.");
        }
    }

    private async Task<Dwelling> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dwellingRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);
    }

    private static string NormalizeReferenceCode(
        string referenceCode)
    {
        ArgumentNullException.ThrowIfNull(referenceCode);

        var value = referenceCode.Trim().ToUpperInvariant();

        if (value.Length == 0 || value.Length > 50)
        {
            throw new BusinessValidationException(
                "La référence de l’habitation doit contenir entre 1 et 50 caractères.");
        }

        return value;
    }

    private static DwellingDto MapToDto(Dwelling dwelling)
    {
        return new DwellingDto(
            dwelling.Id,
            dwelling.CampaignId,
            dwelling.EnumerationAreaId,
            dwelling.ReferenceCode,
            dwelling.Address,
            dwelling.LocalityName,
            dwelling.Latitude,
            dwelling.Longitude,
            dwelling.OccupancyStatus,
            dwelling.RecordStatus,
            dwelling.Notes,
            dwelling.CreatedByUserId,
            dwelling.CreatedAtUtc,
            dwelling.UpdatedAtUtc);
    }

    private static EntityNotFoundException
        CreateNotFoundException(Guid id)
    {
        return new EntityNotFoundException(
            $"L’habitation '{id}' est introuvable.");
    }
}
