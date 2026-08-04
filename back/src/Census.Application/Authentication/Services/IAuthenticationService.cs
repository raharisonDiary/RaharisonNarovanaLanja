using Census.Application.Authentication.Models;

namespace Census.Application.Authentication.Services;

public interface IAuthenticationService
{
    Task<AuthenticationResultModel> LoginAsync(
        LoginModel model,
        CancellationToken cancellationToken);

    Task<AuthenticatedUserDto> GetCurrentUserAsync(
        Guid userId,
        CancellationToken cancellationToken);
}
