using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mail;
using System.Text;
using Census.Application.Authentication.PasswordRecovery.Models;
using Census.Application.Authentication.PasswordRecovery.Notifications;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Authentication.PasswordRecovery;

public sealed class PasswordRecoveryNotifier(
    IOptions<PasswordRecoveryEmailOptions> emailOptions,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PasswordRecoveryNotifier> logger)
    : IPasswordRecoveryNotifier
{
    private readonly PasswordRecoveryEmailOptions _emailOptions =
        emailOptions.Value;

    public Task<bool> SendCodeAsync(
        string email,
        string? phoneNumber,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        PasswordRecoveryChannel channel,
        CancellationToken cancellationToken)
    {
        return channel switch
        {
            PasswordRecoveryChannel.Email => SendEmailAsync(
                email,
                fullName,
                code,
                expiresAtUtc,
                cancellationToken),
            PasswordRecoveryChannel.WhatsApp => SendWhatsAppAsync(
                phoneNumber,
                fullName,
                code,
                expiresAtUtc,
                cancellationToken),
            _ => Task.FromResult(false)
        };
    }

    private async Task<bool> SendEmailAsync(
        string email,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        CancellationToken cancellationToken)
    {
        if (!_emailOptions.Enabled)
        {
            logger.LogWarning(
                "Envoi OTP par e-mail non configuré pour {Email}.",
                email);
            return false;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(
                    _emailOptions.FromAddress,
                    _emailOptions.FromName),
                Subject = "Votre code OTP Census Flow",
                Body = $"""
                    Bonjour {fullName},

                    Votre code OTP est : {code}

                    Il expire à {expiresAtUtc:HH:mm} UTC.
                    Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
                    """,
                IsBodyHtml = false
            };
            message.To.Add(new MailAddress(email));

            using var client = new SmtpClient(
                _emailOptions.Host,
                _emailOptions.Port)
            {
                EnableSsl = _emailOptions.EnableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials =
                    string.IsNullOrWhiteSpace(_emailOptions.Username)
            };

            if (!string.IsNullOrWhiteSpace(_emailOptions.Username))
            {
                client.Credentials = new NetworkCredential(
                    _emailOptions.Username,
                    _emailOptions.Password);
            }

            cancellationToken.ThrowIfCancellationRequested();
            await client.SendMailAsync(
                message,
                cancellationToken);
            return true;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Échec de l'envoi OTP par e-mail à {Email}.",
                email);
            return false;
        }
    }

    private async Task<bool> SendWhatsAppAsync(
        string? phoneNumber,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc,
        CancellationToken cancellationToken)
    {
        var enabled = configuration.GetValue<bool>("WhatsApp:Enabled");
        var token = configuration["WhatsApp:AccessToken"];
        var phoneNumberId = configuration["WhatsApp:PhoneNumberId"];
        var version = configuration["WhatsApp:GraphApiVersion"] ?? "v24.0";

        if (!enabled ||
            string.IsNullOrWhiteSpace(token) ||
            string.IsNullOrWhiteSpace(phoneNumberId) ||
            string.IsNullOrWhiteSpace(phoneNumber))
        {
            logger.LogWarning(
                "Envoi OTP WhatsApp indisponible ou non configuré.");
            return false;
        }

        try
        {
            var endpoint =
                $"https://graph.facebook.com/{version}/{phoneNumberId}/messages";
            var client = httpClientFactory.CreateClient();

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                endpoint);
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
            request.Content = JsonContent.Create(
                BuildWhatsAppPayload(
                    NormalizePhone(phoneNumber),
                    fullName,
                    code,
                    expiresAtUtc));

            using var response = await client.SendAsync(
                request,
                cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            var body = await response.Content.ReadAsStringAsync(
                cancellationToken);
            logger.LogWarning(
                "Échec de l'envoi OTP WhatsApp ({StatusCode}) : {ResponseBody}",
                response.StatusCode,
                body);
            return false;
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Échec de l'envoi OTP WhatsApp.");
            return false;
        }
    }

    private object BuildWhatsAppPayload(
        string phoneNumber,
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc)
    {
        var templateName = configuration["WhatsApp:OtpTemplateName"];
        var language = configuration["WhatsApp:OtpTemplateLanguage"]
            ?? configuration["WhatsApp:TemplateLanguage"]
            ?? "fr";

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
                    language = new { code = language },
                    components = new object[]
                    {
                        new
                        {
                            type = "body",
                            parameters = new object[]
                            {
                                new { type = "text", text = fullName },
                                new { type = "text", text = code },
                                new { type = "text", text = expiresAtUtc.ToString("HH:mm 'UTC'") }
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
                body = BuildOtpMessage(
                    fullName,
                    code,
                    expiresAtUtc)
            }
        };
    }

    private static string BuildOtpMessage(
        string fullName,
        string code,
        DateTimeOffset expiresAtUtc)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"Bonjour {fullName},");
        builder.AppendLine();
        builder.AppendLine($"Votre code OTP Census Flow est : {code}");
        builder.AppendLine($"Expiration : {expiresAtUtc:HH:mm} UTC.");
        builder.AppendLine();
        builder.AppendLine("Ne partagez jamais ce code.");
        return builder.ToString().Trim();
    }

    private static string NormalizePhone(string phoneNumber)
    {
        return new string(
            phoneNumber.Where(char.IsDigit).ToArray());
    }
}
