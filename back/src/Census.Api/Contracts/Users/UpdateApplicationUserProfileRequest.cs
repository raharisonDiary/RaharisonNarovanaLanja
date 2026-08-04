using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Users;

public sealed class UpdateApplicationUserProfileRequest
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
}
