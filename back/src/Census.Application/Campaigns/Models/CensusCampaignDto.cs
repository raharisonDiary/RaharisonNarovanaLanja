using Census.Domain.Campaigns;

namespace Census.Application.Campaigns.Models;

public sealed record CensusCampaignDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    DateOnly StartDate,
    DateOnly EndDate,
    CensusCampaignStatus Status,
    Guid ScopeAdministrativeAreaId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
