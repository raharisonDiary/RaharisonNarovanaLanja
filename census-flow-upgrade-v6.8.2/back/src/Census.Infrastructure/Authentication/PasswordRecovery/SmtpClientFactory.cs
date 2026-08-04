using System.Net;
using System.Net.Mail;

namespace Census.Infrastructure.Authentication.PasswordRecovery;

public static class SmtpClientFactory
{
    public static SmtpClient Create(
        PasswordRecoveryEmailOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var username = options.Username.Trim();
        var password = NormalizePassword(
            options.Host,
            options.Password);

        return new SmtpClient(
            options.Host.Trim(),
            options.Port)
        {
            EnableSsl = options.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(
                username,
                password),
            Timeout = options.TimeoutMilliseconds
        };
    }

    public static MailAddress CreateFromAddress(
        PasswordRecoveryEmailOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        return new MailAddress(
            options.FromAddress.Trim(),
            string.IsNullOrWhiteSpace(options.FromName)
                ? "Census Flow"
                : options.FromName.Trim());
    }

    private static string NormalizePassword(
        string host,
        string password)
    {
        var normalized = password.Trim();

        // Google displays app passwords in groups separated by spaces.
        // SMTP expects the 16 characters without spaces.
        if (host.Contains(
                "gmail.com",
                StringComparison.OrdinalIgnoreCase) ||
            host.Contains(
                "google.com",
                StringComparison.OrdinalIgnoreCase))
        {
            normalized = new string(
                normalized
                    .Where(character =>
                        !char.IsWhiteSpace(character))
                    .ToArray());
        }

        return normalized;
    }
}
