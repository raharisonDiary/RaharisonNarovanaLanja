using Census.Application.Users.Models;

namespace Census.Application.Users.Services;

public interface IApplicationUserService
{
    Task<IReadOnlyList<ApplicationUserDto>> GetAllAsync(
        ApplicationUserQueryModel query,
        CancellationToken cancellationToken);

    Task<ApplicationUserDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<ApplicationUserDto> CreateAsync(
        CreateApplicationUserModel model,
        CancellationToken cancellationToken);

    Task<ApplicationUserDto> UpdateProfileAsync(
        Guid id,
        UpdateApplicationUserProfileModel model,
        CancellationToken cancellationToken);

    Task<ApplicationUserDto> UpdateAccessAsync(
        Guid id,
        UpdateApplicationUserAccessModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<ApplicationUserDto> SetActiveStatusAsync(
        Guid id,
        bool isActive,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task ResetPasswordAsync(
        Guid id,
        string newPassword,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);
}
