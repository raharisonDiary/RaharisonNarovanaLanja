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
                person =>
                    person.Sex == query.Sex.Value);
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
            var search =
                $"%{query.Search.Trim()}%";

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
        /*
         * IgnoreQueryFilters est nécessaire ici, car la contrainte
         * PostgreSQL ux_persons_household_number tient également
         * compte des enregistrements supprimés logiquement.
         */
        return await dbContext.Set<Person>()
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                person =>
                    person.HouseholdId == householdId &&
                    person.PersonNumber == personNumber &&
                    (
                        !excludedId.HasValue ||
                        person.Id != excludedId.Value
                    ),
                cancellationToken);
    }

    public async Task<bool> ExistsByNationalIdAsync(
        string normalizedNationalId,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(
                normalizedNationalId))
        {
            return false;
        }

        var nationalId =
            normalizedNationalId.Trim();

        return await dbContext.Set<Person>()
            .IgnoreQueryFilters()
            .AsNoTracking()
            .AnyAsync(
                person =>
                    person.NationalId != null &&
                    person.NationalId == nationalId &&
                    (
                        !excludedId.HasValue ||
                        person.Id != excludedId.Value
                    ),
                cancellationToken);
    }

    public async Task<Person?>
        FindPotentialDuplicateAsync(
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
        var normalizedFirstName =
            firstName.Trim();

        var normalizedLastName =
            lastName.Trim();

        var normalizedBirthPlace =
            birthPlace?.Trim();

        var persons = dbContext.Set<Person>()
            .AsNoTracking()
            .Where(
                person =>
                    person.CampaignId == campaignId &&
                    EF.Functions.ILike(
                        person.FirstName,
                        normalizedFirstName) &&
                    EF.Functions.ILike(
                        person.LastName,
                        normalizedLastName) &&
                    (
                        !excludedId.HasValue ||
                        person.Id != excludedId.Value
                    ));

        if (dateOfBirth.HasValue)
        {
            persons = persons.Where(
                person =>
                    person.DateOfBirth ==
                    dateOfBirth.Value);

            if (!string.IsNullOrWhiteSpace(
                    normalizedBirthPlace))
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
                    person =>
                        person.HouseholdId ==
                        householdId);
            }
        }
        else if (
            ageYears.HasValue &&
            !string.IsNullOrWhiteSpace(
                normalizedBirthPlace))
        {
            persons = persons.Where(
                person =>
                    person.AgeYears ==
                    ageYears.Value &&
                    person.BirthPlace != null &&
                    EF.Functions.ILike(
                        person.BirthPlace,
                        normalizedBirthPlace));
        }
        else
        {
            persons = persons.Where(
                person =>
                    person.HouseholdId ==
                    householdId);

            if (!string.IsNullOrWhiteSpace(
                    normalizedBirthPlace))
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
            .FirstOrDefaultAsync(
                cancellationToken);
    }

    public async Task<Person>
        AddWithGeneratedNumberAsync(
            Guid householdId,
            Func<int, Person> personFactory,
            CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(
            personFactory);

        /*
         * Toutes les opérations de la transaction doivent
         * être exécutées par la stratégie de reprise EF Core.
         */
        var executionStrategy =
            dbContext.Database
                .CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync(
            async retryCancellationToken =>
            {
                await using var transaction =
                    await dbContext.Database
                        .BeginTransactionAsync(
                            retryCancellationToken);

                Person? createdPerson = null;

                try
                {
                    /*
                     * Ce verrou PostgreSQL sérialise uniquement
                     * les créations concernant le même ménage.
                     *
                     * Deux appareils ne peuvent donc pas calculer
                     * simultanément le même numéro de citoyen.
                     */
                    var householdKey =
                        householdId.ToString();

                    await dbContext.Database
                        .ExecuteSqlInterpolatedAsync(
                            $"""
                            SELECT pg_advisory_xact_lock(
                                hashtextextended(
                                    {householdKey},
                                    0
                                )
                            )
                            """,
                            retryCancellationToken);

                    /*
                     * Les citoyens supprimés logiquement sont
                     * inclus afin qu'un ancien numéro ne soit
                     * jamais réutilisé.
                     */
                    var highestNumber =
                        await dbContext.Set<Person>()
                            .IgnoreQueryFilters()
                            .Where(
                                person =>
                                    person.HouseholdId ==
                                    householdId)
                            .Select(
                                person =>
                                    (int?)
                                    person.PersonNumber)
                            .MaxAsync(
                                retryCancellationToken);

                    var nextNumber =
                        checked(
                            (highestNumber ?? 0) + 1);

                    createdPerson =
                        personFactory(nextNumber);

                    await dbContext.Set<Person>()
                        .AddAsync(
                            createdPerson,
                            retryCancellationToken);

                    await dbContext.SaveChangesAsync(
                        retryCancellationToken);

                    await transaction.CommitAsync(
                        retryCancellationToken);

                    return createdPerson;
                }
                catch
                {
                    /*
                     * Si EF Core relance l'opération après une
                     * erreur temporaire, l'entité de la première
                     * tentative ne doit plus rester suivie.
                     */
                    if (createdPerson is not null)
                    {
                        var entry =
                            dbContext.Entry(
                                createdPerson);

                        if (entry.State !=
                            EntityState.Detached)
                        {
                            entry.State =
                                EntityState.Detached;
                        }
                    }

                    /*
                     * La destruction de la transaction avec
                     * await using effectue automatiquement le
                     * rollback lorsqu'elle n'a pas été validée.
                     */
                    throw;
                }
            },
            cancellationToken);
    }

    public async Task AddAsync(
        Person person,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(person);

        await dbContext.Set<Person>()
            .AddAsync(
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