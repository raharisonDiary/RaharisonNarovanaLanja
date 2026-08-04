using System.Security.Cryptography;
using System.Text;
using Census.Application.Authentication.Sessions.Models;
using Census.Application.Authentication.Sessions.Security;

namespace Census.Infrastructure.Authentication.Sessions;

public sealed class RefreshTokenProtector
    : IRefreshTokenProtector
{
    public RefreshTokenMaterial Create()
    {
        var tokenBytes =
            RandomNumberGenerator.GetBytes(64);

        var plainTextToken =
            Convert.ToBase64String(tokenBytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');

        return new RefreshTokenMaterial(
            plainTextToken,
            ComputeHash(plainTextToken));
    }

    public string ComputeHash(
        string plainTextToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(
            plainTextToken);

        var tokenBytes =
            Encoding.UTF8.GetBytes(
                plainTextToken);

        var hashBytes =
            SHA256.HashData(tokenBytes);

        return Convert.ToHexString(hashBytes);
    }
}
