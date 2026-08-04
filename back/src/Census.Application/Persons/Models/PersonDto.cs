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
    BirthDatePrecision BirthDatePrecision,
    string? BirthPlace,
    RelationshipToHead RelationshipToHead,
    MaritalStatus MaritalStatus,
    int? ChildrenCount,
    string? Nationality,
    string? Occupation,
    string? PhoneNumber,
    string? NationalId,
    DateOnly? NationalIdIssueDate,
    string? NationalIdIssuePlace,
    string? PhotoDataUrl,
    string? Notes,
    PersonRecordStatus RecordStatus,
    Guid CreatedByUserId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc);
