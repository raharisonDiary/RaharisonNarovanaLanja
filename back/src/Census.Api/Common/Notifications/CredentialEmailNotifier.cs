using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace Census.Api.Common.Notifications;

public sealed class CredentialEmailNotifier(
    HttpClient httpClient,
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
            configuration.GetValue<bool>("GmailOAuth:Enabled");

        if (!enabled)
        {
            logger.LogWarning(
                "Envoi Gmail API non configuré pour {Email}.",
                email);

            return "NotConfigured";
        }

        try
        {
            var accessToken =
                await GetAccessTokenAsync(cancellationToken);

            var fromAddress =
                configuration["GmailOAuth:FromAddress"]
                ?? throw new InvalidOperationException(
                    "GmailOAuth:FromAddress est absent.");

            var rawMessage = BuildRawMessage(
                fromAddress,
                email,
                fullName,
                loginIdentifier,
                temporaryPassword);

            var encodedMessage =
                Convert.ToBase64String(
                        Encoding.UTF8.GetBytes(rawMessage))
                    .TrimEnd('=')
                    .Replace('+', '-')
                    .Replace('/', '_');

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send");

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    accessToken);

            request.Content = JsonContent.Create(
                new
                {
                    raw = encodedMessage
                });

            using var response =
                await httpClient.SendAsync(
                    request,
                    cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body =
                    await response.Content.ReadAsStringAsync(
                        cancellationToken);

                logger.LogWarning(
                    "Échec Gmail API ({StatusCode}) : {ResponseBody}",
                    response.StatusCode,
                    body);

                return "Failed";
            }

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
                "Échec de l'envoi Gmail API à {Email}.",
                email);

            return "Failed";
        }
    }

    private async Task<string> GetAccessTokenAsync(
        CancellationToken cancellationToken)
    {
        var clientId =
            configuration["GmailOAuth:ClientId"]
            ?? throw new InvalidOperationException(
                "GmailOAuth:ClientId est absent.");

        var clientSecret =
            configuration["GmailOAuth:ClientSecret"]
            ?? throw new InvalidOperationException(
                "GmailOAuth:ClientSecret est absent.");

        var refreshToken =
            configuration["GmailOAuth:RefreshToken"]
            ?? throw new InvalidOperationException(
                "GmailOAuth:RefreshToken est absent.");

        using var response =
            await httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(
                    new Dictionary<string, string>
                    {
                        ["client_id"] = clientId,
                        ["client_secret"] = clientSecret,
                        ["refresh_token"] = refreshToken,
                        ["grant_type"] = "refresh_token"
                    }),
                cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body =
                await response.Content.ReadAsStringAsync(
                    cancellationToken);

            throw new InvalidOperationException(
                $"Impossible d'obtenir un access token Google : {body}");
        }

        var tokenResponse =
            await response.Content
                .ReadFromJsonAsync<GoogleTokenResponse>(
                    cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException(
                "Réponse OAuth Google invalide.");

        if (string.IsNullOrWhiteSpace(
                tokenResponse.AccessToken))
        {
            throw new InvalidOperationException(
                "Google n'a pas retourné d'access token.");
        }

        return tokenResponse.AccessToken;
    }

    private static string BuildRawMessage(
        string from,
        string to,
        string fullName,
        string loginIdentifier,
        string temporaryPassword)
    {
        var subject =
            "Vos identifiants Census Flow";

        var body = $"""
            Bonjour {fullName},

            Votre compte Census Flow vient d'être créé.

            Identifiant : {loginIdentifier}
            Mot de passe temporaire : {temporaryPassword}

            Connectez-vous puis remplacez immédiatement ce mot de passe.
            Ne transmettez jamais vos identifiants à une autre personne.
            """;

        return
            $"From: Census Flow <{from}>\r\n" +
            $"To: {to}\r\n" +
            $"Subject: {subject}\r\n" +
            "MIME-Version: 1.0\r\n" +
            "Content-Type: text/plain; charset=UTF-8\r\n" +
            "\r\n" +
            body;
    }

    private sealed class GoogleTokenResponse
    {
        [System.Text.Json.Serialization.JsonPropertyName(
            "access_token")]
        public string AccessToken { get; init; } =
            string.Empty;
    }
}
