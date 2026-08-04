using Census.Application.Authentication.Sessions.Models;
using Census.Application.Authentication.Sessions.Repositories;
using Census.Application.Authentication.Sessions.Security;
using Census.Application.Authentication.Sessions.Services;
using Census.Application.Common.Exceptions;
using Census.Application.Users.Repositories;
using Census.Domain.Authentication;
using Census.Domain.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Authentication.Sessions;

public sealed class UserSessionService(
    IApplicationUserRepository userRepository,
    IUserSessionRepository sessionRepository,
    IRefreshTokenProtector refreshTokenProtector,
    ISessionAccessTokenService accessTokenService,
    PasswordHasher<object> passwordHasher,
    IOptions<UserSessionOptions> options,
    TimeProvider timeProvider)
    : IUserSessionService
{
    private readonly UserSessionOptions _options =
        options.Value;

    private readonly object _passwordUser = new();

    public async Task<SessionAuthenticationResultModel>
        LoginAsync(
            string email,
            string password,
            SessionClientContext clientContext,
            CancellationToken cancellationToken)
    {
        var normalizedEmail =
            NormalizeEmail(email);

        var user =
            await userRepository.GetByEmailForUpdateAsync(
                normalizedEmail,
                cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw CreateInvalidCredentialsException();
        }

        var verification =
            passwordHasher.VerifyHashedPassword(
                _passwordUser,
                user.PasswordHash,
                password);

        if (verification ==
            PasswordVerificationResult.Failed)
        {
            throw CreateInvalidCredentialsException();
        }

        var now = timeProvider.GetUtcNow();

        if (verification ==
            PasswordVerificationResult
                .SuccessRehashNeeded)
        {
            var newHash =
                passwordHasher.HashPassword(
                    _passwordUser,
                    password);

            user.ChangePassword(
                newHash,
                now);
        }

        user.RegisterSuccessfulLogin(now);

        await RevokeExcessSessionsAsync(
            user.Id,
            now,
            clientContext,
            cancellationToken);

        var result = await CreateSessionAsync(
            user,
            now,
            clientContext,
            cancellationToken);

        await sessionRepository.SaveChangesAsync(
            cancellationToken);

        return result;
    }

    public async Task<SessionAuthenticationResultModel>
        RefreshAsync(
            string refreshToken,
            SessionClientContext clientContext,
            CancellationToken cancellationToken)
    {
        var tokenHash =
            refreshTokenProtector.ComputeHash(
                refreshToken);

        var session =
            await sessionRepository
                .GetByTokenHashForUpdateAsync(
                    tokenHash,
                    cancellationToken)
            ?? throw CreateInvalidSessionException();

        var now = timeProvider.GetUtcNow();

        if (session.RevokedAtUtc.HasValue)
        {
            if (session.ReplacedBySessionId.HasValue)
            {
                await RevokeAllActiveSessionsAsync(
                    session.UserId,
                    now,
                    clientContext.IpAddress,
                    "Réutilisation d’un refresh token détectée.",
                    cancellationToken);

                await sessionRepository.SaveChangesAsync(
                    cancellationToken);
            }

            throw CreateInvalidSessionException();
        }

        if (session.ExpiresAtUtc <= now)
        {
            session.Revoke(
                now,
                clientContext.IpAddress,
                "Session expirée.");

            await sessionRepository.SaveChangesAsync(
                cancellationToken);

            throw CreateInvalidSessionException();
        }

        var user =
            await userRepository.GetForUpdateAsync(
                session.UserId,
                cancellationToken);

        if (user is null || !user.IsActive)
        {
            await RevokeAllActiveSessionsAsync(
                session.UserId,
                now,
                clientContext.IpAddress,
                "Compte indisponible.",
                cancellationToken);

            await sessionRepository.SaveChangesAsync(
                cancellationToken);

            throw CreateInvalidSessionException();
        }

        var refreshMaterial =
            refreshTokenProtector.Create();

        var newSession =
            new UserSession(
                user.Id,
                refreshMaterial.TokenHash,
                now,
                now.AddDays(
                    _options.RefreshTokenLifetimeDays),
                clientContext.IpAddress,
                clientContext.UserAgent,
                clientContext.DeviceName);

        session.Revoke(
            now,
            clientContext.IpAddress,
            "Refresh token remplacé.",
            newSession.Id);

        await sessionRepository.AddAsync(
            newSession,
            cancellationToken);

        await sessionRepository.SaveChangesAsync(
            cancellationToken);

        var accessToken =
            accessTokenService.Create(user);

        return BuildResult(
            user,
            accessToken,
            refreshMaterial.PlainTextToken,
            newSession.ExpiresAtUtc);
    }

    public async Task LogoutAsync(
        string refreshToken,
        SessionClientContext clientContext,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash =
            refreshTokenProtector.ComputeHash(
                refreshToken);

        var session =
            await sessionRepository
                .GetByTokenHashForUpdateAsync(
                    tokenHash,
                    cancellationToken);

        if (session is null ||
            session.RevokedAtUtc.HasValue)
        {
            return;
        }

        session.Revoke(
            timeProvider.GetUtcNow(),
            clientContext.IpAddress,
            "Déconnexion de la session.");

        await sessionRepository.SaveChangesAsync(
            cancellationToken);
    }

    public async Task LogoutAllAsync(
        Guid userId,
        SessionClientContext clientContext,
        CancellationToken cancellationToken)
    {
        var user =
            await userRepository.GetByIdAsync(
                userId,
                cancellationToken)
            ?? throw new AuthenticationFailedException(
                "Le compte utilisateur est introuvable.");

        await RevokeAllActiveSessionsAsync(
            user.Id,
            timeProvider.GetUtcNow(),
            clientContext.IpAddress,
            "Déconnexion de tous les appareils.",
            cancellationToken);

        await sessionRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task<SessionAuthenticationResultModel>
        CreateSessionAsync(
            ApplicationUser user,
            DateTimeOffset now,
            SessionClientContext clientContext,
            CancellationToken cancellationToken)
    {
        var refreshMaterial =
            refreshTokenProtector.Create();

        var refreshExpiresAtUtc =
            now.AddDays(
                _options.RefreshTokenLifetimeDays);

        var session =
            new UserSession(
                user.Id,
                refreshMaterial.TokenHash,
                now,
                refreshExpiresAtUtc,
                clientContext.IpAddress,
                clientContext.UserAgent,
                clientContext.DeviceName);

        await sessionRepository.AddAsync(
            session,
            cancellationToken);

        var accessToken =
            accessTokenService.Create(user);

        return BuildResult(
            user,
            accessToken,
            refreshMaterial.PlainTextToken,
            refreshExpiresAtUtc);
    }

    private async Task RevokeExcessSessionsAsync(
        Guid userId,
        DateTimeOffset now,
        SessionClientContext clientContext,
        CancellationToken cancellationToken)
    {
        var activeSessions =
            await sessionRepository
                .GetActiveByUserIdForUpdateAsync(
                    userId,
                    now,
                    cancellationToken);

        var numberToRevoke =
            activeSessions.Count -
            _options.MaximumActiveSessionsPerUser +
            1;

        if (numberToRevoke <= 0)
        {
            return;
        }

        foreach (var session in
                 activeSessions.Take(numberToRevoke))
        {
            session.Revoke(
                now,
                clientContext.IpAddress,
                "Limite de sessions actives atteinte.");
        }
    }

    private async Task RevokeAllActiveSessionsAsync(
        Guid userId,
        DateTimeOffset now,
        string? ipAddress,
        string reason,
        CancellationToken cancellationToken)
    {
        var sessions =
            await sessionRepository
                .GetActiveByUserIdForUpdateAsync(
                    userId,
                    now,
                    cancellationToken);

        foreach (var activeSession in sessions)
        {
            activeSession.Revoke(
                now,
                ipAddress,
                reason);
        }
    }

    private static SessionAuthenticationResultModel
        BuildResult(
            ApplicationUser user,
            SessionAccessTokenResult accessToken,
            string refreshToken,
            DateTimeOffset refreshExpiresAtUtc)
    {
        var userDto =
            new SessionUserDto(
                user.Id,
                user.FirstName,
                user.LastName,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Role,
                user.AdministrativeAreaId,
                user.IsActive);

        return new SessionAuthenticationResultModel(
            accessToken.Token,
            "Bearer",
            accessToken.ExpiresAtUtc,
            refreshToken,
            refreshExpiresAtUtc,
            userDto);
    }

    private static string NormalizeEmail(
        string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw CreateInvalidCredentialsException();
        }

        return email
            .Trim()
            .ToLowerInvariant();
    }

    private static AuthenticationFailedException
        CreateInvalidCredentialsException()
    {
        return new AuthenticationFailedException(
            "L’adresse e-mail ou le mot de passe est incorrect.");
    }

    private static AuthenticationFailedException
        CreateInvalidSessionException()
    {
        return new AuthenticationFailedException(
            "La session est invalide ou a expiré.");
    }
}
