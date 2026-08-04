using Census.Domain.Users;

namespace Census.Application.Users.Models;

public sealed record CreateApplicationUserModel(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    UserRole Role,
    Guid? AdministrativeAreaId);
