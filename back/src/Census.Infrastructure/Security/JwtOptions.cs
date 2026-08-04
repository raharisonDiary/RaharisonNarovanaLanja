namespace Census.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } =
        string.Empty;

    public string Audience { get; set; } =
        string.Empty;

    public string SigningKeyBase64 { get; set; } =
        string.Empty;

    public int AccessTokenLifetimeMinutes { get; set; } =
        60;

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Issuer))
        {
            throw new InvalidOperationException(
                "La configuration Jwt:Issuer est absente.");
        }

        if (string.IsNullOrWhiteSpace(Audience))
        {
            throw new InvalidOperationException(
                "La configuration Jwt:Audience est absente.");
        }

        if (AccessTokenLifetimeMinutes is < 5 or > 1440)
        {
            throw new InvalidOperationException(
                "Jwt:AccessTokenLifetimeMinutes doit être compris entre 5 et 1440.");
        }

        _ = GetSigningKeyBytes();
    }

    public byte[] GetSigningKeyBytes()
    {
        if (string.IsNullOrWhiteSpace(
                SigningKeyBase64))
        {
            throw new InvalidOperationException(
                "La configuration Jwt:SigningKeyBase64 est absente.");
        }

        byte[] signingKeyBytes;

        try
        {
            signingKeyBytes =
                Convert.FromBase64String(
                    SigningKeyBase64);
        }
        catch (FormatException exception)
        {
            throw new InvalidOperationException(
                "Jwt:SigningKeyBase64 n’est pas une clé Base64 valide.",
                exception);
        }

        if (signingKeyBytes.Length < 32)
        {
            throw new InvalidOperationException(
                "La clé JWT doit contenir au moins 32 octets.");
        }

        return signingKeyBytes;
    }
}
