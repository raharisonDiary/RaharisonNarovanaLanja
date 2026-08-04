namespace Census.Application.Users.Security;

public enum PasswordVerificationStatus
{
    Failed = 0,
    Success = 1,
    SuccessRehashNeeded = 2
}

public interface IPasswordService
{
    string Hash(string password);

    PasswordVerificationStatus Verify(
        string passwordHash,
        string providedPassword);
}
