using Census.Domain.Users;

namespace Census.Application.Authentication.Models;

public sealed record AuthenticatedUserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    Guid? AdministrativeAreaId,
    bool IsActive,
    DateTimeOffset? LastLoginAtUtc);
