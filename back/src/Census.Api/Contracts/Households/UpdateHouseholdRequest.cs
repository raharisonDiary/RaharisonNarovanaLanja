using System.ComponentModel.DataAnnotations;
using Census.Domain.Households;

namespace Census.Api.Contracts.Households;

public sealed class UpdateHouseholdRequest
{
    [EnumDataType(typeof(HouseholdType))]
    public HouseholdType HouseholdType { get; init; }

    [StringLength(200)]
    public string? HeadFullName { get; init; }

    [StringLength(30)]
    public string? PhoneNumber { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }
}
