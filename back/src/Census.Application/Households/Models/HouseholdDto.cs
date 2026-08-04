using Census.Domain.Households;

namespace Census.Application.Households.Models;

public sealed record HouseholdDto(
    Guid Id,
    Guid CampaignId,
    Guid DwellingId,
    string ReferenceCode,
    HouseholdType HouseholdType,
    string? HeadFullName,
    string? PhoneNumber,
    string? Notes,
    HouseholdRecordStatus RecordStatus,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
