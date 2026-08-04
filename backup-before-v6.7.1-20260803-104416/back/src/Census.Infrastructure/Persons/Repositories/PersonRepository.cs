using Census.Application.Persons.Models;
using Census.Application.Persons.Repositories;
using Census.Domain.Persons;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Persons.Repositories;

public sealed class PersonRepository(
    CensusDbContext dbContext)
    : IPersonRepository
{
    public async Task<IReadOnlyList<Person>> GetAllAsync(
        PersonQueryModel query,
        CancellationToken cancellationToken)
    {
        var persons = dbContext.Set<Person>()
            .AsNoTracking()
            .AsQueryable();

        if (query.CampaignId.HasValue)
        {
            persons = persons.Where(
                person =>
                    person.CampaignId ==
                    query.CampaignId.Value);
        }

        if (query.HouseholdId.HasValue)
        {
            persons = persons.Where(
                person =>
                    person.HouseholdId ==
                    query.HouseholdId.Value);
        }

        if (query.RecordStatus.HasValue)
        {
            persons = persons.Where(
                person =>
                    person.RecordStatus ==
                    query.RecordStatus.Value);
        }

        if (query.Sex.HasValue)
        {
            persons = persons.Where(
                person => person.Sex == query.Sex.Value);
        }

        if (query.CreatedByUserId.HasValue)
        {
            persons = persons.Where(
                person =>
                    person.CreatedByUserId ==
                    query.CreatedByUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = $"%{query.Search.Trim()}%";

            persons = persons.Where(
                person =>
                    EF.Functions.ILike(
                        person.FirstName,
                        search) ||
                    EF.Functions.ILike(
                        person.LastName,
                        search) ||
                    (
                        person.NationalId != null &&
                        EF.Functions.ILike(
                            person.NationalId,
                            search)
                    ));
        }

        return await persons
            .OrderBy(person => person.HouseholdId)
            .ThenBy(person => person.PersonNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<Person?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Person>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                person => person.Id == id,
                cancellationToken);
    }

    public async Task<Person?> GetForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Person>()
            .FirstOrDefaultAsync(
                person => person.Id == id,
                cancellationToken);
    }

    public async Task<bool> ExistsByPersonNumberAsync(
        Guid householdId,
        int personNumber,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Person>()
            .AsNoTracking()
            .AnyAsync(
                person =>
                    person.HouseholdId == householdId &&
                    person.PersonNumber == personNumber &&
                    (!excludedId.HasValue ||
                     person.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task<bool> ExistsByNationalIdAsync(
        string normalizedNationalId,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Set<Person>()
            .AsNoTracking()
            .AnyAsync(
                person =>
                    person.NationalId ==
                    normalizedNationalId &&
                    (!excludedId.HasValue ||
                     person.Id != excludedId.Value),
                cancellationToken);
    }

    public async Task<Person?> FindPotentialDuplicateAsync(
        Guid campaignId,
        Guid householdId,
        string firstName,
        string lastName,
        DateOnly? dateOfBirth,
        int? ageYears,
        string? birthPlace,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        var normalizedFirstName = firstName.Trim();
        var normalizedLastName = lastName.Trim();
        var normalizedBirthPlace = birthPlace?.Trim();

        var persons = dbContext.Set<Person>()
            .AsNoTracking()
            .Where(person =>
                person.CampaignId == campaignId &&
                EF.Functions.ILike(
                    person.FirstName,
                    normalizedFirstName) &&
                EF.Functions.ILike(
                    person.LastName,
                    normalizedLastName) &&
                (!excludedId.HasValue ||
                 person.Id != excludedId.Value));

        if (dateOfBirth.HasValue)
        {
            persons = persons.Where(
                person => person.DateOfBirth == dateOfBirth.Value);

            if (!string.IsNullOrWhiteSpace(normalizedBirthPlace))
            {
                persons = persons.Where(
                    person =>
                        person.BirthPlace != null &&
                        EF.Functions.ILike(
                            person.BirthPlace,
                            normalizedBirthPlace));
            }
            else
            {
                persons = persons.Where(
                    person => person.HouseholdId == householdId);
            }
        }
        else if (ageYears.HasValue &&
                 !string.IsNullOrWhiteSpace(normalizedBirthPlace))
        {
            persons = persons.Where(
                person =>
                    person.AgeYears == ageYears.Value &&
                    person.BirthPlace != null &&
                    EF.Functions.ILike(
                        person.BirthPlace,
                        normalizedBirthPlace));
        }
        else
        {
            persons = persons.Where(
                person => person.HouseholdId == householdId);

            if (!string.IsNullOrWhiteSpace(normalizedBirthPlace))
            {
                persons = persons.Where(
                    person =>
                        person.BirthPlace != null &&
                        EF.Functions.ILike(
                            person.BirthPlace,
                            normalizedBirthPlace));
            }
        }

        return await persons
            .OrderBy(person => person.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(
        Person person,
        CancellationToken cancellationToken)
    {
        await dbContext.Set<Person>().AddAsync(
            person,
            cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(
            cancellationToken);
    }
}
