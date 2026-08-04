namespace Census.Application.Campaigns.Models;

public sealed record CreateCensusCampaignModel(
    string Code,
    string Name,
    string? Description,
    DateOnly StartDate,
    DateOnly EndDate,
    Guid ScopeAdministrativeAreaId);
