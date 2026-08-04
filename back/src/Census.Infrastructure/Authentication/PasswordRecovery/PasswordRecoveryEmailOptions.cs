using System.Net.Mail;

namespace Census.Infrastructure.Authentication.PasswordRecovery;

public sealed class PasswordRecoveryEmailOptions
{
    public const string SectionName = "PasswordRecoveryEmail";

    public bool Enabled { get; init; }
    public string Host { get; init; } = string.Empty;
    public int Port { get; init; } = 587;
    public bool EnableSsl { get; init; } = true;
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string FromAddress { get; init; } = string.Empty;
    public string FromName { get; init; } = "Census Flow";
    public int TimeoutMilliseconds { get; init; } = 60000;

    public bool IsValid()
    {
        if (!Enabled)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(Host) ||
            Port is <= 0 or > 65535 ||
            string.IsNullOrWhiteSpace(Username) ||
            string.IsNullOrWhiteSpace(Password) ||
            string.IsNullOrWhiteSpace(FromAddress) ||
            TimeoutMilliseconds is < 5000 or > 300000)
        {
            return false;
        }

        try
        {
            _ = new MailAddress(Username.Trim());
            _ = new MailAddress(FromAddress.Trim());
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
