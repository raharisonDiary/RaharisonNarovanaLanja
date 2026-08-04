using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Users;

public sealed class ResetApplicationUserPasswordRequest
{
    [Required]
    [StringLength(128, MinimumLength = 12)]
    public string NewPassword { get; init; } =
        string.Empty;
}
