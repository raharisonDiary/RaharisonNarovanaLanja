namespace Census.Application.Authentication.PasswordRecovery.Notifications;

public interface IPasswordRecoveryNotifier
{
    Task SendCodeAsync(
        string email,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        CancellationToken cancellationToken);
}
