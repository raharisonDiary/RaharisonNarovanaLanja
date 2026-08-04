using Census.Domain.Persons;

namespace Census.Application.Persons.Models;

public sealed record PersonDto(
    Guid Id,
    Guid CampaignId,
    Guid HouseholdId,
    int PersonNumber,
    string FirstName,
    string LastName,
    string FullName,
    PersonSex Sex,
    DateOnly? DateOfBirth,
    int? AgeYears,
    RelationshipToHead RelationshipToHead,
    MaritalStatus MaritalStatus,
    string? Nationality,
    string? Occupation,
    string? PhoneNumber,
    string? NationalId,
    string? Notes,
    PersonRecordStatus RecordStatus,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
