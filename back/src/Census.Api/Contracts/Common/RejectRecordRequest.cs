using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Common;

public sealed class RejectRecordRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 3)]
    public string Reason { get; init; } =
        string.Empty;
}
