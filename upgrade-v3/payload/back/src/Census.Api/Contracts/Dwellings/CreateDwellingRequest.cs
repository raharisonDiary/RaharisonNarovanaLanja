using System.ComponentModel.DataAnnotations;

namespace Census.Api.Contracts.Dwellings;

public sealed class CreateDwellingRequest
{
    [Required]
    public Guid? CampaignId { get; init; }

    [Required]
    public Guid? EnumerationAreaId { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string ReferenceCode { get; init; } =
        string.Empty;

    [StringLength(250)]
    public string? Address { get; init; }

    [StringLength(150)]
    public string? LocalityName { get; init; }

    [Range(-90, 90)]
    public decimal Latitude { get; init; }

    [Range(-180, 180)]
    public decimal Longitude { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }
}
