using Census.Domain.Persons;

namespace Census.Application.Persons.Models;

public sealed record PersonQueryModel(
    Guid? CampaignId = null,
    Guid? HouseholdId = null,
    PersonRecordStatus? RecordStatus = null,
    PersonSex? Sex = null,
    Guid? CreatedByUserId = null,
    string? Search = null);
