using Census.Domain.Dwellings;

namespace Census.Application.Dwellings.Models;

public sealed record UpdateDwellingModel(
    string? Address,
    string? LocalityName,
    decimal Latitude,
    decimal Longitude,
    DwellingOccupancyStatus OccupancyStatus,
    string? Notes);
