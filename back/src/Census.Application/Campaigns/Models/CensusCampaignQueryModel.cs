using Census.Domain.Campaigns;

namespace Census.Application.Campaigns.Models;

public sealed record CensusCampaignQueryModel(
    CensusCampaignStatus? Status = null,
    Guid? ScopeAdministrativeAreaId = null,
    string? Search = null,
    DateOnly? StartsOnOrAfter = null,
    DateOnly? EndsOnOrBefore = null);
