using Census.Application.Campaigns.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.Dwellings.Repositories;
using Census.Application.FieldWork.Security;
using Census.Application.Households.Models;
using Census.Application.Households.Repositories;
using Census.Domain.Campaigns;
using Census.Domain.Households;

namespace Census.Application.Households.Services;

public sealed class HouseholdService(
    IHouseholdRepository householdRepository,
    IDwellingRepository dwellingRepository,
    ICensusCampaignRepository campaignRepository,
    IFieldAuthorizationService fieldAuthorizationService,
    TimeProvider timeProvider)
    : IHouseholdService
{
    public async Task<IReadOnlyList<HouseholdDto>> GetAllAsync(
        HouseholdQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var households = await householdRepository.GetAllAsync(
            query,
            cancellationToken);

        return households.Select(MapToDto).ToList();
    }

    public async Task<HouseholdDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var household = await householdRepository.GetByIdAsync(
            id,
            cancellationToken);

        return household is null
            ? throw CreateNotFoundException(id)
            : MapToDto(household);
    }

    public async Task<HouseholdDto> CreateAsync(
        CreateHouseholdModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var dwelling =
            await dwellingRepository.GetByIdAsync(
                model.DwellingId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"L’habitation '{model.DwellingId}' est introuvable.");

        await EnsureCampaignIsActiveAsync(
            dwelling.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            recordOwnerId: null,
            cancellationToken);

        var referenceCode = NormalizeReferenceCode(
            model.ReferenceCode);

        var exists =
            await householdRepository
                .ExistsByReferenceIncludingDeletedAsync(
                    dwelling.CampaignId,
                    referenceCode,
                    excludedId: null,
                    cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"Un ménage utilise déjà la référence '{referenceCode}' dans cette campagne.");
        }

        var household = new Household(
            dwelling.CampaignId,
            dwelling.Id,
            referenceCode,
            model.HouseholdType,
            model.HeadFullName,
            model.PhoneNumber,
            actingUserId,
            timeProvider.GetUtcNow());

        await householdRepository.AddAsync(
            household,
            cancellationToken);

        await householdRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(household);
    }

    public async Task<HouseholdDto> UpdateAsync(
        Guid id,
        UpdateHouseholdModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var household = await GetForUpdateAsync(
            id,
            cancellationToken);

        var dwelling = await GetDwellingAsync(
            household.DwellingId,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            household.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            household.CreatedByUserId,
            cancellationToken);

        if (household.RecordStatus is
            HouseholdRecordStatus.Submitted or
            HouseholdRecordStatus.Validated)
        {
            throw new ConflictException(
                "Ce ménage ne peut plus être modifié dans son état actuel.");
        }

        household.UpdateDetails(
            model.HouseholdType,
            model.HeadFullName,
            model.PhoneNumber,
            model.Notes,
            timeProvider.GetUtcNow());

        await householdRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(household);
    }

    public async Task<HouseholdDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var household = await GetForUpdateAsync(
            id,
            cancellationToken);

        var dwelling = await GetDwellingAsync(
            household.DwellingId,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            household.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            household.CreatedByUserId,
            cancellationToken);

        if (household.RecordStatus is not
            (HouseholdRecordStatus.Draft or
             HouseholdRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seul un ménage en brouillon ou rejeté peut être soumis.");
        }

        household.Submit(timeProvider.GetUtcNow());

        await householdRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(household);
    }

    public async Task<HouseholdDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var household = await GetForUpdateAsync(
            id,
            cancellationToken);

        var dwelling = await GetDwellingAsync(
            household.DwellingId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            cancellationToken);

        if (household.RecordStatus !=
            HouseholdRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seul un ménage soumis peut être validé.");
        }

        household.Validate(timeProvider.GetUtcNow());

        await householdRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(household);
    }

    public async Task<HouseholdDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var household = await GetForUpdateAsync(
            id,
            cancellationToken);

        var dwelling = await GetDwellingAsync(
            household.DwellingId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            cancellationToken);

        if (household.RecordStatus !=
            HouseholdRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seul un ménage soumis peut être rejeté.");
        }

        household.Reject(
            reason,
            timeProvider.GetUtcNow());

        await householdRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(household);
    }

    public async Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var household = await GetForUpdateAsync(
            id,
            cancellationToken);

        var dwelling = await GetDwellingAsync(
            household.DwellingId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            household.CreatedByUserId,
            cancellationToken);

        if (household.RecordStatus is not
            (HouseholdRecordStatus.Draft or
             HouseholdRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seul un ménage en brouillon ou rejeté peut être supprimé.");
        }

        household.Delete(timeProvider.GetUtcNow());

        await householdRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task EnsureCampaignIsActiveAsync(
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
                "La campagne doit être active pour modifier les données de terrain.");
        }
    }

    private async Task<Census.Domain.Dwellings.Dwelling>
        GetDwellingAsync(
            Guid dwellingId,
            CancellationToken cancellationToken)
    {
        return await dwellingRepository.GetByIdAsync(
            dwellingId,
            cancellationToken)
            ?? throw new EntityNotFoundException(
                $"L’habitation '{dwellingId}' est introuvable.");
    }

    private async Task<Household> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await householdRepository.GetForUpdateAsync(
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
                "La référence du ménage doit contenir entre 1 et 50 caractères.");
        }

        return value;
    }

    private static HouseholdDto MapToDto(
        Household household)
    {
        return new HouseholdDto(
            household.Id,
            household.CampaignId,
            household.DwellingId,
            household.ReferenceCode,
            household.HouseholdType,
            household.HeadFullName,
            household.PhoneNumber,
            household.Notes,
            household.RecordStatus,
            household.CreatedByUserId,
            household.CreatedAtUtc,
            household.UpdatedAtUtc);
    }

    private static EntityNotFoundException
        CreateNotFoundException(Guid id)
    {
        return new EntityNotFoundException(
            $"Le ménage '{id}' est introuvable.");
    }
}
