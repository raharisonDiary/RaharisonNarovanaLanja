using Census.Application.Persons.Models;
using Census.Domain.Persons;

namespace Census.Application.Persons.Repositories;

public interface IPersonRepository
{
    Task<IReadOnlyList<Person>> GetAllAsync(
        PersonQueryModel query,
        CancellationToken cancellationToken);

    Task<Person?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<Person?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<bool> ExistsByPersonNumberAsync(
        Guid householdId,
        int personNumber,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task<bool> ExistsByNationalIdAsync(
        string normalizedNationalId,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task<Person?> FindPotentialDuplicateAsync(
        Guid campaignId,
        Guid householdId,
        string firstName,
        string lastName,
        DateOnly? dateOfBirth,
        int? ageYears,
        string? birthPlace,
        Guid? excludedId,
        CancellationToken cancellationToken);

    Task<Person> AddWithGeneratedNumberAsync(
        Guid householdId,
        Func<int, Person> personFactory,
        CancellationToken cancellationToken);

    Task AddAsync(
        Person person,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}
