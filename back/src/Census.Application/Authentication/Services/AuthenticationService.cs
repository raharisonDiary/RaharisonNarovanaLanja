using Census.Application.Authentication.Models;
using Census.Application.Authentication.Security;
using Census.Application.Common.Exceptions;
using Census.Application.Users.Repositories;
using Census.Application.Users.Security;
using Census.Domain.Users;

namespace Census.Application.Authentication.Services;

public sealed class AuthenticationService(
    IApplicationUserRepository userRepository,
    IPasswordService passwordService,
    IAccessTokenService accessTokenService,
    TimeProvider timeProvider)
    : IAuthenticationService
{
    private const string InvalidCredentialsMessage =
        "Adresse e-mail ou mot de passe incorrect.";

    public async Task<AuthenticationResultModel> LoginAsync(
        LoginModel model,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var normalizedEmail =
            NormalizeEmail(model.Email);

        var user =
            await userRepository.GetByEmailForUpdateAsync(
                normalizedEmail,
                cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new AuthenticationFailedException(
                InvalidCredentialsMessage);
        }

        var verificationStatus =
            passwordService.Verify(
                user.PasswordHash,
                model.Password);

        if (verificationStatus ==
            PasswordVerificationStatus.Failed)
        {
            throw new AuthenticationFailedException(
                InvalidCredentialsMessage);
        }

        var now = timeProvider.GetUtcNow();

        if (verificationStatus ==
            PasswordVerificationStatus.SuccessRehashNeeded)
        {
            var refreshedPasswordHash =
                passwordService.Hash(model.Password);

            user.ChangePassword(
                refreshedPasswordHash,
                now);
        }

        user.RegisterSuccessfulLogin(now);

        await userRepository.SaveChangesAsync(
            cancellationToken);

        var accessToken =
            accessTokenService.Create(user);

        return new AuthenticationResultModel(
            accessToken.Token,
            accessToken.ExpiresAtUtc,
            MapToDto(user));
    }

    public async Task<AuthenticatedUserDto>
        GetCurrentUserAsync(
            Guid userId,
            CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(
            userId,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new AuthenticationFailedException(
                "La session utilisateur n’est plus valide.");
        }

        return MapToDto(user);
    }

    private static string NormalizeEmail(
        string email)
    {
        ArgumentNullException.ThrowIfNull(email);

        var normalizedEmail =
            email.Trim().ToLowerInvariant();

        if (normalizedEmail.Length == 0)
        {
            throw new AuthenticationFailedException(
                InvalidCredentialsMessage);
        }

        return normalizedEmail;
    }

    private static AuthenticatedUserDto MapToDto(
        ApplicationUser user)
    {
        return new AuthenticatedUserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.AdministrativeAreaId,
            user.IsActive,
            user.LastLoginAtUtc);
    }
}
