using Census.Domain.Authentication;

namespace Census.Application.Authentication.Sessions.Repositories;

public interface IUserSessionRepository
{
    Task<UserSession?> GetByTokenHashForUpdateAsync(
        string tokenHash,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<UserSession>>
        GetActiveByUserIdForUpdateAsync(
            Guid userId,
            DateTimeOffset now,
            CancellationToken cancellationToken);

    Task AddAsync(
        UserSession session,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
