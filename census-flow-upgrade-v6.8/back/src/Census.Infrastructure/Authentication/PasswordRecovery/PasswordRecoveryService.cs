using System.Security.Cryptography;
using System.Text;
using Census.Application.Authentication.PasswordRecovery.Models;
using Census.Application.Authentication.PasswordRecovery.Notifications;
using Census.Application.Authentication.PasswordRecovery.Services;
using Census.Application.Authentication.Sessions.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.Users.Repositories;
using Census.Application.Users.Security;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Authentication.PasswordRecovery;

public sealed class PasswordRecoveryService(
    IApplicationUserRepository userRepository,
    IUserSessionRepository sessionRepository,
    IPasswordService passwordService,
    IPasswordRecoveryNotifier notifier,
    IOptions<PasswordRecoveryOptions> options,
    TimeProvider timeProvider)
    : IPasswordRecoveryService
{
    private readonly PasswordRecoveryOptions _options = options.Value;

    public async Task<PasswordRecoveryRequestResult> RequestCodeAsync(
        string email,
        PasswordRecoveryChannel channel,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        var genericMessage = BuildGenericMessage(channel);
        var user = await userRepository.GetByEmailForUpdateAsync(
            normalizedEmail,
            cancellationToken);

        // Réponse générique : ne révèle pas si le compte existe.
        if (user is null || !user.IsActive)
        {
            return new PasswordRecoveryRequestResult(
                genericMessage,
                null,
                channel);
        }

        var now = timeProvider.GetUtcNow();
        var code = RandomNumberGenerator
            .GetInt32(0, 1_000_000)
            .ToString("D6");
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var salt = Convert.ToBase64String(saltBytes);
        var codeHash = ComputeCodeHash(code, saltBytes);
        var expiresAtUtc = now.AddMinutes(
            _options.OtpLifetimeMinutes);

        user.BeginPasswordRecovery(
            codeHash,
            salt,
            expiresAtUtc,
            now);
        await userRepository.SaveChangesAsync(
            cancellationToken);

        var sent = await notifier.SendCodeAsync(
            user.Email,
            user.PhoneNumber,
            user.FullName,
            code,
            expiresAtUtc,
            channel,
            cancellationToken);

        if (!sent)
        {
            user.ClearPasswordRecovery(now);
            await userRepository.SaveChangesAsync(
                cancellationToken);

            throw new BusinessValidationException(
                channel == PasswordRecoveryChannel.WhatsApp
                    ? "Le code OTP n'a pas pu être envoyé par WhatsApp. Vérifiez le numéro associé au compte et la configuration WhatsApp."
                    : "Le code OTP n'a pas pu être envoyé par e-mail. Vérifiez la configuration SMTP.");
        }

        return new PasswordRecoveryRequestResult(
            genericMessage,
            expiresAtUtc,
            channel);
    }

    public async Task<PasswordRecoveryVerificationResult> VerifyCodeAsync(
        string email,
        string code,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        var normalizedCode = (code ?? string.Empty).Trim();

        if (normalizedCode.Length != 6 ||
            !normalizedCode.All(char.IsDigit))
        {
            throw new BusinessValidationException(
                "Le code de vérification doit contenir exactement 6 chiffres.");
        }

        var user = await userRepository.GetByEmailForUpdateAsync(
            normalizedEmail,
            cancellationToken);

        var now = timeProvider.GetUtcNow();

        if (user is null || !user.IsActive ||
            string.IsNullOrWhiteSpace(user.PasswordRecoveryCodeHash) ||
            string.IsNullOrWhiteSpace(user.PasswordRecoveryCodeSalt) ||
            !user.PasswordRecoveryCodeExpiresAtUtc.HasValue ||
            user.PasswordRecoveryCodeExpiresAtUtc <= now)
        {
            throw new BusinessValidationException(
                "Le code est invalide ou a expiré. Demandez un nouveau code.");
        }

        if (user.PasswordRecoveryAttemptCount >=
            _options.MaximumVerificationAttempts)
        {
            user.ClearPasswordRecovery(now);
            await userRepository.SaveChangesAsync(cancellationToken);
            throw new BusinessValidationException(
                "Trop de tentatives ont été effectuées. Demandez un nouveau code.");
        }

        byte[] saltBytes;
        try
        {
            saltBytes = Convert.FromBase64String(
                user.PasswordRecoveryCodeSalt);
        }
        catch (FormatException)
        {
            user.ClearPasswordRecovery(now);
            await userRepository.SaveChangesAsync(cancellationToken);
            throw new BusinessValidationException(
                "Le code est invalide ou a expiré. Demandez un nouveau code.");
        }

        var expectedHash = Convert.FromBase64String(
            user.PasswordRecoveryCodeHash);
        var actualHash = Convert.FromBase64String(
            ComputeCodeHash(normalizedCode, saltBytes));

        if (!CryptographicOperations.FixedTimeEquals(
                expectedHash,
                actualHash))
        {
            user.RegisterPasswordRecoveryFailure(now);
            await userRepository.SaveChangesAsync(cancellationToken);
            throw new BusinessValidationException(
                "Le code saisi est incorrect.");
        }

        var resetToken = Convert.ToBase64String(
            RandomNumberGenerator.GetBytes(32));
        var tokenHash = ComputeTokenHash(resetToken);
        var tokenExpiresAtUtc = now.AddMinutes(
            _options.ResetTokenLifetimeMinutes);

        user.VerifyPasswordRecovery(
            tokenHash,
            tokenExpiresAtUtc,
            now);
        await userRepository.SaveChangesAsync(cancellationToken);

        return new PasswordRecoveryVerificationResult(
            resetToken,
            tokenExpiresAtUtc);
    }

    public async Task ResetPasswordAsync(
        string email,
        string resetToken,
        string newPassword,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        var user = await userRepository.GetByEmailForUpdateAsync(
            normalizedEmail,
            cancellationToken);

        var now = timeProvider.GetUtcNow();

        if (user is null || !user.IsActive ||
            string.IsNullOrWhiteSpace(user.PasswordRecoveryTokenHash) ||
            !user.PasswordRecoveryTokenExpiresAtUtc.HasValue ||
            user.PasswordRecoveryTokenExpiresAtUtc <= now ||
            string.IsNullOrWhiteSpace(resetToken))
        {
            throw new BusinessValidationException(
                "La demande de réinitialisation est invalide ou a expiré.");
        }

        var expectedHash = Convert.FromBase64String(
            user.PasswordRecoveryTokenHash);
        var actualHash = Convert.FromBase64String(
            ComputeTokenHash(resetToken.Trim()));

        if (!CryptographicOperations.FixedTimeEquals(
                expectedHash,
                actualHash))
        {
            throw new BusinessValidationException(
                "La demande de réinitialisation est invalide ou a expiré.");
        }

        var passwordHash = passwordService.Hash(newPassword);
        user.ChangePassword(passwordHash, now);

        var sessions = await sessionRepository
            .GetActiveByUserIdForUpdateAsync(
                user.Id,
                now,
                cancellationToken);

        foreach (var session in sessions)
        {
            session.Revoke(
                now,
                revokedByIpAddress: null,
                "Mot de passe réinitialisé.");
        }

        await userRepository.SaveChangesAsync(cancellationToken);
    }

    private static string BuildGenericMessage(
        PasswordRecoveryChannel channel)
    {
        return channel == PasswordRecoveryChannel.WhatsApp
            ? "Si un compte actif correspond à cette adresse, un code OTP a été envoyé sur le numéro WhatsApp associé."
            : "Si un compte actif correspond à cette adresse, un code OTP a été envoyé par e-mail.";
    }

    private static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new BusinessValidationException(
                "L’adresse e-mail est obligatoire.");
        }

        return email.Trim().ToLowerInvariant();
    }

    private static string ComputeCodeHash(
        string code,
        byte[] salt)
    {
        var codeBytes = Encoding.UTF8.GetBytes(code);
        var material = new byte[salt.Length + codeBytes.Length];
        Buffer.BlockCopy(salt, 0, material, 0, salt.Length);
        Buffer.BlockCopy(
            codeBytes,
            0,
            material,
            salt.Length,
            codeBytes.Length);
        return Convert.ToBase64String(
            SHA256.HashData(material));
    }

    private static string ComputeTokenHash(string token)
    {
        return Convert.ToBase64String(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));
    }
}
