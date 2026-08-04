using Census.Application.Authentication.PasswordRecovery.Models;

namespace Census.Application.Authentication.PasswordRecovery.Notifications;

public interface IPasswordRecoveryNotifier
{
    Task<bool> SendCodeAsync(
        string email,
        string? phoneNumber,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        PasswordRecoveryChannel channel,
        CancellationToken cancellationToken);
}
