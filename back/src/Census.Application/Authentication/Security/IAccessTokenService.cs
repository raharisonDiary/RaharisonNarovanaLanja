using Census.Domain.Users;

namespace Census.Application.Authentication.Security;

public interface IAccessTokenService
{
    AccessTokenResult Create(
        ApplicationUser user);
}
