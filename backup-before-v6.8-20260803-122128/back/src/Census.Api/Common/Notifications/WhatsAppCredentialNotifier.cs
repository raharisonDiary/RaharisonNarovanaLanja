using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace Census.Api.Common.Notifications;

public sealed class WhatsAppCredentialNotifier(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<WhatsAppCredentialNotifier> logger)
{
    public async Task<string> SendAsync(
        string phoneNumber,
        string fullName,
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var enabled = configuration.GetValue<bool>("WhatsApp:Enabled");
        var token = configuration["WhatsApp:AccessToken"];
        var phoneNumberId = configuration["WhatsApp:PhoneNumberId"];
        var version = configuration["WhatsApp:GraphApiVersion"] ?? "v24.0";

        if (!enabled ||
            string.IsNullOrWhiteSpace(token) ||
            string.IsNullOrWhiteSpace(phoneNumberId))
        {
            logger.LogInformation(
                "Notification WhatsApp simulée pour {PhoneNumber}. Configurez WhatsApp Cloud API pour l'envoi réel.",
                phoneNumber);
            return "PreviewOnly";
        }

        var endpoint = $"https://graph.facebook.com/{version}/{phoneNumberId}/messages";
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(BuildPayload(
            NormalizePhone(phoneNumber),
            fullName,
            email,
            password));

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogWarning(
                "Échec de l'envoi WhatsApp ({StatusCode}) : {ResponseBody}",
                response.StatusCode,
                body);
            return "Failed";
        }

        return "Sent";
    }

    public static string BuildPreviewUrl(
        string phoneNumber,
        string fullName,
        string email,
        string password)
    {
        var text = Uri.EscapeDataString(BuildMessage(fullName, email, password));
        return $"https://wa.me/{NormalizePhone(phoneNumber)}?text={text}";
    }

    private object BuildPayload(
        string phoneNumber,
        string fullName,
        string email,
        string password)
    {
        var templateName = configuration["WhatsApp:TemplateName"];
        if (!string.IsNullOrWhiteSpace(templateName))
        {
            return new
            {
                messaging_product = "whatsapp",
                recipient_type = "individual",
                to = phoneNumber,
                type = "template",
                template = new
                {
                    name = templateName,
                    language = new
                    {
                        code = configuration["WhatsApp:TemplateLanguage"] ?? "fr"
                    },
                    components = new object[]
                    {
                        new
                        {
                            type = "body",
                            parameters = new object[]
                            {
                                new { type = "text", text = fullName },
                                new { type = "text", text = email },
                                new { type = "text", text = password }
                            }
                        }
                    }
                }
            };
        }

        return new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = phoneNumber,
            type = "text",
            text = new
            {
                preview_url = false,
                body = BuildMessage(fullName, email, password)
            }
        };
    }

    private static string BuildMessage(
        string fullName,
        string email,
        string password)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"Bonjour {fullName},");
        builder.AppendLine();
        builder.AppendLine("Votre compte Census Flow vient d'être créé.");
        builder.AppendLine($"Identifiant : {email}");
        builder.AppendLine($"Mot de passe temporaire : {password}");
        builder.AppendLine();
        builder.AppendLine("Connectez-vous puis remplacez immédiatement ce mot de passe.");
        return builder.ToString().Trim();
    }

    private static string NormalizePhone(string phoneNumber)
    {
        return new string(phoneNumber.Where(char.IsDigit).ToArray());
    }
}
