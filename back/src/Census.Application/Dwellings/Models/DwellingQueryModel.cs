using Census.Domain.Dwellings;

namespace Census.Application.Dwellings.Models;

public sealed record DwellingQueryModel(
    Guid? CampaignId = null,
    Guid? EnumerationAreaId = null,
    DwellingRecordStatus? RecordStatus = null,
    DwellingOccupancyStatus? OccupancyStatus = null,
    Guid? CreatedByUserId = null,
    string? Search = null);
