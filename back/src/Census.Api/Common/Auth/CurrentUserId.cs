using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Census.Application.Common.Exceptions;

namespace Census.Api.Common.Auth;

public static class CurrentUserId
{
    public static Guid GetRequired(ClaimsPrincipal user)
    {
        var subject = user.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(subject, out var userId))
        {
            throw new AuthenticationFailedException(
                "Le jeton d’accès est invalide.");
        }

        return userId;
    }
}
