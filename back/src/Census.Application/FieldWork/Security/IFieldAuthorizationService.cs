namespace Census.Application.FieldWork.Security;

public interface IFieldAuthorizationService
{
    Task EnsureCanManageAreaAsync(
        Guid actingUserId,
        Guid targetAreaId,
        Guid? recordOwnerId,
        CancellationToken cancellationToken);

    Task EnsureCanValidateAreaAsync(
        Guid actingUserId,
        Guid targetAreaId,
        CancellationToken cancellationToken);
}
