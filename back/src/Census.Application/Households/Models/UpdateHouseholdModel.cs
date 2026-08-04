using Census.Domain.Households;

namespace Census.Application.Households.Models;

public sealed record UpdateHouseholdModel(
    HouseholdType HouseholdType,
    string? HeadFullName,
    string? PhoneNumber,
    string? Notes);
