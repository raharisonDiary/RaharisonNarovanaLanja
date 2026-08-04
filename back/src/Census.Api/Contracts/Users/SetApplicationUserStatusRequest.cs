using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Users;

public sealed class SetApplicationUserStatusRequest
{
    [Required]
    public bool? IsActive { get; init; }
}
