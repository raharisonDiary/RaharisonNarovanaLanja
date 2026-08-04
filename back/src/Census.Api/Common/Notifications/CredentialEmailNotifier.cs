using System.Net.Mail;
using Census.Infrastructure.Authentication.PasswordRecovery;
using Microsoft.Extensions.Options;

namespace Census.Api.Common.Notifications;

public sealed class CredentialEmailNotifier(
    IOptions<PasswordRecoveryEmailOptions> options,
    ILogger<CredentialEmailNotifier> logger)
{
    private readonly PasswordRecoveryEmailOptions _options = options.Value;

    public async Task<string> SendAsync(
        string email,
        string fullName,
        string loginIdentifier,
        string temporaryPassword,
        CancellationToken cancellationToken)
    {
        if (!_options.Enabled)
        {
            logger.LogWarning(
                "Envoi des identifiants par e-mail non configuré pour {Email}.",
                email);
            return "NotConfigured";
        }

        try
        {
            using var message = new MailMessage
            {
                From = SmtpClientFactory.CreateFromAddress(
                    _options),
                Subject = "Vos identifiants Census Flow",
                Body = BuildMessage(
                    fullName,
                    loginIdentifier,
                    temporaryPassword),
                IsBodyHtml = false
            };
            message.To.Add(new MailAddress(email));

            using var client = SmtpClientFactory.Create(
                _options);

            cancellationToken.ThrowIfCancellationRequested();
            await client.SendMailAsync(
                message,
                cancellationToken);

            return "Sent";
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Échec de l'envoi des identifiants par e-mail à {Email}.",
                email);
            return "Failed";
        }
    }

    private static string BuildMessage(
        string fullName,
        string loginIdentifier,
        string temporaryPassword)
    {
        return $"""
            Bonjour {fullName},

            Votre compte Census Flow vient d'être créé.

            Identifiant : {loginIdentifier}
            Mot de passe temporaire : {temporaryPassword}

            Connectez-vous puis remplacez immédiatement ce mot de passe.
            Ne transmettez jamais vos identifiants à une autre personne.
            """;
    }
}
