namespace Census.Application.FieldWork.Security;

public static class FieldAuthorizationPolicies
{
    public const string ManageFieldData = nameof(ManageFieldData);
    public const string ValidateFieldData = nameof(ValidateFieldData);
    public const string ViewCensusDashboard = nameof(ViewCensusDashboard);
}
