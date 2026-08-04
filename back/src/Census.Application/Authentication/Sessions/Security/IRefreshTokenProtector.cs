using Census.Application.Authentication.Sessions.Models;

namespace Census.Application.Authentication.Sessions.Security;

public interface IRefreshTokenProtector
{
    RefreshTokenMaterial Create();

    string ComputeHash(string plainTextToken);
}
