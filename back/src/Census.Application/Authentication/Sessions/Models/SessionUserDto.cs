using Census.Domain.Users;

namespace Census.Application.Authentication.Sessions.Models;

public sealed record SessionUserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string? PhoneNumber,
    UserRole Role,
    Guid? AdministrativeAreaId,
    bool IsActive);
