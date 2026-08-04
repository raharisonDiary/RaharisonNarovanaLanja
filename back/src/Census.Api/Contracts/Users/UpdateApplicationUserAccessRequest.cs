using System.ComponentModel.DataAnnotations;
using Census.Domain.Users;

namespace Census.Api.Contracts.Users;

public sealed class UpdateApplicationUserAccessRequest
{
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; init; }

    public Guid? AdministrativeAreaId { get; init; }
}
