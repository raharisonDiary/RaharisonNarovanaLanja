using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Campaigns;

public sealed class UpdateCensusCampaignRequest
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string Code { get; init; } =
        string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string Name { get; init; } =
        string.Empty;

    [StringLength(1000)]
    public string? Description { get; init; }

    [Required]
    public DateOnly? StartDate { get; init; }

    [Required]
    public DateOnly? EndDate { get; init; }

    [Required]
    public Guid? ScopeAdministrativeAreaId
    {
        get;
        init;
    }
}
