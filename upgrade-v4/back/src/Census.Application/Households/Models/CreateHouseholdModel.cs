using Census.Domain.Households;

namespace Census.Application.Households.Models;

public sealed record CreateHouseholdModel(
    Guid DwellingId,
    string? ReferenceCode,
    HouseholdType HouseholdType,
    string? HeadFullName,
    string? PhoneNumber,
    string? Notes = null);
