using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Census.Application.Authentication.Security;
using Census.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Census.Infrastructure.Security;

public sealed class JwtAccessTokenService
    : IAccessTokenService
{
    private const string RoleClaimType = "role";

    private const string AdministrativeAreaClaimType =
        "administrative_area_id";

    private readonly JwtOptions _options;
    private readonly TimeProvider _timeProvider;
    private readonly SigningCredentials _signingCredentials;

    public JwtAccessTokenService(
        IOptions<JwtOptions> options,
        TimeProvider timeProvider)
    {
        _options = options.Value;
        _options.Validate();

        _timeProvider = timeProvider;

        var signingKey = new SymmetricSecurityKey(
            _options.GetSigningKeyBytes());

        _signingCredentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);
    }

    public AccessTokenResult Create(
        ApplicationUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var issuedAtUtc =
            _timeProvider.GetUtcNow();

        var expiresAtUtc =
            issuedAtUtc.AddMinutes(
                _options.AccessTokenLifetimeMinutes);

        var claims = CreateClaims(user);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: issuedAtUtc.UtcDateTime,
            expires: expiresAtUtc.UtcDateTime,
            signingCredentials: _signingCredentials);

        var serializedToken =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        return new AccessTokenResult(
            serializedToken,
            expiresAtUtc);
    }

    private static IReadOnlyList<Claim> CreateClaims(
        ApplicationUser user)
    {
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
                "name",
                user.FullName),

            new(
                RoleClaimType,
                user.Role.ToString()),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        if (user.AdministrativeAreaId.HasValue)
        {
            claims.Add(
                new Claim(
                    AdministrativeAreaClaimType,
                    user.AdministrativeAreaId.Value
                        .ToString()));
        }

        return claims;
    }
}
