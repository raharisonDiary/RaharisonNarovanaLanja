using System.ComponentModel.DataAnnotations;
using Census.Domain.AdministrativeAreas;

namespace Census.Api.Contracts.AdministrativeAreas;

public sealed class CreateAdministrativeAreaRequest
{
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;

    [EnumDataType(typeof(AdministrativeAreaType))]
    public AdministrativeAreaType Type { get; init; }

    public Guid? ParentId { get; init; }
}
