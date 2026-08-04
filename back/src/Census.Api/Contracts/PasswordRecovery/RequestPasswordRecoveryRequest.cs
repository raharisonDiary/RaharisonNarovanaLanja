using System.ComponentModel.DataAnnotations;
using Census.Application.Authentication.PasswordRecovery.Models;

namespace Census.Api.Contracts.PasswordRecovery;

public sealed class RequestPasswordRecoveryRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [EnumDataType(typeof(PasswordRecoveryChannel))]
    public PasswordRecoveryChannel Channel { get; init; } =
        PasswordRecoveryChannel.Email;
}
