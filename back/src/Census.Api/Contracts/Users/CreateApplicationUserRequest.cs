using System.ComponentModel.DataAnnotations;
using Census.Domain.Users;

namespace Census.Api.Contracts.Users;

public sealed class CreateApplicationUserRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string FirstName { get; init; } =
        string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string LastName { get; init; } =
        string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; init; } =
        string.Empty;

    [StringLength(30)]
    public string? PhoneNumber { get; init; }

    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string Password { get; init; } =
        string.Empty;

    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    public Guid? AdministrativeAreaId { get; init; }
}
