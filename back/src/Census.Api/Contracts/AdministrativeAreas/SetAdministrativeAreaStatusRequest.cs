using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.AdministrativeAreas;

public sealed class SetAdministrativeAreaStatusRequest
{
    [Required]
    public bool? IsActive { get; init; }
}
