namespace Census.Application.Authorization;

public static class AuthorizationPolicies
{
    public const string ManageAdministrativeAreas =
        nameof(ManageAdministrativeAreas);

    public const string ManageUsers =
        nameof(ManageUsers);

    public const string ManageCampaigns =
        nameof(ManageCampaigns);

    public const string AccessNationalData =
        nameof(AccessNationalData);

    public const string AccessRegionalData =
        nameof(AccessRegionalData);
}
