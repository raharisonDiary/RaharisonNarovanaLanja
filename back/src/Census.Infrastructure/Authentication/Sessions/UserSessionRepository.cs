using Census.Application.Authentication.Sessions.Repositories;
using Census.Application.Common.Exceptions;
using Census.Domain.Authentication;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Authentication.Sessions;

public sealed class UserSessionRepository(
    CensusDbContext dbContext)
    : IUserSessionRepository
{
    public async Task<UserSession?>
        GetByTokenHashForUpdateAsync(
            string tokenHash,
            CancellationToken cancellationToken)
    {
        return await dbContext
            .Set<UserSession>()
            .FirstOrDefaultAsync(
                session =>
                    session.TokenHash == tokenHash,
                cancellationToken);
    }

    public async Task<IReadOnlyList<UserSession>>
        GetActiveByUserIdForUpdateAsync(
            Guid userId,
            DateTimeOffset now,
            CancellationToken cancellationToken)
    {
        return await dbContext
            .Set<UserSession>()
            .Where(
                session =>
                    session.UserId == userId &&
                    session.RevokedAtUtc == null &&
                    session.ExpiresAtUtc > now)
            .OrderBy(
                session => session.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        UserSession session,
        CancellationToken cancellationToken)
    {
        await dbContext
            .Set<UserSession>()
            .AddAsync(
                session,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(
                cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
{
    throw new AuthenticationFailedException(
        "La session a déjà été utilisée ou révoquée.");
}
    }
}
