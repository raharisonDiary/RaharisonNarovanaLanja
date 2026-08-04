using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.AdministrativeAreas;

public sealed class UpdateAdministrativeAreaRequest
{
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string Code { get; init; } = string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string Name { get; init; } = string.Empty;
}
