using System.Net;
using System.Net.Mail;
using Census.Application.Authentication.PasswordRecovery.Notifications;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Authentication.PasswordRecovery;

public sealed class PasswordRecoveryNotifier(
    IOptions<PasswordRecoveryEmailOptions> options,
    ILogger<PasswordRecoveryNotifier> logger)
    : IPasswordRecoveryNotifier
{
    private readonly PasswordRecoveryEmailOptions _options = options.Value;

    public async Task SendCodeAsync(
        string email,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            logger.LogInformation(
                "Envoi e-mail désactivé. Code OTP pour {Email} ({FullName}) : {Code}. Expiration : {ExpiresAtUtc}",
                email,
                fullName,
                code,
                expiresAtUtc);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_options.FromAddress, _options.FromName),
            Subject = "Votre code de récupération Census Flow",
            Body = $"Bonjour {fullName},\n\nVotre code de vérification est : {code}\n\nIl expire à {expiresAtUtc:HH:mm} UTC.\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.",
            IsBodyHtml = false
        };
        message.To.Add(new MailAddress(email));

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = string.IsNullOrWhiteSpace(_options.Username)
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(
                _options.Username,
                _options.Password);
        }

        cancellationToken.ThrowIfCancellationRequested();
        await client.SendMailAsync(message, cancellationToken);
    }
}
