using Resend;

namespace Census.Api.Common.Notifications;

public sealed class CredentialEmailNotifier(
    IResend resend,
    IConfiguration configuration,
    ILogger<CredentialEmailNotifier> logger)
{
    public async Task<string> SendAsync(
        string email,
        string fullName,
        string loginIdentifier,
        string temporaryPassword,
        CancellationToken cancellationToken)
    {
        var enabled =
            configuration.GetValue<bool>("Resend:Enabled");

        if (!enabled)
        {
            logger.LogWarning(
                "Envoi Resend des identifiants non configuré pour {Email}.",
                email);

            return "NotConfigured";
        }

        try
        {
            var from =
                configuration["Resend:FromAddress"]
                ?? "Census Flow <onboarding@resend.dev>";

            var message = new EmailMessage
            {
                From = from,
                Subject = "Vos identifiants Census Flow",
                TextBody = BuildMessage(
                    fullName,
                    loginIdentifier,
                    temporaryPassword)
            };

            message.To.Add(email);

            await resend.EmailSendAsync(
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
                "Échec de l'envoi Resend des identifiants à {Email}.",
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
