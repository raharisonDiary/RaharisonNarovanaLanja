namespace Census.Application.Campaigns.Models;

public sealed record UpdateCensusCampaignModel(
    string Code,
    string Name,
    string? Description,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid ScopeAdministrativeAreaId);
