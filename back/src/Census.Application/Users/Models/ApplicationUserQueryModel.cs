using Census.Domain.Users;

namespace Census.Application.Users.Models;

public sealed record ApplicationUserQueryModel(
    UserRole? Role = null,
    Guid? AdministrativeAreaId = null,
    bool? IsActive = null,
    string? Search = null);
