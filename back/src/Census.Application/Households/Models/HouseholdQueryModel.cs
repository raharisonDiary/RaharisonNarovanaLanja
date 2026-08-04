using Census.Domain.Households;

namespace Census.Application.Households.Models;

public sealed record HouseholdQueryModel(
    Guid? CampaignId = null,
    Guid? DwellingId = null,
    HouseholdRecordStatus? RecordStatus = null,
    HouseholdType? HouseholdType = null,
    Guid? CreatedByUserId = null,
    string? Search = null);
