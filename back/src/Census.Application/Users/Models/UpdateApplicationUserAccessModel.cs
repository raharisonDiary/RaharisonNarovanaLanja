using Census.Domain.Users;

namespace Census.Application.Users.Models;

public sealed record UpdateApplicationUserAccessModel(
    UserRole Role,
    Guid? AdministrativeAreaId);
