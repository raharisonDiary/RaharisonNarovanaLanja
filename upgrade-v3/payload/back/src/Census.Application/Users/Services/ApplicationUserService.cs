using System.Net.Mail;
using Census.Application.AdministrativeAreas.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.Users.Models;
using Census.Application.Users.Repositories;
using Census.Application.Users.Security;
using Census.Domain.AdministrativeAreas;
using Census.Domain.Users;

namespace Census.Application.Users.Services;

public sealed class ApplicationUserService(
    IApplicationUserRepository userRepository,
    IAdministrativeAreaRepository administrativeAreaRepository,
    IPasswordService passwordService,
    TimeProvider timeProvider)
    : IApplicationUserService
{
    public async Task<IReadOnlyList<ApplicationUserDto>> GetAllAsync(
        ApplicationUserQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var users = await userRepository.GetAllAsync(
            query,
            cancellationToken);

        return users
            .Select(MapToDto)
            .ToList();
    }

    public async Task<ApplicationUserDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(
            id,
            cancellationToken);

        return user is null
            ? throw CreateNotFoundException(id)
            : MapToDto(user);
    }

    public async Task<ApplicationUserDto> CreateAsync(
        CreateApplicationUserModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var normalizedEmail = NormalizeEmail(model.Email);

        await EnsureEmailIsAvailableAsync(
            normalizedEmail,
            excludedId: null,
            cancellationToken);

        await ValidateAccessAssignmentAsync(
            model.Role,
            model.AdministrativeAreaId,
            cancellationToken);

        var passwordHash =
            passwordService.Hash(model.Password);

        var user = new ApplicationUser(
            model.FirstName,
            model.LastName,
            normalizedEmail,
            model.PhoneNumber,
            passwordHash,
            model.Role,
            model.AdministrativeAreaId,
            timeProvider.GetUtcNow());

        await userRepository.AddAsync(
            user,
            cancellationToken);

        await userRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(user);
    }

    public async Task<ApplicationUserDto> UpdateProfileAsync(
        Guid id,
        UpdateApplicationUserProfileModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var user = await userRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var normalizedEmail = NormalizeEmail(model.Email);

        await EnsureEmailIsAvailableAsync(
            normalizedEmail,
            user.Id,
            cancellationToken);

        var now = timeProvider.GetUtcNow();

        user.UpdateProfile(
            model.FirstName,
            model.LastName,
            model.PhoneNumber,
            now);

        if (!string.Equals(
                user.Email,
                normalizedEmail,
                StringComparison.Ordinal))
        {
            user.ChangeEmail(
                normalizedEmail,
                now);
        }

        await userRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(user);
    }

    public async Task<ApplicationUserDto> UpdateAccessAsync(
        Guid id,
        UpdateApplicationUserAccessModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (id == actingUserId)
        {
            throw new ConflictException(
                "Vous ne pouvez pas modifier votre propre rôle ou votre propre territoire.");
        }

        var user = await userRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        await ValidateAccessAssignmentAsync(
            model.Role,
            model.AdministrativeAreaId,
            cancellationToken);

        user.ChangeRoleAndArea(
            model.Role,
            model.AdministrativeAreaId,
            timeProvider.GetUtcNow());

        await userRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(user);
    }

    public async Task<ApplicationUserDto> SetActiveStatusAsync(
        Guid id,
        bool isActive,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        if (id == actingUserId)
        {
            throw new ConflictException(
                "Vous ne pouvez pas modifier l’état de votre propre compte.");
        }

        var user = await userRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var now = timeProvider.GetUtcNow();

        if (isActive)
        {
            user.Activate(now);
        }
        else
        {
            user.Deactivate(now);
        }

        await userRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(user);
    }

    public async Task ResetPasswordAsync(
        Guid id,
        string newPassword,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        var passwordHash =
            passwordService.Hash(newPassword);

        user.ChangePassword(
            passwordHash,
            timeProvider.GetUtcNow());

        await userRepository.SaveChangesAsync(
            cancellationToken);
    }

    public async Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        if (id == actingUserId)
        {
            throw new ConflictException(
                "Vous ne pouvez pas supprimer votre propre compte.");
        }

        var user = await userRepository.GetForUpdateAsync(
            id,
            cancellationToken)
            ?? throw CreateNotFoundException(id);

        user.Delete(timeProvider.GetUtcNow());

        await userRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task EnsureEmailIsAvailableAsync(
        string normalizedEmail,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        var exists =
            await userRepository
                .ExistsByEmailIncludingDeletedAsync(
                    normalizedEmail,
                    excludedId,
                    cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"Un utilisateur utilise déjà l’adresse '{normalizedEmail}'.");
        }
    }

    private async Task ValidateAccessAssignmentAsync(
        UserRole role,
        Guid? administrativeAreaId,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(role))
        {
            throw new BusinessValidationException(
                "Le rôle utilisateur est invalide.");
        }

        var allowedAreaTypes = role switch
        {
            UserRole.RegionalSupervisor =>
                new[] { AdministrativeAreaType.Region },

            UserRole.Enumerator =>
                new[]
                {
                    AdministrativeAreaType.Commune,
                    AdministrativeAreaType.Fokontany,
                    AdministrativeAreaType.EnumerationArea
                },

            _ => Array.Empty<AdministrativeAreaType>()
        };

        if (allowedAreaTypes.Length == 0)
        {
            if (administrativeAreaId.HasValue)
            {
                throw new BusinessValidationException(
                    $"Le rôle {role} ne doit pas être associé à un territoire.");
            }

            return;
        }

        if (!administrativeAreaId.HasValue)
        {
            throw new BusinessValidationException(
                $"Le rôle {role} doit être associé à un territoire.");
        }

        var area =
            await administrativeAreaRepository.GetByIdAsync(
                administrativeAreaId.Value,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"Le territoire '{administrativeAreaId}' est introuvable.");

        if (!allowedAreaTypes.Contains(area.Type))
        {
            throw new BusinessValidationException(
                $"Le rôle {role} ne peut pas être associé à un territoire de type {area.Type}.");
        }

        if (!area.IsActive)
        {
            throw new BusinessValidationException(
                "Le territoire sélectionné est inactif.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        ArgumentNullException.ThrowIfNull(email);

        var normalizedEmail =
            email.Trim().ToLowerInvariant();

        if (!MailAddress.TryCreate(
                normalizedEmail,
                out var address) ||
            !string.Equals(
                address.Address,
                normalizedEmail,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new BusinessValidationException(
                "L’adresse e-mail est invalide.");
        }

        if (normalizedEmail.Length > 254)
        {
            throw new BusinessValidationException(
                "L’adresse e-mail ne peut pas dépasser 254 caractères.");
        }

        return normalizedEmail;
    }

    private static ApplicationUserDto MapToDto(
        ApplicationUser user)
    {
        return new ApplicationUserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.AdministrativeAreaId,
            user.IsActive,
            user.LastLoginAtUtc,
            user.CreatedAtUtc,
            user.UpdatedAtUtc);
    }

    private static EntityNotFoundException
        CreateNotFoundException(Guid id)
    {
        return new EntityNotFoundException(
            $"L’utilisateur '{id}' est introuvable.");
    }
}
