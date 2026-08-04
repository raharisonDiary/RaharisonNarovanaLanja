using Census.Application.Campaigns.Repositories;
using Census.Application.Common.Exceptions;
using Census.Application.Dwellings.Repositories;
using Census.Application.FieldWork.Security;
using Census.Application.Households.Repositories;
using Census.Application.Persons.Models;
using Census.Application.Persons.Repositories;
using Census.Domain.Campaigns;
using Census.Domain.Persons;

namespace Census.Application.Persons.Services;

public sealed class PersonService(
    IPersonRepository personRepository,
    IHouseholdRepository householdRepository,
    IDwellingRepository dwellingRepository,
    ICensusCampaignRepository campaignRepository,
    IFieldAuthorizationService fieldAuthorizationService,
    TimeProvider timeProvider)
    : IPersonService
{
    public async Task<IReadOnlyList<PersonDto>> GetAllAsync(
        PersonQueryModel query,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(query);

        var persons = await personRepository.GetAllAsync(
            query,
            cancellationToken);

        return persons.Select(MapToDto).ToList();
    }

    public async Task<PersonDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var person = await personRepository.GetByIdAsync(
            id,
            cancellationToken);

        return person is null
            ? throw CreateNotFoundException(id)
            : MapToDto(person);
    }

    public async Task<PersonDto> CreateAsync(
        CreatePersonModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var household =
            await householdRepository.GetByIdAsync(
                model.HouseholdId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"Le ménage '{model.HouseholdId}' est introuvable.");

        var dwelling =
            await dwellingRepository.GetByIdAsync(
                household.DwellingId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"L’habitation '{household.DwellingId}' est introuvable.");

        await EnsureCampaignIsActiveAsync(
            household.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            dwelling.EnumerationAreaId,
            recordOwnerId: null,
            cancellationToken);

        ValidateAgeInformation(
            model.DateOfBirth,
            model.AgeYears,
            model.BirthDatePrecision);

        var numberExists =
            await personRepository.ExistsByPersonNumberAsync(
                household.Id,
                model.PersonNumber,
                excludedId: null,
                cancellationToken);

        if (numberExists)
        {
            throw new ConflictException(
                $"Le numéro {model.PersonNumber} existe déjà dans ce ménage.");
        }

        await EnsureNationalIdIsAvailableAsync(
            model.NationalId,
            excludedId: null,
            cancellationToken);

        var now = timeProvider.GetUtcNow();
        var person = new Person(
            household.CampaignId,
            household.Id,
            model.PersonNumber,
            model.FirstName,
            model.LastName,
            model.Sex,
            model.DateOfBirth,
            model.AgeYears,
            model.BirthDatePrecision,
            model.BirthPlace,
            model.RelationshipToHead,
            model.MaritalStatus,
            model.ChildrenCount,
            model.Nationality,
            model.Occupation,
            model.PhoneNumber,
            model.NationalId,
            model.NationalIdIssueDate,
            model.NationalIdIssuePlace,
            model.PhotoDataUrl,
            actingUserId,
            now);

        if (!string.IsNullOrWhiteSpace(model.Notes))
        {
            person.UpdateDetails(
                model.FirstName,
                model.LastName,
                model.Sex,
                model.DateOfBirth,
                model.AgeYears,
                model.BirthDatePrecision,
                model.BirthPlace,
                model.RelationshipToHead,
                model.MaritalStatus,
                model.ChildrenCount,
                model.Nationality,
                model.Occupation,
                model.PhoneNumber,
                model.NationalId,
                model.NationalIdIssueDate,
                model.NationalIdIssuePlace,
                model.PhotoDataUrl,
                model.Notes,
                now);
        }

        await personRepository.AddAsync(
            person,
            cancellationToken);

        await personRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(person);
    }

    public async Task<PersonDto> UpdateAsync(
        Guid id,
        UpdatePersonModel model,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(model);

        var context = await GetContextAsync(
            id,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            context.Person.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            context.Dwelling.EnumerationAreaId,
            context.Person.CreatedByUserId,
            cancellationToken);

        if (context.Person.RecordStatus is
            PersonRecordStatus.Submitted or
            PersonRecordStatus.Validated)
        {
            throw new ConflictException(
                "Cette personne ne peut plus être modifiée dans son état actuel.");
        }

        ValidateAgeInformation(
            model.DateOfBirth,
            model.AgeYears,
            model.BirthDatePrecision);

        await EnsureNationalIdIsAvailableAsync(
            model.NationalId,
            context.Person.Id,
            cancellationToken);

        context.Person.UpdateDetails(
            model.FirstName,
            model.LastName,
            model.Sex,
            model.DateOfBirth,
            model.AgeYears,
            model.BirthDatePrecision,
            model.BirthPlace,
            model.RelationshipToHead,
            model.MaritalStatus,
            model.ChildrenCount,
            model.Nationality,
            model.Occupation,
            model.PhoneNumber,
            model.NationalId,
            model.NationalIdIssueDate,
            model.NationalIdIssuePlace,
            model.PhotoDataUrl,
            model.Notes,
            timeProvider.GetUtcNow());

        await personRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(context.Person);
    }

    public async Task<PersonDto> SubmitAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var context = await GetContextAsync(
            id,
            cancellationToken);

        await EnsureCampaignIsActiveAsync(
            context.Person.CampaignId,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            context.Dwelling.EnumerationAreaId,
            context.Person.CreatedByUserId,
            cancellationToken);

        if (context.Person.RecordStatus is not
            (PersonRecordStatus.Draft or
             PersonRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seule une personne en brouillon ou rejetée peut être soumise.");
        }

        context.Person.Submit(timeProvider.GetUtcNow());

        await personRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(context.Person);
    }

    public async Task<PersonDto> ValidateAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var context = await GetContextAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            context.Dwelling.EnumerationAreaId,
            cancellationToken);

        if (context.Person.RecordStatus !=
            PersonRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seule une personne soumise peut être validée.");
        }

        context.Person.Validate(timeProvider.GetUtcNow());

        await personRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(context.Person);
    }

    public async Task<PersonDto> RejectAsync(
        Guid id,
        string reason,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var context = await GetContextAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanValidateAreaAsync(
            actingUserId,
            context.Dwelling.EnumerationAreaId,
            cancellationToken);

        if (context.Person.RecordStatus !=
            PersonRecordStatus.Submitted)
        {
            throw new ConflictException(
                "Seule une personne soumise peut être rejetée.");
        }

        context.Person.Reject(
            reason,
            timeProvider.GetUtcNow());

        await personRepository.SaveChangesAsync(
            cancellationToken);

        return MapToDto(context.Person);
    }

    public async Task DeleteAsync(
        Guid id,
        Guid actingUserId,
        CancellationToken cancellationToken)
    {
        var context = await GetContextAsync(
            id,
            cancellationToken);

        await fieldAuthorizationService.EnsureCanManageAreaAsync(
            actingUserId,
            context.Dwelling.EnumerationAreaId,
            context.Person.CreatedByUserId,
            cancellationToken);

        if (context.Person.RecordStatus is not
            (PersonRecordStatus.Draft or
             PersonRecordStatus.Rejected))
        {
            throw new ConflictException(
                "Seule une personne en brouillon ou rejetée peut être supprimée.");
        }

        context.Person.Delete(timeProvider.GetUtcNow());

        await personRepository.SaveChangesAsync(
            cancellationToken);
    }

    private async Task EnsureCampaignIsActiveAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var campaign = await campaignRepository.GetByIdAsync(
            campaignId,
            cancellationToken)
            ?? throw new EntityNotFoundException(
                $"La campagne '{campaignId}' est introuvable.");

        if (campaign.Status != CensusCampaignStatus.Active)
        {
            throw new ConflictException(
                "La campagne doit être active pour modifier les données de terrain.");
        }
    }

    private async Task EnsureNationalIdIsAvailableAsync(
        string? nationalId,
        Guid? excludedId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(nationalId))
        {
            return;
        }

        var normalized = nationalId.Trim().ToUpperInvariant();

        var exists =
            await personRepository.ExistsByNationalIdAsync(
                normalized,
                excludedId,
                cancellationToken);

        if (exists)
        {
            throw new ConflictException(
                $"L’identifiant national '{normalized}' est déjà utilisé.");
        }
    }

    private void ValidateAgeInformation(
        DateOnly? dateOfBirth,
        int? ageYears,
        BirthDatePrecision precision)
    {
        if (!dateOfBirth.HasValue &&
            !ageYears.HasValue &&
            precision != BirthDatePrecision.Unknown)
        {
            throw new BusinessValidationException(
                "La date de naissance ou l’âge doit être renseigné.");
        }

        if (ageYears is < 0 or > 130)
        {
            throw new BusinessValidationException(
                "L’âge doit être compris entre 0 et 130 ans.");
        }

        if (!dateOfBirth.HasValue)
        {
            return;
        }

        var today = DateOnly.FromDateTime(
            timeProvider.GetUtcNow().UtcDateTime);

        if (dateOfBirth.Value > today)
        {
            throw new BusinessValidationException(
                "La date de naissance ne peut pas être future.");
        }

        if (!ageYears.HasValue)
        {
            return;
        }

        var calculatedAge =
            today.Year - dateOfBirth.Value.Year;

        if (dateOfBirth.Value >
            today.AddYears(-calculatedAge))
        {
            calculatedAge--;
        }

        if (Math.Abs(calculatedAge - ageYears.Value) > 1)
        {
            throw new BusinessValidationException(
                "L’âge indiqué n’est pas cohérent avec la date de naissance.");
        }
    }

    private async Task<PersonContext> GetContextAsync(
        Guid personId,
        CancellationToken cancellationToken)
    {
        var person = await personRepository.GetForUpdateAsync(
            personId,
            cancellationToken)
            ?? throw CreateNotFoundException(personId);

        var household =
            await householdRepository.GetByIdAsync(
                person.HouseholdId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"Le ménage '{person.HouseholdId}' est introuvable.");

        var dwelling =
            await dwellingRepository.GetByIdAsync(
                household.DwellingId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"L’habitation '{household.DwellingId}' est introuvable.");

        return new PersonContext(person, dwelling);
    }

    private static PersonDto MapToDto(Person person)
    {
        return new PersonDto(
            person.Id,
            person.CampaignId,
            person.HouseholdId,
            person.PersonNumber,
            person.FirstName,
            person.LastName,
            person.FullName,
            person.Sex,
            person.DateOfBirth,
            person.AgeYears,
            person.BirthDatePrecision,
            person.BirthPlace,
            person.RelationshipToHead,
            person.MaritalStatus,
            person.ChildrenCount,
            person.Nationality,
            person.Occupation,
            person.PhoneNumber,
            person.NationalId,
            person.NationalIdIssueDate,
            person.NationalIdIssuePlace,
            person.PhotoDataUrl,
            person.Notes,
            person.RecordStatus,
            person.CreatedByUserId,
            person.CreatedAtUtc,
            person.UpdatedAtUtc);
    }

    private static EntityNotFoundException
        CreateNotFoundException(Guid id)
    {
        return new EntityNotFoundException(
            $"La personne '{id}' est introuvable.");
    }

    private sealed record PersonContext(
        Person Person,
        Census.Domain.Dwellings.Dwelling Dwelling);
}
