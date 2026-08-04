using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.PasswordRecovery;

public sealed class VerifyPasswordRecoveryRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [RegularExpression("^[0-9]{6}$")]
    public string Code { get; init; } = string.Empty;
}
