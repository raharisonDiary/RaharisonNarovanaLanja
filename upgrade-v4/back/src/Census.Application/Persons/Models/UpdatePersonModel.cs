using Census.Domain.Persons;

namespace Census.Application.Persons.Models;

public sealed record UpdatePersonModel(
    string FirstName,
    string LastName,
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
    string? Notes);
