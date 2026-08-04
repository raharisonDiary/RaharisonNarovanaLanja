using Census.Domain.Dwellings;

namespace Census.Application.Dwellings.Models;

public sealed record DwellingDto(
    Guid Id,
    Guid CampaignId,
    Guid EnumerationAreaId,
    string ReferenceCode,
    string? Address,
    string? LocalityName,
    decimal Latitude,
    decimal Longitude,
    DwellingOccupancyStatus OccupancyStatus,
    DwellingRecordStatus RecordStatus,
    string? Notes,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
