namespace Census.Infrastructure.Authentication.Sessions;

public sealed class SessionJwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } =
        string.Empty;

    public string Audience { get; init; } =
        string.Empty;

    public string SigningKeyBase64 { get; init; } =
        string.Empty;

    public int AccessTokenLifetimeMinutes
    {
        get;
        init;
    } = 60;

    public bool IsValid()
    {
        if (string.IsNullOrWhiteSpace(Issuer) ||
            string.IsNullOrWhiteSpace(Audience) ||
            AccessTokenLifetimeMinutes <= 0)
        {
            return false;
        }

        try
        {
            var keyBytes =
                Convert.FromBase64String(
                    SigningKeyBase64);

            return keyBytes.Length >= 32;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
