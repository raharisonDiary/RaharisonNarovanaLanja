using Census.Domain.Users;

namespace Census.Application.Users.Models;

public sealed record ApplicationUserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    Guid? AdministrativeAreaId,
    bool IsActive,
    DateTimeOffset? LastLoginAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
