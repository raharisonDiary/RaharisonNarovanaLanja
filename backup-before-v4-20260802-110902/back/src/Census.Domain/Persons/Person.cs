using Census.Domain.Campaigns;
using Census.Domain.Common;
using Census.Domain.Households;
using Census.Domain.Users;

namespace Census.Domain.Persons;

public sealed class Person : EntityBase
{
    private Person()
    {
    }

    public Person(
        Guid campaignId,
        Guid householdId,
        int personNumber,
        string firstName,
        string lastName,
        PersonSex sex,
        DateOnly? dateOfBirth,
        int? ageYears,
        RelationshipToHead relationshipToHead,
        MaritalStatus maritalStatus,
        string? nationality,
        string? occupation,
        string? phoneNumber,
        string? nationalId,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        EnsureRequiredId(campaignId, nameof(campaignId));
        EnsureRequiredId(householdId, nameof(householdId));
        EnsureRequiredId(createdByUserId, nameof(createdByUserId));
        ValidatePersonNumber(personNumber);
        ValidateEnums(sex, relationshipToHead, maritalStatus);
        ValidateAge(ageYears);

        CampaignId = campaignId;
        HouseholdId = householdId;
        PersonNumber = personNumber;
        FirstName = NormalizeRequired(firstName, nameof(firstName), 100);
        LastName = NormalizeRequired(lastName, nameof(lastName), 100);
        Sex = sex;
        DateOfBirth = dateOfBirth;
        AgeYears = ageYears;
        RelationshipToHead = relationshipToHead;
        MaritalStatus = maritalStatus;
        Nationality = NormalizeOptional(nationality, 100);
        Occupation = NormalizeOptional(occupation, 150);
        PhoneNumber = NormalizeOptional(phoneNumber, 30);
        NationalId = NormalizeOptional(nationalId, 100)?.ToUpperInvariant();
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;
        RecordStatus = PersonRecordStatus.Draft;
    }

    public Guid CampaignId { get; private set; }
    public CensusCampaign? Campaign { get; private set; }
    public Guid HouseholdId { get; private set; }
    public Household? Household { get; private set; }
    public int PersonNumber { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public PersonSex Sex { get; private set; }
    public DateOnly? DateOfBirth { get; private set; }
    public int? AgeYears { get; private set; }

    public RelationshipToHead RelationshipToHead
    {
        get;
        private set;
    }

    public MaritalStatus MaritalStatus { get; private set; }
    public string? Nationality { get; private set; }
    public string? Occupation { get; private set; }
    public string? PhoneNumber { get; private set; }
    public string? NationalId { get; private set; }
    public string? Notes { get; private set; }

    public PersonRecordStatus RecordStatus
    {
        get;
        private set;
    }

    public Guid CreatedByUserId { get; private set; }

    public ApplicationUser? CreatedByUser
    {
        get;
        private set;
    }

    public void UpdateDetails(
        string firstName,
        string lastName,
        PersonSex sex,
        DateOnly? dateOfBirth,
        int? ageYears,
        RelationshipToHead relationshipToHead,
        MaritalStatus maritalStatus,
        string? nationality,
        string? occupation,
        string? phoneNumber,
        string? nationalId,
        string? notes,
        DateTimeOffset updatedAtUtc)
    {
        EnsureEditable();
        ValidateEnums(sex, relationshipToHead, maritalStatus);
        ValidateAge(ageYears);

        FirstName = NormalizeRequired(firstName, nameof(firstName), 100);
        LastName = NormalizeRequired(lastName, nameof(lastName), 100);
        Sex = sex;
        DateOfBirth = dateOfBirth;
        AgeYears = ageYears;
        RelationshipToHead = relationshipToHead;
        MaritalStatus = maritalStatus;
        Nationality = NormalizeOptional(nationality, 100);
        Occupation = NormalizeOptional(occupation, 150);
        PhoneNumber = NormalizeOptional(phoneNumber, 30);
        NationalId = NormalizeOptional(nationalId, 100)?.ToUpperInvariant();
        Notes = NormalizeOptional(notes, 1000);
        MarkAsUpdated(updatedAtUtc);
    }

    public void Submit(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus is not
            (PersonRecordStatus.Draft or
             PersonRecordStatus.Rejected))
        {
            throw new InvalidOperationException(
                "Seule une personne en brouillon ou rejetée peut être soumise.");
        }

        RecordStatus = PersonRecordStatus.Submitted;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Validate(DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus != PersonRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seule une personne soumise peut être validée.");
        }

        RecordStatus = PersonRecordStatus.Validated;
        MarkAsUpdated(updatedAtUtc);
    }

    public void Reject(
        string reason,
        DateTimeOffset updatedAtUtc)
    {
        if (RecordStatus != PersonRecordStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Seule une personne soumise peut être rejetée.");
        }

        Notes = NormalizeRequired(reason, nameof(reason), 1000);
        RecordStatus = PersonRecordStatus.Rejected;
        MarkAsUpdated(updatedAtUtc);
    }

    private void EnsureEditable()
    {
        if (RecordStatus is
            PersonRecordStatus.Submitted or
            PersonRecordStatus.Validated)
        {
            throw new InvalidOperationException(
                "Cette personne ne peut plus être modifiée dans son état actuel.");
        }
    }

    private static void ValidatePersonNumber(int personNumber)
    {
        if (personNumber <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(personNumber),
                "Le numéro de la personne doit être supérieur à zéro.");
        }
    }

    private static void ValidateAge(int? ageYears)
    {
        if (ageYears is < 0 or > 130)
        {
            throw new ArgumentOutOfRangeException(
                nameof(ageYears),
                "L’âge doit être compris entre 0 et 130 ans.");
        }
    }

    private static void ValidateEnums(
        PersonSex sex,
        RelationshipToHead relationshipToHead,
        MaritalStatus maritalStatus)
    {
        if (!Enum.IsDefined(sex) ||
            !Enum.IsDefined(relationshipToHead) ||
            !Enum.IsDefined(maritalStatus))
        {
            throw new ArgumentException(
                "Une valeur de classification de la personne est invalide.");
        }
    }

    private static void EnsureRequiredId(
        Guid id,
        string parameterName)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException(
                "L’identifiant est obligatoire.",
                parameterName);
        }
    }

    private static string NormalizeRequired(
        string value,
        string parameterName,
        int maximumLength)
    {
        ArgumentNullException.ThrowIfNull(value);

        var normalized = value.Trim();

        if (normalized.Length == 0 ||
            normalized.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur doit contenir entre 1 et {maximumLength} caractères.",
                parameterName);
        }

        return normalized;
    }

    private static string? NormalizeOptional(
        string? value,
        int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value.Trim();

        if (normalized.Length > maximumLength)
        {
            throw new ArgumentException(
                $"La valeur ne peut pas dépasser {maximumLength} caractères.");
        }

        return normalized;
    }
}
