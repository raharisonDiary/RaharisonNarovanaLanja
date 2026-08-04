using Census.Domain.Users;

namespace Census.Api.Contracts.Authentication;

public sealed record AuthenticatedUserResponse(
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
