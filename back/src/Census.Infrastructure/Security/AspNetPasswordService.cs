using Census.Application.Users.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Census.Infrastructure.Security;

public sealed class AspNetPasswordService
    : IPasswordService
{
    private readonly PasswordHasher<object> _passwordHasher;

    public AspNetPasswordService(
        IOptions<PasswordHasherOptions> options)
    {
        _passwordHasher =
            new PasswordHasher<object>(options);
    }

    public string Hash(string password)
    {
        ValidatePassword(password);

        return _passwordHasher.HashPassword(
            new object(),
            password);
    }

    public PasswordVerificationStatus Verify(
        string passwordHash,
        string providedPassword)
    {
        if (string.IsNullOrWhiteSpace(passwordHash) ||
            string.IsNullOrEmpty(providedPassword))
        {
            return PasswordVerificationStatus.Failed;
        }

        var result = _passwordHasher.VerifyHashedPassword(
            new object(),
            passwordHash,
            providedPassword);

        return result switch
        {
            PasswordVerificationResult.Success =>
                PasswordVerificationStatus.Success,

            PasswordVerificationResult.SuccessRehashNeeded =>
                PasswordVerificationStatus.SuccessRehashNeeded,

            _ => PasswordVerificationStatus.Failed
        };
    }

    private static void ValidatePassword(string password)
    {
        ArgumentNullException.ThrowIfNull(password);

        if (password.Length < 12)
        {
            throw new ArgumentException(
                "Le mot de passe doit contenir au moins 12 caractères.",
                nameof(password));
        }

        if (password.Length > 128)
        {
            throw new ArgumentException(
                "Le mot de passe ne peut pas dépasser 128 caractères.",
                nameof(password));
        }
    }
}
