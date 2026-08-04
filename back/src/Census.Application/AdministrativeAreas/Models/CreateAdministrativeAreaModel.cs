using Census.Domain.AdministrativeAreas;

namespace Census.Application.AdministrativeAreas.Models;

public sealed record CreateAdministrativeAreaModel(
    string Code,
    string Name,
    AdministrativeAreaType Type,
    Guid? ParentId);
