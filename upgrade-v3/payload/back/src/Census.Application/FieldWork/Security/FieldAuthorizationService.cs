using Census.Application.Common.Exceptions;
using Census.Application.Users.Repositories;
using Census.Domain.Users;

namespace Census.Application.FieldWork.Security;

public sealed class FieldAuthorizationService(
    IApplicationUserRepository userRepository,
    IAreaHierarchyQuery areaHierarchyQuery)
    : IFieldAuthorizationService
{
    public async Task EnsureCanManageAreaAsync(
        Guid actingUserId,
        Guid targetAreaId,
        Guid? recordOwnerId,
        CancellationToken cancellationToken)
    {
        var user = await GetActiveUserAsync(actingUserId, cancellationToken);

        switch (user.Role)
        {
            case UserRole.SystemAdministrator:
            case UserRole.NationalCoordinator:
                return;

            case UserRole.RegionalSupervisor:
                await EnsureAreaIsInsideUserScopeAsync(
                    user,
                    targetAreaId,
                    cancellationToken);
                return;

            case UserRole.Enumerator:
                await EnsureAreaIsInsideUserScopeAsync(
                    user,
                    targetAreaId,
                    cancellationToken);

                if (recordOwnerId.HasValue &&
                    recordOwnerId.Value != actingUserId)
                {
                    throw new BusinessValidationException(
                        "L’agent recenseur ne peut modifier que ses propres enregistrements.");
                }

                return;

            default:
                throw new BusinessValidationException(
                    "Le rôle de cet utilisateur ne permet pas de modifier les données de terrain.");
        }
    }

    public async Task EnsureCanValidateAreaAsync(
        Guid actingUserId,
        Guid targetAreaId,
        CancellationToken cancellationToken)
    {
        var user = await GetActiveUserAsync(actingUserId, cancellationToken);

        switch (user.Role)
        {
            case UserRole.SystemAdministrator:
            case UserRole.NationalCoordinator:
                return;

            case UserRole.RegionalSupervisor:
                await EnsureAreaIsInsideUserScopeAsync(
                    user,
                    targetAreaId,
                    cancellationToken);
                return;

            default:
                throw new BusinessValidationException(
                    "Le rôle de cet utilisateur ne permet pas de valider les données de terrain.");
        }
    }

    private async Task<ApplicationUser> GetActiveUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(
            userId,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new AuthenticationFailedException(
                "Le compte utilisateur est indisponible.");
        }

        return user;
    }

    private async Task EnsureAreaIsInsideUserScopeAsync(
        ApplicationUser user,
        Guid targetAreaId,
        CancellationToken cancellationToken)
    {
        if (!user.AdministrativeAreaId.HasValue)
        {
            throw new BusinessValidationException(
                "Aucun territoire n’est associé à ce responsable régional.");
        }

        var isInsideScope =
            await areaHierarchyQuery.IsDescendantOrSelfAsync(
                targetAreaId,
                user.AdministrativeAreaId.Value,
                cancellationToken);

        if (!isInsideScope)
        {
            throw new BusinessValidationException(
                "Le territoire demandé se trouve en dehors du périmètre de cet utilisateur.");
        }
    }
}
