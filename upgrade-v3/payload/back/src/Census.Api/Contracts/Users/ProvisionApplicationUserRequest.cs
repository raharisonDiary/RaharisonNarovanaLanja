using System.ComponentModel.DataAnnotations;
using Census.Domain.Users;

namespace Census.Api.Contracts.Users;

public sealed class ProvisionApplicationUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string LastName { get; init; } = string.Empty;

    [EmailAddress]
    [StringLength(254)]
    public string? Email { get; init; }

    [Required]
    [StringLength(30, MinimumLength = 8)]
    public string WhatsAppNumber { get; init; } = string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    [Required]
    public Guid? AdministrativeAreaId { get; init; }
}
