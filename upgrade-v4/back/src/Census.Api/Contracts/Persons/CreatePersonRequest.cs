using System.ComponentModel.DataAnnotations;
using Census.Domain.Persons;

namespace Census.Api.Contracts.Persons;

public sealed class CreatePersonRequest
{
    [Required]
    public Guid? HouseholdId { get; init; }

    [Range(1, int.MaxValue)]
    public int PersonNumber { get; init; }

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string LastName { get; init; } = string.Empty;

    [EnumDataType(typeof(PersonSex))]
    public PersonSex Sex { get; init; }

    public DateOnly? DateOfBirth { get; init; }

    [Range(0, 130)]
    public int? AgeYears { get; init; }

    [EnumDataType(typeof(BirthDatePrecision))]
    public BirthDatePrecision BirthDatePrecision { get; init; } =
        BirthDatePrecision.Exact;

    [StringLength(150)]
    public string? BirthPlace { get; init; }

    [EnumDataType(typeof(RelationshipToHead))]
    public RelationshipToHead RelationshipToHead { get; init; }

    [EnumDataType(typeof(MaritalStatus))]
    public MaritalStatus MaritalStatus { get; init; }

    [Range(0, 50)]
    public int? ChildrenCount { get; init; }

    [StringLength(100)]
    public string? Nationality { get; init; }

    [StringLength(150)]
    public string? Occupation { get; init; }

    [StringLength(30)]
    public string? PhoneNumber { get; init; }

    [StringLength(100)]
    public string? NationalId { get; init; }

    public DateOnly? NationalIdIssueDate { get; init; }

    [StringLength(150)]
    public string? NationalIdIssuePlace { get; init; }

    [StringLength(5_000_000)]
    public string? PhotoDataUrl { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }
}
