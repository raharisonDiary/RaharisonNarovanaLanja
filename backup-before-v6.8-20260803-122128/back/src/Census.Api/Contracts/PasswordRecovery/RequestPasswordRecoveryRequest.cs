using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.PasswordRecovery;

public sealed class RequestPasswordRecoveryRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;
}
