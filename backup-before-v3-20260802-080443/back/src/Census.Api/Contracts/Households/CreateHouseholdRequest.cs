using System.ComponentModel.DataAnnotations;
using Census.Domain.Households;

namespace Census.Api.Contracts.Households;

public sealed class CreateHouseholdRequest
{
    [Required]
    public Guid? DwellingId { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string ReferenceCode { get; init; } =
        string.Empty;

    [EnumDataType(typeof(HouseholdType))]
    public HouseholdType HouseholdType { get; init; }

    [StringLength(200)]
    public string? HeadFullName { get; init; }

    [StringLength(30)]
    public string? PhoneNumber { get; init; }
}
