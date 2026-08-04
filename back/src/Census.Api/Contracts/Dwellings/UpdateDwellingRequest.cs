using System.ComponentModel.DataAnnotations;
using Census.Domain.Dwellings;

namespace Census.Api.Contracts.Dwellings;

public sealed class UpdateDwellingRequest
{
    [StringLength(250)]
    public string? Address { get; init; }

    [StringLength(150)]
    public string? LocalityName { get; init; }

    [Range(-90, 90)]
    public decimal Latitude { get; init; }

    [Range(-180, 180)]
    public decimal Longitude { get; init; }

    [EnumDataType(typeof(DwellingOccupancyStatus))]
    public DwellingOccupancyStatus OccupancyStatus
    {
        get;
        init;
    }

    [StringLength(1000)]
    public string? Notes { get; init; }
}
