using Census.Domain.AdministrativeAreas;

namespace Census.Application.AdministrativeAreas.Models;

public sealed record AdministrativeAreaQueryModel(
    AdministrativeAreaType? Type = null,
    Guid? ParentId = null,
    bool RootOnly = false,
    bool IncludeInactive = false);
