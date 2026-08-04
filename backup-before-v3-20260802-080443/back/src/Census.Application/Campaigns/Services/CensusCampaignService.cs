using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.Campaigns.Models;
using Census.Application.Campaigns.Repositories;
using Census.Application.Common.Exceptions;
using Census.Domain.Campaigns;

namespace Census.Application.Campaigns.Services;

public sealed class CensusCampaignService(
    ICensusCampaignRepository campaignRepository,
    IAdministrativeAreaRepository administrativeAreaRepository,
    TimeProvider timeProvider)
    : ICensusCampaignService
{
    public async Task<IReadOnlyList<CensusCampaignDto>> GetAllAsync(
        CensusCampaignQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        if (query.StartsOnOrAfter.HasValue &&
            query.EndsOnOrBefore.HasValue &&
            query.EndsOnOrBefore.Value <
            query.StartsOnOrAfter.Value)
        {
            throw new BusinessValidationException(
                "La date finale du filtre ne peut pas précéder la date initiale.");
        }

        var campaigns =
            await campaignRepository.GetAllAsync(
                query,
                cancellationToken);

        return campaigns
            .Select(MapToDto)
            .ToList();
    }

    public async Task<CensusCampaignDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var campaign =
            await campaignRepository.GetByIdAsync(
                id,
                cancellationToken);

        return campaign is null
            ? throw CreateNotFoundException(id)
            : MapToDto(campaign);
    }

    public async Task<CensusCampaignDto> CreateAsync(
        CreateCensusCampaignModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var normalizedCode = NormalizeCode(model.Code);

        await EnsureCodeIsAvailableAsync(
            normalizedCode,
            excludedId: null,
            cancellationToken);

        await ValidateScopeAsync(
            model.ScopeAdministrativeAreaId,
            cancellationToken);

        var campaign = new CensusCampaign(
            normalizedCode,
            model.Name,
            model.Description,
            model.StartDate,
            model.EndDate,
            model.ScopeAdministrativeAreaId,
            timeProvider.GetUtcNow());

        await campaignRepository.AddAsync(
            campaign,
            cancellationToken);

        await campaignRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(campaign);
    }

    public async Task<CensusCampaignDto> UpdateAsync(
        Guid id,
        UpdateCensusCampaignModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var campaign =
            await campaignRepository.GetForUpdateAsync(
                id,
                cancellationToken)
            ?? throw CreateNotFoundException(id);

        if (campaign.Status is not
            (CensusCampaignStatus.Draft or
             CensusCampaignStatus.Scheduled))
        {
            throw new ConflictException(
                "Seules les campagnes en préparation ou programmées peuvent être modifiées.");
        }

        var normalizedCode = NormalizeCode(model.Code);

        await EnsureCodeIsAvailableAsync(
            normalizedCode,
            campaign.Id,
            cancellationToken);

        await ValidateScopeAsync(
            model.ScopeAdministrativeAreaId,
            cancellationToken);

        campaign.UpdateDetails(
            normalizedCode,
            model.Name,
            model.Description,
            model.StartDate,
            model.EndDate,
            model.ScopeAdministrativeAreaId,
            timeProvider.GetUtcNow());

        await campaignRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(campaign);
    }

    public async Task<CensusCampaignDto> ChangeStatusAsync(
        Guid id,
        CensusCampaignStatus status,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(status))
        {
            throw new BusinessValidationException(
                "Le statut demandé est invalide.");
        }

        var campaign =
            await campaignRepository.GetForUpdateAsync(
                id,
                cancellationToken)
            ?? throw CreateNotFoundException(id);

        if (campaign.Status == status)
        {
            return MapToDto(campaign);
        }

        if (!IsTransitionAllowed(
                campaign.Status,
                status))
        {
            throw new ConflictException(
                $"La transition de {campaign.Status} vers {status} n’est pas autorisée.");
        }

        campaign.ChangeStatus(
            status,
            timeProvider.GetUtcNow());

        await campaignRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(campaign);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var campaign =
            await campaignRepository.GetForUpdateAsync(
                id,
                cancellationToken)
            ?? throw CreateNotFoundException(id);

        if (campaign.Status != CensusCampaignStatus.Draft)
        {
            throw new ConflictException(
                "Seule une campagne en préparation peut être supprimée.");
        }

        campaign.Delete(timeProvider.GetUtcNow());

        await campaignRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task EnsureCodeIsAvailableAsync(
        string code,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        var exists =
            await campaignRepository
                .ExistsByCodeIncludingDeletedAsync(
                    code,
                    excludedId,
                    cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"Une campagne utilise déjà le code '{code}'.");
        }
    }

    private async Task ValidateScopeAsync(
        Guid scopeAdministrativeAreaId,
        CancellationToken cancellationToken)
    {
        if (scopeAdministrativeAreaId == Guid.Empty)
        {
            throw new BusinessValidationException(
                "Le territoire de la campagne est obligatoire.");
        }

        var area =
            await administrativeAreaRepository.GetByIdAsync(
                scopeAdministrativeAreaId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"Le territoire '{scopeAdministrativeAreaId}' est introuvable.");

        if (!area.IsActive)
        {
            throw new BusinessValidationException(
                "Le territoire sélectionné est inactif.");
        }
    }

    private static bool IsTransitionAllowed(
        CensusCampaignStatus currentStatus,
        CensusCampaignStatus requestedStatus)
    {
        return currentStatus switch
        {
            CensusCampaignStatus.Draft =>
                requestedStatus ==
                CensusCampaignStatus.Scheduled,

            CensusCampaignStatus.Scheduled =>
                requestedStatus is
                    CensusCampaignStatus.Draft or
                    CensusCampaignStatus.Active,

            CensusCampaignStatus.Active =>
                requestedStatus is
                    CensusCampaignStatus.Suspended or
                    CensusCampaignStatus.Closed,

            CensusCampaignStatus.Suspended =>
                requestedStatus is
                    CensusCampaignStatus.Active or
                    CensusCampaignStatus.Closed,

            CensusCampaignStatus.Closed =>
                requestedStatus ==
                CensusCampaignStatus.Archived,

            CensusCampaignStatus.Archived => false,

            _ => false
        };
    }

    private static string NormalizeCode(
        string code)
    {
        ArgumentNullException.ThrowIfNull(code);

        var normalizedCode =
            code.Trim().ToUpperInvariant();

        if (normalizedCode.Length == 0)
        {
            throw new BusinessValidationException(
                "Le code de la campagne est obligatoire.");
        }

        if (normalizedCode.Length > 40)
        {
            throw new BusinessValidationException(
                "Le code de la campagne ne peut pas dépasser 40 caractères.");
        }

        return normalizedCode;
    }

    private static CensusCampaignDto MapToDto(
        CensusCampaign campaign)
    {
        return new CensusCampaignDto(
            campaign.Id,
            campaign.Code,
            campaign.Name,
            campaign.Description,
            campaign.StartDate,
            campaign.EndDate,
            campaign.Status,
            campaign.ScopeAdministrativeAreaId,
            campaign.CreatedAtUtc,
            campaign.UpdatedAtUtc);
    }

    private static EntityNotFoundException
        CreateNotFoundException(Guid id)
    {
        return new EntityNotFoundException(
            $"La campagne '{id}' est introuvable.");
    }
}
