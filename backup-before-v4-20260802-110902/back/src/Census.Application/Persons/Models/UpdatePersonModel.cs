using Census.Domain.Persons;

namespace Census.Application.Persons.Models;

public sealed record UpdatePersonModel(
    string FirstName,
    string LastName,
    PersonSex Sex,
    DateOnly? DateOfBirth,
    int? AgeYears,
    RelationshipToHead RelationshipToHead,
    MaritalStatus MaritalStatus,
    string? Nationality,
    string? Occupation,
    string? PhoneNumber,
    string? NationalId,
    string? Notes);
