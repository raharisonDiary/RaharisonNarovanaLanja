using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.PasswordRecovery;

public sealed class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string ResetToken { get; init; } = string.Empty;

    [Required]
    [MinLength(12)]
    [MaxLength(128)]
    public string NewPassword { get; init; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword))]
    public string ConfirmPassword { get; init; } = string.Empty;
}
