namespace Census.Infrastructure.Bootstrap;

public sealed class BootstrapAdminOptions
{
    public const string SectionName =
        "BootstrapAdmin";

    public string FirstName { get; init; } =
        "Administrateur";

    public string LastName { get; init; } =
        "Système";

    public string Email { get; init; } =
        string.Empty;

    public string Password { get; init; } =
        string.Empty;
}
