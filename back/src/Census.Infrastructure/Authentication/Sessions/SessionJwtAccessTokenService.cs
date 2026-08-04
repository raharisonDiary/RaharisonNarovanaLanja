using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Census.Application.Authentication.Sessions.Models;
using Census.Application.Authentication.Sessions.Security;
using Census.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Census.Infrastructure.Authentication.Sessions;

public sealed class SessionJwtAccessTokenService(
    IOptions<SessionJwtOptions> options,
    TimeProvider timeProvider)
    : ISessionAccessTokenService
{
    private readonly SessionJwtOptions _options =
        options.Value;

    public SessionAccessTokenResult Create(
        ApplicationUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var now = timeProvider.GetUtcNow();

        var expiresAtUtc =
            now.AddMinutes(
                _options.AccessTokenLifetimeMinutes);

        var signingKey =
            new SymmetricSecurityKey(
                Convert.FromBase64String(
                    _options.SigningKeyBase64));

        var credentials =
            new SigningCredentials(
                signingKey,
                SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()),

            new(
                JwtRegisteredClaimNames.Email,
                user.Email),

            new(
                JwtRegisteredClaimNames.GivenName,
                user.FirstName),

            new(
                JwtRegisteredClaimNames.FamilyName,
                user.LastName),

            new(
                JwtRegisteredClaimNames.Name,
                user.FullName),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()),

            new(
                "role",
                user.Role.ToString())
        };

        if (user.AdministrativeAreaId.HasValue)
        {
            claims.Add(
                new Claim(
                    "administrative_area_id",
                    user.AdministrativeAreaId
                        .Value
                        .ToString()));
        }

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAtUtc.UtcDateTime,
            signingCredentials: credentials);

        var encodedToken =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        return new SessionAccessTokenResult(
            encodedToken,
            expiresAtUtc);
    }
}
