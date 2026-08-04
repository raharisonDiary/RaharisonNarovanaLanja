using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Sessions;

public sealed class RefreshSessionRequest
{
    [Required]
    [StringLength(512, MinimumLength = 40)]
    public string RefreshToken { get; init; } =
        string.Empty;

    [StringLength(100)]
    public string? DeviceName { get; init; }
}
