using Census.Application.Authentication.Sessions.Models;

namespace Census.Application.Authentication.Sessions.Services;

public interface IUserSessionService
{
    Task<SessionAuthenticationResultModel> LoginAsync(
        string email,
        string password,
        SessionClientContext clientContext,
        CancellationToken cancellationToken);

    Task<SessionAuthenticationResultModel> RefreshAsync(
        string refreshToken,
        SessionClientContext clientContext,
        CancellationToken cancellationToken);

    Task LogoutAsync(
        string refreshToken,
        SessionClientContext clientContext,
        CancellationToken cancellationToken);

    Task LogoutAllAsync(
        Guid userId,
        SessionClientContext clientContext,
        CancellationToken cancellationToken);
}
