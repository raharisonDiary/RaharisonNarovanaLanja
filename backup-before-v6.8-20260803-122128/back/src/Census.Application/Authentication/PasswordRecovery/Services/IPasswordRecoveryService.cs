using Census.Application.Authentication.PasswordRecovery.Models;

namespace Census.Application.Authentication.PasswordRecovery.Services;

public interface IPasswordRecoveryService
{
    Task<PasswordRecoveryRequestResult> RequestCodeAsync(
        string email,
        CancellationToken cancellationToken);

    Task<PasswordRecoveryVerificationResult> VerifyCodeAsync(
        string email,
        string code,
        CancellationToken cancellationToken);

    Task ResetPasswordAsync(
        string email,
        string resetToken,
        string newPassword,
        CancellationToken cancellationToken);
}
