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
    public string FromAddress { get; init; } = "no-reply@recensement.mg";
    public string FromName { get; init; } = "Plateforme de recensement";

    public bool IsValid() =>
        !Enabled ||
        (!string.IsNullOrWhiteSpace(Host) &&
         Port is > 0 and <= 65535 &&
         !string.IsNullOrWhiteSpace(FromAddress));
}
