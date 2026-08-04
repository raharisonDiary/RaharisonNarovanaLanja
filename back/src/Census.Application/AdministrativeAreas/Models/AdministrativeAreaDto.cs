using Census.Domain.AdministrativeAreas;

namespace Census.Application.AdministrativeAreas.Models;

public sealed record AdministrativeAreaDto(
    Guid Id,
    string Code,
    string Name,
    AdministrativeAreaType Type,
    Guid? ParentId,
    bool IsActive,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
