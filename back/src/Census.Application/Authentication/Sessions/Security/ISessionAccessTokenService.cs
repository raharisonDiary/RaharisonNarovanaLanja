using Census.Application.Authentication.Sessions.Models;
using Census.Domain.Users;

namespace Census.Application.Authentication.Sessions.Security;

public interface ISessionAccessTokenService
{
    SessionAccessTokenResult Create(
        ApplicationUser user);
}
