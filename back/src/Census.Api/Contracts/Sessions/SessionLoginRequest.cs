using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Sessions;

public sealed class SessionLoginRequest
{
    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; init; } =
        string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string Password { get; init; } =
        string.Empty;

    [StringLength(100)]
    public string? DeviceName { get; init; }
}
