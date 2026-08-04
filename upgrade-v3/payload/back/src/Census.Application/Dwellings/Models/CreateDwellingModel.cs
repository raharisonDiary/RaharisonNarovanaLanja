namespace Census.Application.Dwellings.Models;

public sealed record CreateDwellingModel(
    Guid CampaignId,
    Guid EnumerationAreaId,
    string ReferenceCode,
    string? Address,
    string? LocalityName,
    decimal Latitude,
    decimal Longitude,
    string? Notes = null);
