using Census.Application.Persons.Models;

namespace Census.Application.Persons.Services;

public interface IPersonService
{
    Task<IReadOnlyList<PersonDto>> GetAllAsync(
        PersonQueryModel query,
        CancellationToken cancellationToken);

    Task<PersonDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<PersonDto> CreateAsync(
        CreatePersonModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<PersonDto> UpdateAsync(
        Guid id,
        UpdatePersonModel model,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<PersonDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<PersonDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task<PersonDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken);
}
